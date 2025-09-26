<script lang="ts">
  import corn from "$lib/assets/corn.png";
  import "../app.css";

  let { children } = $props();
  let mobileMenuOpen = $state(false);

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/ledger", label: "Ledger" },
    { href: "/trades", label: "Trades" },
  ];

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<svelte:head>
  <link rel="icon" href={corn} />
</svelte:head>

<div class="bg-stone-900 min-h-screen text-stone-50">
  <!-- Header -->
  <header class="top-0 z-50 sticky bg-stone-800 border-stone-700 border-b">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center space-x-3">
          <img src={corn} alt="Logo" class="rounded-lg w-12 h-12" />
          <h1 class="font-bold text-stone-50 text-xl">StockCorn</h1>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:flex space-x-8">
          {#each navItems as item}
            <a
              href={item.href}
              class="px-3 py-2 rounded-md font-medium text-stone-300 hover:text-stone-50 text-sm transition-colors"
            >
              {item.label}
            </a>
          {/each}
        </nav>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            type="button"
            onclick={toggleMobileMenu}
            class="focus:outline-none text-stone-300 hover:text-stone-50 focus:text-stone-50"
          >
            {#if mobileMenuOpen}
              <svg
                class="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            {:else}
              <svg
                class="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            {/if}
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      {#if mobileMenuOpen}
        <div class="md:hidden bg-stone-800 border-stone-700 border-t">
          <div class="space-y-1 px-2 pt-2 pb-3">
            {#each navItems as item}
              <a
                href={item.href}
                onclick={toggleMobileMenu}
                class="block hover:bg-stone-700 px-3 py-2 rounded-md font-medium text-stone-300 hover:text-stone-50 text-base transition-colors"
              >
                {item.label}
              </a>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </header>

  <!-- Main Content -->
  <main class="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
    {@render children?.()}
  </main>

  <!-- Footer -->
  <footer class="bg-stone-800 mt-auto border-stone-700 border-t">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-6xl">
      <div class="text-stone-400 text-sm text-center">
        <p>&copy; {new Date().getFullYear()} StockCorn</p>
      </div>
    </div>
  </footer>
</div>
