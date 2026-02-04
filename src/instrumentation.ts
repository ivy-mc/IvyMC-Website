import EventEmitter from "events";
import BlogManager from "./lib/server/blogs/BlogManager";
import GuideManager from "./lib/server/guides/GuideManager";
import RanksManager from "./lib/server/store/RanksManager";

// Check if running in serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        EventEmitter.defaultMaxListeners = 100;
        
        // In serverless, fetch on-demand; in traditional environments, fetch and cache
        if (!isServerless) {
            await BlogManager.getInstance().fetchBlogs();
            await GuideManager.getInstance().fetchGuides();
            await RanksManager.getInstance().fetchRanks();
        } else {
            // Initialize managers but don't fetch immediately in serverless
            // Data will be fetched on-demand when needed
            BlogManager.getInstance();
            GuideManager.getInstance();
            RanksManager.getInstance();
        }
    }
}