// Suggestion templates and dropdown options mock data

import type { DropdownOption } from '@/components/Dropdown/Dropdown';

/**
 * Default template suggestions displayed as pills.
 *
 * Each template has a locked, non-editable structure.
 * Only the [Client Name] and [Company Name] placeholders are interactive.
 * [Client Name] is auto-populated from the active chat client context (editable).
 * [Company Name] renders as a dropdown of companies relevant to the active client.
 */
export const defaultSuggestions: string[] = [
  'Based on news, which companies are performing well',
  'Which companies may struggle if current market trends continue?',
  'What are the top companies based on SEC filings?',
];

/**
 * Template strings mapped to browse option values
 * These are used when a user selects an option from the Browse dropdown
 */
export const browseTemplates: Record<string, string> = {
  financial: 'Provide a comprehensive financial analysis for [Input], including revenue growth, profit margins, and key financial ratios.',
  market: 'What are the current market trends affecting [Input]? Analyze recent performance and future outlook.',
  risk: 'Conduct a detailed risk assessment for [Input]. What are the major risks and potential mitigation strategies?',
  portfolio: 'Review the portfolio allocation for [Input]. Should we rebalance based on current market conditions?',
  valuation: 'What is the fair valuation of [Input] based on fundamental analysis? Is it currently undervalued or overvalued?',
  dividend: 'Analyze the dividend history and sustainability of [Input]. Is it a good dividend investment for this client?',
  sector: 'How is [Input] positioned within its sector? Compare it to major competitors and industry benchmarks.',
  technical: 'Provide technical analysis for [Input], including key support/resistance levels and momentum indicators.',
};

/**
 * Browse dropdown options with corresponding templates
 */
export const defaultBrowseOptions: DropdownOption[] = [
  { label: 'Financial Analysis', value: 'financial' },
  { label: 'Market Trends', value: 'market' },
  { label: 'Risk Assessment', value: 'risk' },
  { label: 'Portfolio Review', value: 'portfolio' },
  { label: 'Valuation Analysis', value: 'valuation' },
  { label: 'Dividend Analysis', value: 'dividend' },
  { label: 'Sector Comparison', value: 'sector' },
  { label: 'Technical Analysis', value: 'technical' },
];

