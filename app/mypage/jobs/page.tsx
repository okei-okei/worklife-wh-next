"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import JobForm from "./JobForm";
import JobList from "./JobList";
import EditJobModal from "./EditJobModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Job } from "./types";

export default function JobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from("saved_jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setJobs([...data]);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchJobs();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchJobs]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-5xl min-w-0 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="min-w-0 whitespace-normal break-words text-2xl font-bold md:text-4xl">
            保存した求人
          </h1>

          <Link
            href="/mypage"
            className="w-full rounded-lg bg-gray-700 px-4 py-3 text-center font-bold text-white sm:w-auto sm:py-2"
          >
            ← マイページ
          </Link>
        </div>

        <JobForm onSaved={fetchJobs} />

        <JobList
          jobs={jobs}
          userId={currentUserId}
          onRefresh={() => {
            fetchJobs();
          }}
          onEdit={(job) => setEditingJob(job)}
        />

        <EditJobModal
          job={editingJob}
          userId={currentUserId}
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
