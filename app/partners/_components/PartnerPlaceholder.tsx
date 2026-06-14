"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type PartnerPlaceholderProps = {
  category: string;
  title: string;
  description: string;
  partnerName?: string | null;
  destinationUrl?: string | null;
};

export function PartnerPlaceholder({
  category,
  title,
  description,
  partnerName = null,
  destinationUrl = null,
}: PartnerPlaceholderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState("準備中");

  const handleLeadClick = async () => {
    setIsRecording(true);
    setMessage("準備中");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("lead_clicks").insert({
      user_id: user?.id ?? null,
      category,
      partner_name: partnerName,
      destination_url: destinationUrl,
      source_page: window.location.pathname,
    });

    if (error) {
      console.error(error);
      setMessage("準備中");
      setIsRecording(false);
      return;
    }

    setMessage("準備中です。提携サービス案内を整備中です。");
    setIsRecording(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH パートナー案内
            </p>
            <h1 className="text-4xl font-bold">{title}</h1>
          </div>

          <Link
            href="/mypage"
            className="rounded-lg bg-gray-500 px-4 py-2 text-white"
          >
            ← マイページ
          </Link>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
            準備中
          </div>

          <p className="text-lg leading-8 text-gray-700">{description}</p>

          <p className="mt-4 leading-7 text-gray-600">
            将来的には、ワーホリ生活の開始に必要なサービスを比較しやすい形で整理し、
            ユーザーが安心して選べる提携サービスや送客リンクを掲載する予定です。
            現時点では外部広告リンクは掲載していません。
          </p>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={handleLeadClick}
              disabled={isRecording}
              className="rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isRecording ? "記録中..." : "サービスを見る"}
            </button>

            <p className="mt-3 text-sm text-gray-500">{message}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
