export const ARTICLE_CATEGORIES = [
  "渡航前準備",
  "ビザ",
  "IRDナンバー",
  "銀行口座",
  "SIM",
  "保険",
  "仕事探し",
  "家探し",
  "電気・インターネット",
  "生活費",
  "交通",
  "注意喚起",
  "体験談",
  // Existing values remain available so earlier articles keep working.
  "お金",
  "渡航準備",
  "SIM・通信",
  "銀行・送金",
  "現地生活",
] as const;

export const ARTICLE_STATUSES = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "published",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: ArticleCategory;
  country_code: string | null;
  region: string | null;
  article_type: "general" | "experience";
  cover_image_url: string | null;
  status: ArticleStatus;
  is_user_submitted: boolean;
  submitted_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  is_sponsored: boolean;
  is_affiliate: boolean;
  sponsor_name: string | null;
  related_checklist_items: string[];
  related_service_ids: string[];
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
  | "country_code"
  | "region"
  | "article_type"
  | "cover_image_url"
  | "status"
  | "is_sponsored"
  | "is_affiliate"
  | "sponsor_name"
  | "related_checklist_items"
  | "related_service_ids"
  | "rejected_reason"
>;

export function isArticleCategory(value: string): value is ArticleCategory {
  return ARTICLE_CATEGORIES.includes(value as ArticleCategory);
}

export function isArticleStatus(value: string): value is ArticleStatus {
  return ARTICLE_STATUSES.includes(value as ArticleStatus);
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

export function isPublicArticleStatus(status: ArticleStatus) {
  return status === "published" || status === "approved";
}

export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "下書き",
  pending: "承認待ち",
  approved: "公開済み",
  rejected: "却下",
  published: "公開済み",
};
