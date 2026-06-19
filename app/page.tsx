import Hero from "../components/Hero";
import Features from "../components/Features";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-gray-50 text-gray-900">
      <Hero />

      <section className="bg-white px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 md:p-6">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH Demo
            </p>
            <h2 className="text-2xl font-bold text-gray-900 md:text-4xl">
              海外の暮らしを設計する
            </h2>
            <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-gray-800">
              仕事と住まいを選んで、月いくら残るか試せます。
            </p>
          </div>

          <div>
            <Link
              href="/demo-planner"
              className="inline-block w-full rounded-lg bg-blue-600 px-5 py-3 text-center font-bold text-white sm:w-auto"
            >
              無料で生活プランを試す
            </Link>
          </div>
        </div>
      </section>

      <Features />
    </main>
  );
}
