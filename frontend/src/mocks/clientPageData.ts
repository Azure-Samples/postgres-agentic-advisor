import { FilterIcon, SortIcon } from '@/icons';

export interface FilterOption {
  label: string;
  value: string;
}

export interface SortOption {
  label: string;
  value: string;
}

// Filter options for the client list
export const clientFilterOptions: FilterOption[] = [
  {
    label: 'All Clients',
    value: 'all',
  },
  {
    label: 'Growth-oriented',
    value: 'high_risk',
  },
  {
    label: 'Information Technology',
    value: 'tech',
  },
];

// Sort options for the client list
export const clientSortOptions: SortOption[] = [
  {
    label: 'Sort by: Default',
    value: 'default',
  },
  {
    label: 'Sort by: Name',
    value: 'name',
  },
  {
    label: 'Sort by: Net Worth',
    value: 'networth',
  },
  {
    label: 'Sort by: Growth',
    value: 'growth',
  },
  {
    label: 'Sort by: Risk Profile',
    value: 'risk',
  },
];

// Default values for client page
export const clientPageDefaults = {
  defaultFilter: 'all',
  defaultSort: 'default',
  searchPlaceholder: 'Search clients, companies, positions...',
  sortPlaceholder: 'Sort by: Default',
};
