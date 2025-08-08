-- migrate:up

-- Create the trade table with source and destination farmers
CREATE TABLE trade (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_farmer TEXT NOT NULL CONSTRAINT fk_trade_source_farmer_id REFERENCES farmer(id),
  destination_farmer TEXT NOT NULL CONSTRAINT fk_trade_destination_farmer_id REFERENCES farmer(id),
  date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled'))
);

CREATE TABLE transfer_new (
  trade_id INTEGER NOT NULL REFERENCES trade(id),
  commodity INTEGER NOT NULL,
  amount INTEGER NOT NULL CHECK (amount != 0)
);

-- Create a temporary table to map transfers to trades
CREATE TEMPORARY TABLE transfer_trade_mapping AS
WITH numbered_transfers AS (
  SELECT
    rowid,
    source_farmer,
    destination_farmer,
    date,
    ROW_NUMBER() OVER (ORDER BY rowid) as rn
  FROM transfer
)
SELECT
  rowid as transfer_rowid,
  source_farmer,
  destination_farmer,
  date,
  rn
FROM numbered_transfers;

-- Insert trades for each existing transfer
INSERT INTO trade (source_farmer, destination_farmer, date, status)
SELECT source_farmer, destination_farmer, date, 'accepted'
FROM transfer_trade_mapping
ORDER BY rn;

-- Insert transfers with positive amounts (source to destination)
INSERT INTO transfer_new (trade_id, commodity, amount)
SELECT
  t.id,
  tr.source_commodity,
  tr.source_amount
FROM trade t
JOIN transfer_trade_mapping ttm ON t.rowid = ttm.rn
JOIN transfer tr ON tr.rowid = ttm.transfer_rowid;

-- Clean up temporary table
DROP TABLE transfer_trade_mapping;

-- Remove the old trigger that runs on transfer insert
DROP TRIGGER update_balance_after_transfer;

-- Replace the old transfer table with the new one
DROP TABLE transfer;
ALTER TABLE transfer_new RENAME TO transfer;

-- Create new trigger that runs when trade status changes to accepted
CREATE TRIGGER update_balance_after_trade_accepted
AFTER UPDATE ON trade
WHEN NEW.status = 'accepted' AND OLD.status != 'accepted'
BEGIN
  -- Ensure balance records exist for both farmers and all commodities in the trade
  INSERT OR IGNORE INTO balance (farmer, commodity, amount)
  SELECT NEW.source_farmer, t.commodity, 0
  FROM transfer t
  WHERE t.trade_id = NEW.id;

  INSERT OR IGNORE INTO balance (farmer, commodity, amount)
  SELECT NEW.destination_farmer, t.commodity, 0
  FROM transfer t
  WHERE t.trade_id = NEW.id;

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

-- migrate:down

-- Drop the new trigger
DROP TRIGGER update_balance_after_trade_accepted;

-- Rename current transfer table to temporary name
ALTER TABLE transfer RENAME TO transfer_old;

-- Recreate the original transfer table structure
CREATE TABLE transfer (
  source_farmer TEXT NOT NULL CONSTRAINT fk_source_farmer_id REFERENCES farmer(id),
  source_commodity INTEGER NOT NULL,
  source_amount INTEGER NOT NULL CHECK (source_amount > 0),
  destination_farmer TEXT NOT NULL CONSTRAINT fk_destination_farmer_id REFERENCES farmer(id),
  destination_commodity INTEGER NOT NULL,
  destination_amount INTEGER NOT NULL CHECK (destination_amount > 0),
  date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Migrate data back from the new structure to the old structure
-- For each trade, create a transfer record
INSERT INTO transfer (source_farmer, source_commodity, source_amount, destination_farmer, destination_commodity, destination_amount, date)
SELECT
  t.source_farmer,
  tr.commodity,
  tr.amount,
  t.destination_farmer,
  tr.commodity,
  tr.amount,
  t.date
FROM trade t
JOIN transfer_old tr ON tr.trade_id = t.id
WHERE tr.amount > 0;

-- Drop the new tables
DROP TABLE transfer_old;
DROP TABLE trade;

-- Recreate the original trigger
CREATE TRIGGER update_balance_after_transfer
AFTER INSERT ON transfer
BEGIN
  INSERT INTO balance (farmer, commodity, amount) VALUES (NEW.source_farmer, NEW.source_commodity, 0) ON CONFLICT DO NOTHING;
  INSERT INTO balance (farmer, commodity, amount) VALUES (NEW.destination_farmer, NEW.destination_commodity, 0) ON CONFLICT DO NOTHING;
  UPDATE balance SET amount = balance.amount - NEW.source_amount WHERE farmer = NEW.source_farmer AND commodity = NEW.source_commodity;
  UPDATE balance SET amount = balance.amount + NEW.destination_amount WHERE farmer = NEW.destination_farmer AND commodity = NEW.destination_commodity;
END;
