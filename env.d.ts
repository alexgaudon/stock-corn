declare module "bun" {
  interface Env {
    DISCORD_TOKEN: string;
    DISCORD_APPLICATION_ID: string;
    DATABASE_URL: string;
  }
}
