import { TOP_BALANCES } from "../../statements";
import { Layout } from "../components/Layout";
import { Html } from "@elysiajs/html";

export const Leaderboard = () => {
  const top = TOP_BALANCES.all({ $top: 100 });

  return (
    <Layout>
      <ul>
        {top.map(({ farmer, username, amount, avatar_url }) => (
          <li>
            {avatar_url && (
              <img
                src={avatar_url}
                alt={username ?? farmer}
                style={{ width: "32px", height: "32px", borderRadius: "50%" }}
              />
            )}{" "}
            <b>
              {username ?? farmer} - {amount}
            </b>
          </li>
        ))}
      </ul>
    </Layout>
  );
};
