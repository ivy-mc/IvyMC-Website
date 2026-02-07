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

        // BuyMeACoffee kullanıcı adınız
        const bmcUsername = process.env.BUYMEACOFFEE_USERNAME || 'ivymc';
        
        // Tüm membership seçeneklerinin yer aldığı genel membership sayfası
        // Hangi rank'e tıklamış olursa olsun, kullanıcı bu sayfada tüm seçenekleri görecek
        const membershipUrl = `https://www.buymeacoffee.com/${bmcUsername}/membership`;

        console.log(`[create-checkout] Redirecting to BMC membership page for rank: ${rank_id}`);

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
