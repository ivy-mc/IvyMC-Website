import { createClient, RedisClientType } from 'redis';
import ConsoleManager from '../../logs/ConsoleManager';

declare global {
    var redisManager: RedisManager;
}

// Check if running in serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

export default class RedisManager {
    private client: RedisClientType;

    private constructor() {
        this.client = createClient({
            url: process.env.REDIS_URI,
            socket: {
                connectTimeout: 10000,
                // Keep-alive disabled in serverless for proper connection cleanup
                // Vercel serverless functions are stateless and connections should not persist
                keepAlive: isServerless ? 0 : 30000,
            }
        });
        this.client.connect().then(async () => {
            ConsoleManager.debug('Redis Manager', 'Connected to Redis');
        }).catch(err => {
            ConsoleManager.error('Redis Manager', 'Failed to connect to Redis: ' + err.message);
        });
    }

    public getClient(): RedisClientType {
        return this.client;
    }

    public async ensureConnected(): Promise<void> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            await this.client.ping();
        } catch (err) {
            ConsoleManager.error('Redis Manager', 'Reconnecting to Redis...');
            try {
                if (!this.client.isOpen) {
                    await this.client.connect();
                }
            } catch (reconnectErr) {
                ConsoleManager.error('Redis Manager', 'Redis reconnection failed: ' + (reconnectErr as any).message);
                throw reconnectErr;
            }
        }
    }

    public static getInstance(): RedisManager {
        if (!global.redisManager) {
            global.redisManager = new RedisManager();
        }

        return global.redisManager;
    }
}