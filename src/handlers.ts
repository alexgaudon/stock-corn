import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { dole, getBalance, getTopBalances, transfer } from "./operations.ts";

type Handler = (interaction: ChatInputCommandInteraction) => Promise<void>;
type Command = { data: SlashCommandBuilder; handler: Handler };

export const commands: Array<Command> = [
  {
    data: new SlashCommandBuilder()
      .setName("balance")
      .setDescription("Check your stockpile"),
    handler: async (interaction) => {
      const balance = getBalance(interaction.user.id);
      await interaction.reply(`Your balance is ${balance}`);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName("harvest")
      .setDescription("Reap the golden bounty"),
    handler: async (interaction) => {
      const doleResult = dole(interaction.user.id);
      if ("error" in doleResult) {
        switch (doleResult.error) {
          case "ALREADY_DOLED":
            await interaction.reply("You have already harvested today.");
            break;
          default:
            await interaction.reply("An unknown error occurred.");
            break;
        }
        return;
      }
      await interaction.reply(
        `Here is your daily harvest. Your balance is: ${doleResult.value} cobs`,
      );
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
      ),
    handler: async (interaction) => {
      const source = interaction.user.id;
      const destinationUser = interaction.options.getUser("user")!;
      const amount = interaction.options.getInteger("amount")!;
      const transferResult = transfer(source, destinationUser.id, amount);
      if ("error" in transferResult) {
        switch (transferResult.error) {
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
                value: `${transferResult.value.sourceBalance} cobs`,
                inline: true,
              },
              {
                name: destinationUser.displayName,
                value: `${transferResult.value.destinationBalance} cobs`,
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
      const topBalances = getTopBalances();
      const leaderboard = topBalances
        .map((entry, index) => `${index + 1}. <@${entry.id}>: ${entry.balance}`)
        .join("\n");
      await interaction.reply(`The top corn barons are:\n${leaderboard}`);
    },
  },
];
