import Database from "better-sqlite3";
import { DATABASE_PATH } from "../env";

export const db = new Database(DATABASE_PATH);
