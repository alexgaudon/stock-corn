<script lang="ts">
    import corn from "$lib/assets/corn.png";
    type LeaderboardEntry = {
        farmer: string;
        amount: number;
        username: string;
        avatar_url: string;
    };

    type PageData = {
        leaderboard: LeaderboardEntry[];
    };

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>Leaderboard - StockCorn</title>
</svelte:head>

<div class="space-y-6">
    <div class="text-center">
        <h1 class="text-3xl font-bold text-stone-50 mb-2">
            🌽 Corn Leaderboard
        </h1>
        <p class="text-stone-300">Top 100 farmers by Corn balance</p>
    </div>

    <div
        class="bg-stone-800 rounded-lg border border-stone-700 overflow-hidden"
    >
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-stone-700">
                    <tr>
                        <th
                            class="px-6 py-4 text-left text-xs font-medium text-stone-300 uppercase tracking-wider"
                        >
                            Rank
                        </th>
                        <th
                            class="px-6 py-4 text-left text-xs font-medium text-stone-300 uppercase tracking-wider"
                        >
                            Farmer
                        </th>
                        <th
                            class="px-6 py-4 text-right text-xs font-medium text-stone-300 uppercase tracking-wider"
                        >
                            Corn Balance
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-stone-700">
                    {#each data.leaderboard as farmer, index}
                        <tr class="hover:bg-stone-750 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    {#if index === 0}
                                        <span class="text-2xl">🥇</span>
                                    {:else if index === 1}
                                        <span class="text-2xl">🥈</span>
                                    {:else if index === 2}
                                        <span class="text-2xl">🥉</span>
                                    {:else}
                                        <span
                                            class="text-stone-400 font-medium text-lg"
                                            >#{index + 1}</span
                                        >
                                    {/if}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center space-x-3">
                                    <img
                                        src={farmer.avatar_url || corn}
                                        alt="{farmer.username ||
                                            'unknown user'}'s avatar"
                                        class="h-10 w-10 rounded-full border-2 border-stone-600"
                                        loading="lazy"
                                    />
                                    <div>
                                        <div
                                            class="text-sm font-medium text-stone-50"
                                        >
                                            {farmer.username || "unknown user"}
                                        </div>
                                        <div class="text-xs text-stone-400">
                                            ID: {farmer.farmer}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right">
                                <div class="text-lg font-bold text-yellow-400">
                                    {farmer.amount.toLocaleString()} 🌽
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

    {#if data.leaderboard.length === 0}
        <div class="text-center py-12">
            <div class="text-6xl mb-4">🌽</div>
            <h2 class="text-xl font-semibold text-stone-300 mb-2">
                No farmers found
            </h2>
            <p class="text-stone-400">
                The leaderboard is empty. Start farming to see results!
            </p>
        </div>
    {/if}
</div>

<style>
    .hover\:bg-stone-750:hover {
        background-color: #44403c;
    }
</style>
