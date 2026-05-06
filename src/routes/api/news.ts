import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { sampleArticles } from "@/data/sampleNews";

const cors = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Map our dashboard categories to NewsAPI queries
const CATEGORY_QUERIES: Record<string, string> = {
  "All": "AI OR maps OR geospatial OR autonomous vehicles",
  "AI Updates": "artificial intelligence OR generative AI OR LLM",
  "Vehicle AI": "autonomous vehicles OR self-driving OR ADAS",
  "Map Industry": "TomTom OR HERE Maps OR Google Maps OR Apple Maps",
  "Geospatial Tech": "geospatial OR GIS OR satellite imagery OR remote sensing",
  "Competitor Updates": "TomTom OR HERE Technologies OR Mapbox OR Esri",
  "Map Data Updates": "OpenStreetMap OR Overture Maps OR map data",
};

type NewsApiArticle = {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  source: { name: string };
  publishedAt: string;
};

export const Route = createFileRoute("/api/news")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request }) => {
        const apiKey = process.env.NEWS_API_KEY;
        const url = new URL(request.url);
        const category = url.searchParams.get("category") || "All";
        const q = encodeURIComponent(CATEGORY_QUERIES[category] || CATEGORY_QUERIES["All"]);

        const filteredSample =
          category === "All"
            ? sampleArticles
            : sampleArticles.filter((a) => a.category === category);

        if (!apiKey) {
          return new Response(
            JSON.stringify({
              success: true,
              source: "sample",
              count: filteredSample.length,
              articles: filteredSample,
            }),
            { status: 200, headers: cors },
          );
        }

        try {
          const apiUrl = `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=24&apiKey=${apiKey}`;
          const res = await fetch(apiUrl);
          if (!res.ok) throw new Error(`NewsAPI ${res.status}`);
          const json = (await res.json()) as { articles: NewsApiArticle[] };

          const articles = (json.articles || [])
            .filter((a) => a.title && a.url)
            .map((a, i) => ({
              id: `${i}-${a.url}`,
              title: a.title,
              description: a.description ?? "",
              url: a.url,
              imageUrl: a.urlToImage ?? undefined,
              source: a.source?.name ?? "Unknown",
              publishedAt: a.publishedAt,
              category,
              keywords: [],
            }));

          return new Response(
            JSON.stringify({ success: true, source: "newsapi", count: articles.length, articles }),
            { status: 200, headers: cors },
          );
        } catch (e) {
          return new Response(
            JSON.stringify({
              success: true,
              source: "sample-fallback",
              error: e instanceof Error ? e.message : "fetch failed",
              count: filteredSample.length,
              articles: filteredSample,
            }),
            { status: 200, headers: cors },
          );
        }
      },
    },
  },
});
