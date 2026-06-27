import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocoder";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "住所または地域を指定してください。" },
      { status: 400 },
    );
  }

  const coordinates = await geocodeAddress(query);

  return NextResponse.json(coordinates);
}
