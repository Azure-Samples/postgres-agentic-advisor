/**
 * Mock data barrel exports
 */

export { AlertMockData, chatHistoryMockData } from './chat';
export { AlertSummaryMockData } from './alertSummaries';
export { mockClients, mockClientData } from './clients';
export type { MockClient, ClientDetail, Project } from './clients';
export { defaultSuggestions, defaultBrowseOptions, browseTemplates } from './suggestions';
export {
  PIPELINE_NODES,
  PIPELINE_EDGES,
  AGENT_DETAILS,
  AGENT_DETAIL_MAP,
  PIPELINE_AGENT_ORDER,
} from './workflowMockData';
export type {
  AgentId,
  AgentDetail,
  AgentNodeData,
  CompactNodeData,
  RelationshipNodeData,
  RelationshipEdgeData,
} from './workflowMockData';
export { upcomingEarningsMockData } from './upcomingEarnings';
export type { UpcomingEarning } from './upcomingEarnings';
export { dashboardClientsMockData } from './dashboardClients';
export type { DashboardClient } from './dashboardClients';
export { upcomingMeetingsMockData } from './upcomingMeetings';
export type { UpcomingMeeting } from './upcomingMeetings';
