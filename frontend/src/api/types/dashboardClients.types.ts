export interface DashboardClientItem {
  client_name: string;
  current_portfolio_value: number;
  trend: 'up' | 'down';
  total_return_percentage: number;
  holdings?: string[];
}

export interface DashboardClientsResponse {
  clients: DashboardClientItem[];
  date: string;
}
