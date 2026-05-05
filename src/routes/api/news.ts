import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { sampleArticles } from "@/data/sampleNews";

const cors = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/news")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async () => {
        return new Response(
          JSON.stringify({
            success: true,
            count: sampleArticles.length,
            articles: sampleArticles,
          }),
          { status: 200, headers: cors },
        );
      },
    },
  },
});
