import axios from "axios"

export type Blog = {
    id: number;
    attributes: {
        title: string;
        category: string;
        description: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        thumbnail: StrapiImage;
        path: string;
    }
}

declare global {
    var blogManager: BlogManager;
}

// Check if running in serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

export default class BlogManager {
    public blogs: Blog[] = [];
    private isFetching: boolean = false;
    private lastFetchTime: number = 0;
    private cacheDuration: number = 10000; // 10 seconds cache in serverless


    private constructor() {
        // Only set up polling in non-serverless environments
        if (!isServerless && process.env.NEXT_RUNTIME === 'nodejs') {
            setInterval(async () => {
                await this.fetchBlogs();
            }, 1000 * 10);
        }
    }

    public static getInstance(): BlogManager {
        if (!global.blogManager) {
            global.blogManager = new BlogManager();
        }

        return global.blogManager;
    }

    // Get blogs with automatic fetch if empty or stale
    public async getBlogs(): Promise<Blog[]> {
        const now = Date.now();
        const shouldRefetch = isServerless && (now - this.lastFetchTime > this.cacheDuration);
        
        if ((this.blogs.length === 0 || shouldRefetch) && !this.isFetching) {
            await this.fetchBlogs();
        }
        
        return this.blogs;
    }

    public async fetchBlogs(): Promise<Blog[]> {
        if (this.isFetching) {
            // Wait for existing fetch to complete
            return this.blogs;
        }
        
        this.isFetching = true;
        try {
            const result = await axios.get(process.env.STRAPI_URL + "/api/blogs?populate=*",
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`
                    }
                }).then((response) => response.data as { data: Blog[] });

            this.blogs = result.data.map((blog) => {
                return {
                    id: blog.id,
                    attributes: {
                        title: blog.attributes.title,
                        category: blog.attributes.category,
                        description: blog.attributes.description,
                        createdAt: blog.attributes.createdAt,
                        updatedAt: blog.attributes.updatedAt,
                        publishedAt: blog.attributes.publishedAt,
                        path: blog.attributes.path,
                        thumbnail: {
                            data: {
                                attributes: {
                                    name: blog.attributes.thumbnail.data.attributes.name,
                                    width: blog.attributes.thumbnail.data.attributes.width,
                                    height: blog.attributes.thumbnail.data.attributes.height,
                                    url: blog.attributes.thumbnail.data.attributes.url,
                                    blurhash: blog.attributes.thumbnail.data.attributes.blurhash,
                                    formats: {
                                        thumbnail: {
                                            url: blog.attributes.thumbnail.data.attributes.formats.thumbnail.url,
                                            width: blog.attributes.thumbnail.data.attributes.formats.thumbnail.width,
                                            height: blog.attributes.thumbnail.data.attributes.formats.thumbnail.height
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
            return this.blogs;
        } catch (error) {
            console.error("Error fetching blogs", error);
            return [];
        } finally {
            this.isFetching = false;
        }
    }
}