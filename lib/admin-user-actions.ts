"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";

function getFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  return value;
}

function getSafeReturnPath(formData: FormData): string {
  const returnPath = getFormString(formData, "returnPath");

  if (returnPath === null) {
    return "/dashboard/admin/users";
  }

  if (!returnPath.startsWith("/dashboard/admin/users")) {
    return "/dashboard/admin/users";
  }

  return returnPath;
}

function getRedirectUrl(status: string, returnPath: string): string {
  const searchParams = new URLSearchParams();
  searchParams.set("status", status);

  return `${returnPath}?${searchParams.toString()}`;
}

function getNextActiveValue(value: string | null): boolean | null {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}

export async function updateUserStatusAction(formData: FormData): Promise<void> {
  const session = await requireRole("ADMIN");

  const userId = getFormString(formData, "userId");
  const nextActiveValue = getNextActiveValue(getFormString(formData, "nextActive"));
  const returnPath = getSafeReturnPath(formData);

  if (userId === null || nextActiveValue === null) {
    redirect(getRedirectUrl("invalid", returnPath));
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true
    }
  });

  if (user === null) {
    redirect(getRedirectUrl("not-found", returnPath));
  }

  if (user.id === session.userId && !nextActiveValue) {
    await writeAuditLog({
      actorId: session.userId,
      action: "ACCESS_DENIED",
      resourceType: "User",
      resourceId: user.id,
      metadata: {
        reason: "admin-self-deactivation-blocked",
        targetEmail: user.email
      }
    });

    redirect(getRedirectUrl("self-lock-blocked", returnPath));
  }

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      isActive: nextActiveValue
    }
  });

  await writeAuditLog({
    actorId: session.userId,
    action: "ADMIN_USER_STATUS_UPDATE",
    resourceType: "User",
    resourceId: user.id,
    metadata: {
      targetEmail: user.email,
      targetRole: user.role,
      previousStatus: user.isActive,
      nextStatus: nextActiveValue,
      changed: user.isActive !== nextActiveValue
    }
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
  revalidatePath(`/dashboard/admin/users/${user.id}`);
  revalidatePath("/dashboard/admin/search");
  revalidatePath("/dashboard/admin/data-integrity");

  redirect(getRedirectUrl("updated", returnPath));
}
