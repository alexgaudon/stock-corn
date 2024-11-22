import { db } from "./db";

export const GET_BALANCE = db.prepare<{ balance: number }, [string]>(
  "SELECT balance FROM user WHERE id = ?",
);

export const INSERT_USER = db.prepare<undefined, [string]>(
  "INSERT INTO user (id, balance) VALUES (?, 0)",
);

export const ADJUST_BALANCE = db.prepare<undefined, [number, string]>(
  "UPDATE user SET balance = balance + ? WHERE id = ?",
);

export const LOG_TRANSFER = db.prepare<undefined, [string, string, number]>(
  "INSERT INTO transfer (source, destination, amount, date) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
);

export const ENSURE_USER = db.prepare<undefined, [string]>(
  "INSERT OR IGNORE INTO user (id, balance) VALUES (?, 0)",
);

export const GET_LAST_DOLED = db.prepare<{ date: string }, [string]>(
  "SELECT date FROM transfer WHERE source = 'BANK' AND destination = ? ORDER BY date DESC LIMIT 1",
);

export const TOP_BALANCES = db.prepare<{ id: string; balance: number }, []>(
  "SELECT id, balance FROM user ORDER BY balance DESC LIMIT 10",
);
