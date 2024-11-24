import { db } from "./db";

db.run(`
  CREATE TABLE transfer (
    source TEXT NOT NULL CONSTRAINT fk_source_user_id REFERENCES user(id),
    destination TEXT NOT NULL CONSTRAINT fk_destination_user_id REFERENCES user(id),
    amount INTEGER NOT NULL,
    date TEXT NOT NULL)
`);

db.run(`
  CREATE TABLE user (
    id TEXT PRIMARY KEY,
    balance INTEGER NOT NULL)
`);
