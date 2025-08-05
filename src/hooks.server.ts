import type { ServerInit } from "@sveltejs/kit";

export const init: ServerInit = async () => {
  await import("$lib/server/discord");
};
