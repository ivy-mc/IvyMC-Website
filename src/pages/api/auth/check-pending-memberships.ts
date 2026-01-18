import AuthManager from "@/lib/server/auth/AuthManager";
import ConsoleManager from "@/lib/server/logs/ConsoleManager";
import WebhookManager from "@/lib/server/logs/WebhookManager";
import PendingMembershipManager from "@/lib/server/payment/PendingMembershipManager";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    name: string;
    pending_memberships?: number;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== "POST") {
        return res.status(405).json({ name: "Method not allowed" });
    }

    try {
        const { old_email, new_email } = req.body;

        if (!old_email || !new_email) {
            return res.status(400).json({ name: "Missing required fields" });
        }

        // Yeni email için pending membership'leri kontrol et
        const pendingMemberships = await PendingMembershipManager.getInstance()
            .getPendingByEmail(new_email);

        if (pendingMemberships.length === 0) {
            return res.status(200).json({ 
                name: "Email updated successfully",
                pending_memberships: 0
            });
        }

        // Her pending membership için rank ver
        let successCount = 0;
        const user = await AuthManager.getInstance().getWebUserByEmail(new_email);

        if (!user) {
            return res.status(400).json({ name: "User not found with new email" });
        }

        for (const pending of pendingMemberships) {
            try {
                // Rank verme işlemi
                const response = await fetch(
                    `${process.env.WEBSITE_URL}/api/store/purchase/rank/${pending.rank_id}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Internal-Request": "true",
                        },
                        body: JSON.stringify({
                            username: user.username,
                            bypass_balance_check: true,
                            payment_method: "buymeacoffee_membership",
                            transaction_id: pending.transaction_id,
                        })
                    }
                );

                if (response.ok) {
                    // Pending olarak işaretle
                    await PendingMembershipManager.getInstance().resolvePendingMembership(
                        pending.transaction_id,
                        user.username
                    );
                    
                    successCount++;

                    ConsoleManager.log("CheckPendingMemberships", 
                        `Resolved pending membership: ${pending.rank_id} for ${user.username}`);

                    // Discord bildirimi
                    WebhookManager.sendEmbedWebhook(
                        "🎉 Pending Membership Resolved",
                        `**Kullanıcı:** ${user.username}\n` +
                        `**Eski Email:** ${old_email}\n` +
                        `**Yeni Email:** ${new_email}\n` +
                        `**Rank:** ${pending.membership_level_name}\n` +
                        `**Transaction ID:** ${pending.transaction_id}\n\n` +
                        `✅ Email güncellemesi sonrası otomatik eşleştirildi!`,
                        0x00FF00
                    );
                } else {
                    const errorData = await response.json();
                    ConsoleManager.error("CheckPendingMemberships", 
                        `Failed to grant rank: ${errorData.name}`);
                }
            } catch (error) {
                ConsoleManager.error("CheckPendingMemberships", 
                    `Error processing pending membership: ${(error as any).message}`);
            }
        }

        return res.status(200).json({
            name: "Email updated and pending memberships processed",
            pending_memberships: successCount
        });
    } catch (error) {
        console.error(error);
        ConsoleManager.error("CheckPendingMemberships", (error as any).message);
        return res.status(500).json({ name: "Internal server error" });
    }
}
