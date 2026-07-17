import Link from "next/link";

export default function HomeFinalCTA() {
  return (
    <section className="bg-gray-50 px-4 py-8 md:px-6 md:py-14">
      <div className="mx-auto max-w-6xl rounded-3xl bg-gray-900 p-5 text-white md:p-8">
        <p className="text-xs font-bold text-emerald-300">
          無料で利用できます
        </p>
        <h2 className="mt-2 text-xl font-black leading-tight md:text-3xl">
          仕事と住まいを、別々ではなく一緒に考える
        </h2>
        <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-gray-200 md:text-base md:leading-7">
          求人、物件、通勤時間、生活費をまとめて比較し、自分に合う生活プランを確認できます。
        </p>
        <Link
          href="/planner"
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-black text-gray-900 hover:bg-gray-100 sm:w-auto"
        >
          ライフプランナーを使う
        </Link>
      </div>
    </section>
  );
}
