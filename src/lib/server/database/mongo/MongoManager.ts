import { Db, MongoClient } from "mongodb";
import ConsoleManager from "../../logs/ConsoleManager";
import RedisManager from "../redis/RedisManager";
import MysqlManager from "../mysql/MysqlManager";

declare global {
    var mongoManager: MongoManager;
}

// Check if running in serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

export default class MongoManager {
    public client: MongoClient;
    public websiteDatabase: Db;
    public minecraftDatabase: Db;

    private constructor() {
        // Serverless-friendly MongoDB configuration
        this.client = new MongoClient(process.env.MONGO_URI as string, {
            maxPoolSize: isServerless ? 1 : 10,
            minPoolSize: 0,
            maxIdleTimeMS: 10000,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        this.client.connect().then(() => {
            ConsoleManager.debug('Mongo Manager', 'Connected to MongoDB');
        }).catch(err => {
            ConsoleManager.error('Mongo Manager', 'Failed to connect to MongoDB: ' + err.message);
        });
        this.websiteDatabase = this.client.db("website");
        this.minecraftDatabase = this.client.db("minecraft");
        
        // Only initialize other managers in non-serverless environments
        // In serverless, managers will be initialized on-demand
        if (!isServerless && process.env.NEXT_RUNTIME === 'nodejs') {
            RedisManager.getInstance();
            MysqlManager.getInstance();
        }
    }

    public static getInstance(): MongoManager {
        if (!global.mongoManager) {
            global.mongoManager = new MongoManager();
        }

        return global.mongoManager;
    }
}