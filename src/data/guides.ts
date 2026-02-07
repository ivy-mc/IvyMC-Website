import { Guide } from "@/lib/server/guides/GuideManager";

/**
 * Statik rehber verileri.
 * Yeni rehber eklemek için bu diziye yeni bir Guide nesnesi ekleyin.
 * Görselleri /public/assets/guides/ klasörüne koyun.
 */
export const GUIDES_DATA: Guide[] = [
    {
        id: 1,
        attributes: {
            title: "Başlangıç Rehberi",
            sub_title: "SUNUCUYA GİRİŞ",
            description: `## IvyMC'ye Hoş Geldiniz!

Bu rehber, sunucumuza ilk kez katılan oyuncular için hazırlanmıştır.

### Sunucuya Nasıl Bağlanırım?
1. Minecraft'ı açın
2. Multiplayer bölümüne girin
3. Sunucu adresini girin: **play.ivymc.com**
4. Bağlan butonuna tıklayın

### İlk Adımlar
- **/kayit** komutu ile kayıt olun
- **/spawn** komutu ile başlangıç noktasına gidin
- **/rehber** komutu ile oyun içi rehbere ulaşın`,
            createdAt: "2025-01-10T10:00:00.000Z",
            updatedAt: "2025-01-10T10:00:00.000Z",
            publishedAt: "2025-01-10T10:00:00.000Z",
            background: "#1a1a2e",
            path: "baslangic-rehberi",
            icon: "/assets/guides/baslangic-rehberi.png",
        },
    },
];
