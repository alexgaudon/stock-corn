import { db } from "./db";
import type { Commodity } from "../../commodities";

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
    destinationFarmer: string;
  },
  { id: number }
>(`
  INSERT INTO trade (
    source_farmer,
    destination_farmer,
    status,
    date)
  VALUES (
    $sourceFarmer,
    $destinationFarmer,
    'pending',
    CURRENT_TIMESTAMP)
  RETURNING id;
`);

export const IMMEDIATE_TRADE = db.transaction(
  ({
    sourceFarmer,
    destinationFarmer,
    commodity,
    amount,
  }: {
    sourceFarmer: string;
    destinationFarmer: string;
    commodity: Commodity;
    amount: number;
  }) => {
    const { id } = CREATE_TRADE.get({ sourceFarmer, destinationFarmer })!;
    CREATE_TRANSFER.run({ tradeId: id, commodity, amount });
    UPDATE_TRADE_STATUS.run({
      id,
      status: "accepted",
    });
  },
);

export const UPDATE_TRADE_STATUS = db.prepare<
  {
    id: number;
    status: "pending" | "accepted" | "rejected" | "cancelled";
  },
  []
>(`
  UPDATE trade
  SET status = $status
  WHERE id = $id;
`);

export const CREATE_TRANSFER = db.prepare<
  {
    tradeId: number;
    commodity: Commodity;
    amount: number;
  },
  []
>(`
  INSERT INTO transfer (
    trade_id,
    commodity,
    amount)
  VALUES (
    $tradeId,
    $commodity,
    $amount)
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
  "SELECT date FROM trade WHERE source_farmer = 'BANK' AND destination_farmer = ? ORDER BY date DESC LIMIT 1",
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

export const GET_TRADES_COUNT = db.prepare<[], { count: number }>(`
  SELECT COUNT(*) as count FROM trade
`);

export const GET_TRADES_WITH_TRANSFERS = db.prepare<
  { limit: number; offset: number },
  {
    trade_id: number;
    source_farmer: string;
    source_username: string | null;
    source_avatar_url: string | null;
    destination_farmer: string;
    destination_username: string | null;
    destination_avatar_url: string | null;
    date: string;
    status: string;
    transfers: string; // JSON array of transfers
  }
>(`
  SELECT
    t.id as trade_id,
    t.source_farmer,
    t.destination_farmer,
    sf.username as source_username,
    sf.avatar_url as source_avatar_url,
    df.username as destination_username,
    df.avatar_url as destination_avatar_url,
    t.date,
    t.status,
    COALESCE(
      json_group_array(
        json_object(
          'commodity_id', tr.commodity,
          'amount', tr.amount
        )
      ) FILTER (WHERE tr.trade_id IS NOT NULL),
      '[]'
    ) as transfers
  FROM trade t
  LEFT JOIN farmer sf ON t.source_farmer = sf.id
  LEFT JOIN farmer df ON t.destination_farmer = df.id
  LEFT JOIN transfer tr ON t.id = tr.trade_id
  GROUP BY t.id, t.source_farmer, t.destination_farmer, sf.username, df.username, t.date, t.status
  ORDER BY t.date DESC, t.id
  LIMIT $limit OFFSET $offset
`);
