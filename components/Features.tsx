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
    <section className="py-20 px-8 bg-gray-100">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="
              bg-white
              p-8
              rounded-2xl
              shadow-lg
            "
          >
            <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>

            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
