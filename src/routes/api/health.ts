import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify({ status: "ok", uptime: Date.now() }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    },
  },
});
