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

    public static getInstance(): RedisManager {
        if (!global.redisManager) {
            global.redisManager = new RedisManager();
        }

        return global.redisManager;
    }
}