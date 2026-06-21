import { NextResponse, type NextRequest } from "next/server";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getAuthenticatedSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

function getLoginRedirectUrl(request: NextRequest): URL {
  return new URL("/login", request.url);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedSession();

  if (session !== null) {
    await writeAuditLog({
      actorId: session.userId,
      action: "LOGOUT",
      resourceType: "User",
      resourceId: session.userId
    });
  }

  const response: NextResponse = NextResponse.redirect(getLoginRedirectUrl(request), {
    status: 303
  });

  response.cookies.delete(SESSION_COOKIE_NAME);

  return response;
}
