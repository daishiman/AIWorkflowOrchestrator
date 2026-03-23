# Phase 7: カバレッジ確認 — テスト期待値更新

## メタ情報

| 項目      | 値                                                                  |
| --------- | ------------------------------------------------------------------- |
| Phase番号 | 7                                                                   |
| 機能名    | test-update                                                         |
| タスクID  | TASK-LLM-MOD-04                                                     |
| 作成日    | 2026-03-23                                                          |
| 前Phase   | Phase 6: テスト拡充                                                 |
| 次Phase   | Phase 8: リファクタリング（基準充足） / Phase 6: テスト拡充（未達） |

## 目的

変更・追加したテストファイルのカバレッジが基準を満たしているかを計測し、未達の場合は Phase 6 へ戻る。

## 実行タスク

### Task 7-1: カバレッジ計測コマンド

```bash
# 必須: apps/desktop ディレクトリから実行（P40 対応）

# llm ハンドラーのカバレッジ
cd apps/desktop && pnpm vitest run --coverage src/main/handlers/__tests__/llm.test.ts

# Adapter 群のカバレッジ
cd apps/desktop && pnpm vitest run --coverage src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
cd apps/desktop && pnpm vitest run --coverage src/main/adapters/llm/__tests__/GoogleAdapter.test.ts

# 全体確認（時間がかかる場合はスキップして個別実行の結果で判断）
cd apps/desktop && pnpm vitest run --coverage src/main/
```

### Task 7-2: カバレッジ基準の確認

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

出典: `.claude/rules/02-code-quality.md`

### Task 7-3: 計測結果の記録

| ファイル                       | Line | Branch | Function | 判定 |
| ------------------------------ | ---- | ------ | -------- | ---- |
| llm ハンドラー（計測後に記入） | -    | -      | -        | -    |
| AnthropicAdapter               | -    | -      | -        | -    |
| GoogleAdapter                  | -    | -      | -        | -    |

### Task 7-4: 未達時の対処

基準未達のファイルが存在する場合:

1. 未達のブランチ・関数を特定する
2. Phase 6 へ戻り、テストを追加する
3. Phase 7 を再実行する

全ファイルが基準を満たした場合: Phase 8 へ進む。

## 参照資料

| 資料                                     | 用途                       |
| ---------------------------------------- | -------------------------- |
| `phase-6-test-expansion.md`              | Phase 6 での拡充内容       |
| `.claude/rules/02-code-quality.md`       | カバレッジ基準             |
| `.claude/rules/06-known-pitfalls.md#P40` | テスト実行ディレクトリ確認 |

## 統合テスト連携

カバレッジ計測を実行しながら全テストが PASS していることを同時に確認する。カバレッジは PASS していても基準未達の場合は Phase 6 へ戻る。

## 成果物

| 成果物                                           | パス                  |
| ------------------------------------------------ | --------------------- |
| カバレッジ計測結果（本ファイル Task 7-3 に記録） | `phase-7-coverage.md` |

## 完了条件

- [ ] 全対象ファイルのカバレッジ計測を実行した
- [ ] Task 7-3 の計測結果テーブルに実際の数値を記入した
- [ ] 全ファイルで Line 80% / Branch 60% / Function 80% の最低基準を達成している
- [ ] 基準未達のファイルがない（または未達箇所を未タスク化した）

## 次のPhase

- 全基準充足: Phase 8: リファクタリング (`phase-8-refactoring.md`)
- 基準未達: Phase 6: テスト拡充 (`phase-6-test-expansion.md`) へ戻る
