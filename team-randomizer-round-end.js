import BasePlugin from "./base-plugin.js";

export default class TeamRandomizerRoundEnd extends BasePlugin {
  static get description() {
    return (
      "The <code>TeamRandomizerRoundEnd</code> randomizes teams at the end of round." +
      "It broadcasts warnings every 10 minutes by default. It can be run by typing," +
      "by default, <code>!randomize</code> into in-game admin chat"
    );
  }

  static get defaultEnabled() {
    return true;
  }

  static get optionsSpecification() {
    return {
      command: {
        required: false,
        description: "The command used to randomize the teams.",
        default: "randomize",
      },
      interval: {
        required: false,
        description: "Frequency of broadcasts in milliseconds.",
        default: 10 * 60 * 1000,
      },
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.onChatCommand = this.onChatCommand.bind(this);
    this.broadcast = this.broadcast.bind(this);
    this.onRoundEnd = this.onRoundEnd.bind(this);
  }

  async mount() {
    this.server.on(`CHAT_COMMAND:${this.options.command}`, this.onChatCommand);
  }

  async unmount() {
    this.server.removeListener(
      `CHAT_COMMAND:${this.options.command}`,
      this.onChatCommand
    );
  }

  async onChatCommand(info) {
    if (info.chat !== "ChatAdmin") return;

    this.verbose(1, "Randomizing teams at the end of the round.");
    this.broadcast();
    this.interval = setInterval(
      this.broadcast.bind(this),
      this.options.interval
    );

    await this.server.on("ROUND_ENDED", this.onRoundEnd);
    return;
  }

  async onRoundEnd() {
    const players = this.server.players.slice(0);

    let currentIndex = players.length;
    let temporaryValue;
    let randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = players[currentIndex];
      players[currentIndex] = players[randomIndex];
      players[randomIndex] = temporaryValue;
    }

    let team = "1";

    for (const player of players) {
      if (player.teamID !== team)
        await this.server.rcon.switchTeam(player.steamID);

      team = team === "1" ? "2" : "1";
    }

    this.verbose(1, "Teams have been scrambled!");
    this.server.rcon.broadcast("The teams have been scrambled!");

    clearInterval(this.interval);
    this.server.removeListener("ROUND_ENDED", this.onRoundEnd);
  }

  async broadcast() {
    this.verbose(1, "Broadcasting team scramble warning.");
    this.server.rcon.broadcast(
      "Teams will be scrambled at the end of this match!"
    );
  }
}
