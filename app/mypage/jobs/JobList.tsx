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

function JobFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2">
      <p className="text-xs font-bold text-gray-600">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
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
        <article
          key={job.id}
          className="overflow-hidden rounded-2xl bg-white text-gray-900 shadow"
        >
          {job.image_urls?.[0] ? (
            // Supabase Storage URLs are configured at runtime.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.image_urls[0]}
              alt=""
              className="aspect-[16/9] w-full object-cover"
            />
          ) : null}

          <div className="p-4 md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold md:text-2xl">
                  {job.title}
                </h2>
                <p className="mt-1 font-medium text-gray-800">
                  {job.company || "会社名未設定"}
                  {job.location || job.address
                    ? ` / ${job.location || job.address}`
                    : ""}
                </p>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${getStatusBadgeClassName(
                  job.status,
                )}`}
              >
                {job.status || "気になる"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <JobFact
                label="時給"
                value={job.hourly_rate ? `$${job.hourly_rate}` : "未設定"}
              />
              <JobFact
                label="週時間"
                value={job.work_hours ? `${job.work_hours}h` : "未設定"}
              />
              <JobFact
                label="採用形態"
                value={job.employment_type || "未設定"}
              />
              <JobFact
                label="住み込み"
                value={
                  job.accommodation_available === true
                    ? "可"
                    : job.accommodation_available === false
                      ? "なし"
                      : "要確認"
                }
              />
            </div>

            <div className="mt-4 grid gap-2 text-sm font-medium text-gray-800">
              {job.address ? <p className="break-words">住所: {job.address}</p> : null}
              {job.url ? (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-bold text-blue-700"
                >
                  {job.url}
                </a>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <select
                value={job.status || "気になる"}
                onChange={(event) => handleStatusChange(job, event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm font-bold text-gray-900 sm:w-auto"
              >
                {jobStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <Link
                href={buildJobApplicationHref(job)}
                className="w-full rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-800 sm:w-auto"
              >
                応募する
              </Link>

              <button
                type="button"
                onClick={() => onEdit(job)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
              >
                編集
              </button>

              <button
                type="button"
                onClick={() => handleDelete(job.id)}
                className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 sm:w-auto"
              >
                削除
              </button>
            </div>
          </div>
        </article>
      ))}

      {jobs.length === 0 && (
        <div className="rounded-2xl bg-white p-4 text-center font-medium text-gray-700 md:p-6">
          求人がまだありません
        </div>
      )}
    </div>
  );
}
