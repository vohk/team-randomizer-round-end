## Team Randomizer End Round

This plugin is a modified version of the original Team Randomizer plugin for SquadJS. Rather than fire immediately, it queues the change for the END_ROUND event and broadcasts every 10 minutes about the upcoming change.

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

## To Do
* Replace the sorting algorithm with one that randomly selects half the players on each team and swaps them.
