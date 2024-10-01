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

    // Filter players into each team
    const team1 = players.filter(player => player.teamID == '1');
    const team2 = players.filter(player => player.teamID == '2');

    // Fisher-Yates shuffle
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    // Shuffle the teams, rather than just using the unordered array
    shuffle(team1);
    shuffle(team2);

    // Get the first half of each shuffled team
    const firsthalfTeam1 = team1.slice(0, Math.ceil(team1.length / 2));
    const firsthalfTeam2 = team2.slice(0, Math.ceil(team2.length / 2));

    // Combine all players to be swapped
    const toSwap = firsthalfTeam1.concat(firsthalfTeam2);

    // Iterate through the combined array and send the teamswap commands.
    for (const player of toSwap) {
      await this.server.rcon.switchTeam(player.eosID);
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
