import { REST, Routes } from "discord.js";
import { commands } from "./handlers";

export const registerCommands = async () => {
  console.log("Registering commands...");
  const rest = new REST().setToken(Bun.env.DISCORD_TOKEN);
  await rest.put(Routes.applicationCommands(Bun.env.DISCORD_APPLICATION_ID), {
    body: Object.values(commands).map(({ data }) => data),
  });
  console.log("Done!");
};
