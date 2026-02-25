# Phase 4 検証コマンド集

## 実行コマンド

```bash
# TC-01
rg -n '^[[:space:]]+[A-Z0-9_]+:\s*"[a-zA-Z0-9:-]+"' apps/desktop/src/preload/channels.ts | wc -l

# TC-02
rg -o '"[a-zA-Z0-9:-]+"' apps/desktop/src/preload/channels.ts | sort | uniq -d | wc -l

# TC-03
rg -n 'skill:' apps/desktop/src/preload/channels.ts | wc -l

# TC-04
rg -n 'FromSource' apps/desktop/src/preload/channels.ts | wc -l

# TC-05
rg -n 'skill:[a-zA-Z0-9]*Source' apps/desktop/src/preload/channels.ts | wc -l

# TC-06A
rg -n 'ipcMain\.handle\(' apps/desktop/src/main --glob '!**/*.test.*' --glob '!**/__tests__/**' | wc -l

# TC-06B（重複式可視化）
jq -r '.duplicateHandlers[] | "\(.expr)\t\(.count)"' /tmp/ut-ipc-usage-analysis.json

# TC-07
rg -n 'IPC_CHANNELS\.|skill:' apps/desktop/src/preload --glob '!**/*.test.*' | wc -l

# TC-08
rg -n 'skill:' apps/desktop/src/renderer --glob '!**/*.test.*' | wc -l
```

## 2026-02-25 実測

- TC-01: 203
- TC-02: 0
- TC-03: 26
- TC-04: 0
- TC-05: 0
- TC-06A: 176
- TC-06B: `AUTH_*` で重複式5件（Skill重複0件）
- TC-07: 402
- TC-08: 16
