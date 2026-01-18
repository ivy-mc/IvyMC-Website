import PendingMembershipManager from "@/lib/server/payment/PendingMembershipManager";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    has_pending: boolean;
    count: number;
    memberships?: Array<{
        rank_name: string;
        supporter_email: string;
        created_at: number;
    }>;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== "GET") {
        return res.status(405).json({ 
            has_pending: false,
            count: 0 
        });
    }

    try {
        const { email } = req.query;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ 
                has_pending: false,
                count: 0 
            });
        }

        const pendingMemberships = await PendingMembershipManager.getInstance()
            .getPendingByEmail(email);

        const memberships = pendingMemberships.map(p => ({
            rank_name: p.membership_level_name,
            supporter_email: p.supporter_email,
            created_at: p.created_at,
        }));

        return res.status(200).json({
            has_pending: pendingMemberships.length > 0,
            count: pendingMemberships.length,
            memberships: memberships,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            has_pending: false,
            count: 0 
        });
    }
}
