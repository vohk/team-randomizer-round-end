## Team Randomizer End Round
This plugin is a modified version of the original Team Randomizer plugin for SquadJS:
```diff
- A true random shuffle of all players on the server, anywhere from nobody to everybody.
+ Randomly selects half (rounded up) of each team, and swaps them.

- Fires immediately.
+ Queues the swaps for the end of the match, and broadcasts regular notice.
```
## Configuration
```json
{
  "plugin": "TeamRandomizerRoundEnd",
  "enabled": true,
  "command": "randomize",
  "interval": 600000
}
```
`command` and `interval` are optional. The default warning broadcast interval is 10 minutes.
