set -e

# Load environment variables from .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$DATABASE_PATH" ]; then
  echo "DATABASE_PATH is not set"
  exit 1
fi

# If database doesn't exist, create it
if [ -f "$DATABASE_PATH" ]; then
  cp "$DATABASE_PATH" "$DATABASE_PATH".bak"$(date +%s)"
fi

export DATABASE_URL="sqlite:$DATABASE_PATH"
npm exec dbmate -- up
