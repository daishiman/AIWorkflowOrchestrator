# guided-execution-shell-foundation - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001               |
| タスク名     | guided-execution-shell-foundation                            |
| 機能名       | guided-execution-shell-foundation                            |
| 分類         | 設計                                                         |
| 対象機能     | 実行コンソールの名称、route、shared launcher、mainline entry |
| 優先度       | 高                                                           |
| 見積もり規模 | 中規模                                                       |
| ステータス   | spec_created                                                 |
| 作成日       | 2026-03-23                                                   |

## タスク概要

### 目的

一般ユーザーが最初に触れる入口を `実行コンソール` に統一し、route / label / CTA を drift なく扱える foundation を定義する。

### 背景

現状は `terminal` view が不在で、Chat / Workspace guidance の CTA が未配線、`agent` への代替遷移が残っている。front naming も `terminal` 寄りのため、初心者には目的が伝わりにくい。

### 最終ゴール

`openExecutionConsole()` を source of truth にし、App Shell / Chat / Workspace / Skill Creator が同じ label と同じ挙動で `実行コンソール` を開く設計を確定する。

## AI向け最小読順

この task ディレクトリだけを AI に渡す場合でも、次の順で読む。

1. この `index.md`
2. `../guided-execution-console-realization/00-ai-read-order.md`
3. `../guided-execution-console-realization/index.md`
4. `./phase-1-requirements.md` 〜 `./phase-3-design-review.md`

必要に応じて次を追加する。

- `../guided-execution-console-realization/ui-ux-realization.md`
- `../guided-execution-console-realization/execution-topology.md`
- `../guided-execution-console-realization/system-alignment-matrix.md`

## 参照ファイル

| 参照資料        | パス                                                                                    | 内容                                                        |
| --------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| root AI guide   | `docs/30-workflows/guided-execution-console-realization/00-ai-read-order.md`            | 親パックの入口と読順                                        |
| root index      | `docs/30-workflows/guided-execution-console-realization/index.md`                       | task 分離と推奨実行順                                       |
| root order map  | `docs/30-workflows/guided-execution-console-realization/execution-topology.md`          | 実行順マップとしての親Phase / 子task / 外部 task の順番整理 |
| root alignment  | `docs/30-workflows/guided-execution-console-realization/system-alignment-matrix.md`     | 現行実装と周辺task の進め方                                 |
| root UX         | `docs/30-workflows/guided-execution-console-realization/ui-ux-realization.md`           | naming と CTA 契約                                          |
| root audit      | `docs/30-workflows/guided-execution-console-realization/design-audit-matrix.md`         | front naming と責務分離の判断根拠                           |
| navigation 正本 | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                 | `ViewType` / route 契約                                     |
| state core      | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`       | surface ownership                                           |
| ChatPanel       | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                               | current fallback                                            |
| App             | `apps/desktop/src/renderer/App.tsx`                                                     | view routing                                                |
| store types     | `apps/desktop/src/renderer/store/types.ts`                                              | `ViewType` 現状                                             |
| guidance banner | `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`                        | secondary CTA 未配線                                        |
| workspace panel | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`                  | guidance action dispatch                                    |
| runtime access  | `apps/desktop/src/renderer/utils/runtimeAccess.ts`                                      | launcher helper                                             |
| unassigned      | `docs/30-workflows/unassigned-task/ut-viewtype-terminal-addition.md`                    | terminal view GAP                                           |
| unassigned      | `docs/30-workflows/unassigned-task/UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001.md` | CTA wiring GAP                                              |

## 受入基準（AC）

| ID   | 基準                                                                                       |
| ---- | ------------------------------------------------------------------------------------------ |
| AC-1 | front の primary label が `実行コンソール` 系へ統一されている                              |
| AC-2 | `ViewType` / route / shared action の正本が定義されている                                  |
| AC-3 | App Shell / Chat / Workspace / Skill Creator の CTA が同一ラベル・同一挙動で設計されている |
| AC-4 | `agent` 代替や no-op CTA の除去方針が明記されている                                        |

## 実行前の前提

- root Phase 1-3
  - pack 全体の目的と入口の語彙を先に固定する
- `../guided-execution-console-realization/00-ai-read-order.md` に従う親パック読順

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス   |
| ----- | ---------------- | -------------------------------------------------------------- | ------------ |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | spec_created |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | spec_created |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | spec_created |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | spec_created |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | spec_created |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | spec_created |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | spec_created |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | spec_created |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | spec_created |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | spec_created |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | spec_created |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | spec_created |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked      |

## 統合テスト連携

- route owner
- shared action dispatch
- App Shell / Chat / Workspace / Skill Creator の CTA 表示
- no-op / silent fallback が存在しないこと

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する
- `artifacts.json` と phase 本文の成果物名を一致させる
- Phase 13 はユーザー明示指示があるまで blocked のまま維持する
