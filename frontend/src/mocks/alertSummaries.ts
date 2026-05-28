export interface ClientDetailsSummary {
  name: string;
  net_worth: number;
  portfolio_value: number;
  growth: string;
  last_crm_note: string;
}

export interface AiSummarySection {
  title: string;
  description: string;
  sources: string[];
}

export interface WorkflowSummary {
  planning_agent?: string;
  news_synthesizer_agent?: string;
  financial_advisor_agent?: string;
  risk_insight_agent?: string;
  brief_agent?: string;
}

export interface ViewSummaryResponse {
  client_details: ClientDetailsSummary;
  AI_summary: AiSummarySection;
  Suggested_response: AiSummarySection;
  workflow?: WorkflowSummary;
}

export const AlertSummaryMockData: Record<string, ViewSummaryResponse> = {
  '1': {
    client_details: {
      name: 'Jennifer Walsh',
      net_worth: 2500000,
      portfolio_value: 1850000,
      growth: '5.2% QoQ',
      last_crm_note: 'Called on 2/28 regarding XLK rebalance',
    },
    AI_summary: {
      title: 'Tech sector pullback for XLK',
      description:
        'XLK fell -2.8% intraday, primarily driven by negative earnings surprises from key semiconductor holdings. Client remains overweight in large-cap tech with concentrated exposure to a few names.',
      sources: ['CRM Note – June 10, 2025', 'Market Data – March 3, 2026'],
    },
    Suggested_response: {
      title: 'Rebalance concentrated tech exposure',
      description:
        'Acknowledge the short-term volatility, highlight long-term thesis, and propose trimming overweight XLK exposure into more diversified tech and quality factor ETFs to reduce idiosyncratic risk.',
      sources: ['Advisor Analysis – March 4, 2026'],
    },
    workflow: {
      planning_agent:
        'Identified client risk tolerance and concentration in XLK, recommending a step-wise rebalance over the next two weeks to smooth execution.',
      news_synthesizer_agent:
        'Aggregated today’s earnings headlines for Nvidia and other top XLK constituents, emphasizing guidance downgrades and sector-wide multiple compression.',
      financial_advisor_agent:
        'Compared client’s tech allocation vs. model portfolio, highlighting a 9% overweight and suggesting a 3–4% trim to align with policy bands.',
      risk_insight_agent:
        'Flagged elevated single-sector and factor risk, noting increased drawdown sensitivity to future semiconductor downgrades.',
      brief_agent:
        'Drafted a concise client-ready explanation connecting today’s move in XLK to earnings, risk posture, and a proactive rebalance plan.',
    },
  },
  '2': {
    client_details: {
      name: 'Acme Corp',
      net_worth: 12000000,
      portfolio_value: 7800000,
      growth: '3.1% QoQ',
      last_crm_note: 'Email sent 3/1 about energy volatility concerns',
    },
    AI_summary: {
      title: 'Energy exposure impacted by crude volatility',
      description:
        'Client’s energy allocation has underperformed the broader market over the last week due to sharp intraday swings in crude oil futures and weaker refinery margins.',      sources: ['CRM Note – March 1, 2026', 'Energy Sector Report'],    },
    Suggested_response: {
      title: 'Reframe volatility and stress diversification',
      description:
        'Explain how energy positions fit within the overall diversification strategy and consider adding a low-volatility or dividend-focused sleeve to smooth returns.',
      sources: ['Advisor Analysis – March 4, 2026'],
    },
    workflow: {
      planning_agent:
        'Aligned the recommendation with Acme’s medium-term income and capital preservation objectives, avoiding large tactical timing calls.',
      news_synthesizer_agent:
        'Summarized key OPEC+ headlines, inventory reports, and demand revisions driving recent energy price moves.',
      financial_advisor_agent:
        'Stress-tested the portfolio under additional 10–15% energy drawdowns, confirming overall plan resilience.',
      risk_insight_agent:
        'Highlighted correlation between energy holdings and broader commodity complex, recommending no further increases in the sleeve.',
      brief_agent:
        'Prepared a short note framing the underperformance as expected volatility within a long-term allocation, with clear next steps.',
    },
  },
  '3': {
    client_details: {
      name: 'Beta Investments',
      net_worth: 4800000,
      portfolio_value: 3600000,
      growth: '6.4% QoQ',
      last_crm_note: 'Meeting scheduled for 3/5 to discuss gains',
    },
    AI_summary: {
      title: 'Tech rebound offers opportunity to lock gains',
      description:
        'After a strong intraday rebound in large-cap tech, the client’s growth sleeve is now ahead of target returns for the quarter, opening a window to crystalize gains.',      sources: ['CRM Note – February 28, 2026', 'Portfolio Analysis'],    },
    Suggested_response: {
      title: 'Take partial profits and rotate into quality',
      description:
        'Recommend locking in a portion of recent gains in high-beta tech and rotating into a quality or dividend-growth basket to keep upside while reducing downside risk.',
      sources: ['Advisor Analysis – March 4, 2026'],
    },
    workflow: {
      planning_agent:
        'Validated that realizing partial gains still keeps the client on track with long-term growth objectives.',
      news_synthesizer_agent:
        'Compiled analyst upgrades and momentum signals supporting the recent rally in core holdings.',
      financial_advisor_agent:
        'Modeled scenarios comparing “hold” vs. “trim and rotate” over a 12–18 month horizon.',
      risk_insight_agent:
        'Flagged elevated portfolio beta relative to benchmark, reinforcing the case for modest de-risking.',
      brief_agent:
        'Created a brief summary you can send explaining why now is a good moment to take some risk off the table without abandoning the growth story.',
    },
  },
};
