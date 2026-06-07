import Link from "next/link";

const sampleJobs = [
  {
    id: 1,
    title: "Cafe Staff",
    location: "Auckland",
    hourly: "$26/hour",
  },
  {
    id: 2,
    title: "Cleaner",
    location: "Queenstown",
    hourly: "$25/hour",
  },
  {
    id: 3,
    title: "Hotel Staff",
    location: "Christchurch",
    hourly: "$27/hour",
  },
];

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">求人一覧</h1>

        <p className="text-gray-600 mb-8">
          ニュージーランドの人気求人をチェックしましょう。
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {sampleJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-2xl font-bold mb-2">{job.title}</h2>

              <p>{job.location}</p>

              <p className="mb-4">時給：{job.hourly}</p>

              <Link
                href="/login"
                className="
                  inline-block
                  bg-blue-600
                  text-white
                  px-4
                  py-2
                  rounded-lg
                "
              >
                保存する
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
