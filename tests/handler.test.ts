import { describe, expect, test } from "bun:test";
import { handleRequest } from "../api/index";

const fixturePath = new URL("./fixtures/n89nanda-contributions.html", import.meta.url);

describe("handleRequest", () => {
  test("returns landing page for /", async () => {
    const response = await handleRequest(new Request("http://localhost:3000/"), {
      fetchImpl: async () => new Response("unexpected", { status: 500 }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    const body = await response.text();
    expect(body).toContain("dailygreen - By webforspeed");
  });

  test("returns svg and cache headers for /:username", async () => {
    const fixtureMarkup = await Bun.file(fixturePath).text();

    const response = await handleRequest(new Request("http://localhost:3000/n89nanda"), {
      fetchImpl: async () => new Response(fixtureMarkup, { status: 200 }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(response.headers.get("cache-control")).toBe("public, max-age=86400, s-maxage=86400");

    const svg = await response.text();
    expect(svg).toContain("<svg");
    expect(svg).toContain("n89nanda");
  });

  test("returns 400 for invalid username", async () => {
    const response = await handleRequest(new Request("http://localhost:3000/ab--cd"));
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Invalid username.");
  });

  test("returns 404 for no contribution data", async () => {
    const response = await handleRequest(new Request("http://localhost:3000/nobody"), {
      fetchImpl: async () => new Response("<svg></svg>", { status: 200 }),
    });

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("No contribution data found for this user.");
  });

  test("maps upstream failures to 502", async () => {
    const response = await handleRequest(new Request("http://localhost:3000/n89nanda"), {
      fetchImpl: async () => {
        throw new Error("network");
      },
    });

    expect(response.status).toBe(502);
    expect(await response.text()).toBe("Failed to fetch contribution data.");
  });
});
