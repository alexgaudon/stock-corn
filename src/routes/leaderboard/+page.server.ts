import { getLuckStats } from "$lib/server/db/operations";
import { TOP_BALANCES_WITH_LUCK } from "$lib/server/db/statements";
import type { PageServerLoad } from "./$types";

type LeaderboardEntry = {
  farmer: string;
  amount: number;
  username: string;
  avatar_url: string | null;
  barren: number;
  normal: number;
  bountiful: number;
};

type LuckStats = {
  barrenPercent: number;
  barrenTheory: number;
  normalPercent: number;
  normalTheory: number;
  bountifulPercent: number;
  bountifulTheory: number;
};

export const load: PageServerLoad = async () => {
  const leaderboardData: (LeaderboardEntry & LuckStats)[] =
    TOP_BALANCES_WITH_LUCK.all(100).map((entry) => {
      const luckStats = getLuckStats({
        bountiful: entry.bountiful,
        barren: entry.barren,
        normal: entry.normal,
      });
      return {
        ...entry,
        ...luckStats,
      };
    });

  console.log(leaderboardData);

  return {
    leaderboard: leaderboardData,
  };
};
