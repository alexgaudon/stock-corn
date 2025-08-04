CREATE TABLE IF NOT EXISTS "schema_migrations" (version varchar(128) primary key);
CREATE TABLE farmer (
  id TEXT PRIMARY KEY,
  date_started TEXT NOT NULL, exiled BOOLEAN NOT NULL DEFAULT FALSE, username TEXT, avatar_url TEXT);
CREATE TABLE trade (
  source_farmer TEXT NOT NULL CONSTRAINT fk_source_farmer_id REFERENCES farmer(id),
  source_commodity INTEGER NOT NULL,
  source_amount INTEGER NOT NULL CHECK (source_amount > 0),
  destination_farmer TEXT NOT NULL CONSTRAINT fk_destination_farmer_id REFERENCES farmer(id),
  destination_commodity INTEGER NOT NULL,
  destination_amount INTEGER NOT NULL CHECK (destination_amount > 0),
  date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE balance (
  farmer TEXT NOT NULL CONSTRAINT fk_farmer_id REFERENCES farmer(id),
  commodity INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  PRIMARY KEY (farmer, commodity)
);
CREATE TRIGGER update_balance_after_trade
AFTER INSERT ON trade
BEGIN
  INSERT INTO balance (farmer, commodity, amount) VALUES (NEW.source_farmer, NEW.source_commodity, 0) ON CONFLICT DO NOTHING;
  INSERT INTO balance (farmer, commodity, amount) VALUES (NEW.destination_farmer, NEW.destination_commodity, 0) ON CONFLICT DO NOTHING;
  UPDATE balance SET amount = amount - NEW.source_amount WHERE farmer = NEW.source_farmer AND commodity = NEW.source_commodity;
  UPDATE balance SET amount = amount + NEW.destination_amount WHERE farmer = NEW.destination_farmer AND commodity = NEW.destination_commodity;
END;
-- Dbmate schema migrations
INSERT INTO "schema_migrations" (version) VALUES
  ('20241126225753'),
  ('20241126231742'),
  ('20241127030707'),
  ('20250315131047'),
  ('20250801002304'),
  ('20250804213008');
