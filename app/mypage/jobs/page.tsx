"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Job = {
  id: string;
  title: string;
  url: string;
  location: string | null;
  hourly_rate: number | null;
  work_hours: number | null;
  status: string | null;
};

export default function MyJobsPage() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [workHours, setWorkHours] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("saved_jobs")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    if (data) {
      setJobs(data);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("この求人を削除しますか？");

    if (!confirmed) return;

    const { error } = await supabase.from("saved_jobs").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchJobs();
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("ログインしてください");
      return;
    }

    const { error } = await supabase.from("saved_jobs").insert({
      user_id: user.id,
      title,
      url,
      location,
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      work_hours: workHours ? Number(workHours) : null,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("求人を保存しました");

    setTitle("");
    setUrl("");
    setLocation("");
    setHourlyRate("");
    setWorkHours("");

    fetchJobs();
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">保存した求人</h1>

          <Link
            href="/mypage"
            className="
              bg-gray-500
              text-white
              px-4
              py-2
              rounded-lg
            "
          >
            ← マイページへ戻る
          </Link>
        </div>

        <form
          onSubmit={handleSave}
          className="
            bg-white
            p-6
            rounded-2xl
            shadow
            mb-8
            space-y-4
          "
        >
          <input
            type="text"
            placeholder="求人タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-3 rounded-lg"
            required
          />

          <input
            type="url"
            placeholder="SEEK URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="勤務地 (例: Auckland CBD)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="number"
            placeholder="時給 ($)"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="number"
            placeholder="週勤務時間"
            value={workHours}
            onChange={(e) => setWorkHours(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />

          <button
            type="submit"
            className="
              bg-blue-600
              text-white
              px-6
              py-3
              rounded-lg
            "
          >
            保存する
          </button>
        </form>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="
                bg-white
                p-6
                rounded-2xl
                shadow
              "
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-bold">{job.title}</h2>

                  <p className="mt-2">勤務地: {job.location || "未設定"}</p>

                  <p>
                    時給: {job.hourly_rate ? `$${job.hourly_rate}` : "未設定"}
                  </p>

                  <p>
                    週勤務時間:{" "}
                    {job.work_hours ? `${job.work_hours}時間` : "未設定"}
                  </p>

                  <p>状態: {job.status || "saved"}</p>

                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      text-blue-600
                      break-all
                    "
                  >
                    {job.url}
                  </a>
                </div>

                <button
                  onClick={() => handleDelete(job.id)}
                  className="
                    bg-red-500
                    text-white
                    px-4
                    py-2
                    rounded-lg
                    h-fit
                  "
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
