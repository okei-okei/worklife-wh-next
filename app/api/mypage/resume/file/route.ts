import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const resumeBucketName = "resumes";

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

function getSupabaseUserClient(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authorization = request.headers.get("authorization");
  const token = authorization?.replace("Bearer ", "");

  if (!supabaseUrl || !anonKey || !token) return null;

  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
    },
  });
}

async function getUser(request: Request) {
  const userClient = getSupabaseUserClient(request);
  const authorization = request.headers.get("authorization");
  const token = authorization?.replace("Bearer ", "");

  if (!userClient || !token) return null;

  const {
    data: { user },
  } = await userClient.auth.getUser(token);

  return user;
}

function buildResumeFilePath(userId: string, fileName: string) {
  const timestamp = Date.now();
  const safeFileName = fileName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  return `${userId}/${timestamp}-${safeFileName || "resume.pdf"}`;
}

export async function POST(request: Request) {
  const user = await getUser(request);
  const adminClient = getSupabaseAdminClient();

  if (!user) {
    return NextResponse.json({ message: "Login is required." }, { status: 401 });
  }

  if (!adminClient) {
    return NextResponse.json(
      { message: "Supabase service role is not configured." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "PDFファイルを選択してください。" },
      { status: 400 },
    );
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return NextResponse.json(
      { message: "PDFファイルのみアップロードできます。" },
      { status: 400 },
    );
  }

  const filePath = buildResumeFilePath(user.id, file.name);
  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadResponse = await adminClient.storage
    .from(resumeBucketName)
    .upload(filePath, bytes, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadResponse.error) {
    return NextResponse.json(
      { message: uploadResponse.error.message },
      { status: 500 },
    );
  }

  const insertResponse = await adminClient.from("resume_files").insert({
    user_id: user.id,
    file_name: file.name,
    file_path: filePath,
    file_url: null,
  });

  if (insertResponse.error) {
    await adminClient.storage.from(resumeBucketName).remove([filePath]);

    return NextResponse.json(
      { message: insertResponse.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await getUser(request);
  const adminClient = getSupabaseAdminClient();
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("id");

  if (!user) {
    return NextResponse.json({ message: "Login is required." }, { status: 401 });
  }

  if (!fileId) {
    return NextResponse.json(
      { message: "削除するPDFが指定されていません。" },
      { status: 400 },
    );
  }

  if (!adminClient) {
    return NextResponse.json(
      { message: "Supabase service role is not configured." },
      { status: 500 },
    );
  }

  const fileResponse = await adminClient
    .from("resume_files")
    .select("id,file_path")
    .eq("id", fileId)
    .eq("user_id", user.id)
    .maybeSingle<{ id: string; file_path: string }>();

  if (fileResponse.error) {
    return NextResponse.json(
      { message: fileResponse.error.message },
      { status: 500 },
    );
  }

  if (!fileResponse.data) {
    return NextResponse.json(
      { message: "PDFが見つかりません。" },
      { status: 404 },
    );
  }

  const storageResponse = await adminClient.storage
    .from(resumeBucketName)
    .remove([fileResponse.data.file_path]);

  if (storageResponse.error) {
    return NextResponse.json(
      { message: storageResponse.error.message },
      { status: 500 },
    );
  }

  const deleteResponse = await adminClient
    .from("resume_files")
    .delete()
    .eq("id", fileId)
    .eq("user_id", user.id);

  if (deleteResponse.error) {
    return NextResponse.json(
      { message: deleteResponse.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
