"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PublicJob = {
  id: string;
  title: string;
  company: string | null;
  city: string | null;
  address: string | null;
  hourly_rate: number | null;
  work_hours: number | null;
  description: string | null;
  visa_support: boolean | null;
  japanese_ok: boolean | null;
  accommodation_available: boolean | null;
  apply_url: string | null;
  latitude: number | null;
  longitude: number | null;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [savingJobId, setSavingJobId] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("public_jobs")
        .select(
          "id, title, company, city, address, hourly_rate, work_hours, description, visa_support, japanese_ok, accommodation_available, apply_url, latitude, longitude",
        )
        .eq("is_active", true)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);
        setMessage("求人情報の読み込みに失敗しました。");
        setJobs([]);
      } else {
        setJobs((data || []) as PublicJob[]);
      }

      setIsLoading(false);
    };

    fetchJobs();
  }, []);

  const handleSaveJob = async (job: PublicJob) => {
    setMessage("");
    setSavingJobId(job.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("ログインしてください。");
      setSavingJobId(null);
      return;
    }

    const { error } = await supabase.from("saved_jobs").insert({
      user_id: user.id,
      title: job.title,
      url: job.apply_url || "",
      hourly_rate: job.hourly_rate,
      work_hours: job.work_hours,
      status: "検討中",
      address: job.address || job.city || "",
      latitude: job.latitude,
      longitude: job.longitude,
    });

    if (error) {
      console.error(error);
      setMessage("保存に失敗しました。時間をおいて再度お試しください。");
    } else {
      setMessage("求人をマイページに保存しました。");
    }

    setSavingJobId(null);
  };

  const formatHourlyRate = (hourlyRate: number | null) => {
    if (hourlyRate === null) {
      return "時給未設定";
    }

    return `時給 $${hourlyRate.toLocaleString()}`;
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH 公開求人
            </p>
            <h1 className="text-4xl font-bold">ワーホリ向け求人</h1>
            <p className="mt-2 text-gray-600">
              運営または掲載企業が公開した求人を確認し、気になる求人をマイページへ保存できます。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/mypage"
              className="rounded-lg bg-white px-4 py-2 font-bold text-gray-700 shadow"
            >
              マイページ
            </Link>
            <Link
              href="/company/submit"
              className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white"
            >
              掲載申請
            </Link>
          </div>
        </div>

        {message && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 font-bold text-blue-800">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-600">求人情報を読み込み中です...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold">公開求人は準備中です</h2>
            <p className="mt-2 leading-7 text-gray-600">
              掲載申請が承認されると、このページに求人が表示されます。
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <article key={job.id} className="rounded-2xl bg-white p-6 shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{job.title}</h2>
                    <p className="mt-1 text-gray-600">
                      {job.company || "掲載企業未設定"}
                      {job.city ? ` / ${job.city}` : ""}
                    </p>
                  </div>

                  <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                    {formatHourlyRate(job.hourly_rate)}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.visa_support && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                      ワーホリ歓迎
                    </span>
                  )}
                  {job.japanese_ok && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                      日本語OK
                    </span>
                  )}
                  {job.accommodation_available && (
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-bold text-purple-700">
                      住み込み可能
                    </span>
                  )}
                  {job.work_hours !== null && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
                      週{job.work_hours}時間
                    </span>
                  )}
                </div>

                {job.description && (
                  <p className="mt-4 leading-7 text-gray-700">
                    {job.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleSaveJob(job)}
                    disabled={savingJobId === job.id}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white disabled:bg-gray-300"
                  >
                    {savingJobId === job.id ? "保存中..." : "保存する"}
                  </button>

                  {job.apply_url && (
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-gray-300 px-4 py-2 font-bold text-gray-700 hover:bg-gray-50"
                    >
                      応募ページを見る
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
