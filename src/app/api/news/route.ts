import { NextRequest, NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "demo";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }

  const now = new Date();
  const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fromStr = from.toISOString().split("T")[0];
  const toStr = now.toISOString().split("T")[0];

  const [newsRes, quoteRes] = await Promise.all([
    fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${fromStr}&to=${toStr}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 60 } }
    ),
    fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 30 } }
    ),
  ]);

  if (!newsRes.ok) {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }

  const newsData = await newsRes.json();
  const quoteData = quoteRes.ok ? await quoteRes.json() : null;

  const news = (Array.isArray(newsData) ? newsData : []).slice(0, 20).map(
    (item: {
      id: number;
      headline: string;
      summary: string;
      source: string;
      url: string;
      image: string;
      datetime: number;
      category: string;
      related: string;
    }) => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      image: item.image,
      datetime: item.datetime,
      category: item.category,
    })
  );

  return NextResponse.json({
    news,
    quote: quoteData
      ? {
          current: quoteData.c,
          change: quoteData.d,
          changePercent: quoteData.dp,
          high: quoteData.h,
          low: quoteData.l,
          open: quoteData.o,
          prevClose: quoteData.pc,
        }
      : null,
  });
}
