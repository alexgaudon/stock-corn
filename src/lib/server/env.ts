import dotenv from "dotenv";

const parsed = dotenv.config({
  path: [".env.development", ".env"],
  quiet: true,
});

if (!process.env.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is not defined");
}

if (!process.env.DATABASE_PATH) {
  throw new Error("DATABASE_PATH is not defined");
}

if (!process.env.DISCORD_APPLICATION_ID) {
  throw new Error("DISCORD_APPLICATION_ID is not defined");
}

if (!process.env.CORN_CZAR_ID) {
  throw new Error("CORN_CZAR_ID is not defined");
}

export const {
  DISCORD_TOKEN,
  DATABASE_PATH,
  CORN_CZAR_ID,
  DISCORD_APPLICATION_ID,
} = process.env;

export const DISABLE_REGISTER = process.env.DISABLE_REGISTER === "true";
