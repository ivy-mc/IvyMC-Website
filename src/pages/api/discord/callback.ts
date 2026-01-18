import AuthManager from "@/lib/server/auth/AuthManager";
import JWTManager from "@/lib/server/auth/JWTManager";
import DiscordOauth2Manager from "@/lib/server/discord/DiscordOauth2Manager";
import { getMetadata, pushMetadata } from "@/lib/server/discord/MetadataUtil";
import ConsoleManager from "@/lib/server/logs/ConsoleManager";
import { NextApiRequest, NextApiResponse } from "next/types";

export const config = {
    api: {
        method: "GET",
    },
};

// Discord rol ID'lerini rütbeye göre döndürür
function getDiscordRoleIdByRank(rank: string): string | null {
    const roleMap: Record<string, string> = {
        "oyuncu": process.env.DISCORD_ROLE_OYUNCU || "",
        "cirak": process.env.DISCORD_ROLE_CIRAK || "",
        "asil": process.env.DISCORD_ROLE_ASIL || "",
        "soylu": process.env.DISCORD_ROLE_SOYLU || "",
        "senyor": process.env.DISCORD_ROLE_SENYOR || ""
    };

    return roleMap[rank] || null;
}

export default async function DiscordCallback(req: NextApiRequest, res: NextApiResponse) {
    const code = req.query.code as string;
    if (!code) {
        return res.status(400).json({ error: "No code provided" });
    };

    try {
        const sessionToken = JWTManager.getInstance().getSessionTokenFromJWT(req.cookies["orleans.token"] || "");

        if (!sessionToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await AuthManager.getInstance().getUserFromSessionToken(sessionToken);

        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const oldAccount = await DiscordOauth2Manager.getInstance().getAccount(user.username.toLocaleLowerCase());
        const oldDiscordUser = await DiscordOauth2Manager.getInstance().getUser(user.username.toLocaleLowerCase());

        const discordOauth2Manager = DiscordOauth2Manager.getInstance();
        const discordOauth2 = discordOauth2Manager.getOAuth();
        const account = await discordOauth2.tokenRequest(
            {
                code,
                scope: discordOauth2Manager.scopes,
                grantType: "authorization_code",
                redirectUri: discordOauth2Manager.redirectUri
            }
        );

        const discordUser = await discordOauth2.getUser(account.access_token);

        if (oldAccount && oldDiscordUser && oldDiscordUser.id !== discordUser.id) {
            pushMetadata(oldAccount.access_token, undefined);
        }

        await discordOauth2Manager.updateAccount({
            _id: user.username.toLocaleLowerCase(),
            ...account,
            updated_at: Date.now()
        });

        await discordOauth2Manager.updateUser({
            _id: user.username.toLocaleLowerCase(),
            ...discordUser,
            updated_at: Date.now()
        });

        await discordOauth2.addMember(
            {
                userId: discordUser.id,
                guildId: "1168183765441458306",
                botToken: process.env.BOT_TOKEN!,
                accessToken: account.access_token
            }
        );

        // Kullanıcının rütbesine göre Discord rolü ata
        const playerRankForRole = user.player.rank === "player" ? "oyuncu" : user.player.rank;
        const roleId = getDiscordRoleIdByRank(playerRankForRole);
        
        if (roleId) {
            await discordOauth2Manager.assignRole("1168183765441458306", discordUser.id, roleId);
        } else {
            ConsoleManager.warn("DiscordCallback", `No role mapping found for rank: ${playerRankForRole}`);
        }

        const oldMetaDatas = await getMetadata(account.access_token);
        const newMetaData = {
            oyuncu: 1,
            cirak: 0,
            asil: 0,
            soylu: 0,
            senyor: 0
        };
        let playerRank: keyof typeof newMetaData = user.player.rank === "player" ? "oyuncu" : user.player.rank as keyof typeof newMetaData;
        
        if (newMetaData[playerRank] !== undefined) {
            newMetaData[playerRank] = 1;
        }

        if (oldMetaDatas.metadata !== newMetaData) {
            ConsoleManager.info("DiscordCallback", "Pushing metadata");
            pushMetadata(account.access_token, newMetaData);
        };

        res.redirect("/");
    } catch (error) {
        console.error(error);
        if (res.writable) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: "An unknown error occurred" });
            }
        }
    }
};