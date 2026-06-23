import Link from "next/link";

export default function AdDisclosureNotice({ detail = false }: { detail?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-800">
      <p className={detail ? "text-xs font-medium leading-6 sm:text-sm" : "text-xs font-medium leading-5 sm:text-sm"}>
        {detail
          ? "WorkLife WHでは、契約前に条件を比較・確認しやすい形で情報を整理しています。掲載サービスには広告・紹介リンクが含まれる場合があります。掲載内容は、料金、利用条件、対応エリア、ワーホリ・海外生活との相性などをもとに、WorkLife WHの基準で整理しています。実際に契約・申込みを行う前には、必ず各サービスの公式サイトで最新情報をご確認ください。"
          : "掲載サービスには広告・紹介リンクが含まれる場合があります。契約前に必ず公式サイトで最新情報をご確認ください。"}
      </p>
      <Link href="/legal/affiliate-disclosure" className="mt-2 inline-block text-xs font-bold text-gray-700 underline">
        {detail ? "広告・紹介リンク開示を確認する" : "広告・紹介リンク開示"}
      </Link>
    </div>
  );
}
