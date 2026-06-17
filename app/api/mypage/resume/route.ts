import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const resumeBucketName = "resumes";

type ResumePayload = {
  full_name?: string;
  email?: string;
  phone?: string;
  current_city?: string;
  visa_type?: string;
  available_from?: string | null;
  work_experience?: string;
  skills?: string;
  skills_list?: string[];
  experience_items?: unknown[];
  english_level?: string;
  self_introduction?: string;
};

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

function sanitizeResumePayload(payload: ResumePayload, userId: string) {
  return {
    user_id: userId,
    full_name: payload.full_name || null,
    email: payload.email || null,
    phone: payload.phone || null,
    current_city: payload.current_city || null,
    visa_type: payload.visa_type || null,
    available_from: payload.available_from || null,
    work_experience: payload.work_experience || null,
    skills: payload.skills || null,
    skills_list: Array.isArray(payload.skills_list) ? payload.skills_list : [],
    experience_items: Array.isArray(payload.experience_items)
      ? payload.experience_items
      : [],
    english_level: payload.english_level || null,
    self_introduction: payload.self_introduction || null,
    updated_at: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
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

  const resumeResponse = await adminClient
    .from("resumes")
    .select(
      "full_name,email,phone,current_city,visa_type,available_from,work_experience,skills,skills_list,experience_items,english_level,self_introduction",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (resumeResponse.error) {
    return NextResponse.json(
      { message: resumeResponse.error.message },
      { status: 500 },
    );
  }

  const filesResponse = await adminClient
    .from("resume_files")
    .select("id,user_id,file_name,file_path,file_url,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (filesResponse.error) {
    return NextResponse.json(
      { message: filesResponse.error.message },
      { status: 500 },
    );
  }

  const files = await Promise.all(
    (filesResponse.data || []).map(async (file) => {
      const { data } = await adminClient.storage
        .from(resumeBucketName)
        .createSignedUrl(file.file_path, 60 * 60);

      return {
        ...file,
        signed_url: data?.signedUrl || file.file_url,
      };
    }),
  );

  return NextResponse.json({
    resume: resumeResponse.data || null,
    files,
    email: user.email || "",
  });
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

  const payload = sanitizeResumePayload((await request.json()) as ResumePayload, user.id);

  const existingResponse = await adminClient
    .from("resumes")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle<{ id: string }>();

  if (existingResponse.error) {
    return NextResponse.json(
      { message: existingResponse.error.message },
      { status: 500 },
    );
  }

  const saveResponse = existingResponse.data?.id
    ? await adminClient
        .from("resumes")
        .update(payload)
        .eq("user_id", user.id)
        .select("id")
        .single()
    : await adminClient.from("resumes").insert(payload).select("id").single();

  if (saveResponse.error) {
    return NextResponse.json(
      { message: saveResponse.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
