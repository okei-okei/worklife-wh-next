import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

const legalLinks = [
  { href: "/legal/terms", label: "利用規約" },
  { href: "/legal/privacy", label: "プライバシーポリシー" },
  { href: "/legal/cookies", label: "Cookieポリシー" },
  { href: "/legal", label: "法務一覧" },
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

        <nav className="flex min-w-0 flex-wrap gap-x-4 gap-y-2">
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
