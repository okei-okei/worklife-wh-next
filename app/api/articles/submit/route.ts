import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "現在、ユーザー自由投稿は受け付けていません。情報提供フォームは今後検討します。",
    },
    { status: 410 },
  );
}
