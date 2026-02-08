import { handleRequest } from "../api/index";

const port = Number.parseInt(Bun.env.PORT ?? "3000", 10);

Bun.serve({
  port,
  fetch(request) {
    return handleRequest(request);
  },
});

console.log(`dailygreen local server is running at http://localhost:${port}`);
