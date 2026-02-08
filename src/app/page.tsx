import { renderToStaticMarkup } from "react-dom/server";
import { ChartDemo } from "../components/landing/chart-demo";
import { UsageSnippet } from "../components/landing/usage-snippet";
import { UsernamePreviewForm } from "../components/landing/username-preview-form";

const LANDING_PAGE_SCRIPT = String.raw`
const usernamePattern = /^(?!-)(?!.*--)[A-Za-z0-9-]{1,39}$/;
const form = document.getElementById("username-form");
const input = document.getElementById("username");
const preview = document.getElementById("preview");
const snippetNode = document.getElementById("snippet");
const errorNode = document.getElementById("error");
const submitButton = form?.querySelector('button[type="submit"]');

function setErrorState(message) {
  if (message) {
    errorNode.textContent = message;
    errorNode.classList.remove("hidden");
    return;
  }
  errorNode.classList.add("hidden");
  errorNode.textContent = "";
}

if (form && input && preview && snippetNode && errorNode && submitButton) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value || value.endsWith("-") || !usernamePattern.test(value)) {
      setErrorState("Please enter a valid GitHub username.");
      return;
    }

    const src = window.location.origin + "/" + encodeURIComponent(value);
    submitButton.disabled = true;
    submitButton.textContent = "Loading...";

    try {
      const response = await fetch(src, { method: "GET", headers: { Accept: "image/svg+xml" } });
      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok || !contentType.includes("image/svg+xml")) {
        throw new Error("chart-not-available");
      }

      const renderedSrc = src + "?preview=" + Date.now();
      preview.src = renderedSrc;
      preview.alt = value + "'s Github chart";
      snippetNode.textContent = "<img src=\"" + src + "\" alt=\"" + value + "'s Github chart\" />";
      setErrorState("");
    } catch {
      setErrorState("Could not load contributions for that username.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Preview";
    }
  });
}
`;

function LandingPage({ origin }: { origin: string }) {
  const demoUser = "n89nanda";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>dailygreen - By webforspeed</title>
        <meta
          name="description"
          content="Generate a GitHub-style contribution SVG for any public GitHub username."
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          body {
            font-family: "Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
            background: #f3f3f3;
            color: #575757;
          }
          a {
            border-bottom: 1px solid #d4d4d4;
          }
          .page-wrap {
            width: 100%;
            max-width: 894px;
          }
          .block-title {
            letter-spacing: 0.01em;
          }
        `}</style>
      </head>
      <body className="min-h-screen">
        <main className="page-wrap mx-auto px-4 py-10 sm:px-6 md:px-8 md:py-16">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
            dg
          </div>
          <h1 className="mt-8 text-[44px] lowercase leading-[1.03] tracking-[-0.03em] text-neutral-700">
            <span className="font-semibold">dailygreen</span> - by webforspeed
          </h1>
          <p className="mt-7 text-[36px] font-semibold lowercase leading-[1.15] tracking-[-0.02em] text-neutral-700">
            GitHub contributions as an SVG image.
          </p>
          <p className="mt-6 text-[19px] leading-[1.45] text-neutral-500">
            Embed your GitHub contribution chart as an SVG image in your <a href="https://github.com/n89nanda">README.md</a> 
          </p>

          <UsageSnippet origin={origin} username={demoUser} />
          <ChartDemo origin={origin} username={demoUser} />
          <UsernamePreviewForm />
        </main>

        <script dangerouslySetInnerHTML={{ __html: LANDING_PAGE_SCRIPT }} />
      </body>
    </html>
  );
}

export function renderLandingHtml(origin: string): string {
  return `<!doctype html>${renderToStaticMarkup(<LandingPage origin={origin} />)}`;
}
