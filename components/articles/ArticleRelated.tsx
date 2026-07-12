import RelatedArticles from "@/components/articles/RelatedArticles";
import type { Article } from "@/lib/articles";

export default function ArticleRelated({ articles }: { articles: Article[] }) {
  return <RelatedArticles articles={articles} title="関連記事" />;
}
