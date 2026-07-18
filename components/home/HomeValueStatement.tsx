import Image from "next/image";
import Link from "next/link";

export default function HomeValueStatement() {
  return (
    <section
      data-home-scene="life-plan"
      className="bg-white/90 px-4 py-9 backdrop-blur-[1px] md:px-6 md:py-16"
    >
      <div className="mx-auto grid max-w-6xl gap-0 overflow-hidden rounded-[2rem] border border-gray-200 bg-white lg:grid-cols-[minmax(0,0.66fr)_minmax(320px,0.34fr)]">
        <div className="relative min-h-[240px] lg:min-h-[520px]">
          <Image
            src="/images/home/hero-desktop.webp"
            alt="ニュージーランドの自然と街で始まる海外生活のイメージ"
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/25 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-white/20" />
        </div>
        <div className="relative flex flex-col justify-center bg-white p-5 lg:-ml-12 lg:my-12 lg:rounded-l-[2rem] lg:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
            LIFE PLANNING
          </p>
          <h2 className="mt-3 text-2xl font-black leading-tight text-gray-900 md:text-4xl">
            仕事と住まいを
            <br />
            一緒に考える
          </h2>
          <p className="mt-4 text-xl font-black leading-tight text-gray-900 md:text-3xl">
            仕事だけでも、
            <br />
            住まいだけでもない。
          </p>
          <p className="mt-3 text-sm font-medium leading-6 text-gray-700 md:text-base md:leading-7">
            暮らし全体を見ながら、自分に合う選択を考えます。
          </p>
          <Link
            href="/planner"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-blue-700 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-800 sm:w-auto"
          >
            ライフプランナーで比較する
          </Link>
        </div>
      </div>
    </section>
  );
}
