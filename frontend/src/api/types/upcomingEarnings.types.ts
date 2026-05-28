export interface UpcomingEarningItem {
  company_name: string;
  days_from_reference: number | null;
  trend: 'up' | 'down';
  earnings_date: string;
}

export interface UpcomingEarningsResponse {
  reference_date: string;
  earnings: UpcomingEarningItem[];
}
