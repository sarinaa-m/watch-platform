export function initialsOf(identifier: string | null | undefined): string {
  if (!identifier) return '?';
  const local = identifier.split('@')[0].trim();
  if (!local) return '?';
  return local.slice(0, 2).toUpperCase();
}
