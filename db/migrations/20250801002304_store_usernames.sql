-- migrate:up
ALTER TABLE farmer ADD COLUMN username TEXT;

-- migrate:down
ALTER TABLE farmer DROP COLUMN username;
