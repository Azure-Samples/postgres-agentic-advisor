news_articles_rag_questions = [
    "What are the recent revenue, profit, or earnings results reported for this company?",
    "Has the company missed or beaten analyst expectations recently?",
    "Are there any reports of financial losses, writedowns, or cost-cutting measures?",
    "What major business decisions, acquisitions, or partnerships has the company announced?",
    "Has the company launched any new products, services, or entered new markets?",
    "Are there any reports of the company losing market share or facing competitive pressure?",
    "What is the overall market and investor sentiment around this company?",
    "Are there any controversies, scandals, or PR issues surrounding the company?",
    "What are analysts and experts saying about this company's future prospects?",
    "Are there any regulatory, legal, or government-related developments affecting this company?",
    "How is the macroeconomic environment (interest rates, inflation, recession) impacting this company?",
    "Are there any supply chain, operational, or geopolitical issues affecting the company?",
]

# sec_file_rag_questions = [
#     "What were the company's revenue, net income, and earnings per share for the reported period?",
#     "What is the company's current debt level and debt-to-equity ratio?",
#     "What is the company's cash flow from operations — is it positive or negative?",
#     "Has the company's gross margin and operating margin improved or deteriorated?",
#     "What are the top risks the company has disclosed that could impact its business?",
#     "Are there any legal proceedings, lawsuits, or regulatory investigations disclosed?",
#     "Has the company disclosed any going concern warnings or liquidity risks?",
#     "What is management's guidance for future revenue and earnings?",
#     "What strategic priorities and investments is management focused on?",
#     "Has management tone shifted — are they more cautious or optimistic compared to prior filings?",
#     "Are there any significant changes in the company's business model or operations disclosed?",
#     "Has the company disclosed any major customer concentration risks?",
#     "Are there any disclosed issues with key personnel, leadership changes, or governance concerns?",
# ]

sec_file_rag_questions = [
    "What were the company's revenue, net income, earnings per share, gross margin, and cash flow from operations?",
    "What are the top risks, legal proceedings, going concern warnings, and liquidity risks the company has disclosed?",
    "What is management's guidance for future revenue and earnings, and what strategic priorities are they focused on?",
]

# Used by the AskAI chat path when no news snippet is available.
# These are injected with the company ticker at runtime to perform
# query-decomposed RAG across the news vector store.
news_analysis_rag_questions = [
    "What are the recent earnings, revenue, and financial results reported for {ticker}?",
    "What is the current analyst sentiment, price targets, and investment outlook for {ticker}?",
    "Are there any supply chain disruptions, operational issues, or geopolitical risks affecting {ticker}?",
    "What new products, partnerships, acquisitions, or market expansions has {ticker} announced recently?",
    "Are there any regulatory, legal, or competitive pressures currently facing {ticker}?",
]
