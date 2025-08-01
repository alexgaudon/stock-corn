import { TOP_BALANCES } from "../../statements";
import { Layout } from "../components/Layout";
import { Html } from "@elysiajs/html";

export const Leaderboard = () => {
  const top = TOP_BALANCES.all({ $top: 100 });

  return (
    <Layout>
      <ul>
        {top.map(({ farmer, username, amount }) => (
          <li>
            <b>
              {username ?? farmer} - {amount}
            </b>
          </li>
        ))}
      </ul>
    </Layout>
  );
};
