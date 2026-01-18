import AuthManager from "@/lib/server/auth/AuthManager";
import ConsoleManager from "@/lib/server/logs/ConsoleManager";
import WebhookManager from "@/lib/server/logs/WebhookManager";
import PendingMembershipManager from "@/lib/server/payment/PendingMembershipManager";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    name: string;
};

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "100kb",
        },
        method: "POST",
    },
};

export type BuyMeACoffeeMembershipData = {
    id: number,
    object: "membership",
    status: "active" | "cancelled" | "expired",
    membership_level_id: string,
    membership_level_name: string,
    supporter_name: string,
    supporter_email: string,
    supporter_id: number,
    message: string,
    currency: "EUR" | "USD",
    subscription_duration_type: "month" | "year",
    subscription_current_period_start: number,
    subscription_current_period_end: number,
    subscription_created_on: number,
    subscription_updated_on: number,
    subscription_cancelled_on: number | null,
}

export type BuyMeACoffeeMembershipPayload = {
    type: "membership.started" | "membership.cancelled",
    live_mode: boolean,
    attempt: number,
    created: number,
    event_id: string,
    data: BuyMeACoffeeMembershipData,
}

// Membership Level ID'lerini rank ID'leriyle eşleştir
const MEMBERSHIP_TO_RANK: Record<string, string> = {
    '12345': 'cirak',
    '12346': 'asil',
    '12347': 'soylu',
    '12348': 'senyor',
};

export default async function BuyMeACoffeeMembershipHandler(
    req: NextApiRequest, 
    res: NextApiResponse<Data>
) {
    try {
        const body = req.body as BuyMeACoffeeMembershipPayload;
        
        if (!['membership.started', 'membership.cancelled'].includes(body.type)) {
            ConsoleManager.error("BuyMeACoffeeMembershipHandler", "Invalid request type: " + body.type);
            return res.status(400).json({ name: "Invalid request" });
        }

        const token = req.query.token as string;
        const secret = process.env.BUYMEACOFFEE_SECRET;

        if (token !== secret) {
            ConsoleManager.error("BuyMeACoffeeMembershipHandler", "Unauthorized request");
            return res.status(401).json({ name: "Unauthorized" });
        }

        const user = await AuthManager.getInstance().getWebUserByEmail(body.data.supporter_email);

        if (!user) {
            // Kullanıcı bulunamadı - Pending olarak kaydet
            const rankId = MEMBERSHIP_TO_RANK[body.data.membership_level_id];
            
            if (rankId) {
                await PendingMembershipManager.getInstance().savePendingMembership({
                    supporter_email: body.data.supporter_email,
                    supporter_name: body.data.supporter_name,
                    membership_level_id: body.data.membership_level_id,
                    membership_level_name: body.data.membership_level_name,
                    rank_id: rankId,
                    transaction_id: body.event_id,
                    currency: body.data.currency,
                    subscription_duration_type: body.data.subscription_duration_type,
                    subscription_current_period_start: String(body.data.subscription_current_period_start),
                    subscription_current_period_end: String(body.data.subscription_current_period_end),
                });
            }
            
            ConsoleManager.warn("BuyMeACoffeeMembershipHandler", 
                `User not found with email: ${body.data.supporter_email} - Saved as pending`);
            
            return res.status(200).json({ name: "Saved as pending - user will be notified" });
        }

        const rankId = MEMBERSHIP_TO_RANK[body.data.membership_level_id];
        
        if (!rankId) {
            ConsoleManager.error("BuyMeACoffeeMembershipHandler", 
                `Unknown membership level: ${body.data.membership_level_id}`);
            return res.status(400).json({ name: "Unknown membership level" });
        }

        if (body.type === "membership.started") {
            // Rank verme işlemi - mevcut purchase endpoint'inizi kullanın
            const response = await fetch(`${process.env.WEBSITE_URL}/api/store/purchase/rank/${rankId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Internal-Request": "true", // Güvenlik için
                },
                body: JSON.stringify({
                    username: user.username,
                    bypass_balance_check: true, // Bakiye kontrolünü atla
                    payment_method: "buymeacoffee_membership",
                    transaction_id: body.event_id,
                })
            });// Eğer pending'den geliyorsa resolve et
                await PendingMembershipManager.getInstance().resolvePendingMembership(
                    body.event_id,
                    user.username
                );
                
                

            if (response.ok) {
                ConsoleManager.log("BuyMeACoffeeMembershipHandler", 
                    `Rank ${rankId} granted to ${user.username} via BMC membership`);
                
                const successMessage = `✅ **Membership Satın Alma Başarılı!**\n\n` +
                    `**Kullanıcı:** ${user.username}\n` +
                    `**Email:** ${body.data.supporter_email}\n` +
                    `**Rank:** ${body.data.membership_level_name}\n` +
                    `**Fiyat:** ${body.data.currency} (Stripe üzerinden)\n` +
                    `**Süre:** ${body.data.subscription_duration_type === 'month' ? '1 Ay' : '1 Yıl'}\n` +
                    `**Başlangıç:** <t:${body.data.subscription_current_period_start}:F>\n` +
                    `**Bitiş:** <t:${body.data.subscription_current_period_end}:F>\n` +
                    `**Transaction ID:** ${body.event_id}`;
                
                WebhookManager.sendEmbedWebhook(
                    "🎉 Yeni Membership Satışı",
                    successMessage,
                    0x00FF00 // Yeşil
                );
            } else {
                const errorData = await response.json();
                ConsoleManager.error("BuyMeACoffeeMembershipHandler", 
                    `Failed to grant rank: ${errorData.name}`);
                
                WebhookManager.sendEmbedWebhook(
                    "❌ Rank Grant Failed",
                    `**User:** ${user.username}\n**Rank:** ${rankId}\n**Error:** ${errorData.name}`,
                    0xFF0000
                );
            }
        } else if (body.type === "membership.cancelled") {
            ConsoleManager.log("BuyMeACoffeeMembershipHandler", 
                `Membership cancelled for ${user.username}`);
            
            WebhookManager.sendEmbedWebhook(
                "⚠️ Membership Cancelled",
                `**User:** ${user.username}\n**Rank:** ${body.data.membership_level_name}`,
                0xFFA500
            );
        }

        return res.status(200).json({ name: "Success" });
    } catch (error) {
        console.error(error);
        ConsoleManager.error("BuyMeACoffeeMembershipHandler", (error as any).message);
        return res.status(400).json({ name: "Invalid request" });
    }
}
