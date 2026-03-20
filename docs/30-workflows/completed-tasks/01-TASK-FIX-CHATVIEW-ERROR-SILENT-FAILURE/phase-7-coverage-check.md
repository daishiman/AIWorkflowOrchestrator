# Phase 7: カバレッジ確認

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 7                                       |
| 機能名    | ChatView エラーサイレント握りつぶし修正 |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE  |
| 作成日    | 2026-03-20                              |
| 前Phase   | `phase-6-test-expansion.md`             |

## 目的

Phase 6 のテスト拡充後にカバレッジ基準を達成しているかを確認する。未達の場合は Phase 6 に戻りテストを追加する。

## 実行タスク

- Task 1: Task 01 対象ファイルのカバレッジを再計測する。
- Task 2: 最低基準未達なら Phase 6 へ戻す。
- Task 3: 先行実装済みの Task 2〜4 用テストを Task 01 の指標へ混在させない。

### Task 1: カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/store/slices/chatSlice.ts \
  src/renderer/views/ChatView/index.tsx \
  src/renderer/store/index.ts
```

### Task 2: カバレッジ基準との照合

| 指標              | 最低基準 | 推奨基準 | 対象ファイル                                 |
| ----------------- | -------- | -------- | -------------------------------------------- |
| Line Coverage     | 80%      | 90%      | chatSlice.ts、ChatView/index.tsx             |
| Branch Coverage   | 60%      | 70%      | chatSlice.ts（エラー分岐）                   |
| Function Coverage | 80%      | 90%      | clearChatError、sendMessage、getErrorMessage |

### Task 3: 未達の場合の対応

カバレッジが最低基準（Line 80%、Branch 60%）を下回る場合は Phase 6 に戻る。

**戻る条件:**

- `chatSlice.ts` の Line Coverage が 80% 未満
- `chatSlice.ts` の Branch Coverage が 60% 未満（エラー分岐が未テスト）
- `ChatView/index.tsx` の Line Coverage が 80% 未満

## 参照資料

| 資料名                             | パス                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| Phase 5 実装                       | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-5-implementation.md` |
| Phase 6 テスト拡充                 | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-6-test-expansion.md` |
| コード品質ルール（カバレッジ基準） | `.claude/rules/02-code-quality.md`                                                      |

## 実行手順

### Step 1: カバレッジ計測実行

Task 1 のコマンドを実行してカバレッジレポートを取得する。

### Step 2: 基準照合

Task 2 の表に実測値を記入し、合否を判定する。

### Step 3: 判定結果の記録

本仕様書の完了条件チェックリストに実測値を記録する。

## 統合テスト連携

- `chatSlice.ts` / `ChatView/index.tsx` の 2 ファイルを主指標とし、Task 01 の silent failure 修正に必要な分岐だけで合否判定する。
- `store/index.ts` は `useChatError` / `useClearChatError` の selector 露出に伴う補助対象として扱う。
- Workspace 側テストは回帰観測のみで、Task 01 の coverage 合否へ算入しない。

## 成果物

| 成果物                       | パス                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| Phase 7 仕様書（本ファイル） | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-7-coverage-check.md` |

## 完了条件

- [ ] `chatSlice.ts` の Line Coverage が 80% 以上
- [ ] `chatSlice.ts` の Branch Coverage が 60% 以上
- [ ] `ChatView/index.tsx` の Line Coverage が 80% 以上
- [ ] カバレッジ未達の場合は Phase 6 へ戻り、テストを追加した
- [ ] 全テストが Green である

## 次Phase

カバレッジ基準を達成した場合: Phase 8: リファクタリング（`phase-8-refactoring.md`）
未達の場合: Phase 6 へ戻る
