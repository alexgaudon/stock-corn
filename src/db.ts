import { Database } from "bun:sqlite";

export const db = new Database(Bun.env.DATABASE_PATH);
