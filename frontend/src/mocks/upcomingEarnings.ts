export interface UpcomingEarning {
  id: number;
  companyName: string;
  earningsDate: string;
  sparklineSeries: number[];
}

export const upcomingEarningsMockData: UpcomingEarning[] = [
  {
    id: 1,
    companyName: 'NorthWind',
    earningsDate: '24 Oct',
    sparklineSeries: [3, 2.5, 3.5, 2, 2.8, 2.2],
  },
  {
    id: 2,
    companyName: 'Zava Technologies',
    earningsDate: '18 Nov',
    sparklineSeries: [2, 2.4, 3, 3.5, 3.2, 3.8],
  },
  {
    id: 3,
    companyName: 'Contoso Compute',
    earningsDate: '30 Nov',
    sparklineSeries: [3.8, 3.2, 3.5, 3.1, 3.4, 3.0],
  },
  {
    id: 4,
    companyName: 'Nanofab Equipments',
    earningsDate: '05 Dec',
    sparklineSeries: [2.5, 3, 2.8, 3.5, 3.2, 3.8],
  },
  {
    id: 5,
    companyName: 'EduCare',
    earningsDate: '12 Dec',
    sparklineSeries: [3.5, 3, 2.5, 2.8, 2.2, 2.6],
  },
];
