import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui/status-badge";
import { getPublishedCreativeProfileByHandle } from "@/lib/creative-portfolio";

interface PublicCreativeProfilePageProps {
  readonly params: Promise<{
    readonly publicHandle: string;
  }>;
}

export default async function PublicCreativeProfilePage(props: PublicCreativeProfilePageProps) {
  const params = await props.params;
  const profile = await getPublishedCreativeProfileByHandle(params.publicHandle);

  if (profile === null) {
    notFound();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <section className="maurie-glass grid w-full max-w-6xl gap-8 rounded-[2rem] p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
        <div>
          <Link
            href="/"
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(89,55,50,0.16)] bg-[linear-gradient(135deg,var(--maurie-yellow),var(--maurie-orange))] text-base font-black tracking-tight text-[var(--maurie-black)] shadow-[0_14px_34px_rgba(234,109,48,0.24)]"
          >
            ME
          </Link>

          <p className="mt-8 text-sm font-medium uppercase tracking-[0.28em] text-[var(--maurie-muted)]">
            Mauri-E Creative Profile
          </p>

          <h1 className="mt-4 text-5xl font-semibold leading-[0.96] tracking-tight text-[var(--maurie-text)]">
            {profile.creativeName}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--maurie-muted)]">
            {profile.headline}
          </p>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-[var(--maurie-muted)]">
            {profile.bio ?? "This creative has not added a detailed bio yet."}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Location</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                {profile.locationLabel ?? "Not added"}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--maurie-border)] bg-white/35 p-4">
              <p className="text-xs text-[var(--maurie-muted)]">Public Handle</p>
              <p className="mt-1 text-sm font-semibold text-[var(--maurie-text)]">
                /c/{profile.publicHandle}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {profile.websiteUrl !== null ? (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="maurie-button-primary"
              >
                Visit Website
              </a>
            ) : null}

            <Link href={`/c/${profile.publicHandle}/vcard`} className="maurie-button-secondary">
              Download vCard
            </Link>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-[var(--maurie-border)] bg-[var(--maurie-black)] p-5 text-[var(--maurie-cream)] shadow-[0_24px_80px_rgba(89,55,50,0.22)]">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/60">
              Portfolio
            </p>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Selected work.</h2>

            <p className="mt-4 text-sm leading-6 text-white/70">
              Published creative work and portfolio samples connected to this Mauri-E profile.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            {profile.items.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-sm text-white/70">No public portfolio items are available.</p>
              </div>
            ) : (
              profile.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                        {item.category}
                      </p>

                      <h3 className="mt-2 text-base font-semibold text-white">{item.title}</h3>
                    </div>

                    <StatusBadge label="PUBLIC" tone="orange" />
                  </div>

                  <p className="mt-3 text-sm leading-6 text-white/70">
                    {item.description ?? "No description has been added yet."}
                  </p>

                  {item.externalUrl !== null ? (
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex text-sm font-bold text-[var(--maurie-yellow)]"
                    >
                      View work
                    </a>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
