import { describe, expect, test } from "bun:test";
import { parseContributionDays } from "../src/lib/contributions";

const fixturePath = new URL("./fixtures/n89nanda-contributions.html", import.meta.url);

describe("parseContributionDays", () => {
  test("parses real GitHub contribution markup", async () => {
    const markup = await Bun.file(fixturePath).text();
    const days = parseContributionDays(markup);

    expect(days.length).toBeGreaterThan(300);
    expect(days[0]?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(days[0]?.weekIndex).toBe(0);
    expect(days[0]?.dayOfWeek).toBeGreaterThanOrEqual(0);
    expect(days[0]?.dayOfWeek).toBeLessThanOrEqual(6);
  });

  test("returns empty array when data cells are missing", () => {
    expect(parseContributionDays("<svg></svg>")).toEqual([]);
  });
});
