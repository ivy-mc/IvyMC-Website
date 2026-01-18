import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { rank_id, price_try } = req.body;

        if (!rank_id || !price_try) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // BuyMeACoffee Membership Plan Mapping
        // BMC'de oluşturduğunuz her rank için membership plan ID'leri
        const membershipPlans: Record<string, string> = {
            'cirak': '12345',    // BMC'de oluşturduğunuz Çırak membership ID'si
            'asil': '12346',     // Asil membership ID'si
            'soylu': '12347',    // Soylu membership ID'si
            'senyor': '12348',   // Senyor membership ID'si
        };

        const planId = membershipPlans[rank_id];
        
        if (!planId) {
            return res.status(400).json({ error: 'Invalid rank ID' });
        }

        // BuyMeACoffee kullanıcı adınız
        const bmcUsername = process.env.BUYMEACOFFEE_USERNAME || 'ivymc';
        
        // BMC Membership URL'i - kullanıcı bu sayfaya yönlendirilecek
        // BMC otomatik olarak Stripe üzerinden ödeme alacak
        const membershipUrl = `https://www.buymeacoffee.com/${bmcUsername}/membership/${planId}`;

        console.log(`[create-checkout] Redirecting to BMC membership: ${membershipUrl}`);

        return res.status(200).json({
            url: membershipUrl,
            rank_id: rank_id,
            price_try: price_try
        });
    } catch (error) {
        console.error('[create-checkout] Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
