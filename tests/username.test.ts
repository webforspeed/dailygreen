import { describe, expect, test } from "bun:test";
import { validateUsername } from "../src/lib/username";

describe("validateUsername", () => {
  test("accepts valid usernames", () => {
    expect(validateUsername("octocat")).toEqual({ ok: true, value: "octocat" });
    expect(validateUsername("n89nanda")).toEqual({ ok: true, value: "n89nanda" });
    expect(validateUsername("My-User-123")).toEqual({ ok: true, value: "My-User-123" });
  });

  test("normalizes whitespace", () => {
    expect(validateUsername("  octocat  ")).toEqual({ ok: true, value: "octocat" });
  });

  test("rejects malformed usernames", () => {
    const malformed = ["", "-", "-abc", "abc-", "ab--cd", "white space", "name_", "a".repeat(40)];
    for (const username of malformed) {
      expect(validateUsername(username)).toEqual({ ok: false, message: "Invalid username." });
    }
  });
});
