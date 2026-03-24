# advanced-console-safety-governance - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| タスクID     | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001                       |
| タスク名     | advanced-console-safety-governance                                    |
| 分類         | 設計                                                                  |
| 対象機能     | advanced console、approval、AI開示、manual boundary、compliance guard |
| 優先度       | 高                                                                    |
| 見積もり規模 | 中規模                                                                |
| ステータス   | spec_created                                                          |
| 作成日       | 2026-03-23                                                            |

## タスク概要

### 目的

`高度な表示` を raw terminal の detail layer として定義し、approval、AI 開示、外部送信開示、manual boundary を安全に成立させる。

### 背景

一般ユーザー向け front では shell を隠す必要がある一方、上級者には raw terminal の確認手段が必要である。また、Anthropic の利用条件と manual boundary を守るには、暗黙実行や consumer 認証の流用を防ぐ UI / runtime 契約が必要になる。

### 最終ゴール

approval sheet、AI 開示、外部送信開示、advanced console の露出条件が一つの safety contract として定義され、`端末で続ける` が規約違反や UX 断絶を起こさない設計を確定する。

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

| 参照資料               | パス                                                                                                            | 内容                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| root AI guide          | `docs/30-workflows/guided-execution-console-realization/00-ai-read-order.md`                                    | 親パックの入口と読順                                        |
| root index             | `docs/30-workflows/guided-execution-console-realization/index.md`                                               | 推奨実行順                                                  |
| root order map         | `docs/30-workflows/guided-execution-console-realization/execution-topology.md`                                  | 実行順マップとしての親Phase / 子task / 外部 task の順番整理 |
| root alignment         | `docs/30-workflows/guided-execution-console-realization/system-alignment-matrix.md`                             | 現行実装と周辺task の進め方                                 |
| root UX                | `docs/30-workflows/guided-execution-console-realization/ui-ux-realization.md`                                   | safety / compliance ルール                                  |
| root audit             | `docs/30-workflows/guided-execution-console-realization/design-audit-matrix.md`                                 | manual boundary と advanced layer の判断根拠                |
| canonical workflow     | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | manual boundary 正本                                        |
| IPC core               | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | IPC 契約                                                    |
| security core          | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`                               | secret 非露出                                               |
| runtime policy         | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`                                               | route authority                                             |
| skill creator facade   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                           | handoff bundle                                              |
| terminal IPC           | `apps/desktop/src/main/ipc/terminalHandlers.ts`                                                                 | external terminal 起動                                      |
| preload                | `apps/desktop/src/preload/index.ts`                                                                             | exposed API                                                 |
| Usage Policy           | `https://www.anthropic.com/legal/aup`                                                                           | acceptable use                                              |
| Commercial Terms       | `https://www.anthropic.com/legal/commercial-terms`                                                              | API / commercial terms                                      |
| Claude Code data usage | `https://code.claude.com/docs/en/data-usage`                                                                    | data handling                                               |
| Agent SDK permissions  | `https://platform.claude.com/docs/en/agent-sdk/permissions`                                                     | approval / permissions                                      |

## 受入基準（AC）

| ID   | 基準                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| AC-1 | approval sheet が危険操作と外部送信の承認面として定義されている                   |
| AC-2 | 各セッションの開始時に AI 利用と外部送信可能性を開示する契約が定義されている      |
| AC-3 | no auto-send、no hidden parsing、no consumer auth embedding が明記されている      |
| AC-4 | advanced console が opt-in detail layer であり、front の default surface ではない |

## 実行前の前提

- TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001
  - 入口の語彙と lane 表示が固まっていること
- TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001
  - session / artifact 面が見えてから safety を仕上げること
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

- approval 表示
- AI 開示と外部送信開示
- no auto-send enforcement
- advanced console opt-in の確認
