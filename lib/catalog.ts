export type CatalogMovie = {
  slug: string;
  title: string;
  description: string;
  access: "免费试看" | "会员专享" | "会员或单片购买";
  priceCents: number;
  previewSeconds: number;
};

export const catalogMovies: CatalogMovie[] = [
  {
    slug: "hanabi-prologue",
    title: "花火：序章",
    description: "一段关于重逢与夏夜烟火的都市故事。",
    access: "会员或单片购买",
    priceCents: 1800,
    previewSeconds: 120,
  },
  {
    slug: "midnight-route",
    title: "午夜航线",
    description: "穿过云层的深夜航班，载着每位旅客未说出口的心事。",
    access: "会员专享",
    priceCents: 0,
    previewSeconds: 0,
  },
  {
    slug: "cloud-echo",
    title: "云端回声",
    description: "一位声音设计师在旧磁带中发现来自未来的回信。",
    access: "免费试看",
    priceCents: 0,
    previewSeconds: 600,
  },
];

export function getCatalogMovie(slug: string) {
  return catalogMovies.find((movie) => movie.slug === slug);
}
