import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { ROLE_DASHBOARD_PATHS } from "@/lib/navigation";

export default async function DashboardRedirectPage() {
  const session = await getAuthenticatedSession();

  if (session === null) {
    redirect("/login");
  }

  redirect(ROLE_DASHBOARD_PATHS[session.role]);
}
