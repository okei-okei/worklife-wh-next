type LinkPreviewRequest = {
  url?: string;
  kind?: "job" | "property";
};

type LinkPreviewResponse = {
  title: string;
  description: string;
  hourlyRate: number | null;
  rentWeekly: number | null;
  address: string;
};

const MAX_HTML_LENGTH = 350_000;

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function getMetaContent(html: string, keys: string[]) {
  for (const key of keys) {
    const pattern = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i",
    );
    const reversedPattern = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["'][^>]*>`,
      "i",
    );

    const match = html.match(pattern) || html.match(reversedPattern);

    if (match?.[1]) {
      return decodeHtml(match[1]);
    }
  }

  return "";
}

function getPageTitle(html: string) {
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

  return title ? decodeHtml(title) : "";
}

function extractJsonLdText(html: string) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  return blocks
    .map((block) => decodeHtml(block[1] || ""))
    .join(" ")
    .slice(0, 80_000);
}

function extractMoneyValue(text: string, kind: "job" | "property") {
  const normalized = text.replace(/,/g, "");
  const patterns =
    kind === "job"
      ? [
          /\$ ?(\d{2,3}(?:\.\d{1,2})?)\s*(?:per\s*hour|\/\s*hour|\/\s*hr|ph|hourly)/i,
          /(?:hourly|per\s*hour|\/\s*hour|\/\s*hr|ph)[^\d$]{0,20}\$? ?(\d{2,3}(?:\.\d{1,2})?)/i,
        ]
      : [
          /\$ ?(\d{2,5}(?:\.\d{1,2})?)\s*(?:per\s*week|\/\s*week|\/\s*w|pw|weekly)/i,
          /(?:weekly|per\s*week|\/\s*week|\/\s*w|pw)[^\d$]{0,20}\$? ?(\d{2,5}(?:\.\d{1,2})?)/i,
        ];

  for (const pattern of patterns) {
    const value = normalized.match(pattern)?.[1];

    if (value) {
      return Number(value);
    }
  }

  return null;
}

function extractLikelyAddress(text: string) {
  const match = text.match(
    /([A-Za-z0-9 ,'-]{4,80}(?:Auckland|Wellington|Christchurch|Hamilton|Queenstown|Dunedin|Tauranga|Rotorua|Nelson)[A-Za-z0-9 ,'-]{0,80})/i,
  );

  return match?.[1] ? decodeHtml(match[1]) : "";
}

export async function POST(request: Request) {
  const body = (await request.json()) as LinkPreviewRequest;
  const kind = body.kind === "property" ? "property" : "job";

  if (!body.url) {
    return Response.json({ error: "URL is required" }, { status: 400 });
  }

  let url: URL;

  try {
    url = new URL(body.url);
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return Response.json({ error: "Unsupported URL" }, { status: 400 });
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; WorkLifeWH/0.1; +https://worklife-wh.local)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return Response.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 502 },
      );
    }

    const html = (await response.text()).slice(0, MAX_HTML_LENGTH);
    const title =
      getMetaContent(html, ["og:title", "twitter:title"]) || getPageTitle(html);
    const description = getMetaContent(html, [
      "og:description",
      "twitter:description",
      "description",
    ]);
    const extractedText = decodeHtml(
      `${title} ${description} ${extractJsonLdText(html)} ${html.replace(/<[^>]+>/g, " ")}`,
    );

    const preview: LinkPreviewResponse = {
      title,
      description,
      hourlyRate: kind === "job" ? extractMoneyValue(extractedText, kind) : null,
      rentWeekly:
        kind === "property" ? extractMoneyValue(extractedText, kind) : null,
      address: extractLikelyAddress(extractedText),
    };

    return Response.json(preview);
  } catch {
    return Response.json(
      { error: "Could not read this external URL" },
      { status: 502 },
    );
  }
}
