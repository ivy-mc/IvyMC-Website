import EventEmitter from "events";
import BlogManager from "./lib/server/blogs/BlogManager";
import GuideManager from "./lib/server/guides/GuideManager";
import RanksManager from "./lib/server/store/RanksManager";
import { initializeExchangeRate } from "./pages/api/utils/convert-eur-to-try";

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        EventEmitter.defaultMaxListeners = 100;
        
        // Statik veriden yüklenen manager'ları başlat
        BlogManager.getInstance();
        GuideManager.getInstance();
        RanksManager.getInstance();
        
        // Real-time EURO/TRY kurunu çek ve cache'e kaydet
        await initializeExchangeRate();
    }
}