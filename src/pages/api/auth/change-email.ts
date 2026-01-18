import type { NextApiRequest, NextApiResponse } from "next";
import JWTManager from "@/lib/server/auth/JWTManager";
import AuthManager from "@/lib/server/auth/AuthManager";

type Data = {
    name: string;
    requiresPin?: boolean;
};

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "100kb",
        },
        method: "POST",
    },
};

export default async function ChangeEmailHandler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const sessionToken = JWTManager.getInstance().getSessionTokenFromJWT(req.cookies["orleans.token"] || "");

    if (!sessionToken) {
        return res.status(401).json({ name: "Unauthorized" });
    }

    const user = await AuthManager.getInstance().getUserFromSessionToken(sessionToken);
    if (!user) {
        return res.status(401).json({ name: "Unauthorized" });
    }

    const password = req.body.password;
    const newEmail = req.body.newEmail;
    const pin = req.body.pin;

    if (!password || !newEmail) {
        return res.status(400).json({ name: "Eksik alanlar" });
    }

    try {
        const result = await AuthManager.getInstance().changeEmail(user.username, password, newEmail, pin);
        
        if (result.requiresPin) {
            return res.status(200).json({ name: result.message, requiresPin: true });
        }
        
        return res.status(200).json({ name: result.message, requiresPin: false });
    } catch (error) {
        return res.status(400).json({ name: (error as Error).message });
    }
}
