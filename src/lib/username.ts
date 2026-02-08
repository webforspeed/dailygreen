const GITHUB_USERNAME_REGEX = /^(?!-)(?!.*--)[A-Za-z0-9-]{1,39}$/;

export type UsernameValidationResult =
  | { ok: true; value: string }
  | { ok: false; message: string };

export function validateUsername(rawInput: string): UsernameValidationResult {
  const username = rawInput.trim();
  if (!username) {
    return { ok: false, message: "Invalid username." };
  }

  if (username.endsWith("-") || !GITHUB_USERNAME_REGEX.test(username)) {
    return { ok: false, message: "Invalid username." };
  }

  return { ok: true, value: username };
}
