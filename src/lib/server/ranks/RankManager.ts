import LuckPermsUserPermissions from '../database/mysql/LuckPermsUsersModel';
import { Op } from 'sequelize';
import ConsoleManager from '../logs/ConsoleManager';

declare global {
    var luckPermsRankManager: RankManager;
}

export default class RankManager {
    private constructor() {
        ConsoleManager.info('RankManager', 'RankManager initialized');
    }

    public static getInstance(): RankManager {
        if (!global.luckPermsRankManager) {
            global.luckPermsRankManager = new RankManager();
        }
        return global.luckPermsRankManager;
    }

    /**
     * Oyuncuya rütbe atar - direkt LuckPerms database'ine yazar
     * @param uuid Oyuncu UUID'si
     * @param rankId Rütbe ID'si (cirak, asil, soylu, senyor)
     */
    public async setPlayerRank(uuid: string, rankId: string): Promise<void> {
        const validRanks = ['oyuncu', 'cirak', 'asil', 'soylu', 'senyor'];
        
        if (!validRanks.includes(rankId.toLowerCase())) {
            throw new Error(`Invalid rank: ${rankId}`);
        }

        const rankPermission = `group.${rankId.toLowerCase()}`;

        try {
            // Önce tüm rütbe permissionlarını sil (bir oyuncunun sadece bir rütbesi olmalı)
            await LuckPermsUserPermissions.destroy({
                where: {
                    uuid: uuid,
                    permission: {
                        [Op.in]: validRanks.map(r => `group.${r}`)
                    }
                }
            });

            // Yeni rütbeyi ekle
            await LuckPermsUserPermissions.create({
                uuid: uuid,
                permission: rankPermission,
                value: true,
                server: 'global',
                world: 'global',
                expiry: 0,
                contexts: '{}'
            });

            ConsoleManager.info('RankManager', `Rank set for ${uuid}: ${rankPermission}`);
        } catch (error: any) {
            ConsoleManager.error('RankManager', `Failed to set rank: ${error.message}`);
            throw error;
        }
    }

    /**
     * Oyuncunun mevcut rütbesini döndürür
     */
    public async getPlayerRank(uuid: string): Promise<string | null> {
        const validRanks = ['senyor', 'soylu', 'asil', 'cirak', 'oyuncu'];
        
        try {
            const permissions = await LuckPermsUserPermissions.findAll({
                where: {
                    uuid: uuid,
                    permission: {
                        [Op.in]: validRanks.map(r => `group.${r}`)
                    }
                }
            });

            // En yüksek rütbeyi döndür (öncelik sırasına göre)
            for (const rank of validRanks) {
                if (permissions.some((p: any) => p.permission === `group.${rank}`)) {
                    return rank;
                }
            }

            return null;
        } catch (error: any) {
            ConsoleManager.error('RankManager', `Failed to get rank: ${error.message}`);
            return null;
        }
    }
}
