import ArticleReferralBox from "@/components/articles/ArticleReferralBox";
import A8AdSlot from "@/components/partners/A8AdSlot";
import type { Article } from "@/lib/articles";
import { getA8AdHtml } from "@/lib/constants/partners/a8Ads";
import { referralLinks } from "@/lib/constants/referralLinks";

function getArticleReferralKeys(slug: string) {
  const regular: Array<"wise" | "revolut"> = [];
  const a8: Array<"trifa.text" | "japanGlobalEsim.text" | "glocalEsim.text"> = [];

  if (
    slug === "nz-working-holiday-money-transfer-guide" ||
    slug === "nz-working-holiday-initial-cost"
  ) {
    regular.push("wise");
  }

  if (
    slug === "nz-working-holiday-bank-account-guide" ||
    slug === "nz-arrival-ird-bank-transport-real"
  ) {
    regular.push("wise", "revolut");
  }

  if (
    slug === "nz-working-holiday-sim-esim-comparison" ||
    slug === "nz-working-holiday-real-experience" ||
    slug === "nz-working-holiday-before-departure-checklist"
  ) {
    a8.push("trifa.text", "japanGlobalEsim.text", "glocalEsim.text");
  }

  return { regular, a8 };
}

function getA8ArticleMeta(
  key: "trifa.text" | "japanGlobalEsim.text" | "glocalEsim.text",
) {
  if (key.startsWith("trifa")) {
    return {
      label: "トリファを公式サイトで確認する",
      serviceId: "trifa",
      serviceName: "trifa",
      provider: "trifa",
      programId: "s00000027266001",
    };
  }

  if (key.startsWith("glocalEsim")) {
    return {
      label: "Glocal eSIMを公式サイトで確認する",
      serviceId: "glocal-esim",
      serviceName: "Glocal eSIM",
      provider: "glocal_esim",
      programId: "s00000023372004",
    };
  }

  return {
    label: "JAPAN&GLOBAL eSIMを確認する",
    serviceId: "japan-global-esim",
    serviceName: "JAPAN&GLOBAL eSIM",
    provider: "japan-global-esim",
    programId: "s00000025659001",
  };
}

function getReferralTitle(key: "wise" | "revolut") {
  if (key === "wise") return "Wiseで海外送金を確認する";
  return "Revolutを確認する";
}

function getReferralDescription(key: "wise" | "revolut") {
  if (key === "wise") {
    return "日本からニュージーランドへの送金や多通貨管理を検討するときに確認しやすいサービスです。";
  }
  return "海外生活中のカード決済や多通貨管理の選択肢として確認できます。";
}

export default function ArticleAffiliateSection({ article }: { article: Article }) {
  const referrals = getArticleReferralKeys(article.slug);
  const hasRegularLinks = referrals.regular.length > 0;
  const hasA8Links = referrals.a8.length > 0;

  if (!hasRegularLinks && !hasA8Links) return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-3 md:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold text-gray-900">おすすめサービス</h2>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
          PR
        </span>
      </div>
      <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
        記事内容に関連する提携済みサービスです。申込前には必ず公式サイトで最新条件をご確認ください。
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {referrals.regular.map((key) => {
          const referral = referralLinks[key];
          return (
            <ArticleReferralBox
              key={key}
              title={getReferralTitle(key)}
              description={getReferralDescription(key)}
              href={referral.href}
              provider={referral.provider}
              label={referral.label}
              category={referral.category}
              disclosure={referral.disclosure}
              pagePath={`/articles/${article.slug}`}
              articleSlug={article.slug}
            />
          );
        })}
        {referrals.a8.map((key) => {
          const html = getA8AdHtml(key);
          const meta = getA8ArticleMeta(key);
          if (!html) return null;
          return (
            <div key={key} className="rounded-2xl border border-amber-200 bg-amber-50/40 p-3">
              <p className="mb-2 flex w-fit items-center gap-2 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                <span>PR</span>
                <span>広告・紹介リンク</span>
              </p>
              <p className="mb-3 text-sm font-medium leading-6 text-gray-700">
                {meta.label}
              </p>
              <A8AdSlot
                html={html}
                size="text"
                variant="button"
                analytics={{
                  serviceId: meta.serviceId,
                  serviceName: meta.serviceName,
                  category: meta.serviceId === "glocal-esim" ? "sim" : "sim-esim",
                  provider: meta.provider,
                  network: "A8",
                  affiliateNetwork: "A8.net",
                  programId: meta.programId,
                  adType: "text",
                  pagePath: `/articles/${article.slug}`,
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
