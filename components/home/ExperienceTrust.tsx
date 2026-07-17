import Link from "next/link";

export default function ExperienceTrust() {
  return (
    <section className="bg-white px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-6xl rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        <p className="text-xs font-bold text-emerald-700">Editorial Policy</p>
        <h2 className="mt-2 text-lg font-black text-gray-900 md:text-2xl">
          実際の海外生活をもとに発信
        </h2>
        <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-gray-700 md:text-base md:leading-7">
          WorkLife WH編集部が、ニュージーランドでのワーキングホリデー経験と公式情報をもとに、仕事・住まい・生活情報を継続的に更新しています。
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/about"
            className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-black text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            運営方針を見る
          </Link>
          <Link
            href="/articles"
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-800 sm:w-auto"
          >
            役立ち情報を見る
          </Link>
        </div>
      </div>
    </section>
  );
}
