export interface SectorTrendTickerData {
  normalized_change: number;
  relative_performance: number;
  trend: 'up' | 'down';
  performance_sentence: string;
}

export interface SecurityInfo {
  name: string;
  description: string;
}

export interface SectorTrendDataPoint {
  date: string;
  [ticker: string]: SectorTrendTickerData | string;
}

export interface SectorTrendsResponse {
  days: number;
  tickers: string[];
  securities_info: Record<string, SecurityInfo>;
  data: SectorTrendDataPoint[];
}
