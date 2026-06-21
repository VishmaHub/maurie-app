import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME: string =
  process.env.NODE_ENV === "production" ? "__Host-maurie_session" : "maurie_session";
const SESSION_SECRET_ENV_NAME = "MAURIE_SESSION_SECRET" as const;

const USER_ROLES = ["CLIENT", "CREATIVE", "COLLABORATOR"] as const;

type UserRole = (typeof USER_ROLES)[number];

interface SessionClaims {
  readonly sub: string;
  readonly role: UserRole;
  readonly iat: number;
  readonly exp: number;
  readonly nonce: string;
}

const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  CLIENT: "/dashboard/client",
  CREATIVE: "/dashboard/creative",
  COLLABORATOR: "/dashboard/collaborator"
};

const DASHBOARD_PREFIXES: Record<UserRole, string> = {
  CLIENT: "/dashboard/client",
  CREATIVE: "/dashboard/creative",
  COLLABORATOR: "/dashboard/collaborator"
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && Array.isArray(value) === false;
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

function getSessionSecret(): string | null {
  const secret: string | undefined = process.env[SESSION_SECRET_ENV_NAME];

  if (typeof secret !== "string" || secret.length < 32) {
    return null;
  }

  return secret;
}

function decodeBase64UrlToString(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

async function signValue(value: string): Promise<string | null> {
  const secret: string | null = getSessionSecret();

  if (secret === null) {
    return null;
  }

  const cryptoKey: CryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature: ArrayBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(value)
  );

  return Buffer.from(signature).toString("base64url");
}

function parseSessionClaims(value: unknown): SessionClaims | null {
  if (isRecord(value) === false) {
    return null;
  }

  const subject: unknown = value.sub;
  const role: unknown = value.role;
  const issuedAt: unknown = value.iat;
  const expiresAt: unknown = value.exp;
  const nonce: unknown = value.nonce;

  if (
    typeof subject !== "string" ||
    isUserRole(role) === false ||
    typeof issuedAt !== "number" ||
    typeof expiresAt !== "number" ||
    typeof nonce !== "string"
  ) {
    return null;
  }

  return {
    sub: subject,
    role,
    iat: issuedAt,
    exp: expiresAt,
    nonce
  };
}

async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  const parts: string[] = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const header: string | undefined = parts[0];
  const payload: string | undefined = parts[1];
  const signature: string | undefined = parts[2];

  if (typeof header !== "string" || typeof payload !== "string" || typeof signature !== "string") {
    return null;
  }

  const expectedSignature: string | null = await signValue(`${header}.${payload}`);

  if (expectedSignature === null || expectedSignature !== signature) {
    return null;
  }

  let parsedPayload: unknown;

  try {
    parsedPayload = JSON.parse(decodeBase64UrlToString(payload));
  } catch {
    return null;
  }

  const claims: SessionClaims | null = parseSessionClaims(parsedPayload);

  if (claims === null) {
    return null;
  }

  const currentUnixSeconds: number = Math.floor(Date.now() / 1000);

  if (claims.exp <= currentUnixSeconds) {
    return null;
  }

  return claims;
}

function isDashboardPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function isLoginPath(pathname: string): boolean {
  return pathname === "/login" || pathname.startsWith("/login/");
}

function getRoleForDashboardPath(pathname: string): UserRole | null {
  for (const role of USER_ROLES) {
    const prefix: string = DASHBOARD_PREFIXES[role];

    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return role;
    }
  }

  return null;
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl: URL = new URL("/login", request.url);

  if (request.nextUrl.pathname !== "/login") {
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  }

  return NextResponse.redirect(loginUrl);
}

function redirectToDashboard(request: NextRequest, role: UserRole): NextResponse {
  return NextResponse.redirect(new URL(ROLE_DASHBOARD_PATHS[role], request.url));
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; form-action 'self'; img-src 'self' data: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'"
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const pathname: string = request.nextUrl.pathname;
  const sessionToken: string | undefined = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (typeof sessionToken !== "string" || sessionToken.length === 0) {
    if (isDashboardPath(pathname)) {
      return addSecurityHeaders(redirectToLogin(request));
    }

    return addSecurityHeaders(NextResponse.next());
  }

  const claims: SessionClaims | null = await verifySessionToken(sessionToken);

  if (claims === null) {
    if (isDashboardPath(pathname)) {
      return addSecurityHeaders(redirectToLogin(request));
    }

    return addSecurityHeaders(NextResponse.next());
  }

  if (isLoginPath(pathname)) {
    return addSecurityHeaders(redirectToDashboard(request, claims.role));
  }

  if (pathname === "/dashboard") {
    return addSecurityHeaders(redirectToDashboard(request, claims.role));
  }

  const requiredRole: UserRole | null = getRoleForDashboardPath(pathname);

  if (requiredRole !== null && requiredRole !== claims.role) {
    return addSecurityHeaders(redirectToDashboard(request, claims.role));
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/login/:path*", "/dashboard/:path*"]
};
