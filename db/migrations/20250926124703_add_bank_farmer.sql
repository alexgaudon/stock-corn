-- migrate:up
INSERT INTO
    farmer (id, date_started)
VALUES
    ('BANK', CURRENT_TIMESTAMP)
    
-- migrate:down
DELETE FROM farmer
WHERE
    id = 'BANK';