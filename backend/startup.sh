#!/bin/bash

# # Run database setup (extensions, schema, seed data, vector stores, AGE graph)
# python -m src.db_setup.setup

# Run database setup (extensions, schema, seed data, vector stores, AGE graph)

python -m src.db_setup.setup

# Default to development if not set
ENV=${ENVIRONMENT:-dev}

if [ "$ENV" = "prod" ]; then
  echo "Starting in production mode..."
  uvicorn src.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --access-log \
    --log-config logging_config.yaml \
    --workers 8
else
  echo "Starting in development mode..."
  uvicorn src.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload \
    --access-log \
    --log-config logging_config.yaml
fi
