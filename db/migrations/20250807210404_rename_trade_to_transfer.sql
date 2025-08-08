-- migrate:up
ALTER TABLE trade RENAME TO transfer;

DROP TRIGGER update_balance_after_trade;

CREATE TRIGGER update_balance_after_transfer
AFTER INSERT ON transfer
BEGIN
  INSERT INTO balance (farmer, commodity, amount) VALUES (NEW.source_farmer, NEW.source_commodity, 0) ON CONFLICT DO NOTHING;
  INSERT INTO balance (farmer, commodity, amount) VALUES (NEW.destination_farmer, NEW.destination_commodity, 0) ON CONFLICT DO NOTHING;
  UPDATE balance SET amount = balance.amount - NEW.source_amount WHERE farmer = NEW.source_farmer AND commodity = NEW.source_commodity;
  UPDATE balance SET amount = balance.amount + NEW.destination_amount WHERE farmer = NEW.destination_farmer AND commodity = NEW.destination_commodity;
END;

-- migrate:down
ALTER TABLE transfer RENAME TO trade;

DROP TRIGGER update_balance_after_transfer;

CREATE TRIGGER update_balance_after_trade
AFTER INSERT ON trade
BEGIN
  INSERT INTO balance (farmer, commodity, amount) VALUES (NEW.source_farmer, NEW.source_commodity, 0) ON CONFLICT DO NOTHING;
  INSERT INTO balance (farmer, commodity, amount) VALUES (NEW.destination_farmer, NEW.destination_commodity, 0) ON CONFLICT DO NOTHING;
  UPDATE balance SET amount = balance.amount - NEW.source_amount WHERE farmer = NEW.source_farmer AND commodity = NEW.source_commodity;
  UPDATE balance SET amount = balance.amount + NEW.destination_amount WHERE farmer = NEW.destination_farmer AND commodity = NEW.destination_commodity;
END;
