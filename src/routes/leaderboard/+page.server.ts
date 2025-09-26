import { getLuckStats } from "$lib/server/db/operations";
import { TOP_BALANCES_WITH_LUCK } from "$lib/server/db/statements";
import type { PageServerLoad } from "./$types";

type LeaderboardEntry = {
  farmer: string;
  amount: number;
  username: string;
  avatar_url: string | null;
};

type LuckStats = {
  barren: number;
  barrenTheory: number;
  normal: number;
  normalTheory: number;
  bountiful: number;
  bountifulTheory: number;
};

export const load: PageServerLoad = async () => {
  const leaderboardData: (LeaderboardEntry & LuckStats)[] =
    TOP_BALANCES_WITH_LUCK.all(100).map((entry) => {
      return {
        ...entry,
        ...getLuckStats({
          bountiful: entry.bountiful,
          barren: entry.barren,
          normal: entry.normal,
        }),
      };
    });

  return {
    leaderboard: leaderboardData,
  };
};
