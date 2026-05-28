import { getClientAvatarUrl } from '@/utils/clientAvatarMap';

export interface DashboardClient {
  id: number;
  name: string;
  aum: string;
  changePercent: number;
  sparklineSeries: number[];
  avatarUrl?: string;
}

export const dashboardClientsMockData: DashboardClient[] = [
  {
    id: 1,
    name: 'Brian Thompson',
    aum: '$3.7M',
    changePercent: -11.6,
    sparklineSeries: [3.5, 3.2, 2.8, 2.5, 2.2, 2.0],
    avatarUrl: getClientAvatarUrl('Brian Thompson'),
  },
  {
    id: 2,
    name: 'Ashley Cooper',
    aum: '$2.8M',
    changePercent: -10.3,
    sparklineSeries: [3.0, 2.8, 2.6, 2.4, 2.2, 2.0],
    avatarUrl: getClientAvatarUrl('Ashley Cooper'),
  },
  {
    id: 3,
    name: 'Emily Parker',
    aum: '$4.8M',
    changePercent: 12.4,
    sparklineSeries: [3.0, 3.2, 3.5, 3.8, 4.2, 4.5],
    avatarUrl: getClientAvatarUrl('Emily Parker'),
  },
  {
    id: 4,
    name: 'Megan Sullivan',
    aum: '$3.1M',
    changePercent: 3.4,
    sparklineSeries: [2.8, 2.9, 3.0, 3.0, 3.1, 3.1],
    avatarUrl: getClientAvatarUrl('Megan Sullivan'),
  },
  {
    id: 5,
    name: 'James Anderson',
    aum: '$3.2M',
    changePercent: 10.8,
    sparklineSeries: [2.5, 2.7, 2.9, 3.0, 3.2, 3.4],
    avatarUrl: getClientAvatarUrl('James Anderson'),
  },
];
