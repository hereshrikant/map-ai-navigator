import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Search, ExternalLink, Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "AI + Map Industry News Dashboard" },
      { name: "description", content: "Daily news on AI, vehicles, maps, geospatial tech, and competitors." },
    ],
  }),
});

type Article = {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  category: string;
  keywords: string[];
};

const CATEGORIES = [
  "All",
  "AI Updates",
  "Vehicle AI",
  "Map Industry",
  "Geospatial Tech",
  "Competitor Updates",
  "Map Data Updates",
];

function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const load = async (cat: string = category) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news?category=${encodeURIComponent(cat)}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setArticles(data.articles ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      const matchCat = category === "All" || a.category === category;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [articles, query, category]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            AI + Map Industry News Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Daily intelligence on AI, vehicles, maps & geospatial tech
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, source, keywords…"
              className="pl-9 h-11 bg-card"
            />
          </div>
          <Button onClick={() => load()} disabled={loading} className="h-11 gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? "default" : "outline"}
              onClick={() => setCategory(c)}
              className="rounded-full"
            >
              {c}
            </Button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading news…
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16 text-destructive">
            Error: {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No news found</div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a) => (
              <Card key={a.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                {a.imageUrl && (
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={a.imageUrl}
                      alt={a.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(e) => ((e.currentTarget.style.display = "none"))}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="secondary">{a.category}</Badge>
                    <span className="text-xs text-muted-foreground">{a.publishedAt}</span>
                  </div>
                  <CardTitle className="text-lg leading-snug">{a.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                  <p className="text-xs text-muted-foreground mt-3">Source: {a.source}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full gap-2">
                    <a href={a.url} target="_blank" rel="noopener noreferrer">
                      Read More <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
