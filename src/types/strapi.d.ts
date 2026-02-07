/**
 * Statik görsel tipi.
 * Strapi kaldırıldığı için artık sadece string path kullanıyoruz.
 * Görseller /public/assets/ altında yer almalıdır.
 */
type StaticImage = string;

/**
 * @deprecated StrapiImage artık kullanılmıyor.
 * Geriye dönük uyumluluk için string alias olarak bırakıldı.
 */
type StrapiImage = string;