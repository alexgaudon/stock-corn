import { REST, Routes } from "discord.js";
import { commands } from "./handlers";

export const registerCommands = async () => {
  if (!Bun.env.DISCORD_TOKEN) {
    throw new Error("DISCORD_TOKEN is not set");
  }
  if (!Bun.env.DISCORD_APPLICATION_ID) {
    throw new Error("DISCORD_APPLICATION_ID is not set");
  }

  console.log("Registering commands...");
  const rest = new REST().setToken(Bun.env.DISCORD_TOKEN);
  await rest.put(Routes.applicationCommands(Bun.env.DISCORD_APPLICATION_ID), {
    body: Object.values(commands).map(({ data }) => data),
  });
  console.log("Done!");
};
