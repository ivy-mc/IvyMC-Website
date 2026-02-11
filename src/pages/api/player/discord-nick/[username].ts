import { NextApiRequest, NextApiResponse } from "next/types";
import DiscordOauth2Manager from "@/lib/server/discord/DiscordOauth2Manager";

export const config = {
    api: {
        method: "GET",
    },
};

export default async function GetPlayerDiscordNick(req: NextApiRequest, res: NextApiResponse) {
    const { username } = req.query;

    if (!username || typeof username !== "string") {
        return res.status(400).json({ error: "Username required" });
    }

    try {
        const discordUser = await DiscordOauth2Manager.getInstance().getUser(username);

        if (!discordUser) {
            return res.status(200).json({ linked: false, nick: "Discord hesabı bağlı değil" });
        }

        return res.status(200).json({
            linked: true,
            nick: discordUser.global_name || discordUser.username || "Bilinmiyor",
            id: discordUser.id,
            avatar: discordUser.avatar
        });
    } catch (error) {
        console.error(error);
        return res.status(200).json({ linked: false, nick: "Discord hesabı bağlı değil" });
    }
}
