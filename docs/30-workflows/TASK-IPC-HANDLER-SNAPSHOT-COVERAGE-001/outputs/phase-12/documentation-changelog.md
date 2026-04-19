# Documentation Changelog

## 更新日時

- 2026-04-19

## 更新ファイル

- `apps/desktop/src/main/ipc/__tests__/llmHandlers.registrationSnapshot.test.ts`
- `apps/desktop/src/main/ipc/__tests__/__snapshots__/llmHandlers.registrationSnapshot.test.ts.snap`
- `docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/outputs/phase-1/handler-inventory.md`
- `docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/outputs/phase-1/existing-test-map.md`
- `docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/outputs/phase-2/wave-plan.md`
- `docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/outputs/phase-4/` 以降の成果物群

## Step 1 / Step 2

- Step 1: 実施
- Step 2: 未実施（仕様契約変更なし）

## validator / verify / link check

| 項目                | 結果                  |
| ------------------- | --------------------- |
| vitest 起動         | workaround 付きで成功 |
| link check          | 手動参照で整合確認    |
| artifacts.json 整合 | ファイル名一致を確認  |

## 実行メモ

```text
ESBUILD_BINARY_PATH を 0.21.5 binary に固定すると 2 files / 11 tests passed
デフォルト実行では esbuild mismatch が残る
```

## Phase 10 MINOR/HIGH/MAJOR 追跡

- `registerChatExportHandlers` 欠落を母集団へ反映
- `REG-COUNT-LLM-01` を `6` に修正
- Wave 1 未完了、環境不整合は継続課題
