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

export const load: PageServerLoad = async () => {
  const leaderboardData: LeaderboardEntry[] = TOP_BALANCES_WITH_LUCK.all(100);

  console.log(leaderboardData);

  return {
    leaderboard: leaderboardData,
  };
};
