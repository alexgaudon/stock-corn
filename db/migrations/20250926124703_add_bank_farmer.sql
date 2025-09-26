-- migrate:up
INSERT
OR IGNORE INTO farmer (id, date_started)
VALUES
    ('BANK', CURRENT_TIMESTAMP);

-- migrate:down
DELETE FROM farmer
WHERE
    id = 'BANK';