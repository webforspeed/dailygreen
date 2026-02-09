import { renderToStaticMarkup } from "react-dom/server";
import { ChartDemo } from "../components/landing/chart-demo";
import { Footer } from "../components/landing/footer";
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
const themeStorageKey = "dailygreen-theme";
const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");
const themeLabel = document.getElementById("theme-label");
const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

function getStoredTheme() {
  try {
    const value = localStorage.getItem(themeStorageKey);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function setStoredTheme(value) {
  try {
    localStorage.setItem(themeStorageKey, value);
  } catch {}
}

function resolveTheme() {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }

  return colorScheme.matches ? "dark" : "light";
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  root.classList.toggle("theme-dark", isDark);
  root.dataset.theme = theme;
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
  }
  if (themeLabel) {
    themeLabel.textContent = isDark ? "Dark" : "Light";
  }
}

let activeTheme = resolveTheme();
applyTheme(activeTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    activeTheme = activeTheme === "dark" ? "light" : "dark";
    applyTheme(activeTheme);
    setStoredTheme(activeTheme);
  });
}

colorScheme.addEventListener("change", (event) => {
  if (getStoredTheme()) {
    return;
  }
  activeTheme = event.matches ? "dark" : "light";
  applyTheme(activeTheme);
});

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
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>dailygreen - By webforspeed</title>
        <meta
          name="description"
          content="Generate a GitHub-style contribution SVG for any public GitHub username."
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          :root {
            color-scheme: light;
            --bg: #f3f3f3;
            --text: #575757;
            --heading: #404040;
            --muted: #686868;
            --link-border: #d4d4d4;
            --chip-bg: #d1fae5;
            --chip-text: #047857;
            --card-bg: #fafafa;
            --card-border: #e5e5e5;
            --card-shadow: 0 1px 1px rgb(0 0 0 / 1%), 0 3px 8px rgb(0 0 0 / 2%);
            --preview-bg: #ffffff;
            --preview-border: #e5e5e5;
            --input-bg: #ffffff;
            --input-border: #d4d4d8;
            --input-placeholder: #9ca3af;
            --button-bg: #059669;
            --button-bg-hover: #047857;
            --button-text: #ffffff;
            --toggle-bg: #ffffff;
            --toggle-border: #d4d4d8;
            --toggle-text: #4b5563;
            --section-label: #8b8b8b;
          }
          html.theme-dark {
            color-scheme: dark;
            --bg: #0b1110;
            --text: #cdd5d4;
            --heading: #f5f6f6;
            --muted: #a8b6b4;
            --link-border: #3f4948;
            --chip-bg: #15332d;
            --chip-text: #6ee7b7;
            --card-bg: #121a19;
            --card-border: #253130;
            --card-shadow: 0 1px 1px rgb(0 0 0 / 35%), 0 12px 30px rgb(0 0 0 / 30%);
            --preview-bg: #0f1414;
            --preview-border: #2a3836;
            --input-bg: #0f1414;
            --input-border: #334341;
            --input-placeholder: #7f8f8d;
            --button-bg: #10b981;
            --button-bg-hover: #34d399;
            --button-text: #052e1f;
            --toggle-bg: #121a19;
            --toggle-border: #334341;
            --toggle-text: #cdd5d4;
            --section-label: #90a09e;
          }
          body {
            font-family: "Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
            background: var(--bg);
            color: var(--text);
            transition: background-color 180ms ease, color 180ms ease;
          }
          a {
            border-bottom: 1px solid var(--link-border);
            color: inherit;
          }
          .page-wrap {
            width: 100%;
            max-width: 894px;
          }
          .block-title {
            letter-spacing: 0.01em;
          }
          .page-chip {
            background: var(--chip-bg);
            color: var(--chip-text);
          }
          .page-title,
          .page-subtitle {
            color: var(--heading);
          }
          .page-body {
            color: var(--muted);
          }
          .section-label {
            color: var(--section-label);
          }
          .card-surface {
            background: var(--card-bg);
            border-color: var(--card-border);
            box-shadow: var(--card-shadow);
          }
          .preview-image {
            background: var(--preview-bg);
            border-color: var(--preview-border);
          }
          .ui-input {
            background: var(--input-bg);
            border-color: var(--input-border);
            color: var(--text);
          }
          .ui-input::placeholder {
            color: var(--input-placeholder);
          }
          .ui-button {
            background: var(--button-bg);
            color: var(--button-text);
          }
          .ui-button:hover {
            background: var(--button-bg-hover);
          }
          .ui-button:disabled {
            cursor: not-allowed;
            opacity: 0.7;
          }
          .theme-toggle {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            border-radius: 9999px;
            border: 1px solid var(--toggle-border);
            background: var(--toggle-bg);
            color: var(--toggle-text);
            padding: 0.35rem 0.75rem;
            font-size: 0.875rem;
            line-height: 1.1;
            transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease;
          }
          .theme-toggle:hover {
            filter: brightness(0.98);
          }
          .theme-toggle-icon {
            display: grid;
            place-items: center;
            width: 1.05rem;
            height: 1.05rem;
            border-radius: 9999px;
            border: 1px solid var(--toggle-border);
            font-size: 0.65rem;
            transition: transform 180ms ease;
          }
          [data-theme="dark"] .theme-toggle-icon {
            transform: rotate(180deg);
          }
        `}</style>
      </head>
      <body className="min-h-screen">
        <main className="page-wrap mx-auto px-4 py-10 sm:px-6 md:px-8 md:py-16">
          <div className="flex items-center justify-between">
            <div className="page-chip grid h-9 w-9 place-items-center rounded-full text-sm font-semibold">dg</div>
            <button
              id="theme-toggle"
              type="button"
              className="theme-toggle"
              aria-label="Toggle color mode"
              aria-pressed="false"
            >
              <span className="theme-toggle-icon" aria-hidden="true">
                ◐
              </span>
              <span id="theme-label">Light</span>
            </button>
          </div>
          <h1 className="page-title mt-8 text-[44px] lowercase leading-[1.03] tracking-[-0.03em]">
            <span className="font-semibold">dailygreen</span> - by webforspeed
          </h1>
          <p className="page-subtitle mt-7 text-[36px] font-semibold lowercase leading-[1.15] tracking-[-0.02em]">
            GitHub contributions as an SVG image.
          </p>
          <p className="page-body mt-6 text-[19px] leading-[1.45]">
            Embed your GitHub contribution chart as an SVG image in your{" "}
            <a href="https://github.com/n89nanda">README.md</a>
          </p>

          <UsageSnippet origin={origin} username={demoUser} />
          <ChartDemo origin={origin} username={demoUser} />
          <UsernamePreviewForm />
          <Footer />
        </main>

        <script dangerouslySetInnerHTML={{ __html: LANDING_PAGE_SCRIPT }} />
      </body>
    </html>
  );
}

export function renderLandingHtml(origin: string): string {
  return `<!doctype html>${renderToStaticMarkup(<LandingPage origin={origin} />)}`;
}
