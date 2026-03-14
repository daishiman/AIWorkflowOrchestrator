# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 8                       |
| Phase名    | リファクタリング        |
| タスクID   | TASK-SKILL-LIFECYCLE-04 |
| ステータス | completed               |
| 前提Phase  | Phase 5, 6, 7           |
| 後続Phase  | Phase 9                 |

## 目的

評価ロジックと導線分岐の重複を削減し、責務境界を明確にする。

## 実行タスク

- タスク1: スコア算出ロジックの重複を抽出する。
- タスク2: ゲート判定ロジックを共通化する。
- タスク3: UI表示分岐の責務を整理する。
- タスク4: テストを維持したまま命名と構造を整理する。

## 参照資料

| 参照資料        | パス                                                                                                                                                                               | 目的                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 実装仕様        | `./phase-5-implementation.md`                                                                                                                                                      | 実装対象確認                   |
| カバレッジ報告  | `./phase-7-coverage-check.md`                                                                                                                                                      | 欠落観点確認                   |
| 実装パターン    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                                                                        | 再利用パターン確認             |
| 状態管理仕様    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                                       | 責務境界確認                   |
| 依存Phase成果物 | phase-1-requirements.md（Phase 1）, phase-2-design.md（Phase 2）, phase-5-implementation.md（Phase 5）, phase-6-test-expansion.md（Phase 6）, phase-7-coverage-check.md（Phase 7） | Phase 1/2/5/6/7 の成果物を参照 |

## 実行手順

1. 重複箇所を抽出し、共通化候補を決める。
2. 共通化後の依存関係を図示する。
3. リファクタ後に全テストを再実行する。
4. 差分を Phase 9 の品質監査へ引き渡す。

## 統合テスト連携

- 想定コマンド: `pnpm --filter @repo/desktop exec vitest run`
- 想定コマンド: `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`
- 目的: リファクタ後の回帰ゼロ確認。

## 多角的チェック観点（AIが判断）

- 共通化で責務境界が明確になったか。
- 可読性向上とテスト安定性が両立しているか。
- 仕様契約を破壊していないか。

## サブタスク管理

| SubAgent   | 責務           | 実行方式 | 出力                         |
| ---------- | -------------- | -------- | ---------------------------- |
| SubAgent-A | ロジック共通化 | 並列     | logic-refactor-log.md        |
| SubAgent-B | UI責務整理     | 並列     | ui-refactor-log.md           |
| SubAgent-C | 回帰検証       | 並列     | regression-validation-log.md |

## 成果物

| 成果物         | パス                                     | 内容                 |
| -------------- | ---------------------------------------- | -------------------- |
| リファクタ仕様 | `./phase-8-refactoring.md`               | リファクタ対象と方針 |
| リファクタ報告 | `outputs/phase-8/refactoring-summary.md` | 差分と回帰検証       |

## 完了条件

- [x] 重複ロジックが整理されている
- [x] 責務境界が明確になっている
- [x] テスト回帰がゼロである

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

## 次Phase

Phase 9（品質保証）で静的検証と品質ゲートを実施する。
