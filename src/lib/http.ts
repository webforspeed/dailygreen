export function textResponse(status: number, message: string, headers?: Record<string, string>): Response {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...(headers ?? {}),
    },
  });
}
