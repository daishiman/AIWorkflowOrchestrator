# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 9                                            |
| Phase名    | 品質検証                                     |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001      |
| 前提Phase  | Phase 5（実装）、Phase 8（リファクタリング） |
| 後続Phase  | Phase 10（最終レビュー）                     |
| ステータス | completed                                    |
| 作成日     | 2026-03-13                                   |
| 機能名     | slide-ai-runtime-alignment                   |

## 目的

Slide / Modifier / Legacy Agent 経路の runtime 整流 の品質を横断観点で確認する。Lint、TypeCheck、テスト、Direct SDK 排除、electron-store 排除、IPC セキュリティ、UX 整合を網羅的に検証する。

## 実行タスク

- T-9-1 Lint: ESLint エラー 0 件を確認する
- T-9-2 TypeCheck: TypeScript エラー 0 件を確認する
- T-9-3 Test: slide main / renderer テストを全 PASS にする
- T-9-4 Direct SDK 排除: `@anthropic-ai/sdk` 直 import を slide 配下から排除する
- T-9-5 electron-store 排除: slide 配下の独自 Store 生成を排除する
- T-9-6 validateIpcSender 適用: 全 slide IPC handler に sender 検証を適用する
- T-9-7 P42 3段バリデーション: 文字列引数の trim 空文字まで検証する
- T-9-8 UX 整合: guidance / error envelope / sync status の表示を揃える

| T-ID  | カテゴリ               | チェック項目                                                     | 確認コマンド / 方法                                                        |
| ----- | ---------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| T-9-1 | Lint                   | ESLint エラー 0 件                                               | `pnpm --filter @repo/desktop lint`                                         |
| T-9-2 | TypeCheck              | TypeScript エラー 0 件                                           | `pnpm --filter @repo/desktop typecheck`                                    |
| T-9-3 | Test                   | slide 関連テスト全 PASS                                          | `cd apps/desktop && pnpm vitest run src/main/slide/ src/renderer/slide/`   |
| T-9-4 | Direct SDK 排除        | `@anthropic-ai/sdk` が slide 配下に存在しないこと                | `grep -rn "from.*@anthropic-ai/sdk" apps/desktop/src/main/slide/`          |
| T-9-5 | electron-store 排除    | slide 配下に独自 Store インスタンスがないこと                    | `grep -rn "new Store\|new ElectronStore" apps/desktop/src/main/slide/`     |
| T-9-6 | validateIpcSender 適用 | 全 slide IPC handler に sender 検証があること                    | `grep -rn "validateIpcSender" apps/desktop/src/main/slide/ipc-handlers.ts` |
| T-9-7 | P42 3段バリデーション  | 全文字列引数に `.trim() === ""` チェックがあること               | `grep -rn "\.trim()" apps/desktop/src/main/slide/ipc-handlers.ts`          |
| T-9-8 | UX 整合                | guidance / error envelope / sync status の表示が一貫していること | 手動確認（Phase 11 で詳細実施）                                            |

## 多角的チェック観点

| 観点           | チェック内容                                                                 | 関連 Pitfall / ルール   |
| -------------- | ---------------------------------------------------------------------------- | ----------------------- |
| セキュリティ   | validateIpcSender が全 handler に適用されていること                          | 04-electron-security.md |
| セキュリティ   | パストラバーサル検出が実装されていること                                     | P42                     |
| アーキテクチャ | Direct SDK / electron-store 直読み / env fallback が排除されていること       | Phase 2 設計決定        |
| 型安全         | any 型が slide 配下に存在しないこと                                          | 02-code-quality.md      |
| テスト         | カバレッジ基準（Line 80%、Branch 60%、Function 80%）を満たしていること       | 02-code-quality.md      |
| UX             | error envelope が user-facing メッセージのみを含み、内部情報を漏洩しないこと | 04-electron-security.md |

## 参照資料

| 参照資料                    | パス                                                 | 内容                                                  |
| --------------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Phase 5（実装）             | `phase-5-implementation.md`                          | 依存する前提成果物を確認する                          |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                             | 依存する前提成果物を確認する                          |
| slide skill-executor        | `apps/desktop/src/main/slide/skill-executor.ts`      | slide skill execute の current path を確認する        |
| slide agent-client          | `apps/desktop/src/main/slide/agent-client.ts`        | legacy agent client の current path を確認する        |
| SlideWorkspace              | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | slide renderer surface と reverse-sync 導線を確認する |

### システム仕様（aiworkflow-requirements）

> 完全な canonical set は `index.md` を正本とし、この Phase では「品質ゲート判定に使う根拠」だけを重点確認する。

| 参照資料                        | パス                                                                                   | 内容                                                      |
| ------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| api-ipc-system                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                  | slide IPC 契約と rename 対象の正本                        |
| interfaces-auth                 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                 | auth-mode / capability transport の正本                   |
| interfaces-agent-sdk-executor   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`   | execute 契約と error code の正本                          |
| llm-workspace-chat-edit         | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`         | RuntimeResolver / guidance / handoff DTO の再利用元       |
| api-ipc-agent-core              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`              | `handoff` / `guidance` / `AUTHENTICATION_ERROR` transport |
| security-electron-ipc-core      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`      | validateIpcSender 順序、secret 非中継、auth-mode IPC 境界 |
| arch-state-management-reference | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference.md` | stale handoff state / dismiss 契約の正本                  |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、対象範囲を固定する。

### ステップ2: T-9-1 Lint チェックを実行する

`pnpm --filter @repo/desktop lint` を実行し、エラー 0 件を確認する。

### ステップ3: T-9-2 TypeCheck を実行する

`pnpm --filter @repo/desktop typecheck` を実行し、エラー 0 件を確認する。

### ステップ4: T-9-3 テストを実行する

`cd apps/desktop && pnpm vitest run src/main/slide/ src/renderer/slide/` を実行し、全テスト PASS を確認する。

### ステップ5: T-9-4 から T-9-7 の排除確認を実行する

grep コマンドで Direct SDK、electron-store、validateIpcSender、P42 3段バリデーションの適用状況を確認する。

### ステップ6: T-9-8 UX 整合を確認する

guidance / error envelope / sync status の表示一貫性を確認する（詳細は Phase 11 で実施）。

### ステップ7: 成果物と完了条件を確認する

qa-checklist.md に全 T-ID の結果を記録し、品質 blocker の有無を判定する。

## サブタスク管理

1. T-9-1: ESLint 実行と結果記録
2. T-9-2: TypeScript 型チェック実行と結果記録
3. T-9-3: Vitest 実行と結果記録
4. T-9-4: Direct SDK 排除確認と結果記録
5. T-9-5: electron-store 排除確認と結果記録
6. T-9-6: validateIpcSender 適用確認と結果記録
7. T-9-7: P42 3段バリデーション確認と結果記録
8. T-9-8: UX 整合の予備確認と記録
9. qa-checklist.md の作成と全 T-ID 結果統合

## 統合テスト連携

reverse-sync、watcher、guidance、streaming feedback、sync status の品質観点を横断確認する。

## 成果物

| 成果物             | パス                              | 内容                                           |
| ------------------ | --------------------------------- | ---------------------------------------------- |
| 品質チェックリスト | `outputs/phase-9/qa-checklist.md` | セキュリティ、UX、契約整合の確認項目をまとめる |

## 完了条件

- [ ] T-9-1: ESLint エラー 0 件
- [ ] T-9-2: TypeScript エラー 0 件
- [ ] T-9-3: slide 関連テスト全 PASS
- [ ] T-9-4: `@anthropic-ai/sdk` import が slide 配下に 0 件
- [ ] T-9-5: electron-store 独自インスタンスが slide 配下に 0 件
- [ ] T-9-6: 全 slide IPC handler に validateIpcSender が適用されている
- [ ] T-9-7: 全文字列引数に P42 3段バリデーションが適用されている
- [ ] T-9-8: UX 整合に blocker がない
- [ ] 品質 blocker 0 件

## タスク100%実行確認【必須】

- [ ] 全 T-ID（T-9-1 から T-9-8）の実行結果が qa-checklist.md に記録されている
- [ ] 各 grep コマンドの出力結果（件数）が記録されている
- [ ] blocker が検出された場合、Phase 8 への差し戻し判断が記録されている
- [ ] system spec との整合確認が完了している
- [ ] 成果物パスにファイルが存在する

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
