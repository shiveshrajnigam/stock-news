import { NextRequest, NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "demo";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  const res = await fetch(
    `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error("Finnhub search error:", res.status, body);
    return NextResponse.json({ error: "Failed to search", status: res.status, detail: body }, { status: 500 });
  }

  const data = await res.json();
  const results = (data.result || [])
    .filter((item: { type: string }) => item.type === "Common Stock")
    .slice(0, 8)
    .map((item: { symbol: string; description: string }) => ({
      symbol: item.symbol,
      name: item.description,
    }));

  return NextResponse.json(results);
}
