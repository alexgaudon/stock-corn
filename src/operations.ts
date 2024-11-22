import {
  ADJUST_BALANCE,
  ENSURE_USER,
  GET_BALANCE,
  GET_LAST_DOLED,
  LOG_TRANSFER,
  TOP_BALANCES,
} from "./statements";

type Result<T, E> = { value: T } | { error: E };

type TransferResult = Result<
  {
    sourceBalance: number;
    destinationBalance: number;
  },
  "INSUFFICIENT_FUNDS" | "SOURCE_USER_NOT_FOUND" | "INVALID_AMOUNT"
>;

type DoleResult = Result<number, "ALREADY_DOLED" | "UNKNOWN_ERROR">;

export const getBalance = (id: string): number => {
  ENSURE_USER.run(id);
  let balance = GET_BALANCE.get(id)!.balance;
  return balance;
};

export const transfer = (
  source: string,
  destination: string,
  amount: number,
): TransferResult => {
  ENSURE_USER.run(source);
  ENSURE_USER.run(destination);
  const sourceBalance = GET_BALANCE.get(source)!.balance;
  if (amount <= 0) {
    return { error: "INVALID_AMOUNT" };
  }
  if (sourceBalance < amount || source === "BANK") {
    return { error: "INSUFFICIENT_FUNDS" };
  }
  ADJUST_BALANCE.run(-amount, source);
  ADJUST_BALANCE.run(amount, destination);
  LOG_TRANSFER.run(source, destination, amount);
  return {
    value: {
      sourceBalance: GET_BALANCE.get(source)!.balance,
      destinationBalance: GET_BALANCE.get(destination)!.balance,
    },
  };
};

export const dole = (id: string): DoleResult => {
  const lastDoled = GET_LAST_DOLED.get(id);
  if (lastDoled) {
    const lastDoledDate = new Date(lastDoled.date);
    const now = new Date();
    const oneDay = 1000 * 60 * 60 * 24;
    if (now.getTime() - lastDoledDate.getTime() < oneDay) {
      return { error: "ALREADY_DOLED" } as const;
    }
  }
  const transferResult = transfer("BANK", id, 100);
  if ("error" in transferResult) {
    return { error: "UNKNOWN_ERROR" };
  }
  return { value: transferResult.value.destinationBalance };
};

export const getTopBalances = () => {
  return TOP_BALANCES.all();
};
