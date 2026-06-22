import { prisma } from "@/lib/prisma";

export interface CollaboratorEoiListItem {
  readonly id: string;
  readonly referenceCode: string;
  readonly title: string;
  readonly status: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CollaboratorEoiDetail {
  readonly id: string;
  readonly referenceCode: string;
  readonly title: string;
  readonly status: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

function getShortReference(id: string): string {
  return `EOI-${id.slice(0, 8).toUpperCase()}`;
}

export async function getCollaboratorEoiSubmissions(
  userId: string
): Promise<readonly CollaboratorEoiListItem[]> {
  const submissions = await prisma.eoiSubmission.findMany({
    where: {
      collaboratorId: userId
    },
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return submissions.map(
    (submission): CollaboratorEoiListItem => ({
      id: submission.id,
      referenceCode: getShortReference(submission.id),
      title: "Encrypted EOI Submission",
      status: "SECURELY_STORED",
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt
    })
  );
}

export async function getCollaboratorEoiDetail(input: {
  readonly userId: string;
  readonly eoiId: string;
}): Promise<CollaboratorEoiDetail | null> {
  const submission = await prisma.eoiSubmission.findFirst({
    where: {
      id: input.eoiId,
      collaboratorId: input.userId
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (submission === null) {
    return null;
  }

  return {
    id: submission.id,
    referenceCode: getShortReference(submission.id),
    title: "Encrypted EOI Submission",
    status: "SECURELY_STORED",
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt
  };
}
