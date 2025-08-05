import { TOP_BALANCES } from "$lib/server/db/statements";
import type { PageServerLoad } from "./$types";

type LeaderboardEntry = {
  farmer: string;
  amount: number;
  username: string;
  avatar_url: string;
};

export const load: PageServerLoad = async () => {
  const leaderboardData: LeaderboardEntry[] = TOP_BALANCES.all({ top: 100 });

  return {
    leaderboard: leaderboardData,
  };
};
