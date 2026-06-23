import type { ActionFieldErrors } from "@/types/action-response";

export type FormNoticeTone = "success" | "error" | "info";

interface FormNoticeProps {
  readonly title: string;
  readonly message?: string | null;
  readonly tone?: FormNoticeTone;
  readonly fieldErrors?: ActionFieldErrors;
  readonly className?: string;
}

const TONE_CLASSES: Record<FormNoticeTone, string> = {
  success: "border-[var(--maurie-yellow)] bg-[rgba(253,195,36,0.14)]",
  error: "border-[var(--maurie-orange)] bg-[rgba(234,109,48,0.14)]",
  info: "border-[var(--maurie-border)] bg-white/45"
};

export function FormNotice(props: FormNoticeProps) {
  const tone = props.tone ?? "info";
  const fieldErrorMessages = Object.values(props.fieldErrors ?? {}).flat();
  const role = tone === "error" ? "alert" : "status";

  return (
    <section
      role={role}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={`rounded-3xl border p-5 ${TONE_CLASSES[tone]} ${props.className ?? ""}`}
    >
      <h2 className="text-base font-semibold text-[var(--maurie-text)]">{props.title}</h2>

      {props.message === null || typeof props.message === "undefined" ? null : (
        <p className="mt-2 text-sm leading-6 text-[var(--maurie-muted)]">{props.message}</p>
      )}

      {fieldErrorMessages.length === 0 ? null : (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--maurie-muted)]">
          {fieldErrorMessages.map((message, index) => (
            <li key={`${message}-${index}`}>{message}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
