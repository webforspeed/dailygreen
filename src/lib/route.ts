export type ParsedRoute =
  | { kind: "home" }
  | { kind: "chart"; usernameRaw: string }
  | { kind: "invalid" };

export function parseRoute(pathname: string): ParsedRoute {
  if (pathname === "/") {
    return { kind: "home" };
  }

  if (!pathname.startsWith("/") || pathname.endsWith("/") || pathname.includes("//")) {
    return { kind: "invalid" };
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) {
    return { kind: "invalid" };
  }

  let decodedSegment: string;
  try {
    decodedSegment = decodeURIComponent(segments[0]);
  } catch {
    return { kind: "invalid" };
  }

  const usernameRaw = decodedSegment.trim();
  if (!usernameRaw || usernameRaw === "." || usernameRaw === ".." || usernameRaw.includes("/")) {
    return { kind: "invalid" };
  }

  return { kind: "chart", usernameRaw };
}
