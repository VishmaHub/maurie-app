export function formatCurrencyFromCents(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency
  }).format(amountCents / 100);
}

export function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

export function formatDate(value: Date | null): string {
  if (value === null) {
    return "No date set";
  }

  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium"
  }).format(value);
}
