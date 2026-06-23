import { NextResponse } from "next/server";

export const runtime = "nodejs";

function disabledResponse() {
  return NextResponse.json(
    {
      message:
        "履歴書ファイル保存機能は現在停止しています。履歴書管理ではプロフィール、職歴、スキルのみ保存できます。",
    },
    { status: 410 },
  );
}

export async function POST() {
  return disabledResponse();
}

export async function DELETE() {
  return disabledResponse();
}
