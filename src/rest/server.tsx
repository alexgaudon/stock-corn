import Elysia from "elysia";
import { html, Html } from "@elysiajs/html";
import { Layout } from "./components/Layout";
import { Leaderboard } from "./pages/leaderboard";

export const startServer = () => {
  new Elysia()
    .use(html())
    .get("/", () => <Layout>Stock Corn 2025</Layout>)
    .get("/leaderboard", Leaderboard)
    .listen(3000);
};
