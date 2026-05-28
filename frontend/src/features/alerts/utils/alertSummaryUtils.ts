/**
 * Format numeric value as currency
 */
export const formatCurrency = (value: number): string => {
  if (Number.isNaN(value)) return '-';
  return `$${value.toLocaleString()}`;
};

/**
 * Extract initials from a name (max 2 characters)
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
