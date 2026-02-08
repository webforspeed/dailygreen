import { describe, expect, test } from "bun:test";
import { renderContributionSvg } from "../src/lib/svg";
import type { ContributionDay } from "../src/lib/types";

describe("renderContributionSvg", () => {
  test("renders deterministic SVG output", () => {
    const days: ContributionDay[] = [
      { date: "2026-01-04", count: 0, level: 0, weekIndex: 0, dayOfWeek: 0 },
      { date: "2026-01-05", count: 2, level: 2, weekIndex: 0, dayOfWeek: 1 },
      { date: "2026-01-06", count: 4, level: 3, weekIndex: 0, dayOfWeek: 2 },
      { date: "2026-01-12", count: 1, level: 1, weekIndex: 1, dayOfWeek: 1 },
    ];

    const svg = renderContributionSvg("octocat", days);
    const rectCount = (svg.match(/<rect /g) ?? []).length;

    expect(svg.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBeTrue();
    expect(svg.includes("octocat")).toBeTrue();
    expect(svg.includes('role="img"')).toBeTrue();
    expect(svg.includes('data-date="2026-01-12"')).toBeTrue();
    expect(rectCount).toBe(4);
  });
});
