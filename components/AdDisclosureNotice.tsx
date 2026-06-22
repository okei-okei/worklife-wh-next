import Link from "next/link";

type AdDisclosureNoticeProps = {
  compact?: boolean;
};

export default function AdDisclosureNotice({
  compact = false,
}: AdDisclosureNoticeProps) {
  return (
    <div
      className={`rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 ${
        compact ? "p-4 text-sm" : "p-4 text-sm md:p-5"
      }`}
    >
      <div className="space-y-3 font-medium leading-7">
        <p>
          WorkLife WHでは、広告として強くおすすめするのではなく、契約前に条件を比較・確認しやすい形で情報を整理しています。
        </p>
        <p>
          このページには広告・紹介リンクが含まれる場合があります。掲載内容は、料金、利用条件、対応エリア、ワーホリ・海外生活との相性などをもとに、WorkLife WHの基準で整理しています。
        </p>
        <p>
          実際に契約・申込みを行う前には、必ず各サービスの公式サイトで最新情報をご確認ください。
        </p>
        <p className="text-xs font-bold">広告・紹介リンクを含む場合があります</p>
        <details className="rounded-md border border-amber-300 bg-white/60 p-3">
          <summary className="cursor-pointer font-bold">広告・紹介リンクについて</summary>
          <p className="mt-2 text-sm leading-7">
            WorkLife WHでは、一部ページに広告・紹介リンクを掲載する場合があります。ユーザーがリンク経由で申込みや契約を行った場合、WorkLife WHが報酬を受け取ることがあります。ただし、掲載するサービスは、ワーホリ・海外生活に役立つか、条件が比較しやすいか、契約前に確認すべき情報が明確かを基準に整理しています。
          </p>
        </details>
        <Link href="/legal/affiliate-disclosure" className="inline-block font-bold text-amber-900 underline">
          広告・紹介リンク開示を確認する
        </Link>
      </div>
    </div>
  );
}
