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
    private connectionPromise: Promise<void> | null = null;
    private isConnected: boolean = false;

    private constructor() {
        // Serverless-friendly MongoDB configuration
        this.client = new MongoClient(process.env.MONGO_URI as string, {
            maxPoolSize: isServerless ? 1 : 10,
            minPoolSize: 0,
            maxIdleTimeMS: 10000,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        this.websiteDatabase = this.client.db("website");
        this.minecraftDatabase = this.client.db("minecraft");
        
        // Initiate connection but don't await it in constructor
        this.connectionPromise = this.connect();
        
        // Only initialize other managers in non-serverless environments
        // In serverless, managers will be initialized on-demand
        if (!isServerless && process.env.NEXT_RUNTIME === 'nodejs') {
            RedisManager.getInstance();
            MysqlManager.getInstance();
        }
    }

    private async connect(): Promise<void> {
        try {
            await this.client.connect();
            this.isConnected = true;
            ConsoleManager.debug('Mongo Manager', 'Connected to MongoDB');
        } catch (err) {
            this.isConnected = false;
            ConsoleManager.error('Mongo Manager', 'Failed to connect to MongoDB: ' + (err as Error).message);
            throw err;
        }
    }

    /**
     * Ensures the MongoDB client is connected before performing operations.
     * This is critical for serverless environments where connections may be closed between invocations.
     */
    public async ensureConnected(): Promise<void> {
        // If already connected, try to ping the database to verify connection is alive
        if (this.isConnected) {
            try {
                // Quick check to verify connection is still alive
                await this.client.db('admin').command({ ping: 1 });
                return;
            } catch (err) {
                // Connection is dead, mark as disconnected and reconnect
                ConsoleManager.debug('Mongo Manager', 'Connection lost, reconnecting...');
                this.isConnected = false;
            }
        }

        // If connection is in progress, wait for it
        if (this.connectionPromise) {
            try {
                await this.connectionPromise;
                return;
            } catch (err) {
                // Connection failed, try to reconnect
                this.connectionPromise = null;
            }
        }

        // Connection is closed or never established, reconnect
        ConsoleManager.debug('Mongo Manager', 'Reconnecting to MongoDB');
        this.connectionPromise = this.connect();
        await this.connectionPromise;
    }

    public static getInstance(): MongoManager {
        if (!global.mongoManager) {
            global.mongoManager = new MongoManager();
        }

        return global.mongoManager;
    }
}