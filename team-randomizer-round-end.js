import BasePlugin from './base-plugin.js';

export default class TeamRandomizerRoundEnd extends BasePlugin {
  static get description() {
    return (
      "The <code>TeamRandomizerRoundEnd</code> randomizes teams at the end of round." +
      'It broadcasts warnings every 10 minutes by default. It can be run by typing,' +
      'by default, <code>!randomize</code> into in-game admin chat'
    );
  }

  static get defaultEnabled() {
    return true;
  }

  static get optionsSpecification() {
    return {
      command: {
        required: false,
        description: 'The command used to randomize the teams.',
        default: 'randomize'
      },
      interval: {
        required: false,
        description: 'Frequency of broadcasts in milliseconds.',
        default: 10 * 60 * 1000
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.onChatCommand = this.onChatCommand.bind(this);
    this.broadcast = this.broadcast.bind(this);
    this.onRoundEnd = this.onRoundEnd.bind(this);
  }

  // When the plugin is mounted, add event listeners for the trigger command and the round end event.
  async mount() {
    this.server.on(`CHAT_COMMAND:${this.options.command}`, this.onChatCommand);
    this.interval = setInterval(this.broadcast, this.options.interval);
  }

  // When the plugin is unmounted, clear the interval, remove the event listeners, and reset the stop flag.
  async unmount() {
    clearInterval(this.interval);
    this.server.removeEventListener(`CHAT_COMMAND:${this.options.command}`, this.onChatCommand);
    this.server.removeEventListener('ROUND_ENDED', this.onRoundEnd);
  }

  // When the trigger command is used in AdminChat, start listening for the round end event.
  async onChatCommand(info) {
    if (info.chat !== 'ChatAdmin') return;
    this.stop = false;

    await this.server.on("ROUND_ENDED", this.onRoundEnd);
    return;
  }
  
  // When the round ends, randomize teams and broadcast a message.
  async onRoundEnd(){
    this.stop = true;
    setTimeout(() => {
      this.stop = false;
    }, 30 * 1000);

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

    let team = '1';

    for (const player of players) {
      if (player.teamID !== team) await this.server.rcon.switchTeam(player.steamID);

      team = team === '1' ? '2' : '1';
    }
    this.server.rcon.broadcast("The teams have been scrambled!");
  }

  // Broadcast notice of the upcoming team scramble until the round ends.
  async broadcast() {
    if (this.stop) return;

    await this.server.rcon.broadcast("Teams will be scrambled at the end of this match!");
  }
}
