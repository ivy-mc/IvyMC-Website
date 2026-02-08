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
            title: "Kapalı Beta Başladı!",
            category: "Duyuru",
            description: `## Hoş Geldiniz!

IvyMC sunucusunun kapalı beta sürümü resmi olarak başladı! Seçkin oyuncularımızı aramıza davet ediyoruz.

### Beta Testi Nedir?
Kapalı beta sürecinde sunucumuzu geliştirmek için sizin geri bildiriminize ihtiyacımız var. Oyun deneyimini, performansı ve içeriği birlikte şekillendireceğiz.

### Özel Beta Avantajları
- **Erken Erişim**: Yeni özellikleri ilk deneyenler olun
- **Şekillendirin**: Sunucunun geleceğine doğrudan etki edin
- **Eksklusif**: Beta testerlar için özel rozetler ve rewards
- **Topluluk**: Gelişim sürecinde aktif olun

### Bizi Destekle
Geri bildirim, sorun raporları ve önerilerinizi paylaşarak sunucuyu iyileştirmemize yardım edin.

Beta'ya katılmak için Discord sunucumuzda başvuru yapabilirsiniz!`,
            createdAt: "2026-02-08T10:00:00.000Z",
            updatedAt: "2026-02-08T10:00:00.000Z",
            publishedAt: "2026-02-08T10:00:00.000Z",
            thumbnail: "/assets/blogs/acilis-duyurusu.png",
            path: "/ivymc-kapali-beta",
        },
    },
];
