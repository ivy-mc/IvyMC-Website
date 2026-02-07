import { RANKS_DATA } from "@/data/ranks";


export type RankPrivileges = {
    rank: string;
    color: string;
    groups: {
        title: string;
        privileges: {
            icon_id: string;
            text: string;
        }[];
    }[];
}


export type PublicRank = {
    id: number;
    attributes: {
        privileges: RankPrivileges;
        title: string,
        credit_market_id: string,
        discount_percentage: number | null,
        discount_end_date: string | null,
        icon: string,
        price: number | null;
        priceEur?: number | null;
    }
}

export type Rank = {
    attributes: {
        commands: string[] | null;
        item: string | null;
        publishedAt: string;
    }
} & PublicRank;

export type CreditMarketProduct = {
    id: string;
    name: string;
    description: string;
    commands: string[];
    item: string;
    amount: number;
    price: number;
}

export type CreditMarket = {
    ranks: CreditMarketProduct[];
    crates: CreditMarketProduct[];
}

declare global {
    var rankManager: RankManager;
}

export default class RankManager {
    public ranks: Rank[] = [];

    private constructor() {
        this.ranks = RANKS_DATA.map((rank) => {
            const result = { ...rank };
            // İndirim süresi dolmuşsa indirimi kaldır
            if (result.attributes.discount_percentage && result.attributes.discount_end_date) {
                const end_date = new Date(result.attributes.discount_end_date);
                const now = new Date();
                if (end_date < now) {
                    result.attributes = {
                        ...result.attributes,
                        discount_percentage: null,
                        discount_end_date: null,
                    };
                }
            }
            return result;
        }).sort((a, b) => {
            return new Date(a.attributes.publishedAt).getTime() - new Date(b.attributes.publishedAt).getTime();
        });
    }

    public static getInstance(): RankManager {
        if (!global.rankManager) {
            global.rankManager = new RankManager();
        }

        return global.rankManager;
    }

    public async getRanks(): Promise<Rank[]> {
        return this.ranks;
    }

    public getPublicRanks(): PublicRank[] {
        return this.ranks.map((rank) => {
            return {
                id: rank.id,
                attributes: {
                    title: rank.attributes.title,
                    credit_market_id: rank.attributes.credit_market_id,
                    discount_percentage: rank.attributes.discount_percentage,
                    discount_end_date: rank.attributes.discount_end_date,
                    icon: rank.attributes.icon,
                    price: rank.attributes.price,
                    priceEur: rank.attributes.priceEur,
                    privileges: rank.attributes.privileges,
                }
            }
        });
    }

    public getRankByCreditMarketId(creditMarketId: string): Rank | null {
        return this.ranks.find((rank) => rank.attributes.credit_market_id === creditMarketId) || null;
    }
}