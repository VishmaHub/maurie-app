interface VCardInput {
  readonly fullName: string;
  readonly organization: string;
  readonly title: string;
  readonly email: string | null;
  readonly url: string | null;
  readonly note: string | null;
}

function escapeVCardValue(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll(";", "\\;").replaceAll(",", "\\,");
}

function getOptionalLine(label: string, value: string | null): string | null {
  if (value === null || value.trim().length === 0) {
    return null;
  }

  return `${label}:${escapeVCardValue(value)}`;
}

export function buildVCard(input: VCardInput): string {
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCardValue(input.fullName)}`,
    `ORG:${escapeVCardValue(input.organization)}`,
    `TITLE:${escapeVCardValue(input.title)}`
  ];

  const emailLine = getOptionalLine("EMAIL;TYPE=INTERNET", input.email);
  const urlLine = getOptionalLine("URL", input.url);
  const noteLine = getOptionalLine("NOTE", input.note);

  if (emailLine !== null) {
    lines.push(emailLine);
  }

  if (urlLine !== null) {
    lines.push(urlLine);
  }

  if (noteLine !== null) {
    lines.push(noteLine);
  }

  lines.push("END:VCARD");

  return `${lines.join("\r\n")}\r\n`;
}
