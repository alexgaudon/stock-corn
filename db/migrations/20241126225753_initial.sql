-- migrate:up
CREATE TABLE IF NOT EXISTS transfer (
  source TEXT NOT NULL CONSTRAINT fk_source_user_id REFERENCES user(id),
  destination TEXT NOT NULL CONSTRAINT fk_destination_user_id REFERENCES user(id),
  amount INTEGER NOT NULL,
  date TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  balance INTEGER NOT NULL);

-- migrate:down
DROP TABLE transfer;
DROP TABLE user;
