import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const dailyLimit = Number(process.env.APPLICATION_AI_DAILY_LIMIT || "5");

type RequestBody = {
  documentType: "job_application_email" | "job_cover_letter" | "property_inquiry";
  target: unknown;
  resume?: unknown;
  jobDetails?: unknown;
  propertyDetails?: unknown;
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

async function getAuthenticatedUser(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.replace("Bearer ", "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!token || !supabaseUrl || !anonKey) return null;

  const supabase = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  return user;
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function getDailyUsage(userId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return {
      count: 0,
      loggingEnabled: false,
    };
  }

  const { count, error } = await supabase
    .from("ai_generation_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("generated_on", getTodayIsoDate());

  if (error) {
    console.warn("AI usage count skipped:", error.message);
    return {
      count: 0,
      loggingEnabled: false,
    };
  }

  return {
    count: count || 0,
    loggingEnabled: true,
  };
}

async function recordUsage(userId: string, documentType: RequestBody["documentType"]) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) return;

  const { error } = await supabase.from("ai_generation_logs").insert({
    user_id: userId,
    document_type: documentType,
    generated_on: getTodayIsoDate(),
  });

  if (error) {
    console.warn("AI usage log skipped:", error.message);
  }
}

function buildPrompt(body: RequestBody) {
  const documentName =
    body.documentType === "job_cover_letter"
      ? "job cover letter"
      : body.documentType === "property_inquiry"
        ? "property inquiry email"
        : "job application email";

  return `Create a natural, concise English ${documentName} for a working holiday user in New Zealand.

Important instructions:
- Use the Japanese input as meaning, not as direct literal text.
- Write polished but simple English.
- Keep it friendly, professional, and not too long.
- Do not invent qualifications that are not included.
- If information is missing, write around it naturally.

Data:
${JSON.stringify(body, null, 2)}`;
}

function getOutputText(data: {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
}) {
  if (data.output_text) return data.output_text;

  return (
    data.output
      ?.flatMap((item) => item.content || [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n") || ""
  );
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);

  if (!user) {
    return NextResponse.json(
      {
        enabled: false,
        reason: "login_required",
      },
      { status: 401 },
    );
  }

  const usage = await getDailyUsage(user.id);

  return NextResponse.json({
    enabled: hasApiKey && usage.count < dailyLimit,
    hasApiKey,
    dailyLimit,
    usedToday: usage.count,
    remainingToday: Math.max(dailyLimit - usage.count, 0),
    loggingEnabled: usage.loggingEnabled,
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const user = await getAuthenticatedUser(request);

  if (!apiKey) {
    return NextResponse.json({
      content: null,
      fallback: true,
      message: "OPENAI_API_KEY is not configured.",
    });
  }

  if (!user) {
    return NextResponse.json(
      {
        content: null,
        fallback: true,
        message: "Login is required to use AI generation.",
      },
      { status: 401 },
    );
  }

  const body = (await request.json()) as RequestBody;
  const usage = await getDailyUsage(user.id);

  if (usage.count >= dailyLimit) {
    return NextResponse.json(
      {
        content: null,
        fallback: true,
        message: "Daily AI generation limit reached.",
      },
      { status: 429 },
    );
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.APPLICATION_AI_MODEL || "gpt-5-nano",
      input: buildPrompt(body),
      max_output_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    return NextResponse.json(
      {
        content: null,
        fallback: true,
        message: errorText,
      },
      { status: 200 },
    );
  }

  const data = await response.json();
  const content = getOutputText(data);

  if (content) {
    await recordUsage(user.id, body.documentType);
  }

  return NextResponse.json({
    content: content || null,
    fallback: !content,
    dailyLimit,
    usedToday: content ? usage.count + 1 : usage.count,
    remainingToday: content
      ? Math.max(dailyLimit - usage.count - 1, 0)
      : Math.max(dailyLimit - usage.count, 0),
  });
}
