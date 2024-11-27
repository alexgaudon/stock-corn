cp "$DATABASE_PATH" "$DATABASE_PATH".bak"$(date +%s)"

export DATABASE_URL="sqlite:$DATABASE_PATH"
bun x dbmate up
bun run src/index.ts
