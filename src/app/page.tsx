"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SearchResult {
  symbol: string;
  name: string;
}

interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
  category: string;
}

interface Quote {
  current: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Search companies
  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const fetchNews = useCallback(async (symbol: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?symbol=${encodeURIComponent(symbol)}`);
      const data = await res.json();
      setNews(data.news || []);
      setQuote(data.quote || null);
    } catch {
      setNews([]);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh news every 60 seconds
  useEffect(() => {
    if (!selectedSymbol) return;
    const interval = setInterval(() => fetchNews(selectedSymbol), 60000);
    return () => clearInterval(interval);
  }, [selectedSymbol, fetchNews]);

  function selectCompany(symbol: string, name: string) {
    setSelectedSymbol(symbol);
    setSelectedName(name);
    setQuery("");
    setShowDropdown(false);
    fetchNews(symbol);
  }

  function timeAgo(timestamp: number): string {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4">
          <h1 className="shrink-0 text-xl font-bold tracking-tight">
            <span className="text-emerald-400">Stock</span>News
          </h1>

          {/* Search */}
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company or ticker..."
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {searchLoading && (
              <div className="absolute right-3 top-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-emerald-400" />
              </div>
            )}
            {showDropdown && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-gray-700 bg-gray-900 shadow-2xl">
                {results.map((r) => (
                  <button
                    key={r.symbol}
                    onClick={() => selectCompany(r.symbol, r.name)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                      {r.symbol}
                    </span>
                    <span className="truncate text-sm text-gray-300">
                      {r.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* No selection state */}
        {!selectedSymbol && !loading && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-4 text-6xl">&#128200;</div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-200">
              Search for a company
            </h2>
            <p className="text-gray-500">
              Type a company name or ticker symbol to get the latest news
            </p>
          </div>
        )}

        {/* Selected company */}
        {selectedSymbol && (
          <>
            {/* Company header + quote */}
            <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-emerald-500/10 px-3 py-1 text-lg font-bold text-emerald-400">
                      {selectedSymbol}
                    </span>
                    <h2 className="text-xl font-semibold text-gray-100">
                      {selectedName}
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Auto-refreshes every 60s
                  </p>
                </div>
                {quote && quote.current > 0 && (
                  <div className="text-right">
                    <div className="text-3xl font-bold tabular-nums">
                      ${quote.current.toFixed(2)}
                    </div>
                    <div
                      className={`mt-1 text-sm font-medium ${
                        quote.change >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {quote.change >= 0 ? "+" : ""}
                      {quote.change?.toFixed(2)} ({quote.change >= 0 ? "+" : ""}
                      {quote.changePercent?.toFixed(2)}%)
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-gray-500">
                      <span>O: ${quote.open?.toFixed(2)}</span>
                      <span>H: ${quote.high?.toFixed(2)}</span>
                      <span>L: ${quote.low?.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-emerald-400" />
              </div>
            )}

            {/* News list */}
            {!loading && news.length === 0 && (
              <p className="py-20 text-center text-gray-500">
                No recent news found for {selectedSymbol}
              </p>
            )}

            {!loading && news.length > 0 && (
              <div className="space-y-4">
                {news.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4 transition hover:border-gray-700 hover:bg-gray-800/50"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        className="hidden h-24 w-32 shrink-0 rounded-lg object-cover sm:block"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 font-semibold leading-snug text-gray-100 group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {item.headline}
                      </h3>
                      <p className="mb-2 text-sm leading-relaxed text-gray-400 line-clamp-2">
                        {item.summary}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="font-medium text-gray-400">
                          {item.source}
                        </span>
                        <span>·</span>
                        <span>{timeAgo(item.datetime)}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
