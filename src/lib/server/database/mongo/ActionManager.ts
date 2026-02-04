import { Collection } from "mongodb";
import MongoManager from "./MongoManager";
import ConsoleManager from "../../logs/ConsoleManager";

declare global {
    var actionManager: ActionManager;
}

export type Action = {
    type: "COMMAND" | "UNKNOWN";
    reason: string;
    command: string;
    server_type: "REALMS" | "REALMS_SPAWN" | "REALMS_OUTLAND" | null;
    date: Date;
    executed?: boolean;
    executed_at?: Date;
    error?: string;
}

export default class ActionManager {
    private collection: Collection<Action>;

    private constructor() {
        this.collection = MongoManager.getInstance().minecraftDatabase.collection<Action>("pending_actions");
        ConsoleManager.info('ActionManager', 'ActionManager initialized - commands will be stored in MongoDB');
    }

    public static getInstance(): ActionManager {
        if (!global.actionManager) {
            global.actionManager = new ActionManager();
        }

        return global.actionManager;
    }

    public async sendAction(action: Action) {
        // Ensure MongoDB connection is active
        await MongoManager.getInstance().ensureConnected();
        
        // MongoDB'ye kaydet (log/history amaçlı)
        await this.collection.insertOne({
            ...action,
            executed: false
        });
    }
}