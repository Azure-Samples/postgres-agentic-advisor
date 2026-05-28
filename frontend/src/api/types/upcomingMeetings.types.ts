export interface UpcomingMeetingItem {
  client_name: string;
  scheduled_at: string; // ISO 8601 datetime string
}

export interface UpcomingMeetingsResponse {
  meetings: UpcomingMeetingItem[];
}
