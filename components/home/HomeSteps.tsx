const steps = [
  {
    step: "STEP 01",
    label: "SAVE",
    title: "候補を保存する",
    description: "仕事と住まいの候補をまとめます。",
    className: "bg-white",
  },
  {
    step: "STEP 02",
    label: "COMPARE",
    title: "条件を比較する",
    description: "通勤時間と毎月の収支を確認します。",
    className: "bg-blue-50",
  },
  {
    step: "STEP 03",
    label: "DECIDE",
    title: "生活プランを決める",
    description: "自分に合う仕事と住まいの組み合わせを選びます。",
    className: "bg-emerald-50",
  },
];

export default function HomeSteps() {
  return (
    <section className="bg-white px-4 py-8 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
          LIFE PLANNING
        </p>
        <h2 className="mt-2 text-xl font-black text-gray-900 md:text-4xl">
          海外生活を決めるまでの3ステップ
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
