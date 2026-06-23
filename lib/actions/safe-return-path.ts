const LOCAL_ORIGIN = "https://maurie.local";

function matchesAllowedPrefix(pathname: string, prefix: string): boolean {
  const normalisedPrefix = prefix === "/" ? prefix : prefix.replace(/\/$/, "");

  if (normalisedPrefix === "/") {
    return pathname.startsWith("/");
  }

  return pathname === normalisedPrefix || pathname.startsWith(`${normalisedPrefix}/`);
}

/**
 * Accepts only local paths within an explicit allow-list. This prevents a
 * client-controlled returnPath field from becoming an open redirect.
 */
export function getSafeReturnPath(
  value: FormDataEntryValue | null | undefined,
  allowedPrefixes: readonly string[],
  fallbackPath: string
): string {
  if (typeof value !== "string" || allowedPrefixes.length === 0) {
    return fallbackPath;
  }

  const candidate = value.trim();

  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return fallbackPath;
  }

  try {
    const url = new URL(candidate, LOCAL_ORIGIN);

    if (url.origin !== LOCAL_ORIGIN) {
      return fallbackPath;
    }

    if (!allowedPrefixes.some((prefix): boolean => matchesAllowedPrefix(url.pathname, prefix))) {
      return fallbackPath;
    }

    return `${url.pathname}${url.search}`;
  } catch {
    return fallbackPath;
  }
}
