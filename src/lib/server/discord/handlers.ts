import { formatDuration } from "date-fns";
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { Commodities, getCommodityName } from "../../commodities";
import {
  dole,
  exile,
  getBalances,
  getLuck,
  getLuckStats,
  isExiled,
  trade,
} from "../db/operations";
import { TOP_BALANCES_WITH_LUCK } from "../db/statements";
import { CORN_CZAR_ID } from "../env";
import { userToFarmer } from "./utilities";

type Handler = (interaction: ChatInputCommandInteraction) => Promise<void>;
type Command = {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  handler: Handler;
};

export const commands: Array<Command> = [
  {
    data: new SlashCommandBuilder()
      .setName("luck")
      .setDescription("Check your luck"),
    handler: async (interaction) => {
      const luckRaw = getLuck(userToFarmer(interaction.user));
      if (luckRaw === undefined) {
        await interaction.reply(
          "You have not harvested before. We do not have stats for you.",
        );
        return;
      }
      const luck = getLuckStats({
        barren: luckRaw.barren,
        normal: luckRaw.normal,
        bountiful: luckRaw.bountiful,
      });
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00beef)
            .addFields(
              {
                name: "Barren",
                value: `Count: ${luckRaw.barren}\nActual: ${luck.barren}%\nTheory: ${luck.barrenTheory}%`,
                inline: true,
              },
              {
                name: "Normal",
                value: `Count: ${luckRaw.normal}\nActual: ${luck.normal}%\nTheory: ${luck.normalTheory}%`,
                inline: true,
              },
              {
                name: "🌽 Bountiful",
                value: `Count: ${luckRaw.bountiful}\nActual: ${luck.bountiful}%\nTheory: ${luck.bountifulTheory}%`,
                inline: true,
              },
            )
            .setFooter({ text: "Bank trades only" })
            .setTimestamp(),
        ],
      });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName("balance")
      .setDescription("Check your stockpile"),
    handler: async (interaction) => {
      if (isExiled(interaction.user.id)) {
        await interaction.reply("You are exiled from the kingdom.");
        return;
      }

      const balances = getBalances(userToFarmer(interaction.user));
      await interaction.reply({
        embeds: [
          new EmbedBuilder({
            title: "Your stockpile",
            fields: balances.map(({ commodity, amount }) => ({
              name: getCommodityName(commodity),
              value: `${amount}`,
            })),
          }),
        ],
      });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName("harvest")
      .setDescription("Reap the golden bounty"),
    handler: async (interaction) => {
      if (isExiled(interaction.user.id)) {
        await interaction.reply("You are exiled from the kingdom.");
        return;
      }

      const doleResult = dole(userToFarmer(interaction.user));
      if ("error" in doleResult) {
        switch (doleResult.error.type) {
          case "ALREADY_DOLED":
            await interaction.reply(
              `You have already harvested today. You can harvest again in ${formatDuration(
                doleResult.error.duration,
              )}.`,
            );
            break;
          default:
            await interaction.reply("An unknown error occurred.");
            break;
        }
        return;
      }
      switch (doleResult.value.result) {
        case "LUCKY":
          await interaction.reply({
            embeds: [
              new EmbedBuilder().setTitle("Lucky harvest!").setFields([
                {
                  name: "yield",
                  value: `${doleResult.value.yield} cobs`,
                  inline: true,
                },
                {
                  name: "balance",
                  value: `${doleResult.value.balance} cobs`,
                  inline: true,
                },
              ]),
            ],
          });
          break;
        case "UNFORTUNATE":
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("But the field was barren")
                .setDescription("Your family may go hungry")
                .setFields([
                  {
                    name: "yield",
                    value: `${doleResult.value.yield} cobs`,
                    inline: true,
                  },
                  {
                    name: "balance",
                    value: `${doleResult.value.balance} cobs`,
                    inline: true,
                  },
                ]),
            ],
          });
          break;
        default:
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("You harvested your field")
                .setFields([
                  {
                    name: "yield",
                    value: `${doleResult.value.yield} cobs`,
                    inline: true,
                  },
                  {
                    name: "balance",
                    value: `${doleResult.value.balance} cobs`,
                    inline: true,
                  },
                ]),
            ],
          });
          break;
      }
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName("send")
      .setDescription("Send money to another user")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to send corn to")
          .setRequired(true),
      )
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription("The amount of corn to send")
          .setRequired(true),
      ) as SlashCommandBuilder,
    handler: async (interaction) => {
      if (isExiled(interaction.user.id)) {
        await interaction.reply("You are exiled from the kingdom.");
        return;
      }

      const source = interaction.user.id;
      const destinationUser = interaction.options.getUser("user")!;

      if (isExiled(destinationUser.id)) {
        await interaction.reply(
          "The recipient is exiled from the kingdom. They will not receive the corn.",
        );
        return;
      }

      const amount = interaction.options.getInteger("amount")!;
      const tradeResult = trade(
        source,
        destinationUser.id,
        Commodities.Corn,
        amount,
      );
      if ("error" in tradeResult) {
        switch (tradeResult.error) {
          case "INSUFFICIENT_FUNDS":
            await interaction.reply("You do not have enough cobs.");
            break;
          case "INVALID_AMOUNT":
            await interaction.reply("The amount must be positive");
            break;
          default:
            await interaction.reply("An unknown error occurred.");
            break;
        }
        return;
      }
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Transfer successful")
            .setDescription(
              `You have sent ${amount} cobs of corn to <@${destinationUser.id}>.`,
            )
            .addFields([
              {
                name: interaction.user.displayName,
                value: `${tradeResult.value.sourceBalance} cobs`,
                inline: true,
              },
              {
                name: destinationUser.displayName,
                value: `${tradeResult.value.destinationBalance} cobs`,
                inline: true,
              },
            ]),
        ],
      });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName("leaderboard")
      .setDescription("Check the top corn barons"),
    handler: async (interaction) => {
      const topBalancesWithLuck = TOP_BALANCES_WITH_LUCK.all(10);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Top Corn Barons")
            .setColor(0x00beef)
            .setFields(
              topBalancesWithLuck.map((entry, index) => {
                return {
                  name: `${index + 1}. ${entry.username}`,
                  value: `${entry.amount} cobs\n`,
                  inline: true,
                };
              }),
            )
            .setTimestamp(),
        ],
      });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName("exile")
      .setDescription("Exile a user from the kingdom")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to exile")
          .setRequired(true),
      ) as SlashCommandBuilder,
    handler: async (interaction) => {
      if (interaction.user.id !== CORN_CZAR_ID) {
        await interaction.reply("You are not authorized to exile users.");
        return;
      }

      const user = interaction.options.getUser("user")!;
      const exileResult = exile(userToFarmer(user));

      if ("error" in exileResult) {
        switch (exileResult.error.type) {
          case "ALREADY_EXILED":
            await interaction.reply("The user is already exiled.");
            break;
          case "UNKNOWN_ERROR":
            await interaction.reply("An unknown error occurred.");
            break;
        }
        return;
      }

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${user.username} has been exiled.`)
            .setDescription(
              `All ${exileResult.value.jailed} cobs of corn have been sent to jail.`,
            ),
        ],
      });
    },
  },
];
