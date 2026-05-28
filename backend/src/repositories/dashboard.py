from __future__ import annotations

from datetime import date, datetime, timedelta

from sqlalchemy import and_, cast, desc, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.types import Date as SADate
from src.models.account_holdings import AccountHolding
from src.models.clients import Client
from src.models.securities import Security
from src.models.security_prices import SecurityPrice


class DashboardRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_client_portfolio_overview(
        self,
        client_id: int,
        current_date: date = None,
    ) -> tuple[Client, list[tuple[AccountHolding, Security, float]]] | None:
        """Get client portfolio overview with current market values."""

        client_query = select(Client).filter(Client.id == client_id)
        client_result = await self.db.execute(client_query)
        client = client_result.scalar_one_or_none()

        if not client:
            return None

        # Load only holdings that were open on current_date
        holdings_query = (
            select(AccountHolding)
            .options(selectinload(AccountHolding.security))
            .filter(AccountHolding.client_id == client_id)
        )
        if current_date is not None:
            holdings_query = holdings_query.filter(
                and_(
                    cast(AccountHolding.as_of, SADate) <= current_date,
                    or_(
                        AccountHolding.closed_at.is_(None),
                        cast(AccountHolding.closed_at, SADate) > current_date,
                    ),
                ),
            )
        holdings_result = await self.db.execute(holdings_query)
        holdings = list(holdings_result.scalars().all())

        holdings_with_prices = []
        for holding in holdings:
            # Get the most recent price for this security on or before the current date
            price_query = (
                select(SecurityPrice)
                .filter(SecurityPrice.security_id == holding.security_id)
                .filter(SecurityPrice.price_date <= current_date)
                .order_by(desc(SecurityPrice.price_date))
                .limit(1)
            )
            price_result = await self.db.execute(price_query)
            latest_price = price_result.scalar_one_or_none()

            current_price = latest_price.close if latest_price else 0.0
            holdings_with_prices.append((holding, holding.security, current_price))

        return client, holdings_with_prices

    async def get_client_portfolio_holdings(
        self,
        client_id: int,
        simulated_date: date = None,
    ) -> tuple[Client, list[tuple[AccountHolding, Security, float]], datetime] | None:
        """Get detailed portfolio holdings for a specific client."""
        result = await self.get_client_portfolio_overview(client_id, simulated_date)
        if not result:
            return None

        client, holdings_with_prices = result
        # Use simulated date as last_updated timestamp
        last_updated = datetime.combine(
            simulated_date or date.today(),
            datetime.min.time(),
        )

        return client, holdings_with_prices, last_updated

    async def get_recent_alerts(
        self,
        limit: int = 10,
        current_date: date = None,
    ) -> list[dict]:
        """Get recent alerts. Since there's no alerts table, we'll generate mock alerts."""
        # Mock alerts - in a real application, you'd have an alerts table
        mock_alerts = []

        # Get some client names for realistic alerts
        clients_query = select(Client).limit(5)
        clients_result = await self.db.execute(clients_query)
        clients = list(clients_result.scalars().all())

        if not clients:
            return []

        for i in range(min(limit, 5)):  # Generate up to 5 mock alerts
            client = clients[i % len(clients)]
            alert_types = [
                "Price Drop",
                "Performance Alert",
                "Risk Alert",
                "Market Alert",
            ]
            severities = ["Low", "Medium", "High", "Critical"]

            # Create alerts that appear to be from recent days before the simulated date
            alert_datetime = datetime.combine(
                current_date,
                datetime.min.time(),
            ) - timedelta(hours=i)

            mock_alerts.append(
                {
                    "client_id": client.id,
                    "client_name": client.full_name,
                    "alert_type": alert_types[i % len(alert_types)],
                    "message": f"Portfolio alert for {client.full_name}: {alert_types[i % len(alert_types)].lower()} detected",
                    "severity": severities[i % len(severities)],
                    "created_at": alert_datetime,
                    "is_read": False if i < 3 else True,
                },
            )

        return mock_alerts

    async def get_top_performing_clients(
        self,
        limit: int = 10,
        current_date: date = None,
    ) -> list[tuple[Client, float, float, float]]:
        """Get top performing clients based on current date's portfolio changes."""
        current_date = current_date or date.today()
        previous_date = current_date - timedelta(days=1)

        # Complex query to calculate portfolio performance
        # This would ideally be done with a proper view or materialized view
        clients_query = select(Client).limit(limit)
        clients_result = await self.db.execute(clients_query)
        clients = list(clients_result.scalars().all())

        client_performances = []
        for client in clients:
            # Calculate portfolio value and performance
            portfolio_value, change_percent, change_amount = (
                await self._calculate_client_performance(
                    client.id,
                    current_date,
                    previous_date,
                )
            )

            if portfolio_value > 0:
                client_performances.append(
                    (client, portfolio_value, change_percent, change_amount),
                )

        # Sort by performance descending
        client_performances.sort(key=lambda x: x[2], reverse=True)
        return client_performances[:limit]

    async def get_top_regressing_clients(
        self,
        limit: int = 10,
        current_date: date = None,
    ) -> list[tuple[Client, float, float, float]]:
        """Get top regressing clients based on current date's portfolio changes."""
        current_date = current_date or date.today()
        previous_date = current_date - timedelta(days=1)

        # Get all clients with performance data
        clients_query = select(Client).limit(limit * 2)  # Get more to filter properly
        clients_result = await self.db.execute(clients_query)
        clients = list(clients_result.scalars().all())

        client_performances = []
        for client in clients:
            # Calculate portfolio value and performance
            portfolio_value, change_percent, change_amount = (
                await self._calculate_client_performance(
                    client.id,
                    current_date,
                    previous_date,
                )
            )

            if portfolio_value > 0:  # Only include clients with portfolios
                client_performances.append(
                    (client, portfolio_value, change_percent, change_amount),
                )

        # Sort by performance ascending (worst performers first)
        client_performances.sort(key=lambda x: x[2])
        return client_performances[:limit]

    async def get_all_clients_portfolio_performance(
        self,
        current_date: date = None,
    ) -> list[dict]:
        """
        Get all clients with current portfolio value and total return
        since original investment (cost basis comparison).
        """
        current_date = current_date or date.today()

        clients_query = select(Client)
        clients_result = await self.db.execute(clients_query)
        clients = list(clients_result.scalars().all())

        result = []
        for client in clients:
            holdings_query = (
                select(AccountHolding)
                .options(selectinload(AccountHolding.security))
                .filter(AccountHolding.client_id == client.id)
                .filter(
                    and_(
                        cast(AccountHolding.as_of, SADate) <= current_date,
                        or_(
                            AccountHolding.closed_at.is_(None),
                            cast(AccountHolding.closed_at, SADate) > current_date,
                        ),
                    ),
                )
            )
            holdings_result = await self.db.execute(holdings_query)
            holdings = list(holdings_result.scalars().all())

            if not holdings:
                continue

            total_cost_basis = 0.0
            total_current_value = 0.0

            for holding in holdings:
                price_query = (
                    select(SecurityPrice)
                    .filter(SecurityPrice.security_id == holding.security_id)
                    .filter(SecurityPrice.price_date <= current_date)
                    .order_by(desc(SecurityPrice.price_date))
                    .limit(1)
                )
                price_result = await self.db.execute(price_query)
                latest_price = price_result.scalar_one_or_none()

                current_price = float(latest_price.close) if latest_price else 0.0
                total_current_value += float(holding.quantity) * current_price
                total_cost_basis += float(holding.cost_basis_total_usd)

            if total_current_value == 0:
                continue

            total_gain_loss = total_current_value - total_cost_basis
            total_return_percentage = (
                (total_gain_loss / total_cost_basis * 100)
                if total_cost_basis > 0
                else 0.0
            )

            result.append(
                {
                    "client": client,
                    "current_portfolio_value": round(total_current_value / 1000, 1),
                    "trend": "up" if total_return_percentage >= 0 else "down",
                    "total_return_percentage": round(total_return_percentage, 1),
                    "holdings": [holding.security.ticker for holding in holdings],
                },
            )

        return result

    async def get_clients_list_data(
        self,
        advisor_id: int,
        current_date: date = None,
    ) -> list[dict]:
        """
        Fetch all clients for clients list page.
        """
        current_date = current_date or date.today()

        # Fetch all clients
        clients_query = (
            select(Client)
            .filter(Client.primary_advisor_id == advisor_id)
            .order_by(Client.full_name)
        )
        clients_result = await self.db.execute(clients_query)
        clients = list(clients_result.scalars().all())

        if not clients:
            return []

        result = []
        for client in clients:
            # Fetch open holdings for this client on current_date
            holdings_query = (
                select(AccountHolding, Security)
                .join(Security, AccountHolding.security_id == Security.id)
                .filter(AccountHolding.client_id == client.id)
                .filter(
                    and_(
                        cast(AccountHolding.as_of, SADate) <= current_date,
                        or_(
                            AccountHolding.closed_at.is_(None),
                            cast(AccountHolding.closed_at, SADate) > current_date,
                        ),
                    ),
                )
            )
            holdings_result = await self.db.execute(holdings_query)
            holdings_rows = holdings_result.all()

            if not holdings_rows:
                result.append(
                    {
                        "id": client.id,
                        "full_name": client.full_name,
                        "net_worth": None,
                        "growth_percent": None,
                        "growth_series": None,
                        "top_sector": None,
                        "holdings": [],
                        "risk_profile": (client.profile or {}).get("risk_preference"),
                    },
                )
                continue

            total_current_value = 0.0
            total_cost_basis = 0.0
            sector_values: dict[str, float] = {}
            tickers: list[str] = []

            for holding, security in holdings_rows:
                # Get the most recent closing price on or before current_date
                price_query = (
                    select(SecurityPrice.close)
                    .filter(SecurityPrice.security_id == holding.security_id)
                    .filter(SecurityPrice.price_date <= current_date)
                    .order_by(desc(SecurityPrice.price_date))
                    .limit(1)
                )
                price_result = await self.db.execute(price_query)
                latest_close = price_result.scalar_one_or_none()

                current_price = float(latest_close) if latest_close else 0.0
                holding_value = float(holding.quantity) * current_price

                total_current_value += holding_value
                total_cost_basis += float(holding.cost_basis_total_usd)
                tickers.append(security.ticker)

                # Accumulate value per sector to find the top sector
                sector = security.sector or "Unknown"
                sector_values[sector] = sector_values.get(sector, 0.0) + holding_value

            # Growth percent: total return since cost basis
            growth_percent = (
                round(
                    ((total_current_value - total_cost_basis) / total_cost_basis) * 100,
                    1,
                )
                if total_cost_basis > 0
                else None
            )

            # Top sector: whichever sector has the highest total current value
            top_sector = (
                max(sector_values, key=sector_values.get) if sector_values else None
            )

            result.append(
                {
                    "id": client.id,
                    "full_name": client.full_name,
                    "net_worth": (
                        round(total_current_value, 1)
                        if total_current_value > 0
                        else None
                    ),
                    "growth_percent": growth_percent,
                    "growth_series": (
                        (
                            "up"
                            if growth_percent is not None and growth_percent >= 0
                            else "down"
                        )
                        if growth_percent is not None
                        else None
                    ),
                    "top_sector": top_sector,
                    "holdings": tickers,
                    "risk_profile": (client.profile or {}).get("risk_preference"),
                },
            )

        return result

    async def _calculate_client_performance(
        self,
        client_id: int,
        today: date,
        yesterday: date,
    ) -> tuple[float, float, float]:
        """Calculate client's portfolio performance between two dates."""
        holdings_query = (
            select(AccountHolding)
            .options(selectinload(AccountHolding.security))
            .filter(AccountHolding.client_id == client_id)
            .filter(
                and_(
                    cast(AccountHolding.as_of, SADate) <= today,
                    or_(
                        AccountHolding.closed_at.is_(None),
                        cast(AccountHolding.closed_at, SADate) > today,
                    ),
                ),
            )
        )
        holdings_result = await self.db.execute(holdings_query)
        holdings = list(holdings_result.scalars().all())

        current_value = 0.0
        previous_value = 0.0

        for holding in holdings:
            current_price_query = (
                select(SecurityPrice.close)
                .filter(SecurityPrice.security_id == holding.security_id)
                .filter(SecurityPrice.price_date <= today)
                .order_by(desc(SecurityPrice.price_date))
                .limit(1)
            )
            current_price_result = await self.db.execute(current_price_query)
            current_price = current_price_result.scalar_one_or_none() or 0.0

            previous_price_query = (
                select(SecurityPrice.close)
                .filter(SecurityPrice.security_id == holding.security_id)
                .filter(SecurityPrice.price_date <= yesterday)
                .order_by(desc(SecurityPrice.price_date))
                .limit(1)
            )
            previous_price_result = await self.db.execute(previous_price_query)
            previous_price = previous_price_result.scalar_one_or_none() or 0.0

            current_value += float(holding.quantity * current_price)
            previous_value += float(holding.quantity * previous_price)

        change_amount = current_value - previous_value
        change_percent = (
            (change_amount / previous_value * 100) if previous_value > 0 else 0.0
        )

        return current_value, change_percent, change_amount

    async def get_sector_trends(
        self,
        days: int = 5,
        simulated_date: date = None,
    ) -> list[dict]:
        """
        Get percentage change from the first day in the window for each
        security over the last N available trading days.

        The first day always returns 0.0 (baseline). Every subsequent day
        shows how much the price has moved relative to that starting point.

        Formula: ((current_close - start_price) / start_price) * 100

        Args:
            days: Number of most recent trading days to return data for.
            simulated_date: If provided, treat this as today

        Returns:
            List of dicts, one per date, each containing the date and
            percentage change from start per ticker for that day.
        """
        reference_date = simulated_date or date.today()

        # Step 1: Fetch all securities
        securities_query = (
            select(Security)
            .filter(Security.has_data.is_(True))
            .order_by(Security.ticker)
        )
        securities_result = await self.db.execute(securities_query)
        securities = list(securities_result.scalars().all())

        if not securities:
            return []

        # Step 2: For each security, get the last N price records on or
        # before reference_date. the first record
        # in the window becomes the start price (baseline = 0).
        security_prices: dict[int, list[SecurityPrice]] = {}
        for security in securities:
            price_query = (
                select(SecurityPrice)
                .filter(SecurityPrice.security_id == security.id)
                .filter(SecurityPrice.price_date <= reference_date)
                .order_by(desc(SecurityPrice.price_date))
                .limit(days)
            )
            price_result = await self.db.execute(price_query)
            prices = list(price_result.scalars().all())
            # Reverse so oldest is first (left to right on chart)
            prices.reverse()
            security_prices[security.id] = prices

        # Step 3: Find the last N common dates where we have price data
        all_dates: set[date] = set()
        for prices in security_prices.values():
            for price in prices:
                all_dates.add(price.price_date)

        sorted_dates = sorted(all_dates)
        target_dates = (
            sorted_dates[-days:] if len(sorted_dates) >= days else sorted_dates
        )

        if not target_dates:
            return []

        # Step 4: For each security, record the start price (first day's close)
        # This is used as the baseline for all percentage calculations
        start_prices: dict[int, float] = {}
        for security in securities:
            prices = security_prices[security.id]
            if prices:
                start_prices[security.id] = float(prices[0].close)

        # Step 5: For each target date, calculate % change from start price
        result = []
        for target_date in target_dates:
            row: dict = {"date": target_date.isoformat()}

            for security in securities:
                prices_for_security = security_prices[security.id]
                dates_for_security = [p.price_date for p in prices_for_security]

                if target_date not in dates_for_security:
                    row[security.ticker] = None
                    continue

                idx = dates_for_security.index(target_date)
                current_close = float(prices_for_security[idx].close)
                start_price = start_prices.get(security.id)

                if start_price is None or start_price == 0:
                    row[security.ticker] = None
                    continue

                # Formula: ((current_close - start_price) / start_price) * 100
                pct_change = round(
                    ((current_close - start_price) / start_price) * 100,
                    2,
                )
                row[security.ticker] = pct_change

            result.append(row)

        return result

    async def get_robust_scaling_params(self) -> tuple[float, float]:
        """
        Calculate median and IQR from ALL available historical price data
        across all securities. Used for robust scaling normalization.

        Returns:
            A tuple of (median, iqr) calculated from all historical
            daily percentage changes in the database.
        """
        # Fetch all securities
        securities_query = (
            select(Security)
            .filter(Security.has_data.is_(True))
            .order_by(Security.ticker)
        )
        securities_result = await self.db.execute(securities_query)
        securities = list(securities_result.scalars().all())

        if not securities:
            return 0.0, 1.0  # safe defaults — no normalization effect

        # Fetch all historical prices for all securities
        all_pct_changes = []

        for security in securities:
            price_query = (
                select(SecurityPrice)
                .filter(SecurityPrice.security_id == security.id)
                .order_by(SecurityPrice.price_date.asc())
            )
            price_result = await self.db.execute(price_query)
            prices = list(price_result.scalars().all())

            # Calculate percentage change for each consecutive pair
            for i in range(1, len(prices)):
                prev_close = float(prices[i - 1].close)
                curr_close = float(prices[i].close)

                if prev_close == 0:
                    continue

                pct_change = ((curr_close - prev_close) / prev_close) * 100
                all_pct_changes.append(pct_change)

        if not all_pct_changes:
            return 0.0, 1.0  # safe defaults

        # Calculate median
        sorted_values = sorted(all_pct_changes)
        n = len(sorted_values)
        if n % 2 == 0:
            median = (sorted_values[n // 2 - 1] + sorted_values[n // 2]) / 2
        else:
            median = sorted_values[n // 2]

        # Calculate IQR (25th and 75th percentile)
        q1_idx = n // 4
        q3_idx = (3 * n) // 4
        q1 = sorted_values[q1_idx]
        q3 = sorted_values[q3_idx]
        iqr = q3 - q1

        # Prevent division by zero
        if iqr == 0:
            return median, 1.0

        return median, iqr

    async def get_securities_info(self) -> dict[str, dict]:
        """
        Fetch name and description for all securities.
        """
        securities_query = (
            select(Security)
            .filter(Security.has_data.is_(True))
            .order_by(Security.ticker)
        )
        securities_result = await self.db.execute(securities_query)
        securities = list(securities_result.scalars().all())

        return {
            security.ticker: {
                "name": security.name,
                "description": security.description or "No description available.",
            }
            for security in securities
        }

    async def get_upcoming_earnings(
        self,
        reference_date: date,
    ) -> list[dict]:
        """
        Fetch upcoming earnings data for all securities.
        """
        # Step 1 — Fetch all securities that have an earnings date
        securities_query = (
            select(Security)
            .filter(Security.has_data.is_(True))
            .filter(Security.earnings_date.isnot(None))
            .order_by(Security.earnings_date.asc())
        )
        securities_result = await self.db.execute(securities_query)
        securities = list(securities_result.scalars().all())

        if not securities:
            return []

        result = []
        for security in securities:

            # Step 2 — Compare month and day
            earnings_this_year = date(
                reference_date.year,
                security.earnings_date.month,
                security.earnings_date.day,
            )

            # Calculate how many days ago
            days_diff = (reference_date - earnings_this_year).days

            # Only return days_from_reference if earnings was 1-10 days ago
            if 1 <= days_diff <= 10:
                days_from_reference = days_diff
            else:
                days_from_reference = None

            # Step 3 — Determine trend: fetch the 2 most recent closing
            # prices on or before the reference date and compare them.
            recent_prices_query = (
                select(SecurityPrice.close)
                .filter(SecurityPrice.security_id == security.id)
                .filter(SecurityPrice.price_date <= reference_date)
                .order_by(SecurityPrice.price_date.desc())
                .limit(2)
            )
            recent_result = await self.db.execute(recent_prices_query)
            recent_prices = recent_result.scalars().all()

            if len(recent_prices) == 2:
                # recent_prices[0] = latest day, recent_prices[1] = day before
                trend = (
                    "up"
                    if float(recent_prices[0]) >= float(recent_prices[1])
                    else "down"
                )
            else:
                trend = None

            result.append(
                {
                    "company_name": security.name,
                    "days_from_reference": days_from_reference,
                    "trend": trend,
                    "earnings_date": security.earnings_date.isoformat(),
                },
            )

        return result
