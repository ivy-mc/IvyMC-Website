import { Blog } from "@/lib/server/blogs/BlogManager";

/**
 * Statik blog verileri.
 * Yeni blog eklemek için bu diziye yeni bir Blog nesnesi ekleyin.
 * Görselleri /public/assets/blogs/ klasörüne koyun.
 */
export const BLOGS_DATA: Blog[] = [
    {
        id: 1,
        attributes: {
            title: "IvyMC Açılış Duyurusu",
            category: "Duyuru",
            description: `## Merhaba Oyuncular!

IvyMC sunucusu artık açık! Sizleri benzersiz bir Minecraft deneyimine davet ediyoruz.

### Neler Var?
- **Survival Dünyası**: Arkadaşlarınızla birlikte hayatta kalın
- **Özel Etkinlikler**: Her hafta yeni etkinlikler
- **Topluluk**: Discord sunucumuzda binlerce oyuncu

Hemen sunucumuza katılın ve maceraya başlayın!`,
            createdAt: "2025-01-15T10:00:00.000Z",
            updatedAt: "2025-01-15T10:00:00.000Z",
            publishedAt: "2025-01-15T10:00:00.000Z",
            thumbnail: "/assets/blogs/acilis-duyurusu.jpg",
            path: "/ivymc-acilis-duyurusu",
        },
    },
];
