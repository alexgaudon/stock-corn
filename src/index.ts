import { startBot } from "./discord/bot.ts";
import { registerCommands } from "./discord/register.ts";

await registerCommands();
await startBot();
