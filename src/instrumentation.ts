import EventEmitter from "events";
import BlogManager from "./lib/server/blogs/BlogManager";
import GuideManager from "./lib/server/guides/GuideManager";
import RanksManager from "./lib/server/store/RanksManager";

// Check if running in serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        EventEmitter.defaultMaxListeners = 100;
        
        // Fetch data in both traditional and serverless environments
        // In serverless, the interval polling is disabled but initial fetch is needed
        await BlogManager.getInstance().fetchBlogs();
        await GuideManager.getInstance().fetchGuides();
        await RanksManager.getInstance().fetchRanks();
    }
}