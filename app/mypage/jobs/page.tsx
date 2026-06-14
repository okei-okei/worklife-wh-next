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
