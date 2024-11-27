if [ -z "$DATABASE_PATH" ]; then
  echo "DATABASE_PATH is not set"
  exit 1
fi

cp "$DATABASE_PATH" "$DATABASE_PATH".bak"$(date +%s)"

export DATABASE_URL="sqlite:$DATABASE_PATH"
bun x dbmate up
bun run src/index.ts
