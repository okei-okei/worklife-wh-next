export default function Hero() {
  return (
    <section
      className="
        h-[80vh]
        flex
        items-center
        justify-center
        text-white
        bg-cover
        bg-center
      "
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,.4), rgba(0,0,0,.4)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')",
      }}
    >
      <div className="text-center px-6">
        <h2 className="text-5xl md:text-7xl font-bold mb-6">
          海外生活を、
          <br />
          もっとリアルに。
        </h2>

        <p className="text-xl md:text-2xl mb-8">
          仕事 × 応募 × 住まい × 生活設計
        </p>

        <button
          className="
            bg-blue-600
            hover:bg-blue-700
            px-8
            py-4
            rounded-xl
            text-lg
            font-semibold
          "
        >
          はじめる
        </button>
      </div>
    </section>
  );
}
