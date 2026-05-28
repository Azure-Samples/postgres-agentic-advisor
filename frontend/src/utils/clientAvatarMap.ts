/**
 * Maps a client's first name (lowercase) to its avatar image path served from /public.
 * Filenames are intentionally lowercase to match the assets on disk.
 */
const CLIENT_AVATAR_MAP: Record<string, string> = {
  brian: '/brain-thompson.webp',
  ashley: '/ashley-cooper.webp',
  daniel: '/daniel-reed.webp',
  emily: '/emily-parker.webp',
  megan: '/megan-sullivan.webp',
  james: '/james-anderson.webp',
};

/**
 * Returns the avatar URL for a given full client name, or `undefined` if none exists.
 * Lookup is case-insensitive and based on the client's first name.
 */
export function getClientAvatarUrl(fullName: string): string | undefined {
  const firstName = fullName.split(' ')[0].toLowerCase();
  return CLIENT_AVATAR_MAP[firstName];
}

/** Avatar background colors — deterministic, cycling through a warm/neutral palette */
const AVATAR_COLORS = [
  '#067394', // teal (primary)
  '#7C3AED', // violet
  '#D97706', // amber
  '#059669', // emerald
  '#DC2626', // red
  '#2563EB', // blue
  '#DB2777', // pink
  '#0891B2', // cyan
];

/**
 * Returns a deterministic background color for a client's avatar based on their name.
 */
export function getAvatarColor(fullName: string): string {
  let hash = 0;
  for (let i = 0; i < fullName.length; i++) {
    hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Returns up to 2 initials from a full name (first + last).
 * e.g. "Brian Thompson" → "BT", "Sarah" → "S"
 */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
