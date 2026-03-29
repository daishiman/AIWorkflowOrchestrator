# Manual Test Checklist

## Evidence Mode

- `NON_VISUAL`
- reason: runtime bug-fix task であり、画面差分ではなく IPC response と log を主証跡にする

## Checklist

- `ANTHROPIC_API_KEY` 未設定で `LLM_ADAPTER_FAILED` が返る
- `error` に actionable message が含まれる
- `adapterStatus` が `failed` / `ready` / `initializing` のいずれかで返る
- 空 stub が返らない
