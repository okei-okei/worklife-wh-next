import Link from "next/link";
import { notFound } from "next/navigation";

const guides = {
  "working-holiday-start": {
    title: "ワーホリ生活を始める前に確認すること",
    lead: "ビザ、パスポート、初期費用、仕事探し、物件探しの基本を整理します。",
    sections: [
      "パスポートの有効期限と氏名表記を確認する",
      "ビザの入国期限、就労条件、滞在可能期間を確認する",
      "到着直後の通信手段、銀行、IRD番号を準備する",
      "仕事と住まいは保存リストに入れて比較する",
    ],
  },
  passport: {
    title: "パスポート確認",
    lead: "渡航前に、パスポートの有効期限、氏名表記、残存期間を確認しましょう。",
    sections: [
      "航空券やビザ申請の氏名表記と一致しているか確認する",
      "滞在予定期間に対して十分な残存期間があるか確認する",
      "コピーやPDFを安全な場所に保管する",
    ],
  },
  visa: {
    title: "ビザ確認",
    lead: "ワーキングホリデービザの条件は、渡航前に必ず公式情報で確認してください。",
    sections: [
      "入国期限と滞在可能期間を確認する",
      "同一雇用主で働ける期間などの就労条件を確認する",
      "ビザ取得画面や許可レターを保存する",
    ],
  },
  ird: {
    title: "IRD番号取得",
    lead: "ニュージーランドで働く場合、税務番号であるIRD番号が必要になります。",
    sections: [
      "銀行口座や本人確認書類を準備する",
      "公式サイトで申請手順を確認する",
      "勤務開始前に雇用主へ共有できるようにする",
    ],
  },
  "rental-contract": {
    title: "家賃・デポジット・契約条件の確認",
    lead: "入居前に、家賃、ボンド、退去条件、光熱費込みかを確認しましょう。",
    sections: [
      "週家賃、ボンド、前払い家賃を確認する",
      "最低滞在期間と退去通知期間を確認する",
      "電気、ネット、水道、家具が含まれるか確認する",
    ],
  },
  "job-search-caution": {
    title: "仕事探しの注意点",
    lead: "応募前に、時給、勤務時間、場所、仕事内容、雇用条件を確認しましょう。",
    sections: [
      "最低賃金を下回っていないか確認する",
      "現金手渡しや条件が曖昧な求人には注意する",
      "応募前に住所、通勤時間、勤務時間を確認する",
    ],
  },
};

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = guides[slug as keyof typeof guides];

  if (!guide) notFound();

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <p className="mb-2 text-sm font-bold text-blue-700">
            WorkLife WH 役立ち情報
          </p>
          <h1 className="text-2xl font-bold md:text-4xl">{guide.title}</h1>
          <p className="mt-3 text-base font-medium leading-7 text-gray-800">
            {guide.lead}
          </p>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="text-xl font-bold text-gray-900">確認ポイント</h2>
          <ul className="mt-4 space-y-3">
            {guide.sections.map((section) => (
              <li
                key={section}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 font-medium leading-7 text-gray-800"
              >
                {section}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Link
            href="/mypage/checklist"
            className="w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
          >
            チェックリストへ戻る
          </Link>
          <Link
            href="/mypage"
            className="w-full rounded-lg bg-gray-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
          >
            マイページへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
