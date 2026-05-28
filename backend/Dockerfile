FROM python:3.13-slim-trixie AS builder

ENV POETRY_VERSION=1.8.2 \
    POETRY_VIRTUALENVS_CREATE=false \
    PATH="/root/.local/bin:$PATH"

# System Dependcies [test]
RUN apt-get update \
    && apt-get install --no-install-recommends -y curl \
    # Installing `poetry` package manager:
    # https://github.com/python-poetry/poetry
    && curl https://install.python-poetry.org | python \
    && poetry --version \
    # Cleaning cache
    && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY poetry.lock pyproject.toml ./
RUN poetry install --no-interaction --no-ansi --no-root  \
    && rm -rf ~/.cache/pypoetry/*

COPY . .
# test
# ----------- Final Stage -----------
FROM python:3.13-slim-trixie AS production
#testing1
WORKDIR /app

COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY --from=builder /app /app


EXPOSE 8000

RUN chmod +x ./startup.sh
CMD ["./startup.sh"]
