export const ARTICLE_CATEGORIES = [
  "お金",
  "家探し",
  "仕事探し",
  "渡航準備",
  "SIM・通信",
  "銀行・送金",
  "保険",
  "現地生活",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];
export type ArticleStatus = "draft" | "published";

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: ArticleCategory;
  cover_image_url: string | null;
  status: ArticleStatus;
  views: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type ArticleInput = Pick<
  Article,
  | "title"
  | "slug"
  | "excerpt"
  | "content"
  | "category"
  | "cover_image_url"
  | "status"
>;

export function isArticleCategory(value: string): value is ArticleCategory {
  return ARTICLE_CATEGORIES.includes(value as ArticleCategory);
}

export function normalizeArticleSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

