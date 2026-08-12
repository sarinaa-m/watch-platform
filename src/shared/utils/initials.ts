// Best-effort 1-2 character initials from an OTP identifier (email or phone),
// used purely for the avatar tile - there's no separate display-name field.
export function initialsOf(identifier: string | null | undefined): string {
  if (!identifier) return '?';
  const local = identifier.split('@')[0].trim();
  if (!local) return '?';
  return local.slice(0, 2).toUpperCase();
}
