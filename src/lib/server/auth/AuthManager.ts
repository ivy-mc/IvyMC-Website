import { Collection } from "mongodb";
import MongoManager from "../database/mongo/MongoManager";
import MysqlManager from "../database/mysql/MysqlManager";
import JWTManager from "./JWTManager";
import EmailManager from "../email/EmailManager";
import SessionManager from "./SessionManager";
import bcrypt from 'bcrypt';
import Util from "@/lib/common/Util";
import axios from "axios";
import fs from 'fs';
import { GetServerSidePropsContext, NextApiRequest, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";
import ConsoleManager from "../logs/ConsoleManager";
import PlayerManager, { Player } from "./PlayerManager";
import DiscordOauth2Manager, { DiscordUser } from "../discord/DiscordOauth2Manager";
import crypto from "crypto";
import requestIp from 'request-ip';
import path from 'path';

declare global {
    var authManager: AuthManager;
    var pendingRegistrations: Map<string, PendingRegistration>;
    var pendingEmailChanges: Map<string, PendingEmailChange>;
}

// Check if running in serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

type UserCommon = {
    _id: string;
    email: string;
    username: string;
    created_at: string;
    updated_at: string;
}

export type WebUser = {
    password: string;
} & UserCommon;

export type User = {
    player: Player;
    discord: DiscordUser | null;
} & UserCommon;


export type PendingRegistration = {
    pin: string;
    email: string;
    password: string;
    username: string;
}

export type PendingEmailChange = {
    pin: string;
    username: string;
    newEmail: string;
    createdAt: number;
}

export type ResetPasswordRequest = {
    username: string;
    key: string;
    created_at: Date;
}

const pinMailTemplate: string = fs.readFileSync(path.join(process.cwd(), 'src/lib/server/email/PINTemplate.html'), { encoding: 'utf-8' });
const emailChangePinTemplate: string = pinMailTemplate.replace('PIN Doğrulama', 'E-posta Değiştirme Doğrulama').replace('Hesabınızı oluşturmak için', 'E-posta adresinizi değiştirmek için');

export default class AuthManager {
    public userCollection: Collection<WebUser>;
    public resetPasswordRequests: Collection<ResetPasswordRequest>;

    private constructor() {
        ConsoleManager.info("AuthManager", "AuthManager initialized.");
        this.userCollection = MongoManager.getInstance().websiteDatabase.collection<WebUser>("users");
        this.resetPasswordRequests = MongoManager.getInstance().websiteDatabase.collection("reset_password_requests");
        if (!global.pendingRegistrations) {
            global.pendingRegistrations = new Map();
        }
        if (!global.pendingEmailChanges) {
            global.pendingEmailChanges = new Map();
        }

        // Only set up cleanup interval in non-serverless environments
        if (!isServerless && process.env.NEXT_RUNTIME === 'nodejs') {
            setInterval(async () => {
                try {
                    // Ensure MongoDB connection is active
                    await MongoManager.getInstance().ensureConnected();
                    const resetPasswordRequests = await this.resetPasswordRequests.find({
                        created_at: {
                            $lt: new Date(Date.now() - 1000 * 60 * 5)
                        }
                    }).toArray();

                    for (const resetPasswordRequest of resetPasswordRequests) {
                        await this.resetPasswordRequests.deleteOne({ username: resetPasswordRequest.username });
                    }
                } catch (err) {
                    ConsoleManager.error('AuthManager', 'Failed to cleanup old reset password requests: ' + (err as Error).message);
                }
            }, 1000 * 60);
        }
    }

    public static getInstance(): AuthManager {
        if (!global.authManager) {
            global.authManager = new AuthManager();
        }

        return global.authManager;
    }

    public generateCookie(jtwToken: string): string {
        return `orleans.token=${jtwToken}; HttpOnly;${process.env.NODE_ENV === 'production' ? " Secure;" : ""
            } Max-Age=${7 * 24 * 60 * 60}; Path=/`
    }

    public async login(username: string, password: string, ip: string): Promise<string> {
        const user = await this.getWebUser(username);
        if (!user) {
            throw new Error("Kullanıcı adı veya şifre yanlış.");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new Error("Kullanıcı adı veya şifre yanlış.");
        }

        const session = await SessionManager.getInstance().createSession(username, ip);
        const JWT = JWTManager.getInstance().generateToken(session.token);
        ConsoleManager.info("AuthManager", "Kullanıcı giriş yaptı: " + username);
        return JWT;
    }

    public async changePassword(username: string, oldPassword: string, newPassword: string): Promise<void> {
        const user = await this.getWebUser(username);
        if (!user) {
            throw new Error("Kullanıcı bulunamadı.");
        }

        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) {
            throw new Error("Eski şifre yanlış.");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await MysqlManager.getInstance().changePassword(username, hashedPassword);
        
        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        await this.userCollection.updateOne({ _id: username.toLowerCase() }, { $set: { password: hashedPassword } });
        ConsoleManager.info("AuthManager", "Kullanıcı şifresi değiştirildi: " + username);
    }

    public async changeEmail(username: string, password: string, newEmail: string, pin?: string): Promise<{ requiresPin: boolean; message: string }> {
        const user = await this.getWebUser(username);
        if (!user) {
            throw new Error("Kullanıcı bulunamadı.");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new Error("Şifre yanlış.");
        }

        if (!Util.isValidEmail(newEmail)) {
            throw new Error("Geçersiz e-posta adresi.");
        }

        const emailUser = await this.getWebUserByEmail(newEmail);
        if (emailUser && emailUser._id !== username.toLowerCase()) {
            throw new Error("Bu e-posta adresi zaten kullanılmakta.");
        }

        if (user.email.toLowerCase() === newEmail.toLowerCase()) {
            throw new Error("Yeni e-posta eski e-posta ile aynı olamaz.");
        }

        const pendingChange = global.pendingEmailChanges.get(username.toLowerCase());

        // Eğer PIN gelmediyse, PIN oluştur ve gönder
        if (!pin) {
            // Eğer zaten pending bir değişiklik varsa ve aynı email ise
            if (pendingChange && pendingChange.newEmail === newEmail.toLowerCase()) {
                // 2 dakikadan eski değilse, aynı PIN'i kullan
                if (Date.now() - pendingChange.createdAt < 2 * 60 * 1000) {
                    ConsoleManager.info("AuthManager", `E-posta değişikliği için PIN zaten gönderildi: ${username} -> ${newEmail}`);
                    return { requiresPin: true, message: "Doğrulama kodu e-posta adresinize gönderildi." };
                }
            }

            // Yeni PIN oluştur
            const newPin = Util.generateNumericPin();
            global.pendingEmailChanges.set(username.toLowerCase(), {
                pin: newPin,
                username: username.toLowerCase(),
                newEmail: newEmail.toLowerCase(),
                createdAt: Date.now()
            });

            ConsoleManager.info("AuthManager", `E-posta değişikliği için PIN oluşturuldu: ${username} -> ${newEmail} - ${newPin}`);

            try {
                await EmailManager.getInstance().sendEmail(
                    newEmail,
                    "IvyMC E-posta Değiştirme Doğrulama",
                    undefined,
                    emailChangePinTemplate.replace('{PIN}', newPin)
                );
            } catch (error) {
                global.pendingEmailChanges.delete(username.toLowerCase());
                ConsoleManager.error("AuthManager", `E-posta gönderilemedi: ${username} -> ${newEmail} - ${error}`);
                throw new Error(`E-posta gönderilemedi: ${(error as Error).message}`);
            }

            // 5 dakika sonra pending değişikliği sil
            setTimeout(() => {
                const current = global.pendingEmailChanges.get(username.toLowerCase());
                if (current && current.createdAt === pendingChange?.createdAt) {
                    global.pendingEmailChanges.delete(username.toLowerCase());
                    ConsoleManager.info("AuthManager", `E-posta değişikliği zaman aşımına uğradı: ${username}`);
                }
            }, 5 * 60 * 1000);

            return { requiresPin: true, message: "Doğrulama kodu yeni e-posta adresinize gönderildi." };
        }

        // PIN geldi, doğrula
        if (!pendingChange) {
            throw new Error("Doğrulama kodunun süresi doldu. Lütfen tekrar deneyin.");
        }

        if (pendingChange.newEmail !== newEmail.toLowerCase()) {
            throw new Error("E-posta adresi değiştirildi. Lütfen tekrar deneyin.");
        }

        if (pendingChange.pin !== pin) {
            throw new Error("Doğrulama kodu yanlış.");
        }

        // PIN doğru, e-postayı değiştir
        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        await this.userCollection.updateOne(
            { _id: username.toLowerCase() }, 
            { $set: { email: newEmail.toLowerCase(), updated_at: new Date().toISOString() } }
        );
        
        global.pendingEmailChanges.delete(username.toLowerCase());
        ConsoleManager.info("AuthManager", `Kullanıcı e-postası değiştirildi: ${username} -> ${newEmail}`);
        
        return { requiresPin: false, message: "E-posta adresiniz başarıyla değiştirildi." };
    }

    public async generateResetPasswordToken(username: string): Promise<string> {
        const user = await this.getWebUser(username);
        if (!user) {
            throw new Error("Kullanıcı bulunamadı.");
        }

        const key = crypto.randomBytes(32).toString('hex');
        
        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        await this.resetPasswordRequests.insertOne({
            username,
            key,
            created_at: new Date()
        });

        return JWTManager.getInstance().generateResetPasswordToken(key);
    }

    public async resetPassword(token: string, newPassword: string): Promise<void> {
        const key = JWTManager.getInstance().getKeyFromForgotPasswordToken(token);
        if (!key) {
            throw new Error("Geçersiz token.");
        }

        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        const resetPasswordRequest = await this.resetPasswordRequests.findOne({ key });
        if (!resetPasswordRequest) {
            throw new Error("Geçersiz token.");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await MysqlManager.getInstance().changePassword(resetPasswordRequest.username, hashedPassword);
        await this.userCollection.updateOne({ _id: resetPasswordRequest.username.toLowerCase() }, { $set: { password: hashedPassword } });
        await this.resetPasswordRequests.deleteOne({ key });
        ConsoleManager.info("AuthManager", "Kullanıcı şifresi sıfırlandı: " + resetPasswordRequest.username);
    }

    public async validateResetPasswordToken(token: string): Promise<boolean> {
        const key = JWTManager.getInstance().getKeyFromForgotPasswordToken(token);
        if (!key) {
            return false;
        }

        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        const resetPasswordRequest = await this.resetPasswordRequests.findOne({ key });
        if (!resetPasswordRequest) {
            return false;
        }

        return true;
    }

    public async register(email: string, username: string, password: string, pin?: string, ip?: string): Promise<boolean> {
        if (!Util.isValidEmail(email)) {
            throw new Error("Geçersiz email adresi.");
        }

        Util.validateMinecraftNickname(username);

        const user = await this.getWebUser(username);
        if (user) {
            throw new Error("Bu kullanıcı adı zaten alınmış.");
        }

        const emailUser = await this.getWebUserByEmail(email);
        if (emailUser) {
            throw new Error("Bu e-posta adresi zaten kullanılmakta.");
        }

        if (ip) {
            const theSessionHasSameIP = await SessionManager.getInstance().getSessionsByIp(ip, username);
            if (theSessionHasSameIP.length > 2) {
                ConsoleManager.warn("AuthManager", "Bu IP adresi ile çok fazla hesap var: " + ip);
                throw new Error("Hesap oluşturmayı suistimal etmek sunucudan yasaklanmanıza sebep olabilir." +
                    " Durum yetkililere bildirildi! Lütfen destek açın.");
            }
        }

        const pendingRegistration = pendingRegistrations.get(username);
        if (pendingRegistration && !pin) {
            ConsoleManager.warn("AuthManager", "Kullanıcı zaten kayıt olmaya çalışıyordu ama pin yoktu. Pin yeniden gönderildi: " + username);
            pendingRegistrations.delete(username);
        }


        if (!pendingRegistration && pin) {
            ConsoleManager.warn("AuthManager", "Kullanıcının pin bilgisi yoktu: " + username);
            throw new Error("Pininizin süresi doldu. Lütfen tekrar deneyin.");
        }

        if (pendingRegistration && pin) {
            if (pendingRegistration.pin !== pin) {
                ConsoleManager.warn("AuthManager", "Kullanıcının pin bilgisi yanlıştı: " + username
                    + " - " + pin + " - " + pendingRegistration.pin);
                throw new Error("Pininizin süresi doldu. Lütfen tekrar deneyin.");
            }

            pendingRegistrations.delete(username);
            const pendingRegistrationsBelongsToEmail = Array.from(pendingRegistrations.values()).filter(pr => pr.email === email);
            pendingRegistrationsBelongsToEmail.forEach(pr => pendingRegistrations.delete(pr.username));
            await this.forceRegister(email, username, password, ip);
            ConsoleManager.info("AuthManager", "Kullanıcı kaydedildi: " + username);
            return true;
        }

        if (!pin) {
            if (ip && !this.checkIP(ip)) {
                ConsoleManager.warn("AuthManager", "Kullanıcı kaydı yapılırken proxy veya vpn tespit edildi: " + ip + " - " + username);
                throw new Error("Proxy veya VPN kullanarak kayıt olamazsınız.");
            }
            const pin = Util.generateNumericPin();
            pendingRegistrations.set(username, { pin, email, password, username });
            ConsoleManager.info("AuthManager", "Kullanıcı kaydı için pin oluşturuldu: " + email + " - " + pin);

            await EmailManager.getInstance().sendEmail(
                email,
                "IvyMC Kayıt Doğrulama",
                undefined,
                pinMailTemplate.replace('{PIN}', pin)
            );
            return false;
        }
        return false;
    }

    public async forceRegister(email: string, username: string, password: string, ip?: string): Promise<void> {
        const hashedPassword = await bcrypt.hash(password, 10);
        ConsoleManager.info("AuthManager", "Kullanıcı kaydediliyor: " + username);

        const newUser: WebUser = {
            _id: username.toLocaleLowerCase(),
            email,
            username,
            password: hashedPassword,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        await MysqlManager.getInstance().registerToLimboAuth(username, hashedPassword, ip);
        
        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        await this.userCollection.updateOne({ _id: newUser._id }, { $set: newUser }, { upsert: true });

        ConsoleManager.info("AuthManager", "Kullanıcı kaydedildi: " + username);
    }

    public async getUserFromSessionToken(sessionToken: string): Promise<User | null> {
        const session = await SessionManager.getInstance().getSession(sessionToken);
        if (!session) {
            return null;
        }

        return await this.getUser(session.username);
    }

    public async getWebUser(username: string): Promise<WebUser | null> {
        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        return this.userCollection.findOne({ _id: username.toLocaleLowerCase() });
    }

    public async getWebUserByEmail(email: string): Promise<WebUser | null> {
        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        return this.userCollection.findOne({ email });
    }

    public async getUser(username: string): Promise<User | null> {
        const datas = await Promise.all([
            PlayerManager.getInstance().getPlayer(username),
            this.getWebUser(username),
            DiscordOauth2Manager.getInstance().getUser(username)
        ]);

        const player = datas[0];
        const webUser = datas[1];
        const discord = datas[2];

        if (!webUser) {
            return null;
        }

        const user: User & { password?: string } = { ...webUser, player, discord };
        delete user.password;

        return user;
    }

    public async checkIP(ip: string): Promise<boolean> {
        try {
            const response = await axios.get(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=17035264`);
            const data = response.data;
            if (data.status != 'success') {
                return false;
            }
            if (data.proxy || data.vpn || data.tor || data.hosting) {
                return false;
            }
            return true
        } catch (error) {
            console.error('IP kontrolü yapılırken bir hata oluştu:', error);
            return false;
        }
    }

    public async getUserFromContext(ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>): Promise<User | null> {
        let user = null;
        const jwt = ctx.req.cookies["orleans.token"];
        if (jwt) {
            const sessionId = JWTManager.getInstance().getSessionTokenFromJWT(jwt);
            if (sessionId) {

                const session = await SessionManager.getInstance().getSession(sessionId);
                if (session) {
                    const ip = AuthManager.getInstance().getIpFromRequest(ctx.req as any) || "unknown";

                    if (!session.ips.includes(ip)) {
                        session.ips.push(ip);
                        await SessionManager.getInstance().updateSession(session);
                    }

                    user = await AuthManager.getInstance().getUser(session.username) || null;
                }
            }
        }
        return user;
    }

    public getIpFromRequest(req: NextApiRequest) {
        return requestIp.getClientIp(req);
    }
}