"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
type Job = {
  id: string;
  title: string;
  url: string;
};

export default function MyJobsPage() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("saved_jobs")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      alert(JSON.stringify(error, null, 2));

      console.error(error);

      return;
    }

    if (data) {
      setJobs(data);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("ログインしてください");
      return;
    }
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

    const { error } = await supabase.from("saved_jobs").insert({
      user_id: user.id,
      title,
      url,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("求人を保存しました！");

    setTitle("");
    setUrl("");

    fetchJobs();
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
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
      hover:bg-gray-600
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
            placeholder="SEEKなどのURL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border p-3 rounded-lg"
            required
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
