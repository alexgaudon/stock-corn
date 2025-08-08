CREATE TABLE IF NOT EXISTS "schema_migrations" (version varchar(128) primary key);
CREATE TABLE farmer (
  id TEXT PRIMARY KEY,
  date_started TEXT NOT NULL, exiled BOOLEAN NOT NULL DEFAULT FALSE, username TEXT, avatar_url TEXT);
CREATE TABLE balance (
  farmer TEXT NOT NULL CONSTRAINT fk_farmer_id REFERENCES farmer(id),
  commodity INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  PRIMARY KEY (farmer, commodity)
);
CREATE TABLE trade (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_farmer TEXT NOT NULL CONSTRAINT fk_trade_source_farmer_id REFERENCES farmer(id),
  destination_farmer TEXT NOT NULL CONSTRAINT fk_trade_destination_farmer_id REFERENCES farmer(id),
  date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled'))
);
CREATE TABLE IF NOT EXISTS "transfer" (
  trade_id INTEGER NOT NULL REFERENCES trade(id),
  commodity INTEGER NOT NULL,
  amount INTEGER NOT NULL CHECK (amount != 0)
);
CREATE TRIGGER update_balance_after_trade_accepted
AFTER UPDATE ON trade
WHEN NEW.status = 'accepted' AND OLD.status != 'accepted'
BEGIN
  -- Update destination farmer balances (add amounts)
  UPDATE balance
  SET amount = balance.amount + transfer.amount
  FROM transfer
  WHERE transfer.trade_id = NEW.id
  AND balance.farmer = NEW.destination_farmer
  AND balance.commodity = transfer.commodity;

  -- Update source farmer balances (subtract amounts)
  UPDATE balance
  SET amount = balance.amount - transfer.amount
  FROM transfer
  WHERE transfer.trade_id = NEW.id
  AND balance.farmer = NEW.source_farmer
  AND balance.commodity = transfer.commodity;
END;
CREATE TRIGGER rollback_balance_after_trade_unaccepted
AFTER UPDATE ON trade
WHEN OLD.status = 'accepted' AND NEW.status != 'accepted'
BEGIN
  -- Rollback destination farmer balances (subtract amounts)
  UPDATE balance
  SET amount = balance.amount - transfer.amount
  FROM transfer
  WHERE transfer.trade_id = NEW.id
  AND balance.farmer = NEW.destination_farmer
  AND balance.commodity = transfer.commodity;

  -- Rollback source farmer balances (add amounts back)
  UPDATE balance
  SET amount = balance.amount + transfer.amount
  FROM transfer
  WHERE transfer.trade_id = NEW.id
  AND balance.farmer = NEW.source_farmer
  AND balance.commodity = transfer.commodity;
END;
CREATE TRIGGER enforce_pending_status_on_insert
BEFORE INSERT ON trade
WHEN NEW.status != 'pending'
BEGIN
  SELECT RAISE(ABORT, 'Trades can only be inserted with pending status. Use UPDATE to change status after insertion.');
END;
-- Dbmate schema migrations
INSERT INTO "schema_migrations" (version) VALUES
  ('20241126225753'),
  ('20241126231742'),
  ('20241127030707'),
  ('20250315131047'),
  ('20250801002304'),
  ('20250804213008'),
  ('20250807210404'),
  ('20250807211155'),
  ('20250807235439');
