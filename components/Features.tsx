const features = [
  {
    title: "AI応募支援",
    description: "応募メールやカバーレターを自動生成",
  },
  {
    title: "求人・物件管理",
    description: "気になる求人や物件をまとめて保存",
  },
  {
    title: "生活シミュレーター",
    description: "帰国時の貯金額を予測",
  },
];

export default function Features() {
  return (
    <section className="bg-gray-100 px-4 py-12 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="min-w-0 rounded-2xl bg-white p-4 text-gray-900 shadow-lg md:p-8"
          >
            <h3 className="mb-3 whitespace-normal break-words text-xl font-bold text-gray-900 md:mb-4 md:text-2xl">
              {feature.title}
            </h3>

            <p className="text-base font-medium leading-7 text-gray-800">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
