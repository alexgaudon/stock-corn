-- migrate:up
ALTER TABLE farmer ADD COLUMN avatar_url TEXT;

-- migrate:down
ALTER TABLE farmer DROP COLUMN avatar_url;
