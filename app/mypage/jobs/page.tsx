"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import JobForm from "./JobForm";
import JobList from "./JobList";
import EditJobModal from "./EditJobModal";
import Link from "next/link";
import { Job } from "./types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("saved_jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setJobs([...data]);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">保存した求人</h1>

          <Link
            href="/mypage"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            ← マイページ
          </Link>
        </div>

        <JobForm onSaved={fetchJobs} />

        <JobList
          jobs={jobs}
          onRefresh={() => {
            fetchJobs();
          }}
          onEdit={(job) => setEditingJob(job)}
        />

        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onUpdated={async () => {
            await fetchJobs();
            setEditingJob(null);
          }}
        />
      </div>
    </main>
  );
}
