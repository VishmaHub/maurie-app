import { NextResponse, type NextRequest } from "next/server";
import { getPublishedCreativeProfileByHandle } from "@/lib/creative-portfolio";
import { buildVCard } from "@/lib/vcard";

interface PublicCreativeVCardRouteContext {
  readonly params: Promise<{
    readonly publicHandle: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: PublicCreativeVCardRouteContext
): Promise<NextResponse> {
  const params = await context.params;
  const profile = await getPublishedCreativeProfileByHandle(params.publicHandle);

  if (profile === null) {
    return new NextResponse("Creative profile not found.", {
      status: 404
    });
  }

  const vcard = buildVCard({
    fullName: profile.creativeName,
    organization: "Mauri-E",
    title: profile.headline,
    email: profile.contactEmail ?? profile.creativeEmail,
    url: profile.websiteUrl,
    note: profile.bio
  });

  return new NextResponse(vcard, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${profile.publicHandle}.vcf"`
    }
  });
}
