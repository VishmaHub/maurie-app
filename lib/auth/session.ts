import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { UserRole } from "@/generated/prisma/client";

export const SESSION_COOKIE_NAME: string =
  process.env.NODE_ENV === "production" ? "__Host-maurie_session" : "maurie_session";

export const SESSION_DURATION_SECONDS = 60 * 30;

const SESSION_SECRET_ENV_NAME = "MAURIE_SESSION_SECRET" as const;

interface SessionClaims {
  readonly sub: string;
  readonly role: UserRole;
  readonly iat: number;
  readonly exp: number;
  readonly nonce: string;
}

export interface AuthenticatedSession {
  readonly userId: string;
  readonly role: UserRole;
  readonly expiresAt: Date;
}

export interface SessionCookiePayload {
  readonly name: string;
  readonly value: string;
  readonly maxAge: number;
  readonly path: string;
  readonly httpOnly: boolean;
  readonly secure: boolean;
  readonly sameSite: "strict";
}

function getSessionSecret(): string {
  const secret: string | undefined = process.env[SESSION_SECRET_ENV_NAME];

  if (typeof secret !== "string" || secret.length < 32) {
    throw new Error("MAURIE_SESSION_SECRET must be configured with at least 32 characters.");
  }

  return secret;
}

function encodeBase64Url(value: Buffer | string): string {
  return Buffer.from(value).toString("base64url");
}

function decodeBase64UrlToString(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function createSessionToken(claims: SessionClaims): string {
  const header: string = encodeBase64Url(
    JSON.stringify({
      alg: "HS256",
      typ: "JWT"
    })
  );

  const payload: string = encodeBase64Url(JSON.stringify(claims));
  const unsignedToken: string = `${header}.${payload}`;
  const signature: string = signValue(unsignedToken);

  return `${unsignedToken}.${signature}`;
}

function verifySessionToken(token: string): AuthenticatedSession | null {
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

  const unsignedToken: string = `${header}.${payload}`;
  const expectedSignature: Buffer = Buffer.from(signValue(unsignedToken), "base64url");
  const actualSignature: Buffer = Buffer.from(signature, "base64url");

  if (
    expectedSignature.length !== actualSignature.length ||
    timingSafeEqual(expectedSignature, actualSignature) === false
  ) {
    return null;
  }

  let parsedPayload: unknown;

  try {
    parsedPayload = JSON.parse(decodeBase64UrlToString(payload));
  } catch {
    return null;
  }

  if (typeof parsedPayload !== "object" || parsedPayload === null) {
    return null;
  }

  const claims = parsedPayload as Partial<SessionClaims>;

  if (
    typeof claims.sub !== "string" ||
    typeof claims.role !== "string" ||
    typeof claims.iat !== "number" ||
    typeof claims.exp !== "number" ||
    typeof claims.nonce !== "string"
  ) {
    return null;
  }

  const currentUnixSeconds: number = Math.floor(Date.now() / 1000);

  if (claims.exp <= currentUnixSeconds) {
    return null;
  }

  return {
    userId: claims.sub,
    role: claims.role as UserRole,
    expiresAt: new Date(claims.exp * 1000)
  };
}

export function createSessionCookiePayload(input: {
  readonly userId: string;
  readonly role: UserRole;
}): SessionCookiePayload {
  const issuedAt: number = Math.floor(Date.now() / 1000);
  const expiresAt: number = issuedAt + SESSION_DURATION_SECONDS;

  const token: string = createSessionToken({
    sub: input.userId,
    role: input.role,
    iat: issuedAt,
    exp: expiresAt,
    nonce: randomBytes(24).toString("base64url")
  });

  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS
  };
}

export async function createSessionCookie(input: {
  readonly userId: string;
  readonly role: UserRole;
}): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookiePayload: SessionCookiePayload = createSessionCookiePayload(input);

  cookieStore.set(sessionCookiePayload);
}

export async function getAuthenticatedSession(): Promise<AuthenticatedSession | null> {
  const cookieStore = await cookies();
  const token: string | undefined = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (typeof token !== "string" || token.length === 0) {
    return null;
  }

  return verifySessionToken(token);
}
