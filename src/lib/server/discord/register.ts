import { REST, Routes } from "discord.js";
import { commands } from "./handlers";
import {
  DISABLE_REGISTER,
  DISCORD_APPLICATION_ID,
  DISCORD_TOKEN,
} from "../env";

export const registerCommands = async () => {
  if (DISABLE_REGISTER) {
    return;
  }
  console.log("Registering commands...");
  const rest = new REST().setToken(DISCORD_TOKEN);
  await rest.put(Routes.applicationCommands(DISCORD_APPLICATION_ID), {
    body: Object.values(commands).map(({ data }) => data),
  });
  console.log("Done!");
};
