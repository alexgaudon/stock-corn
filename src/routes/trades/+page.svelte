<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let data: PageData;

	$: trades = data.trades || [];
	$: pagination = data.pagination;
	$: currentPage = pagination.page;
	$: totalPages = pagination.totalPages;

	function goToPage(pageNum: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', pageNum.toString());
		goto(url.toString());
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString();
	}

	function formatStatus(status: string) {
		return status.charAt(0).toUpperCase() + status.slice(1);
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'accepted':
				return 'text-green-600 bg-green-100';
			case 'pending':
				return 'text-yellow-600 bg-yellow-100';
			case 'rejected':
				return 'text-red-600 bg-red-100';
			case 'cancelled':
				return 'text-gray-600 bg-gray-100';
			default:
				return 'text-gray-600 bg-gray-100';
		}
	}
</script>

<svelte:head>
	<title>Trades - Stock Corn</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-6">Trade History</h1>

	{#if data.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{data.error}
		</div>
	{/if}

	{#if trades.length === 0}
		<div class="text-center py-8">
			<p class="text-gray-500 text-lg">No trades found.</p>
		</div>
	{:else}
		<!-- Trade List -->
		<div class="space-y-6">
			{#each trades as trade}
				<div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
					<!-- Trade Header -->
					<div class="flex justify-between items-start mb-4">
						<div>
							<h3 class="text-lg font-semibold text-gray-900">Trade #{trade.trade_id}</h3>
							<p class="text-sm text-gray-500">{formatDate(trade.date)}</p>
						</div>
						<span class="px-3 py-1 rounded-full text-sm font-medium {getStatusColor(trade.status)}">
							{formatStatus(trade.status)}
						</span>
					</div>

					<!-- Trade Participants -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
						<div>
							<p class="text-sm font-medium text-gray-700 mb-1">From</p>
							<div class="text-gray-900">
								{trade.source_username || trade.source_farmer}
								{#if trade.source_username && trade.source_farmer !== trade.source_username}
									<span class="text-sm text-gray-500">({trade.source_farmer})</span>
								{/if}
							</div>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-700 mb-1">To</p>
							<div class="text-gray-900">
								{trade.destination_username || trade.destination_farmer}
								{#if trade.destination_username && trade.destination_farmer !== trade.destination_username}
									<span class="text-sm text-gray-500">({trade.destination_farmer})</span>
								{/if}
							</div>
						</div>
					</div>

					<!-- Transfers -->
					{#if trade.transfers.length > 0}
						<div>
							<p class="text-sm font-medium text-gray-700 mb-2">Transfers</p>
							<div class="bg-gray-50 rounded-md p-3">
								<div class="space-y-2">
									{#each trade.transfers as transfer}
										<div class="flex justify-between items-center">
											<span class="text-sm text-gray-600">Commodity {transfer.commodity_id}</span>
											<span class="text-sm font-medium text-gray-900">
												{transfer.amount > 0 ? '+' : ''}{transfer.amount}
											</span>
										</div>
									{/each}
								</div>
							</div>
						</div>
					{:else}
						<div class="text-sm text-gray-500 italic">No transfers</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex justify-center items-center space-x-2 mt-8">
				<button
					class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={currentPage <= 1}
					on:click={() => goToPage(currentPage - 1)}
				>
					Previous
				</button>

				{#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
					const start = Math.max(1, currentPage - 2);
					const end = Math.min(totalPages, start + 4);
					return start + i;
				}).filter(p => p <= totalPages) as pageNum}
					<button
						class="px-3 py-2 text-sm border rounded-md {pageNum === currentPage
							? 'bg-blue-500 text-white border-blue-500'
							: 'border-gray-300 hover:bg-gray-50'}"
						on:click={() => goToPage(pageNum)}
					>
						{pageNum}
					</button>
				{/each}

				<button
					class="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={currentPage >= totalPages}
					on:click={() => goToPage(currentPage + 1)}
				>
					Next
				</button>
			</div>

			<div class="text-center mt-4 text-sm text-gray-500">
				Page {currentPage} of {totalPages} ({pagination.total} total trades)
			</div>
		{/if}
	{/if}
</div>
