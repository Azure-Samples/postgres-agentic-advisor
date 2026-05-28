/**
 * Convert client name to URL-friendly slug
 * Example: "David Nguyen" -> "David-Nguyen"
 * Example: "ABC Corp" -> "ABC-Corp"
 */
export const clientToSlug = (clientName: string): string => {
  return clientName
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9-]/g, '') // Remove special characters except hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Find client by slug from client list
 */
export const findClientBySlug = (clients: Array<{ full_name: string; id: number }>, slug: string) => {
  return clients.find((client) => clientToSlug(client.full_name) === slug);
};

