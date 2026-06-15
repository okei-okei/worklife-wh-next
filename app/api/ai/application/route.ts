import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RequestBody = {
  documentType: "job_application_email" | "job_cover_letter" | "property_inquiry";
  target: unknown;
  resume?: unknown;
  jobDetails?: unknown;
  propertyDetails?: unknown;
};

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

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      content: null,
      fallback: true,
      message: "OPENAI_API_KEY is not configured.",
    });
  }

  const body = (await request.json()) as RequestBody;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.2",
      input: buildPrompt(body),
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

  return NextResponse.json({
    content: content || null,
    fallback: !content,
  });
}
