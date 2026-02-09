import type { ContributionDay, ContributionLevel } from "./types";

export type FetchContributionsResult =
  | { ok: true; markup: string }
  | { ok: false; status: 404 | 502; message: string };

export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const CONTRIBUTIONS_ENDPOINT_BASE = "https://github.com/users";
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

function toUtcDate(dateText: string): Date {
  const [yearText, monthText, dayText] = dateText.split("-");
  const year = Number.parseInt(yearText, 10);
  const month = Number.parseInt(monthText, 10);
  const day = Number.parseInt(dayText, 10);
  return new Date(Date.UTC(year, month - 1, day));
}

function utcStartOfWeek(date: Date): Date {
  const clone = new Date(date.getTime());
  clone.setUTCDate(clone.getUTCDate() - clone.getUTCDay());
  return clone;
}

function dayDiff(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / MILLISECONDS_IN_DAY);
}

function parseAttributes(tagMarkup: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attributeRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)="([^"]*)"/g;

  for (const match of tagMarkup.matchAll(attributeRegex)) {
    const [, key, value] = match;
    attributes[key] = value;
  }

  return attributes;
}

function parseTooltipCounts(markup: string): Map<string, number> {
  const counts = new Map<string, number>();
  const tooltipRegex = /<tool-tip\b[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g;

  for (const match of markup.matchAll(tooltipRegex)) {
    const [, targetId, rawText] = match;
    const tooltipText = rawText.replaceAll(/\s+/g, " ").trim();

    if (/^No contributions on /.test(tooltipText)) {
      counts.set(targetId, 0);
      continue;
    }

    const contributionMatch = tooltipText.match(/^(\d+)\s+contributions?\s+on /);
    if (!contributionMatch) {
      continue;
    }

    counts.set(targetId, Number.parseInt(contributionMatch[1], 10));
  }

  return counts;
}

export async function fetchContributionsMarkup(
  username: string,
  fetchImpl: FetchLike = fetch,
): Promise<FetchContributionsResult> {
  const endpoint = `${CONTRIBUTIONS_ENDPOINT_BASE}/${encodeURIComponent(username)}/contributions`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  let response: Response;
  try {
    response = await fetchImpl(endpoint, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });
  } catch {
    return { ok: false, status: 502, message: "Failed to fetch contribution data." };
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) {
    return { ok: false, status: 404, message: "No contribution data found for this user." };
  }

  if (!response.ok) {
    return { ok: false, status: 502, message: "Failed to fetch contribution data." };
  }

  let markup: string;
  try {
    markup = await response.text();
  } catch {
    return { ok: false, status: 502, message: "Failed to fetch contribution data." };
  }

  return { ok: true, markup };
}

export function parseContributionDays(markup: string): ContributionDay[] {
  const dayTagRegex = /<(?:rect|td)\b[^>]*>/g;
  const tooltipCountsByCellId = parseTooltipCounts(markup);
  const dedupedByDate = new Map<string, { date: string; count: number; level: ContributionLevel }>();

  for (const match of markup.matchAll(dayTagRegex)) {
    const dayTag = match[0];
    if (!dayTag.includes("data-date=") || !dayTag.includes("data-level=")) {
      continue;
    }

    const attributes = parseAttributes(dayTag);
    const date = attributes["data-date"];
    const countText = attributes["data-count"];
    const levelText = attributes["data-level"];
    const cellId = attributes["id"];

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      continue;
    }

    const level = Number.parseInt(levelText ?? "", 10);
    if (Number.isNaN(level) || level < 0 || level > 4) {
      continue;
    }

    const countFromAttribute = Number.parseInt(countText ?? "", 10);
    let count = 0;
    if (!Number.isNaN(countFromAttribute) && countFromAttribute >= 0) {
      count = countFromAttribute;
    } else if (cellId && tooltipCountsByCellId.has(cellId)) {
      count = tooltipCountsByCellId.get(cellId) ?? 0;
    } else {
      count = level === 0 ? 0 : 1;
    }

    dedupedByDate.set(date, { date, count, level: level as ContributionLevel });
  }

  const ordered = [...dedupedByDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  if (ordered.length === 0) {
    return [];
  }

  const start = utcStartOfWeek(toUtcDate(ordered[0].date));
  return ordered.map((entry) => {
    const currentDate = toUtcDate(entry.date);
    return {
      date: entry.date,
      count: entry.count,
      level: entry.level,
      dayOfWeek: currentDate.getUTCDay(),
      weekIndex: Math.floor(dayDiff(start, currentDate) / 7),
    };
  });
}
