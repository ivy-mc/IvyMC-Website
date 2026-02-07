import { Rank, CreditMarket } from "@/lib/server/store/RanksManager";

/**
 * Statik rütbe verileri.
 * Yeni rütbe eklemek veya fiyat güncellemek için burayı düzenleyin.
 * Görselleri /public/assets/ranks/ klasörüne koyun.
 */
export const RANKS_DATA: Rank[] = [
    {
        id: 1,
        attributes: {
            title: "Çırak",
            credit_market_id: "cirak",
            discount_percentage: null,
            discount_end_date: null,
            icon: "/assets/ranks/cirak.png",
            price: 100,
            priceEur: 1,
            item: null,
            commands: null,
            publishedAt: "2025-01-01T00:00:00.000Z",
            privileges: {
                rank: "Çırak",
                color: "#6b7280",
                groups: [
                    {
                        title: "Genel Avantajlar",
                        privileges: [
                            { icon_id: "home", text: "3 ev hakkı" },
                            { icon_id: "star", text: "Özel sohbet rengi" },
                        ],
                    },
                ],
            },
        },
    },
    {
        id: 2,
        attributes: {
            title: "Asil",
            credit_market_id: "asil",
            discount_percentage: null,
            discount_end_date: null,
            icon: "/assets/ranks/asil.png",
            price: 400,
            priceEur: 4,
            item: null,
            commands: null,
            publishedAt: "2025-01-01T00:01:00.000Z",
            privileges: {
                rank: "Asil",
                color: "#f97316",
                groups: [
                    {
                        title: "Genel Avantajlar",
                        privileges: [
                            { icon_id: "home", text: "5 ev hakkı" },
                            { icon_id: "star", text: "Özel sohbet rengi" },
                            { icon_id: "pets", text: "Evcil hayvan erişimi" },
                        ],
                    },
                ],
            },
        },
    },
    {
        id: 3,
        attributes: {
            title: "Soylu",
            credit_market_id: "soylu",
            discount_percentage: null,
            discount_end_date: null,
            icon: "/assets/ranks/soylu.png",
            priceEur: 7,
            price: 700,
            item: null,
            commands: null,
            publishedAt: "2025-01-01T00:02:00.000Z",
            privileges: {
                rank: "Soylu",
                color: "#eab308",
                groups: [
                    {
                        title: "Genel Avantajlar",
                        privileges: [
                            { icon_id: "home", text: "8 ev hakkı" },
                            { icon_id: "star", text: "Özel sohbet rengi" },
                            { icon_id: "pets", text: "Evcil hayvan erişimi" },
                            { icon_id: "flight", text: "Uçuş erişimi" },
                        ],
                    },
                ],
            },
        },
    },
    {
        id: 4,
        attributes: {
            title: "Senyör",
            credit_market_id: "senyor",
            discount_percentage: null,
            discount_end_date: null,
            icon: "/assets/ranks/senyor.png",
            priceEur: 10,
            price: 1050,
            item: null,
            commands: null,
            publishedAt: "2025-01-01T00:03:00.000Z",
            privileges: {
                rank: "Senyör",
                color: "#a855f7",
                groups: [
                    {
                        title: "Genel Avantajlar",
                        privileges: [
                            { icon_id: "home", text: "12 ev hakkı" },
                            { icon_id: "star", text: "Özel sohbet rengi" },
                            { icon_id: "pets", text: "Evcil hayvan erişimi" },
                            { icon_id: "flight", text: "Uçuş erişimi" },
                            { icon_id: "diamond", text: "VIP etkinlik erişimi" },
                        ],
                    },
                ],
            },
        },
    },
];

/**
 * Statik kredi market verileri.
 */
export const CREDIT_MARKET_DATA: CreditMarket = {
    ranks: [
        {
            id: "cirak",
            name: "Çırak",
            description: "Çırak rütbesi",
            commands: [],
            item: "IRON_SWORD",
            amount: 1,
            price: 50,
        },
        {
            id: "asil",
            name: "Asil",
            description: "Asil rütbesi",
            commands: [],
            item: "GOLDEN_SWORD",
            amount: 1,
            price: 100,
        },
        {
            id: "soylu",
            name: "Soylu",
            description: "Soylu rütbesi",
            commands: [],
            item: "DIAMOND_SWORD",
            amount: 1,
            price: 200,
        },
        {
            id: "senyor",
            name: "Senyör",
            description: "Senyör rütbesi",
            commands: [],
            item: "NETHERITE_SWORD",
            amount: 1,
            price: 400,
        },
    ],
    crates: [],
};
