set -e

if [ -z "$DATABASE_PATH" ]; then
  echo "DATABASE_PATH is not set"
  exit 1
fi

# If database doesn't exist, create it
if [ -f "$DATABASE_PATH" ]; then
  cp "$DATABASE_PATH" "$DATABASE_PATH".bak"$(date +%s)"
fi

export DATABASE_URL="sqlite:$DATABASE_PATH"
bun x dbmate up
bun run src/index.ts
