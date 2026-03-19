# Phase 9 Integration Note

## 概要

UT-TASK06-007 のスクリプトは `apps/desktop/scripts/check-ipc-contracts.ts` として実装された。
Phase 9 では package script ではなく、`pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` を直接実行する診断手順として扱う。

## 実行コマンド

```bash
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only --format json
```

## 補足

- 現状は repo 全体に warning / error が残るため、blocking CI gate ではなく診断ツールとして運用する。
- 未解消の拡張課題は `unassigned-task/ut-task06-007-ext-001` 〜 `005` に分離済み。
