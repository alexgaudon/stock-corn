import {
  addHours,
  interval,
  intervalToDuration,
  type Duration,
} from "date-fns";
import { Commodity } from "./enum";
import {
  CREATE_TRADE,
  EXILE,
  GET_BALANCE,
  GET_BALANCES,
  GET_LAST_DOLED,
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

type IsExiledResult = Result<boolean, { type: "UNKNOWN_ERROR" }>;

const DOLE_RESULT = {
  NORMAL: 100,
  LUCKY: 777,
  UNFORTUNATE: 5,
};

export const getBalances = (id: string, username: string) => {
  UPDATE_FARMER.run({ $id: id, $username: username });
  return GET_BALANCES.all({ $farmer: id });
};

export const trade = (
  sourceFarmer: string,
  sourceCommodity: Commodity,
  sourceAmount: number,
  destinationFarmer: string,
  destinationCommodity: Commodity,
  destinationAmount: number,
): TransferResult => {
  if (sourceAmount <= 0) {
    return { error: "INVALID_AMOUNT" };
  }
  const sourceBalance = GET_BALANCE.get({
    $farmer: sourceFarmer,
    $commodity: sourceCommodity,
  })!.amount;
  if (sourceBalance < sourceAmount && sourceFarmer !== "BANK") {
    return { error: "INSUFFICIENT_FUNDS" };
  }
  CREATE_TRADE.run({
    $sourceFarmer: sourceFarmer,
    $sourceCommodity: sourceCommodity,
    $sourceAmount: sourceAmount,
    $destinationFarmer: destinationFarmer,
    $destinationCommodity: destinationCommodity,
    $destinationAmount: destinationAmount,
  });
  return {
    value: {
      sourceBalance: GET_BALANCE.get({
        $farmer: sourceFarmer,
        $commodity: sourceCommodity,
      })!.amount,
      destinationBalance: GET_BALANCE.get({
        $farmer: destinationFarmer,
        $commodity: destinationCommodity,
      })!.amount,
    },
  };
};

export const dole = (id: string, username: string): DoleResult => {
  UPDATE_FARMER.run({ $id: id, $username: username });
  const lastDoled = GET_LAST_DOLED.get(id);
  if (lastDoled) {
    const lastDoledDate = new Date(lastDoled.date);
    const nextDoleDate = addHours(lastDoledDate, 20);
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
  const luck = Math.random();
  let result: keyof typeof DOLE_RESULT;
  if (luck > 0.9) {
    result = "LUCKY";
  } else if (luck < 0.1) {
    result = "UNFORTUNATE";
  } else {
    result = "NORMAL";
  }

  const transferResult = trade(
    "BANK",
    Commodity.Corn,
    DOLE_RESULT[result],
    id,
    Commodity.Corn,
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

export const getTopBalances = () => {
  return TOP_BALANCES.all({ $top: 10 });
};

export const isExiled = (id: string): boolean => {
  const isExiled = IS_EXILED.get(id);
  return isExiled?.exiled ?? false;
};

export const exile = (id: string): ExileResult => {
  ENSURE_FARMER.run(id);

  const isExiled = IS_EXILED.get(id)?.exiled;

  if (isExiled) {
    return { error: { type: "ALREADY_EXILED" } };
  }

  EXILE.run(id);

  const amountToBeExiled =
    GET_BALANCE.get({
      $farmer: id,
      $commodity: Commodity.Corn,
    })?.amount ?? 0;

  if (amountToBeExiled > 0) {
    const exileResult = trade(
      id,
      Commodity.Corn,
      amountToBeExiled,
      "JAIL",
      Commodity.Corn,
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
