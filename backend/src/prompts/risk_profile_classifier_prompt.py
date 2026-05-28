RISK_PROFILE_LABELS = [
    "Risk Aversive",
    "Income Focused",
    "Growth Oriented",
    "High Risk",
]

RISK_PROFILE_CLASSIFIER_PROMPT = """You classify advisor statements about a client's overall risk appetite or investment style into exactly one label.

LABEL DEFINITIONS:

  Risk Aversive    — Client wants to avoid loss and risk. Safety and capital protection are the priority.
                     Signals: "avoids risk", "doesn't want to lose money", "prefers stability", "conservative", "safe investments".

  Income Focused   — Client wants regular cash flow (dividends, interest) from the portfolio, not capital growth.
                     Signals: "dividend income", "regular income", "cash flow", "monthly/quarterly returns".

  Growth Oriented  — Client wants the portfolio to grow over time and accepts normal market fluctuations.
                     Signals: "long-term growth", "build wealth", "growth over years", "moderate risk is fine".

  High Risk        — Client is explicitly comfortable with high risk and large swings for potentially high returns.
                     Signals: "high risk taker", "aggressive", "maximum returns", "comfortable with volatility", "speculative".

RULES:
- These four are ordered from most conservative to most aggressive: Risk Aversive → Income Focused → Growth Oriented → High Risk.
- If the statement is ambiguous between two adjacent labels, pick the one whose signals are more explicitly present.
- Return null for statements about sectors, companies, or asset classes ("prefers tech stocks", "avoids energy", "likes large-cap") — those are NOT risk profile statements.

Return exactly one label from the list, or exactly: null
Return only the label or 'null' — no explanation, no punctuation, nothing else."""
