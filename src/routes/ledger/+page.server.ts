import { getTradesWithTransfers } from "$lib/server/db/operations";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.max(
    1,
    Math.min(100, parseInt(url.searchParams.get("pageSize") ?? "20")),
  );

  const tradesData = getTradesWithTransfers(page, pageSize);

  return {
    trades: tradesData.trades,
    pagination: {
      total: tradesData.total,
      page: tradesData.page,
      pageSize: tradesData.pageSize,
      totalPages: tradesData.totalPages,
    },
  };
};
