import { getTradesWithTransfers } from '$lib/server/db/operations';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const pageSize = parseInt(url.searchParams.get('pageSize') ?? '20');

	try {
		const tradesData = getTradesWithTransfers(page, pageSize);
		return {
			trades: tradesData.trades,
			pagination: {
				total: tradesData.total,
				page: tradesData.page,
				pageSize: tradesData.pageSize,
				totalPages: tradesData.totalPages
			}
		};
	} catch (error) {
		console.error('Error loading trades:', error);
		return {
			trades: [],
			pagination: {
				total: 0,
				page: 1,
				pageSize: 20,
				totalPages: 0
			},
			error: 'Failed to load trades'
		};
	}
};
