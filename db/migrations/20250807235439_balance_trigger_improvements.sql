-- migrate:up

-- Drop the existing trigger to rename it
DROP TRIGGER IF EXISTS update_balance_after_trade_accepted;

-- Create the updated trigger for UPDATE operations (renamed for clarity)
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

-- Create rollback trigger for when trades change from accepted to another status
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

-- Enforce trades created with 'pending' status
CREATE TRIGGER enforce_pending_status_on_insert
BEFORE INSERT ON trade
WHEN NEW.status != 'pending'
BEGIN
  SELECT RAISE(ABORT, 'Trades can only be inserted with pending status. Use UPDATE to change status after insertion.');
END;


-- migrate:down

-- Drop the new triggers
DROP TRIGGER IF EXISTS update_balance_after_trade_accepted;
DROP TRIGGER IF EXISTS rollback_balance_after_trade_unaccepted;
DROP TRIGGER IF EXISTS enforce_pending_status_on_insert;

-- Recreate the original trigger
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
