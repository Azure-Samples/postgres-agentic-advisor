// Client-related types

export interface Client {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  profile?: {
    risk_preference?: string;
    [key: string]: any;
  };
  primary_advisor_id?: number;
  created_at?: string;
  [key: string]: any; // Allow additional properties from API
}

export interface ClientsResponse {
  page: number;
  page_size: number;
  total: number;
  clients: Client[];
}

export interface PortfolioMetrics {
  net_worth: number;
  portfolio_value: number;
  growth: string;
}

// ---- /clients/list endpoint types ----

/** A single client row returned by GET /clients/list. */
export interface ClientListItem {
  id: number;
  full_name: string;
  net_worth: number;
  growth_percent: number;
  /** JSON-encoded or comma-separated array of numeric data points for the sparkline. */
  growth_series: string;
  top_sector: string;
  holdings: string[];
  risk_profile: string;
}

/** Paginated response from GET /clients/list. */
export interface ClientsListResponse {
  page: number;
  page_size: number;
  total: number;
  clients: ClientListItem[];
}

/** Filter values accepted by GET /clients/list. */
export type ClientFilterValue = 'all' | 'active' | 'high_risk' | 'tech' | 'consumer';

/** Sort values accepted by GET /clients/list. */
export type ClientSortValue = 'default' | 'name' | 'networth' | 'growth' | 'risk';

/** Query parameters for GET /clients/list. */
export interface ClientsListParams {
  page?: number;
  page_size?: number;
  filter?: ClientFilterValue;
  sort?: ClientSortValue;
  search?: string;
}
