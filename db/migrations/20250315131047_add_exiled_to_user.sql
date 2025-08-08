-- migrate:up
ALTER TABLE farmer ADD COLUMN exiled BOOLEAN NOT NULL DEFAULT FALSE;
INSERT INTO balance (farmer, commodity, amount) VALUES ('JAIL', 1, 0);
-- migrate:down
DELETE FROM balance WHERE farmer = 'JAIL' AND commodity = 1;
ALTER TABLE farmer DROP COLUMN exiled;
