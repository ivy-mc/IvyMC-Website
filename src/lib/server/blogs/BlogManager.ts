import { BLOGS_DATA } from "@/data/blogs";

export type Blog = {
    id: number;
    attributes: {
        title: string;
        category: string;
        description: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        thumbnail: string;
        path: string;
    }
}

declare global {
    var blogManager: BlogManager;
}

export default class BlogManager {
    public blogs: Blog[] = [];

    private constructor() {
        this.blogs = BLOGS_DATA.sort((a, b) => {
            return new Date(b.attributes.publishedAt).getTime() - new Date(a.attributes.publishedAt).getTime();
        });
    }

    public static getInstance(): BlogManager {
        if (!global.blogManager) {
            global.blogManager = new BlogManager();
        }

        return global.blogManager;
    }

    public async getBlogs(): Promise<Blog[]> {
        return this.blogs;
    }
}