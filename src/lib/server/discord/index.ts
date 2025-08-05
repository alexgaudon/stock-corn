import { startBot } from "./bot";
import { registerCommands } from "./register";

await registerCommands();
export const { bot } = await startBot();
