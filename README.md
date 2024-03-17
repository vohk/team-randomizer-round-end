## Team Randomizer End Round

This plugin is a modified version of the original Team Randomizer plugin for SquadJS. Rather than fire immediately, it queues the change for the END_ROUND event and broadcasts every 10 minutes about the upcoming change.

## Configuration

```json
{
  "plugin": "TeamRandomizerRoundEnd",
  "enabled": true,
  "command": "randomize"
  "interval": 10 * 6 * 1000
}
```

`command` and `interval` are optional.
