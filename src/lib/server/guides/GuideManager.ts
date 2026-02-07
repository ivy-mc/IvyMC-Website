import { GUIDES_DATA } from "@/data/guides";

export type Guide = {
    id: number;
    attributes: {
        title: string,
        sub_title: string,
        description: string,
        createdAt: string,
        updatedAt: string,
        publishedAt: string,
        background: string,
        path: string,
        icon: string,
    }
}

declare global {
    var guideManager: GuideManager;
}

export default class GuideManager {
    public guides: Guide[] = [];

    private constructor() {
        this.guides = GUIDES_DATA.sort((a, b) => {
            return new Date(b.attributes.publishedAt).getTime() - new Date(a.attributes.publishedAt).getTime();
        });
    }

    public static getInstance(): GuideManager {
        if (!global.guideManager) {
            global.guideManager = new GuideManager();
        }

        return global.guideManager;
    }

    public async getGuides(): Promise<Guide[]> {
        return this.guides;
    }
}