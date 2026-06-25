import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = "listing-images";
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp"].includes(fromName)) {
    return fromName;
  }
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function sanitizePrefix(value: string | null) {
  return (value || "listing")
    .replace(/[^a-zA-Z0-9/_-]/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "")
    .slice(0, 120);
}

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonError("Storage upload configuration is missing.", 500);
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return jsonError("画像ファイルを選択してください。");

  const files = formData
    .getAll("files")
    .filter((item): item is File => item instanceof File);

  if (!files.length) return jsonError("画像ファイルを選択してください。");
  if (files.length > 10) return jsonError("画像は最大10枚までです。");

  for (const file of files) {
    if (!allowedTypes.has(file.type)) {
      return jsonError("画像はjpg/png/webp形式を選択してください。");
    }
    if (file.size > maxFileSize) {
      return jsonError("画像は1枚5MB以下にしてください。");
    }
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const prefix = sanitizePrefix(String(formData.get("prefix") || ""));
  const imageUrls: string[] = [];

  for (const [index, file] of files.entries()) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const filePath = `${prefix}/${Date.now()}-${index}-${randomUUID()}.${extensionFor(file)}`;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return jsonError(`画像の保存に失敗しました: ${error.message}`, 500);
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    imageUrls.push(data.publicUrl);
  }

  return NextResponse.json({ imageUrls });
}
