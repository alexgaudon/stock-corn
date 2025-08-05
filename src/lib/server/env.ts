import dotenv from "dotenv";

dotenv.config({
  path: [".env.development", ".env"],
  quiet: true,
});

export const {
  DISCORD_TOKEN,
  DATABASE_PATH,
  CORN_CZAR_ID,
  DISCORD_APPLICATION_ID,
} = process.env;

export const DISABLE_REGISTER = process.env.DISABLE_REGISTER === "true";
