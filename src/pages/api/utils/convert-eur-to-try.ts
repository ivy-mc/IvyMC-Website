import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
    success: boolean;
    eurAmount?: number;
    tryAmount?: number;
    exchangeRate?: number;
    roundedTryAmount?: number;
    isCached?: boolean;
    error?: string;
};

// Cache için in-memory storage (1 saat TTL)
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 3600000; // 1 saat
const FALLBACK_RATE = 51.4; // Fallback kuru

/**
 * Real-time EURO/TRY kuru çek ve cache'e kaydet
 * Server startup'ında çağrılmalı
 */
export async function initializeExchangeRate() {
    try {
        console.log('[EUR-TRY] Server startup: Real-time kur çekiliyor...');
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
        
        if (response.ok) {
            const data = await response.json();
            if (data.rates && data.rates.TRY) {
                const rate = parseFloat(data.rates.TRY.toFixed(2));
                cachedRate = {
                    rate,
                    timestamp: Date.now()
                };
                console.log(`[EUR-TRY] Başlangıç kuru ayarlandı: 1 EUR = ${rate} TRY`);
                return rate;
            }
        }
    } catch (error) {
        console.error('[EUR-TRY] Startup kuru çekme hatası:', error);
    }
    
    // Fallback
    cachedRate = {
        rate: FALLBACK_RATE,
        timestamp: Date.now()
    };
    console.log(`[EUR-TRY] Fallback kuru kullanılıyor: 1 EUR = ${FALLBACK_RATE} TRY`);
    return FALLBACK_RATE;
}

/**
 * Real-time EURO'dan TL'ye dönüştürme API
 * Query parametresi: amount=<euro_fiyatı>
 * Yuvarlama: En yakın 5 TL'ye (örn: 247 → 250, 232 → 235)
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { amount } = req.query;

        if (!amount || typeof amount !== 'string') {
            return res.status(400).json({ success: false, error: 'Missing or invalid amount parameter' });
        }

        const eurAmount = parseFloat(amount);

        if (isNaN(eurAmount) || eurAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid amount value' });
        }

        let exchangeRate = FALLBACK_RATE;
        let isCached = false;

        // Cache kontrol et
        if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
            exchangeRate = cachedRate.rate;
            isCached = true;
        } else {
            // Real-time kur çek (exchangerate-api.com)
            try {
                const response = await fetch(
                    'https://api.exchangerate-api.com/v4/latest/EUR'
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.rates && data.rates.TRY) {
                        exchangeRate = parseFloat(data.rates.TRY.toFixed(2));
                        // Cache'e kaydet
                        cachedRate = {
                            rate: exchangeRate,
                            timestamp: Date.now()
                        };
                        console.log(`[EUR-TRY API] Yeni kur çekildi: 1 EUR = ${exchangeRate} TRY`);
                    }
                } else {
                    console.warn('[EUR-TRY API] Dış API çağrısı başarısız, fallback kullanılıyor');
                }
            } catch (apiError) {
                console.error('[EUR-TRY API] API hatası:', apiError);
                // Fallback kuru kullan
            }
        }

        // EURO'yu TL'ye çevir
        let tryAmount = eurAmount * exchangeRate;

        // En yakın 5 TL'ye yuvarla
        const roundedTryAmount = Math.round(tryAmount / 5) * 5;

        return res.status(200).json({
            success: true,
            eurAmount,
            tryAmount: Math.round(tryAmount * 100) / 100,
            exchangeRate: Math.round(exchangeRate * 100) / 100,
            roundedTryAmount,
            isCached,
        });
    } catch (error) {
        console.error('Currency conversion error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
