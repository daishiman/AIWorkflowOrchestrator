# Change Summary

## Summary

- Task07 index を upstream / downstream / change point まで追える粒度へ拡張した
- Phase 1-13 を governance bundle task として全面更新した
- outputs 群を追加し、route / approval / disclosure / handoff / docs sync の補助資料をそろえた

## Key Decisions

1. `integrated_api` を primary、`terminal_handoff` を secondary として固定する
2. consumer auth token を API key として流用しない
3. shared `HandoffGuidance` / approval / disclosure surface を再利用する
4. Task08 には route state と manual boundary 前提だけを渡す
