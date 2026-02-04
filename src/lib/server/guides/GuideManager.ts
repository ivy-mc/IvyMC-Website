import Util from "@/lib/common/Util";
import axios from "axios"

export type Guide = {
    id: number;
    attributes: {
        title: string,
        sub_title: string,
        description: string,
        createdAt: Date,
        updatedAt: Date,
        publishedAt: Date,
        background: string,
        path: string,
        icon: StrapiImage,
    }
}

declare global {
    var guideManager: GuideManager;
}

// Check if running in serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

export default class GuideManager {
    public guides: Guide[] = [];
    private isFetching: boolean = false;
    private lastFetchTime: number = 0;
    private cacheDuration: number = 10000; // 10 seconds cache in serverless
    private fetchPromise: Promise<Guide[]> | null = null;


    private constructor() {
        // Only set up polling in non-serverless environments
        if (!isServerless && process.env.NEXT_RUNTIME === 'nodejs') {
            setInterval(async () => {
                await this.fetchGuides();
            }, 1000 * 10);
        }
    }

    public static getInstance(): GuideManager {
        if (!global.guideManager) {
            global.guideManager = new GuideManager();
        }

        return global.guideManager;
    }

    // Get guides with automatic fetch if empty or stale
    public async getGuides(): Promise<Guide[]> {
        const now = Date.now();
        const shouldRefetch = isServerless && (now - this.lastFetchTime > this.cacheDuration);
        
        if ((this.guides.length === 0 || shouldRefetch) && !this.isFetching) {
            await this.fetchGuides();
        } else if (this.isFetching && this.fetchPromise) {
            // Wait for the ongoing fetch to complete
            await this.fetchPromise;
        }
        
        return this.guides;
    }

    public async fetchGuides(): Promise<Guide[]> {
        if (this.isFetching && this.fetchPromise) {
            // Return the existing promise to wait for the ongoing fetch
            return this.fetchPromise;
        }
        
        this.isFetching = true;
        this.fetchPromise = (async () => {
            try {
                const result = await axios.get(process.env.STRAPI_URL + "/api/guides?populate=*",
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${process.env.STRAPI_TOKEN}`
                        }
                    }).then((response) => response.data as { data: Guide[] });

                this.guides = result.data.map((guide) => {
                    return {
                        id: guide.id,
                        attributes: {
                            title: guide.attributes.title,
                            sub_title: guide.attributes.sub_title,
                            description: guide.attributes.description,
                            createdAt: guide.attributes.createdAt,
                            updatedAt: guide.attributes.updatedAt,
                            publishedAt: guide.attributes.publishedAt,
                            background: guide.attributes.background,
                            path: Util.slugify(guide.attributes.title),
                            icon: {
                                data: {
                                    attributes: {
                                        name: guide.attributes.icon.data.attributes.name,
                                        width: guide.attributes.icon.data.attributes.width,
                                        height: guide.attributes.icon.data.attributes.height,
                                        url: guide.attributes.icon.data.attributes.url,
                                        blurhash: guide.attributes.icon.data.attributes.blurhash,
                                        formats: {
                                            thumbnail: {
                                                url: guide.attributes.icon.data.attributes.formats.thumbnail.url,
                                                width: guide.attributes.icon.data.attributes.formats.thumbnail.width,
                                                height: guide.attributes.icon.data.attributes.formats.thumbnail.height
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }).sort((a, b) => {
                    return new Date(b.attributes.publishedAt).getTime() - new Date(a.attributes.publishedAt).getTime();
                });
                this.lastFetchTime = Date.now();
                return this.guides;
            } catch (error) {
                console.error("Error fetching guides", error);
                return [];
            } finally {
                this.isFetching = false;
                this.fetchPromise = null;
            }
        })();
        
        return this.fetchPromise;
    }
}