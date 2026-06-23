import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

const legalLinks = [
  { href: "/legal/terms", label: "利用規約" },
  { href: "/legal/privacy", label: "プライバシーポリシー" },
  { href: "/legal/cookies", label: "Cookieポリシー" },
  { href: "/legal/affiliate-disclosure", label: "広告・アフィリエイト開示" },
  { href: "/legal/ai-policy", label: "AI利用ポリシー" },
  { href: "/legal/job-listing-terms", label: "求人掲載規約" },
  { href: "/legal/property-listing-terms", label: "物件掲載規約" },
  { href: "/legal/community-guidelines", label: "コミュニティガイドライン" },
  { href: "/legal/data-policy", label: "データ利用ポリシー" },
  { href: "/legal/business-terms", label: "企業向け利用規約" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 text-sm font-medium text-gray-600 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <p className="text-base font-bold text-gray-900">
            © {siteConfig.name}
          </p>
          <p>
            運営: {siteConfig.operatorName}
          </p>
          <p>
            お問い合わせ:{" "}
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="font-bold text-gray-900 underline"
            >
              {siteConfig.supportEmail}
            </a>
          </p>
        </div>

        <nav className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="break-words hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
