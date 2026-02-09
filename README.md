# dailygreen

Generate a GitHub-style contribution chart SVG for any public GitHub username.

## Stack

- Bun
- TypeScript
- React (server-rendered landing page)
- Tailwind (via CDN on landing page)
- Vercel Functions (single handler + rewrites)

## API Contract

### `GET /`

- Returns `200`
- Returns landing HTML

### `GET /robots.txt`

- Returns `200`
- Returns crawl directives + sitemap URL

### `GET /sitemap.xml`

- Returns `200`
- Returns XML sitemap for the landing page

### `GET /:username`

- Returns `200` with SVG content on success
- Returns `Cache-Control: public, max-age=86400, s-maxage=86400`

### Error behavior

- Invalid username: `400` + plain text `Invalid username.`
- No contribution data: `404` + plain text `No contribution data found for this user.`
- Upstream fetch/parser failures: `502` + plain text message

## Username Rules

Usernames are trimmed and validated with GitHub-compatible constraints:

- 1 to 39 chars
- Alphanumeric or hyphen only
- Cannot start/end with hyphen
- Cannot contain consecutive hyphens

## Local Development

### 1. Install Bun (if needed)

See [Bun install docs](https://bun.sh/docs/installation).

### 2. Install dependencies

```bash
bun install
```

### 3. Run locally

Recommended (no Vercel login required):

```bash
bun run dev:local
```

- Starts local server at `http://localhost:3000`
- Uses Bun server (`scripts/dev.ts`) with watch mode
- Automatically restarts on file changes (local hot reload workflow)

Run once without watch mode:

```bash
bun run dev:local:once
```

Vercel emulation mode:

```bash
bun run dev
```

- Runs `vercel dev` locally on `http://localhost:3000`
- May ask for Vercel login/authentication
- Useful when you specifically want Vercel runtime emulation

### 4. Quick checks

```bash
curl -i http://localhost:3000/
curl -i http://localhost:3000/robots.txt
curl -i http://localhost:3000/sitemap.xml
curl -i http://localhost:3000/n89nanda
curl -i http://localhost:3000/ab--cd
```

## Tests

Run unit + handler tests:

```bash
bun test
```

Run typecheck:

```bash
bun run typecheck
```

Run dependency audit:

```bash
bun audit
```

Included coverage:

- Username validation
- Contribution parser with stable fixture HTML
- SVG renderer deterministic structure
- Endpoint handler behaviors

## Deploy to Vercel

Do not deploy without explicit approval.

When you are ready:

```bash
bunx vercel
```

For production:

```bash
bunx vercel --prod
```

## Project Layout

- `api/index.ts`: Main HTTP handler that routes requests and returns HTML, SVG, or mapped errors.
- `scripts/dev.ts`: Bun local server entrypoint for development without Vercel auth.
- `src/app/page.tsx`: React server-rendered landing page template and client-side preview script.
- `src/components/landing/chart-demo.tsx`: Demo card that renders the preview contribution chart image.
- `src/components/landing/usage-snippet.tsx`: Usage card that renders the copy-ready README image snippet.
- `src/components/landing/username-preview-form.tsx`: Username input form and error container for preview updates.
- `src/components/ui/button.tsx`: Reusable shadcn-style button primitive.
- `src/components/ui/card.tsx`: Reusable shadcn-style card primitive.
- `src/components/ui/input.tsx`: Reusable shadcn-style input primitive.
- `src/lib/contributions.ts`: GitHub contributions fetcher and parser for contribution day data.
- `src/lib/http.ts`: Shared plain-text response helper.
- `src/lib/route.ts`: Path parser that maps URL paths to home/chart/invalid route kinds.
- `src/lib/svg.ts`: Deterministic SVG generator for contribution day data.
- `src/lib/types.ts`: Shared contribution day/type definitions.
- `src/lib/username.ts`: GitHub username validation and normalization logic.
- `src/lib/utils.ts`: Shared utility helpers like class name merging.
- `tests/fixtures/n89nanda-contributions.html`: Stable GitHub contributions markup fixture used by parser/handler tests.
- `tests/handler.test.ts`: End-to-end handler behavior tests for status codes, content types, and errors.
- `tests/parser.test.ts`: Parser tests for real-markup extraction and no-data behavior.
- `tests/svg.test.ts`: SVG renderer tests for deterministic structure and key attributes.
- `tests/username.test.ts`: Username validator tests for accepted and rejected inputs.
- `vercel.json`: Vercel rewrite config routing all paths to the single API handler.
- `package.json`: Project scripts and dependency declarations.
- `tsconfig.json`: TypeScript compiler settings for strict typechecking and JSX support.
- `AGENTS.md`: Repository-specific agent workflow and guardrails.
