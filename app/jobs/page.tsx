"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Job = {
  id: string;
  title: string;
  company: string;
  city: string;
  hourly_rate: number;
  work_hours: number;
  visa_support: boolean;
  japanese_ok: boolean;
  accommodation_available: boolean;
  apply_url: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (data) {
      setJobs(data);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">ワーホリ向け求人</h1>

        <div className="grid gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-2xl font-bold">{job.title}</h2>

              <p>{job.company}</p>

              <p>{job.city}</p>

              <p>時給 ${job.hourly_rate}</p>

              <p>週{job.work_hours}時間</p>

              {job.visa_support && <p>✅ ワーホリ歓迎</p>}

              {job.japanese_ok && <p>✅ 日本語OK</p>}

              {job.accommodation_available && <p>✅ 住み込み可能</p>}

              <a
                href={job.apply_url}
                target="_blank"
                className="
                  inline-block
                  mt-4
                  bg-blue-600
                  text-white
                  px-4
                  py-2
                  rounded-lg
                "
              >
                応募する
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
