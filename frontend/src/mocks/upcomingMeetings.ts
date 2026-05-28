export interface UpcomingMeeting {
  id: number;
  clientName: string;
  dateTime: string;
  platform?: string;
}

export const upcomingMeetingsMockData: UpcomingMeeting[] = [
  {
    id: 1,
    clientName: 'Sarah Chen',
    dateTime: '07 Oct, 2024  |  2:00 AM',
  },
  {
    id: 2,
    clientName: 'Michael Rodriguez',
    dateTime: '07 Oct, 2024  |  10:30 AM',
    platform: 'Zoom',
  },
  {
    id: 3,
    clientName: 'Jennifer Walsh',
    dateTime: '07 Oct, 2024  |  3:00 AM',
    platform: 'Zoom',
  },
];
