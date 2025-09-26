<script lang="ts">
  import corn from "$lib/assets/corn.png";
  type LeaderboardEntry = {
    farmer: string;
    amount: number;
    username: string;
    avatar_url: string | null;
    barren: number;
    barrenTheory: number;
    normal: number;
    normalTheory: number;
    bountiful: number;
    bountifulTheory: number;
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
    <h1 class="mb-2 font-bold text-stone-50 text-3xl">🌽 Corn Leaderboard</h1>
    <p class="text-stone-300">Top 100 farmers by Corn balance</p>
  </div>

  <div class="bg-stone-800 border border-stone-700 rounded-lg overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-stone-700">
          <tr>
            <th
              class="px-6 py-4 font-medium text-stone-300 text-xs text-left uppercase tracking-wider"
            >
              Rank
            </th>
            <th
              class="px-6 py-4 font-medium text-stone-300 text-xs text-left uppercase tracking-wider"
            >
              Farmer
            </th>
            <th
              class="px-6 py-4 font-medium text-stone-300 text-xs text-center uppercase tracking-wider"
              >Barren</th
            >
            <th
              class="px-6 py-4 font-medium text-stone-300 text-xs text-center uppercase tracking-wider"
              >Normal</th
            >
            <th
              class="px-6 py-4 font-medium text-stone-300 text-xs text-center uppercase tracking-wider"
              >Bountiful</th
            >
            <th
              class="px-6 py-4 font-medium text-stone-300 text-xs text-right uppercase tracking-wider"
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
                    <span class="font-medium text-stone-400 text-lg"
                      >#{index + 1}</span
                    >
                  {/if}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-3">
                  <img
                    src={farmer.avatar_url || corn}
                    alt="{farmer.username || 'unknown user'}'s avatar"
                    class="border-2 border-stone-600 rounded-full w-10 h-10"
                    loading="lazy"
                  />
                  <div>
                    <div class="font-medium text-stone-50 text-sm">
                      {farmer.username || "unknown user"}
                    </div>
                    <div class="text-stone-400 text-xs">
                      ID: {farmer.farmer}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-center whitespace-nowrap">
                <div class="flex flex-col items-center gap-1">
                  <span class="font-mono text-lg"
                    >{farmer.barren.toLocaleString()}</span
                  >
                  <span class="text-stone-400 text-xs"
                    >Actual: {farmer.barren}%</span
                  >
                  <span class="text-stone-500 text-xs"
                    >Theory: {farmer.barrenTheory}%</span
                  >
                </div>
              </td>
              <td class="px-6 py-4 text-center whitespace-nowrap">
                <div class="flex flex-col items-center gap-1">
                  <span class="font-mono text-lg"
                    >{farmer.normal.toLocaleString()}</span
                  >
                  <span class="text-stone-400 text-xs"
                    >Actual: {farmer.normal}%</span
                  >
                  <span class="text-stone-500 text-xs"
                    >Theory: {farmer.normalTheory}%</span
                  >
                </div>
              </td>
              <td class="px-6 py-4 text-center whitespace-nowrap">
                <div class="flex flex-col items-center gap-1">
                  <span class="font-mono text-lg"
                    >{farmer.bountiful.toLocaleString()}</span
                  >
                  <span class="text-stone-400 text-xs"
                    >Actual: {farmer.bountiful}%</span
                  >
                  <span class="text-stone-500 text-xs"
                    >Theory: {farmer.bountifulTheory}%</span
                  >
                </div>
              </td>
              <td class="px-6 py-4 text-right whitespace-nowrap">
                <div class="font-bold text-yellow-400 text-lg">
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
    <div class="py-12 text-center">
      <div class="mb-4 text-6xl">🌽</div>
      <h2 class="mb-2 font-semibold text-stone-300 text-xl">
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
