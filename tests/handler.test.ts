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
    expect(body).toContain("dailygreen | GitHub Contribution Chart SVG Generator");
    expect(body).toContain('id="theme-toggle"');
    expect(body).toContain('property="og:title" content="dailygreen | GitHub Contribution Chart SVG Generator"');
    expect(body).toContain('name="twitter:card" content="summary_large_image"');
    expect(body).toContain('name="robots" content="index, follow, max-image-preview:large"');
    expect(body).toContain('property="og:site_name" content="dailygreen"');
    expect(body).toContain('property="og:image" content="http://localhost:3000/social-card.png"');
    expect(body).toContain('"@type":"WebApplication"');
  });

  test("returns social preview image", async () => {
    const response = await handleRequest(new Request("http://localhost:3000/social-card.png"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/png");
    expect(response.headers.get("cache-control")).toBe("public, max-age=604800, s-maxage=604800");

    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(bytes[0]).toBe(0x89);
    expect(bytes[1]).toBe(0x50);
    expect(bytes[2]).toBe(0x4e);
    expect(bytes[3]).toBe(0x47);
  });

  test("returns robots.txt with sitemap location", async () => {
    const response = await handleRequest(new Request("http://localhost:3000/robots.txt"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(response.headers.get("cache-control")).toBe("public, max-age=86400, s-maxage=86400");

    const body = await response.text();
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Allow: /");
    expect(body).toContain("Sitemap: http://localhost:3000/sitemap.xml");
  });

  test("returns sitemap.xml for homepage", async () => {
    const response = await handleRequest(new Request("http://localhost:3000/sitemap.xml"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/xml");
    expect(response.headers.get("cache-control")).toBe("public, max-age=86400, s-maxage=86400");

    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("<loc>http://localhost:3000/</loc>");
    expect(body).toContain("<changefreq>daily</changefreq>");
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
