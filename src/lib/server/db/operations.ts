import type { Farmer } from "$lib/types";
import {
  addSeconds,
  interval,
  intervalToDuration,
  type Duration,
} from "date-fns";
import { Commodities, type Commodity } from "../../commodities";
import {
  ENSURE_FARMER,
  EXILE,
  GET_BALANCE,
  GET_BALANCES,
  GET_LAST_DOLED,
  GET_LUCK_STATS,
  GET_TRADES_COUNT,
  GET_TRADES_WITH_TRANSFERS,
  IMMEDIATE_TRADE,
  IS_EXILED,
  TOP_BALANCES,
  UPDATE_FARMER,
} from "./statements";

type Result<T, E> = { value: T } | { error: E };

type TransferResult = Result<
  {
    sourceBalance: number;
    destinationBalance: number;
  },
  "INSUFFICIENT_FUNDS" | "SOURCE_USER_NOT_FOUND" | "INVALID_AMOUNT"
>;

type DoleResult = Result<
  { result: keyof typeof DOLE_RESULT; yield: number; balance: number },
  { type: "ALREADY_DOLED"; duration: Duration } | { type: "UNKNOWN_ERROR" }
>;

type ExileResult = Result<
  { result: "EXILED"; jailed: number },
  { type: "ALREADY_EXILED" } | { type: "UNKNOWN_ERROR" }
>;

type TradeRecord = {
  source_farmer: string;
  source_commodity: Commodity;
  source_amount: number;
  destination_farmer: string;
  destination_commodity: Commodity;
  destination_amount: number;
  date: string;
  source_username: string | null;
  source_avatar_url: string | null;
  destination_username: string | null;
  destination_avatar_url: string | null;
};

type TradesResult = {
  trades: TradeRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type TransferData = {
  commodity_id: Commodity;
  amount: number;
};

type TradeWithTransfersRecord = {
  trade_id: number;
  source_farmer: string;
  destination_farmer: string;
  source_username: string | null;
  source_avatar_url: string | null;
  destination_username: string | null;
  destination_avatar_url: string | null;
  date: string;
  status: string;
  transfers: TransferData[];
};

type TradesWithTransfersResult = {
  trades: TradeWithTransfersRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const updateFarmer = (farmer: Farmer): void => {
  UPDATE_FARMER.run({
    id: farmer.id,
    username: farmer.username,
    avatar_url: farmer.avatar_url,
  });
};

const DOLE_RESULT = {
  NORMAL: 100,
  LUCKY: 777,
  UNFORTUNATE: 5,
};

export const LUCK_HIGH_ROLL = 0.1; // 10% chance
export const LUCK_LOW_ROLL = 0.1; // 10% chance
export const LUCK_NORMAL_ROLL = 1 - LUCK_HIGH_ROLL - LUCK_LOW_ROLL; // This is just for calculation purposes.

const getDoleLuck = (): keyof typeof DOLE_RESULT => {
  const roll = Math.random();

  if (roll > 1 - LUCK_HIGH_ROLL) {
    return "LUCKY"; // top 10% of rolls
  } else if (roll < LUCK_LOW_ROLL) {
    return "UNFORTUNATE"; // bottom 10% of rolls
  } else {
    return "NORMAL"; // everything in between
  }
};

export const getLuckStats = (stats: {
  bountiful: number;
  barren: number;
  normal: number;
}) => {
  const total = stats.barren + stats.normal + stats.bountiful;
  return {
    barren: Math.round((stats.barren / total) * 100),
    barrenTheory: LUCK_LOW_ROLL * 100,
    normal: Math.round((stats.normal / total) * 100),
    normalTheory: LUCK_NORMAL_ROLL * 100,
    bountiful: Math.round((stats.bountiful / total) * 100),
    bountifulTheory: LUCK_HIGH_ROLL * 100,
  };
};

export const getLuck = (
  farmer: Farmer,
):
  | {
      farmer: string;
      barren: number;
      normal: number;
      bountiful: number;
    }
  | undefined => {
  ENSURE_FARMER(farmer.id);
  updateFarmer(farmer);
  const luck = GET_LUCK_STATS.get(farmer.id);
  return luck;
};

export const getBalances = (farmer: Farmer) => {
  ENSURE_FARMER(farmer.id);
  updateFarmer(farmer);
  return GET_BALANCES.all({ farmer: farmer.id });
};

export const trade = (
  sourceFarmer: string,
  destinationFarmer: string,
  commodity: Commodity,
  amount: number,
): TransferResult => {
  if (amount <= 0) {
    return { error: "INVALID_AMOUNT" };
  }
  const sourceBalance =
    GET_BALANCE.get({
      farmer: sourceFarmer,
      commodity,
    })?.amount ?? 0;
  if (sourceBalance < amount && sourceFarmer !== "BANK") {
    return { error: "INSUFFICIENT_FUNDS" };
  }
  IMMEDIATE_TRADE({
    sourceFarmer,
    destinationFarmer,
    commodity,
    amount,
  });
  return {
    value: {
      sourceBalance: GET_BALANCE.get({
        farmer: sourceFarmer,
        commodity,
      })!.amount,
      destinationBalance: GET_BALANCE.get({
        farmer: destinationFarmer,
        commodity,
      })!.amount,
    },
  };
};

export const dole = (farmer: Farmer): DoleResult => {
  updateFarmer(farmer);
  const lastDoled = GET_LAST_DOLED.get(farmer.id);
  if (lastDoled) {
    const lastDoledDate = new Date(lastDoled.date);
    const nextDoleDate = addSeconds(lastDoledDate, 1);
    const now = new Date();
    if (now < nextDoleDate) {
      return {
        error: {
          type: "ALREADY_DOLED",
          duration: intervalToDuration(interval(now, nextDoleDate)),
        },
      } as const;
    }
  }

  const result = getDoleLuck();

  const transferResult = trade(
    "BANK",
    farmer.id,
    Commodities.Corn,
    DOLE_RESULT[result],
  );
  if ("error" in transferResult) {
    return { error: { type: "UNKNOWN_ERROR" } };
  }

  return {
    value: {
      result: result,
      yield: DOLE_RESULT[result],
      balance: transferResult.value.destinationBalance,
    },
  };
};

export const getTradesWithTransfers = (
  page: number = 1,
  pageSize: number = 20,
): TradesWithTransfersResult => {
  const offset = (page - 1) * pageSize;
  const rawTrades = GET_TRADES_WITH_TRANSFERS.all({ limit: pageSize, offset });

  // Parse JSON transfers
  const trades = rawTrades.map((trade) => ({
    ...trade,
    transfers: JSON.parse(trade.transfers) as TransferData[],
  }));

  const totalCount = GET_TRADES_COUNT.get()!.count;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    trades,
    total: totalCount,
    page,
    pageSize,
    totalPages,
  };
};

export const getTopBalances = () => {
  return TOP_BALANCES.all({ top: 10 });
};

export const isExiled = (id: string): boolean => {
  ENSURE_FARMER(id);
  const isExiled = IS_EXILED.get(id);
  return isExiled?.exiled ?? false;
};

export const exile = (farmer: Farmer): ExileResult => {
  updateFarmer(farmer);

  const isExiled = IS_EXILED.get(farmer.id)?.exiled;
  if (isExiled) {
    return { error: { type: "ALREADY_EXILED" } };
  }

  EXILE.run(farmer.id);

  const amountToBeExiled =
    GET_BALANCE.get({
      farmer: farmer.id,
      commodity: Commodities.Corn,
    })?.amount ?? 0;

  if (amountToBeExiled > 0) {
    const exileResult = trade(
      farmer.id,
      "JAIL",
      Commodities.Corn,
      amountToBeExiled,
    );

    if ("error" in exileResult) {
      return { error: { type: "UNKNOWN_ERROR" } };
    }
  }

  return {
    value: {
      result: "EXILED",
      jailed: amountToBeExiled,
    },
  };
};
