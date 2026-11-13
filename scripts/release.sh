#!/usr/bin/env sh
set -eu

attempt=1
max_attempts=5

while [ "$attempt" -le "$max_attempts" ]; do
  echo "Running Prisma migrations (attempt $attempt/$max_attempts)..."

  if npx prisma migrate deploy; then
    exit 0
  fi

  if [ "$attempt" -eq "$max_attempts" ]; then
    echo "Prisma migrate deploy failed after $max_attempts attempts."
    exit 1
  fi

  attempt=$((attempt + 1))
  echo "Retrying in 5 seconds..."
  sleep 5
done
