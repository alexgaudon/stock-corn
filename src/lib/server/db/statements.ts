import { db } from "./db.ts";
import type { Commodity } from "../commodities.ts";

export const GET_BALANCE = db.prepare<
  [{ farmer: string; commodity: Commodity }],
  { amount: number }
>(
  `SELECT amount FROM balance WHERE farmer = $farmer AND commodity = $commodity`,
);

export const GET_BALANCES = db.prepare<
  [{ farmer: string }],
  { commodity: Commodity; amount: number }
>(`SELECT commodity, amount FROM balance WHERE farmer = $farmer`);

export const CREATE_TRADE = db.prepare<
  {
    sourceFarmer: string;
    sourceCommodity: Commodity;
    sourceAmount: number;
    destinationFarmer: string;
    destinationCommodity: Commodity;
    destinationAmount: number;
  },
  []
>(`
  INSERT INTO trade (
    source_farmer,
    source_commodity,
    source_amount,
    destination_farmer,
    destination_commodity,
    destination_amount,
    date)
  VALUES (
    $sourceFarmer,
    $sourceCommodity,
    $sourceAmount,
    $destinationFarmer,
    $destinationCommodity,
    $destinationAmount,
    CURRENT_TIMESTAMP);
`);

export const UPDATE_FARMER = db.prepare<
  { id: string; username: string; avatar_url: string },
  []
>(
  `
  INSERT INTO farmer (id, date_started, username, avatar_url)
  VALUES ($id, CURRENT_TIMESTAMP, $username, $avatar_url)
  ON CONFLICT(id) DO UPDATE SET
    username = excluded.username,
    avatar_url = excluded.avatar_url
  `,
);

export const GET_LAST_DOLED = db.prepare<[string], { date: string }>(
  "SELECT date FROM trade WHERE source_farmer = 'BANK' AND source_commodity = 1 AND destination_farmer = ? ORDER BY date DESC LIMIT 1",
);

export const TOP_BALANCES = db.prepare<
  { top: number },
  { farmer: string; amount: number; username: string; avatar_url: string }
>(`
  SELECT b.farmer, b.amount, f.username, f.avatar_url
  FROM balance b
  JOIN farmer f ON b.farmer = f.id
  WHERE b.commodity = 1
  AND farmer NOT IN ('BANK', 'JAIL')
  ORDER BY b.amount DESC
  LIMIT $top
`);

export const EXILE = db.prepare<[string], []>(`
  UPDATE farmer SET exiled = 1 WHERE id = ?
`);

export const IS_EXILED = db.prepare<[string], { exiled: boolean }>(`
  SELECT exiled FROM farmer WHERE id = ? LIMIT 1
`);
