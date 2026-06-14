"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type LeadPartnerButtonProps = {
  category: string;
  partnerName: string;
  destinationUrl: string | null;
  sourcePage: string;
};

export function LeadPartnerButton({
  category,
  partnerName,
  destinationUrl,
  sourcePage,
}: LeadPartnerButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    setIsRecording(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("lead_clicks").insert({
      user_id: user?.id ?? null,
      category,
      partner_name: partnerName,
      destination_url: destinationUrl,
      source_page: sourcePage,
    });

    setIsRecording(false);

    if (error) {
      console.error(error);
      setMessage("クリック記録を保存できませんでした。");
      return;
    }

    if (destinationUrl) {
      window.open(destinationUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setMessage("準備中です。提携サービス案内を整備中です。");
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isRecording}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isRecording ? "記録中..." : "詳細を見る"}
      </button>

      {message ? <p className="mt-2 text-sm text-gray-500">{message}</p> : null}
    </div>
  );
}
