import { renderLandingHtml } from "../src/app/page";
import { fetchContributionsMarkup, parseContributionDays, type FetchLike } from "../src/lib/contributions";
import { textResponse } from "../src/lib/http";
import { parseRoute } from "../src/lib/route";
import { renderContributionSvg } from "../src/lib/svg";
import { validateUsername } from "../src/lib/username";

const ONE_DAY_CACHE_HEADER = "public, max-age=86400, s-maxage=86400";

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
<circle cx="18" cy="18" r="18" fill="#d1fae5"/>
<text x="18" y="19" text-anchor="middle" dominant-baseline="central" font-family="Inter,system-ui,sans-serif" font-size="14" font-weight="600" fill="#047857">dg</text>
</svg>`;

const JUNK_PATH_PREFIXES = ["/wp-", "/.well-known", "/.env", "/cgi-bin", "/admin", "/phpMyAdmin"];
const JUNK_PATHS = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/ads.txt",
  "/humans.txt",
  "/.git",
  "/xmlrpc.php",
]);

function isJunkPath(pathname: string): boolean {
  if (JUNK_PATHS.has(pathname)) return true;
  return JUNK_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

type HandlerDependencies = {
  fetchImpl?: FetchLike;
};

export async function handleRequest(request: Request, dependencies: HandlerDependencies = {}): Promise<Response> {
  if (request.method !== "GET") {
    return textResponse(405, "Method not allowed.", { Allow: "GET" });
  }

  const url = new URL(request.url);

  if (url.pathname === "/favicon.ico" || url.pathname === "/favicon.svg") {
    return new Response(FAVICON_SVG, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=604800, s-maxage=604800",
      },
    });
  }

  if (isJunkPath(url.pathname)) {
    return textResponse(404, "Not found.");
  }

  const route = parseRoute(url.pathname);

  if (route.kind === "home") {
    return new Response(renderLandingHtml(url.origin), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  if (route.kind === "invalid") {
    return textResponse(400, "Invalid username.");
  }

  const validation = validateUsername(route.usernameRaw);
  if (!validation.ok) {
    return textResponse(400, validation.message);
  }

  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const upstream = await fetchContributionsMarkup(validation.value, fetchImpl);
  if (!upstream.ok) {
    return textResponse(upstream.status, upstream.message);
  }

  let contributionDays;
  try {
    contributionDays = parseContributionDays(upstream.markup);
  } catch {
    return textResponse(502, "Failed to parse contribution data.");
  }

  if (contributionDays.length === 0) {
    return textResponse(404, "No contribution data found for this user.");
  }

  let svgMarkup: string;
  try {
    svgMarkup = renderContributionSvg(validation.value, contributionDays);
  } catch {
    return textResponse(502, "Failed to render contribution chart.");
  }

  return new Response(svgMarkup, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": ONE_DAY_CACHE_HEADER,
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  return handleRequest(request);
}

export default {
  fetch: handleRequest,
};
