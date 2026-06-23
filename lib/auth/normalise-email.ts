/** Returns the canonical email value used by authentication and unique lookups. */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}
