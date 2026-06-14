"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  getStatusBadgeClassName,
  jobStatusOptions,
} from "@/lib/applicationStatus";
import { Job } from "./types";

type Props = {
  jobs: Job[];
  userId: string | null;
  onRefresh: () => void;
  onEdit: (job: Job) => void;
};

function buildJobApplicationHref(job: Job) {
  const params = new URLSearchParams({
    saved_job_id: job.id,
  });

  return `/mypage/job-application?${params.toString()}`;
}

export default function JobList({ jobs, userId, onRefresh, onEdit }: Props) {
  const handleStatusChange = async (job: Job, status: string) => {
    if (!userId) {
      alert("ログインしてください");
      return;
    }

    const { error } = await supabase
      .from("saved_jobs")
      .update({ status })
      .eq("id", job.id)
      .eq("user_id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!userId) {
      alert("ログインしてください");
      return;
    }

    const confirmed = window.confirm("この求人を削除しますか？");
    if (!confirmed) return;

    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    onRefresh();
  };

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-4 text-gray-900 shadow sm:flex-row md:p-6"
        >
          {/* LEFT SIDE */}
          <div className="min-w-0 space-y-1">
            <h2 className="break-words text-xl font-bold">{job.title}</h2>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span
                className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${getStatusBadgeClassName(
                  job.status,
                )}`}
              >
                {job.status || "気になる"}
              </span>

              <select
                value={job.status || "気になる"}
                onChange={(event) => handleStatusChange(job, event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 sm:w-auto"
              >
                {jobStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm font-medium text-gray-700">
              時給: {job.hourly_rate ? `$${job.hourly_rate}` : "未設定"}
            </p>

            <p className="text-sm font-medium text-gray-700">
              週時間: {job.work_hours ?? "未設定"}
            </p>

            <p className="text-sm font-medium text-gray-700">
              住所: {job.address || "未設定"}
            </p>

            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm font-bold text-blue-700"
            >
              {job.url}
            </a>

            {/* Debug: coordinate status */}
            <p className="text-xs font-semibold text-gray-700">
              {job.latitude && job.longitude
                ? `📍 Geocoded`
                : `⚠️ No coordinates`}
            </p>
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex flex-col gap-2 sm:w-48">
            <Link
              href={buildJobApplicationHref(job)}
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-center font-bold text-white sm:py-2"
            >
              応募する
            </Link>

            {/* EDIT */}
            <button
              onClick={() => onEdit(job)}
              className="w-full rounded-lg bg-gray-700 px-4 py-3 font-bold text-white sm:py-2"
            >
              編集
            </button>

            {/* DELETE */}
            <button
              onClick={() => handleDelete(job.id)}
              className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white sm:py-2"
            >
              削除
            </button>
          </div>
        </div>
      ))}

      {jobs.length === 0 && (
        <div className="rounded-2xl bg-white p-4 text-center font-medium text-gray-700 md:p-6">
          求人がまだありません
        </div>
      )}
    </div>
  );
}
