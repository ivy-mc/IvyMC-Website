import MongoManager from '../database/mongo/MongoManager';
import { Collection } from 'mongodb';

declare global {
    var pendingMembershipManager: PendingMembershipManager;
}

export type PendingMembership = {
    _id?: string;
    supporter_email: string;
    supporter_name: string;
    membership_level_id: string;
    membership_level_name: string;
    rank_id: string;
    transaction_id: string;
    currency: string;
    subscription_duration_type: string;
    subscription_current_period_start: string;
    subscription_current_period_end: string;
    created_at: number;
    resolved: boolean;
    resolved_at?: number;
    resolved_for_user?: string;
};

export default class PendingMembershipManager {
    private collection: Collection<PendingMembership>;

    private constructor() {
        this.collection = MongoManager.getInstance().minecraftDatabase
            .collection<PendingMembership>('pending_memberships');
    }

    public static getInstance(): PendingMembershipManager {
        if (!global.pendingMembershipManager) {
            global.pendingMembershipManager = new PendingMembershipManager();
        }
        return global.pendingMembershipManager;
    }

    public async savePendingMembership(membership: Omit<PendingMembership, '_id' | 'created_at' | 'resolved'>): Promise<void> {
        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        await this.collection.insertOne({
            ...membership,
            created_at: Date.now(),
            resolved: false
        } as PendingMembership);
    }

    public async getPendingByEmail(email: string): Promise<PendingMembership[]> {
        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        return await this.collection.find({
            supporter_email: email,
            resolved: false
        }).toArray();
    }

    public async getAllPending(): Promise<PendingMembership[]> {
        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        return await this.collection.find({
            resolved: false
        }).toArray();
    }

    public async getPendingByTransactionId(transactionId: string): Promise<PendingMembership | null> {
        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        return await this.collection.findOne({
            transaction_id: transactionId,
            resolved: false
        });
    }

    public async resolvePendingMembership(transactionId: string, username: string): Promise<void> {
        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        await this.collection.updateOne(
            { transaction_id: transactionId },
            {
                $set: {
                    resolved: true,
                    resolved_at: Date.now(),
                    resolved_for_user: username
                }
            }
        );
    }

    public async cleanupOldResolved(daysOld: number = 30): Promise<number> {
        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        const result = await this.collection.deleteMany({
            resolved: true,
            resolved_at: { $lt: cutoffTime }
        });
        return result.deletedCount;
    }
}
