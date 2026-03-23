# session-dock-artifact-bridge - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| タスクID     | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001                     |
| タスク名     | session-dock-artifact-bridge                                  |
| 分類         | 設計                                                          |
| 対象機能     | session dock、transcript、artifact-first result、manual share |
| 優先度       | 高                                                            |
| 見積もり規模 | 中規模                                                        |
| ステータス   | spec_created                                                  |
| 作成日       | 2026-03-23                                                    |

## タスク概要

### 目的

`実行コンソール` の中核となる session surface を定義し、dock、transcript persistence、artifact summary、manual share を一つの実行体験としてまとめる。

### 背景

現状は transcript persistence が未実装で、dock を閉じると文脈が消える。さらに成果物よりログが前に出やすく、manual share / provenance も user-first に整理されていない。

### 最終ゴール

session を閉じても再開でき、結果は artifact-first で見え、transcript は明示操作で chat に共有できる設計を確定する。

## AI向け最小読順

この task ディレクトリだけを AI に渡す場合でも、次の順で読む。

1. この `index.md`
2. `../../00-ai-read-order.md`
3. `../../index.md`
4. `./phase-1-requirements.md` 〜 `./phase-3-design-review.md`

必要に応じて次を追加する。

- `../../ui-ux-realization.md`
- `../../execution-topology.md`
- `../../system-alignment-matrix.md`

## 参照ファイル

| 参照資料             | パス                                                                                     | 内容                                                        |
| -------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| root AI guide        | `docs/30-workflows/guided-execution-console-realization/00-ai-read-order.md`             | 親パックの入口と読順                                        |
| root index           | `docs/30-workflows/guided-execution-console-realization/index.md`                        | 推奨実行順                                                  |
| root order map       | `docs/30-workflows/guided-execution-console-realization/execution-topology.md`           | 実行順マップとしての親Phase / 子task / 外部 task の順番整理 |
| root alignment       | `docs/30-workflows/guided-execution-console-realization/system-alignment-matrix.md`      | 現行実装と周辺task の進め方                                 |
| root UX              | `docs/30-workflows/guided-execution-console-realization/ui-ux-realization.md`            | dock / artifact / share 契約                                |
| root audit           | `docs/30-workflows/guided-execution-console-realization/design-audit-matrix.md`          | session / share / advanced layer の判断根拠                 |
| agent execution core | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md`        | transcript / provenance 正本                                |
| existing UX pack     | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md` | terminal dock / share 契約                                  |
| existing diagrams    | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md`    | dock state 図解                                             |
| unassigned           | `docs/30-workflows/unassigned-task/UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001.md`          | persistence GAP                                             |
| unassigned           | `docs/30-workflows/unassigned-task/UT-TERMINAL-DOCK-ABORTED-STATE-001.md`                | aborted state GAP                                           |
| ChatPanel handoff    | `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`                             | current handoff UI                                          |
| launcher             | `apps/desktop/src/renderer/components/chat/PersistentTerminalLauncher.tsx`               | current launcher UI                                         |
| state slice          | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                   | handoffGuidance / state                                     |
| preload              | `apps/desktop/src/preload/index.ts`                                                      | `claudeCliAPI` exposure                                     |
| phase11 harness      | `apps/desktop/src/renderer/phase11-terminal-surface.tsx`                                 | current terminal surface sample                             |

## 受入基準（AC）

| ID   | 基準                                                                                          |
| ---- | --------------------------------------------------------------------------------------------- |
| AC-1 | dock state が `collapsed / ready / running / done / aborted / unavailable` まで定義されている |
| AC-2 | session persistence、session ID、reopen restore の方針が定義されている                        |
| AC-3 | transcript share は手動3操作と provenance chip を前提に定義されている                         |
| AC-4 | 実行後の primary surface が raw log ではなく artifact summary になっている                    |

## 実行前の前提

- TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001
  - 入口と surface 名称が固まってから session 面を設計する
- `../../00-ai-read-order.md` に従う親パック読順

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

- session open / close / reopen
- transcript restore
- manual share with provenance
- artifact summary and error summary
