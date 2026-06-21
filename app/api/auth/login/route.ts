import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "@/generated/prisma/client";
import { createSessionCookiePayload } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { ROLE_DASHBOARD_PATHS } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit/audit-log";

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getFormFieldValue(formData: FormData, fieldName: string): string {
  const value: FormDataEntryValue | null = formData.get(fieldName);

  if (typeof value !== "string") {
    return "";
  }

  return value;
}

function getSafeRedirectPath(nextPath: string, role: UserRole): string {
  const roleDashboardPath: string = ROLE_DASHBOARD_PATHS[role];

  if (nextPath === roleDashboardPath || nextPath.startsWith(`${roleDashboardPath}/`)) {
    return nextPath;
  }

  return roleDashboardPath;
}

function getLoginErrorRedirect(request: NextRequest, nextPath: string): NextResponse {
  const loginUrl: URL = new URL("/login", request.url);

  if (nextPath.startsWith("/dashboard")) {
    loginUrl.searchParams.set("next", nextPath);
  }

  loginUrl.searchParams.set("error", "invalid-login");

  return NextResponse.redirect(loginUrl, {
    status: 303
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const formData: FormData = await request.formData();

  const email: string = normaliseEmail(getFormFieldValue(formData, "email"));
  const password: string = getFormFieldValue(formData, "password").trim();
  const nextPath: string = getFormFieldValue(formData, "next");

  if (email.length === 0 || password.length === 0) {
    return getLoginErrorRedirect(request, nextPath);
  }

  const user = await prisma.user.findUnique({
    where: {
      normalizedEmail: email
    },
    select: {
      id: true,
      passwordHash: true,
      role: true,
      isActive: true
    }
  });

  if (user === null || user.isActive === false) {
    await writeAuditLog({
      actorId: null,
      action: "LOGIN_FAILED",
      resourceType: "User",
      resourceId: email,
      metadata: {
        reason: "user-not-found-or-inactive"
      }
    });

    return getLoginErrorRedirect(request, nextPath);
  }

  const isPasswordValid: boolean = verifyPassword(password, user.passwordHash);

  if (isPasswordValid === false) {
    await writeAuditLog({
      actorId: user.id,
      action: "LOGIN_FAILED",
      resourceType: "User",
      resourceId: user.id,
      metadata: {
        reason: "invalid-password"
      }
    });

    return getLoginErrorRedirect(request, nextPath);
  }

  const redirectPath: string = getSafeRedirectPath(nextPath, user.role);

  const response: NextResponse = NextResponse.redirect(new URL(redirectPath, request.url), {
    status: 303
  });

  response.cookies.set(
    createSessionCookiePayload({
      userId: user.id,
      role: user.role
    })
  );

  await writeAuditLog({
    actorId: user.id,
    action: "LOGIN_SUCCESS",
    resourceType: "User",
    resourceId: user.id,
    metadata: {
      role: user.role
    }
  });

  return response;
}
