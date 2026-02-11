import AuthManager from "@/lib/server/auth/AuthManager";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { username } = req.query;

    if (!username || typeof username !== "string") {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        const user = await AuthManager.getInstance().getUser(username);

        if (!user) {
            return res.status(404).json({ linked: false, nick: "Kullanıcı bulunamadı" });
        }

        if (!user.discord) {
            return res.status(200).json({ linked: false, nick: "Discord hesabı bağlı değil" });
        }

        // Return the Discord username instead of global_name
        const nick = user.discord.username;

        return res.status(200).json({ linked: true, nick });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
