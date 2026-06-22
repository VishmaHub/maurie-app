import { prisma } from "@/lib/prisma";

export interface AdminEoiListItem {
  readonly id: string;
  readonly referenceCode: string;
  readonly collaboratorId: string;
  readonly collaboratorName: string;
  readonly collaboratorEmail: string;
  readonly status: string;
  readonly payloadVisibility: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AdminEoiDetail {
  readonly id: string;
  readonly referenceCode: string;
  readonly collaboratorId: string;
  readonly collaboratorName: string;
  readonly collaboratorEmail: string;
  readonly status: string;
  readonly payloadVisibility: string;
  readonly securityNote: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

interface CollaboratorLookupValue {
  readonly email: string;
  readonly displayName: string | null;
}

function getShortEoiReference(id: string): string {
  return `EOI-${id.slice(0, 8).toUpperCase()}`;
}

function getCollaboratorName(collaborator: CollaboratorLookupValue | undefined): string {
  if (collaborator === undefined) {
    return "Unknown collaborator";
  }

  return collaborator.displayName ?? collaborator.email;
}

async function getCollaboratorLookup(
  collaboratorIds: readonly string[]
): Promise<Map<string, CollaboratorLookupValue>> {
  const uniqueCollaboratorIds: string[] = Array.from(new Set(collaboratorIds));

  if (uniqueCollaboratorIds.length === 0) {
    return new Map<string, CollaboratorLookupValue>();
  }

  const collaborators = await prisma.user.findMany({
    where: {
      id: {
        in: uniqueCollaboratorIds
      },
      role: "COLLABORATOR"
    },
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          displayName: true
        }
      }
    }
  });

  return new Map(
    collaborators.map((collaborator) => [
      collaborator.id,
      {
        email: collaborator.email,
        displayName: collaborator.profile?.displayName ?? null
      }
    ])
  );
}

export async function getAdminEoiSubmissions(): Promise<readonly AdminEoiListItem[]> {
  const submissions = await prisma.eoiSubmission.findMany({
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      collaboratorId: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const collaboratorIds: string[] = submissions.map(
    (submission): string => submission.collaboratorId
  );

  const collaboratorLookup: Map<string, CollaboratorLookupValue> =
    await getCollaboratorLookup(collaboratorIds);

  return submissions.map((submission): AdminEoiListItem => {
    const collaborator = collaboratorLookup.get(submission.collaboratorId);

    return {
      id: submission.id,
      referenceCode: getShortEoiReference(submission.id),
      collaboratorId: submission.collaboratorId,
      collaboratorName: getCollaboratorName(collaborator),
      collaboratorEmail: collaborator?.email ?? "Not available",
      status: "SECURELY_STORED",
      payloadVisibility: "Encrypted",
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt
    };
  });
}

export async function getAdminEoiDetail(eoiId: string): Promise<AdminEoiDetail | null> {
  const submission = await prisma.eoiSubmission.findUnique({
    where: {
      id: eoiId
    },
    select: {
      id: true,
      collaboratorId: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (submission === null) {
    return null;
  }

  const collaboratorLookup: Map<string, CollaboratorLookupValue> = await getCollaboratorLookup([
    submission.collaboratorId
  ]);

  const collaborator = collaboratorLookup.get(submission.collaboratorId);

  return {
    id: submission.id,
    referenceCode: getShortEoiReference(submission.id),
    collaboratorId: submission.collaboratorId,
    collaboratorName: getCollaboratorName(collaborator),
    collaboratorEmail: collaborator?.email ?? "Not available",
    status: "SECURELY_STORED",
    payloadVisibility: "Encrypted and hidden",
    securityNote:
      "The EOI payload is intentionally not displayed in the admin interface. This view confirms ownership, existence, and timestamp metadata only.",
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt
  };
}
