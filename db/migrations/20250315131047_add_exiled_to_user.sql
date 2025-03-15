-- migrate:up
ALTER TABLE farmer ADD COLUMN exiled BOOLEAN NOT NULL DEFAULT FALSE;
INSERT INTO balance (farmer, commodity, amount) VALUES ('JAIL', 1, 0);
-- migrate:down
