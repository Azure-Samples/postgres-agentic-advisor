// Chat mock data for development/demo purposes

import type { DropdownOption } from '@/components/Dropdown/Dropdown';

export const AlertMockData = [
  {
    id: '1',
    trend: 'down',
    clientName: 'Jennifer Walsh',
    title: 'XLK fell -2.8% intraday',
    subtitle: '$XLK down on Nvidia earnings, holds 15% exposure',
  },
  {
    id: '2',
    trend: 'down',
    clientName: 'Acme Corp',
    title: 'Energy sector underperforms',
    subtitle: 'Crude oil volatility impacts energy ETFs',
  },
  {
    id: '3',
    trend: 'up',
    clientName: 'Beta Investments',
    title: 'Tech rebound today',
    subtitle: 'Large-cap tech stocks recover after morning dip',
  },
];

/** Mock sources shown beneath each assistant chat message */
export const MOCK_CHAT_SOURCES: string[] = [
  'Bloomberg Market Data',
  'Internal Portfolio Database (Q2 2024)',
  'Reuters Analyst Forecasts',
];

export const chatHistoryMockData = [
  {
    id: '1',
    title: 'Project Kickoff Discussion',
    subtitle: 'Latest updates shared by client',
    timeAgo: '2 mins ago',
  },
  {
    id: '2',
    title: 'Sprint Review Meeting',
    subtitle: 'Action items assigned to team',
    timeAgo: '1 hour ago',
  },
  {
    id: '3',
    title: 'API Integration Queries',
    subtitle: 'Awaiting response from backend team',
    timeAgo: 'Yesterday',
  },
];
