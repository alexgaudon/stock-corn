import {
  Client,
  Events,
  GatewayIntentBits,
  type Interaction,
} from "discord.js";
import { commands } from "./handlers.ts";

export const startBot = async () => {
  const bot = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  bot.once(Events.ClientReady, (c) => {
    console.log(`Discord bot ready. Logged in as ${c.user.tag}`);
  });

  bot.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = commands.find(
      (command) => command.data.name === interaction.commandName,
    );
    if (command) {
      try {
        await command.handler(interaction);
      } catch (e) {
        console.error(e);
      }
    }
  });

  bot.login(Bun.env.DISCORD_TOKEN);

  return { bot };
};
