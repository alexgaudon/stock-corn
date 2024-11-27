-- migrate:up
INSERT INTO trade (source_farmer, source_commodity, source_amount, destination_farmer, destination_commodity, destination_amount) VALUES ('BANK', 4, 1, '163488287951028227', 4, 1);

-- migrate:down

