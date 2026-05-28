# Stock Data Fetcher (Yahoo Finance)

## 📘 Overview
This utility downloads **historical stock OHLCV data** (Open, High, Low, Close, Volume, and Adjusted Close)
for a list of companies defined in a `companies.csv` file.

It uses the [Yahoo Finance](https://finance.yahoo.com) API via the [`yfinance`](https://pypi.org/project/yfinance/) Python package.
Each ticker’s data is saved as a separate CSV file under the `stock_data/` directory.

This script is part of the **Financial Advisor Solution Accelerator**, where synthetic portfolios are built
from real-world tickers for backtesting, agent workflows, or visualization.

---

## 📂 Expected Input: `companies.csv`

The script expects a CSV file named `companies.csv` (or another file path specified with `--companies-file`).
At minimum, it must contain a **`Ticker`** column.

Example (`companies.csv`):

```csv
Company,Ticker,Sector,IndustryGroup
JPMorgan Chase & Co.,JPM,Financials,Banks
Apple Inc.,AAPL,Information Technology,Technology Hardware & Equipment
Meta Platforms Inc.,META,Communication Services,Media & Entertainment
Exxon Mobil Corp.,XOM,Energy,Oil, Gas & Consumable Fuels
```

Only the **`Ticker`** column is required — other columns are ignored.

---

## 🏃 How to Run

The script is called `fetch_stock_data.py`.

### Basic example
```bash
python fetch_stock_data.py --count 10 --start 2024-01-01 --end 2024-12-31
```

This fetches historical **daily** prices for the **first 10 tickers** in `companies.csv`
from **Jan 1 2024 → Dec 31 2024**, saving each as:

```
stock_data/<TICKER>_<START>_<END>.csv
```

Example output:
```
stock_data/AAPL_2024-01-01_2024-12-31.csv
stock_data/JPM_2024-01-01_2024-12-31.csv
```

---

## 🧩 Command-Line Arguments

| Argument | Default | Description |
|-----------|----------|-------------|
| `--companies-file` | `companies.csv` | Path to the input CSV containing a `Ticker` column |
| `--count` | `10` | Number of companies to process (`0` or negative = all) |
| `--start` | 1 year ago | Start date (`YYYY-MM-DD`) |
| `--end` | today | End date (`YYYY-MM-DD`) |
| `--interval` | `1d` | Data interval (`1d`, `1wk`, `1mo`) |
| `--retry` | `2` | Retry attempts per ticker on transient errors |
| `--delay` | `1.0` | Delay (seconds) between tickers to avoid Yahoo throttling |

---

## 📤 Output Format

Each ticker file (e.g., `JPM_2024-01-01_2024-12-31.csv`) has the following columns:

| Date | Open | High | Low | Close | AdjClose | Volume |
|------|------|------|------|--------|-----------|---------|

- **Date** – Trading date
- **Open, High, Low, Close** – Raw prices
- **AdjClose** – Adjusted for splits and dividends
- **Volume** – Number of shares traded

All dates are sorted ascending (oldest → newest).

---

## 🧠 Example: Fetch entire S&P 100 list

```bash
python fetch_stock_data.py --count 0 --interval 1d --delay 1.5
```

This will iterate all tickers from `companies.csv`, fetch daily data, and respect a 1.5 second pause between calls to prevent rate limiting.

---

## ⚠️ Notes on Yahoo Rate Limits
Yahoo Finance is **not an official API** and may throttle requests if too frequent.
Use the `--delay` flag (1–2 seconds between calls) and avoid concurrent runs.

---

## 📁 Directory Structure
```
.
├── companies.csv
├── fetch_stock_data.py
├── stock_data/
│   ├── AAPL_2024-01-01_2024-12-31.csv
│   ├── JPM_2024-01-01_2024-12-31.csv
│   └── ...
└── README.md
```

---

## ✅ Validation
Each CSV should:
- Have a single header row.
- Contain `Date, Open, High, Low, Close, AdjClose, Volume`.
- Cover the requested date range with no nulls.

You can verify correctness by cross-checking a few sample rows at:
- [Yahoo Finance – JPM](https://finance.yahoo.com/quote/JPM/history)
- [Nasdaq – JPM](https://www.nasdaq.com/market-activity/stocks/jpm/historical)
