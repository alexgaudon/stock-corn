import type { User } from "discord.js";
import type { Farmer } from "$lib/types";

export const userToFarmer = (user: User): Farmer => ({
  id: user.id,
  username: user.username,
  avatar_url: user.avatarURL() ?? "",
});
