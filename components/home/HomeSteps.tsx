const steps = [
  {
    step: "STEP 01",
    label: "SAVE",
    title: "仕事と住まいを保存する",
    description: "気になる求人と物件を、まずは候補として残します。",
    className: "bg-white",
  },
  {
    step: "STEP 02",
    label: "COMPARE",
    title: "通勤時間と生活費を比較する",
    description: "距離、家賃、収入を並べて現実的に比べます。",
    className: "bg-blue-50",
  },
  {
    step: "STEP 03",
    label: "DECIDE",
    title: "自分に合う生活プランを決める",
    description: "仕事と住まいを別々にせず、暮らしとして判断します。",
    className: "bg-emerald-50",
  },
];

export default function HomeSteps() {
  return (
    <section className="bg-white px-4 py-8 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
          LIFE PLANNING FLOW
        </p>
        <h2 className="mt-2 text-xl font-black text-gray-900 md:text-4xl">
          海外生活を整える3ステップ
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.step}
              className={`rounded-3xl border border-gray-200 p-4 md:p-5 ${step.className}`}
            >
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                {step.step}
              </p>
              <p className="mt-4 text-4xl font-black leading-none text-gray-900 md:text-5xl">
                {step.label}
              </p>
              <h3 className="mt-4 text-base font-black text-gray-900 md:text-xl">
                {step.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-gray-700">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
