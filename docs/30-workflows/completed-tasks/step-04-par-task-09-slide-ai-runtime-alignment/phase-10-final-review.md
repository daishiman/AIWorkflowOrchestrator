# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| Phase      | 10                                                                         |
| Phase名    | 最終レビュー                                                               |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001                                    |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 9（品質検証） |
| 後続Phase  | Phase 11（手動テスト）                                                     |
| ステータス | completed                                                                  |
| 作成日     | 2026-03-13                                                                 |
| 機能名     | slide-ai-runtime-alignment                                                 |

## 目的

Slide / Modifier / Legacy Agent 経路の runtime 整流 の release 可否を最終レビューする。Direct SDK 排除、Silent Fallback 排除、UI mode 整合、Cross-task 契約、IPC セキュリティの 5 観点で多角的に検証する。

## 実行タスク

- 最終レビュー実施: release blocker と戻り先を判断する

## レビュー観点（詳細）

| T-ID   | 観点                 | チェック項目                                                     | PASS 基準                                                                                               |
| ------ | -------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| T-10-1 | Direct SDK 排除      | slide 配下に `@anthropic-ai/sdk` import が存在しないこと         | `grep -rn "from.*@anthropic-ai/sdk" apps/desktop/src/main/slide/` の結果が 0 件                         |
| T-10-2 | Silent Fallback 排除 | env fallback / electron-store 直読みが存在しないこと             | `grep -rn "process\.env\.\|new Store\|new ElectronStore" apps/desktop/src/main/slide/` の結果が 0 件    |
| T-10-3 | UI mode 切替         | internal role が UI に露出していないこと                         | SlideWorkspace の CTA が user-facing テキストのみ。internal enum 値が表示されていない                   |
| T-10-4 | Cross-task 契約      | Task01 RuntimeResolver / access matrix と整合していること        | slide 経路が RuntimeResolver.resolve() を呼び出し、local 判定を独自実装していない                       |
| T-10-5 | IPC セキュリティ     | 全チャネルに validateIpcSender + P42 3段バリデーションがあること | 漏れ 0 件。`grep -c "validateIpcSender" apps/desktop/src/main/slide/ipc-handlers.ts` がチャネル数と一致 |
| T-10-6 | IPC チャネル名統一   | 現行チャネル名が正本仕様（api-ipc-system.md）と一致していること  | 4 チャネル全ての名称が正本と一致                                                                        |
| T-10-7 | DIP 準拠             | handler 登録関数の引数型がインターフェース（Port）であること     | 具象クラス依存が 0 件（P61 準拠）                                                                       |

## 多角的チェック観点

| 観点           | チェック内容                                                     | 関連 Pitfall / ルール             |
| -------------- | ---------------------------------------------------------------- | --------------------------------- |
| セキュリティ   | credential が Main Process 内で完結し、Renderer に漏洩しないこと | 04-electron-security.md           |
| セキュリティ   | error envelope が内部情報を漏洩しないこと                        | 04-electron-security.md           |
| アーキテクチャ | agent-client.ts が完全に廃止されていること                       | Phase 2 設計決定                  |
| 状態管理       | slideSlice の状態更新が SyncManager 経由のみであること           | 03-state-management.md            |
| UX             | guidance メッセージが user-facing であること                     | 01-architecture.md UI/UX 設計哲学 |
| 契約整合       | Task01 / Task03 との IPC 契約が一致していること                  | P44, P45                          |

## レビューゲート

最終レビュー の判定基準は .claude/skills/task-specification-creator/references/review-gate-criteria.md に従う。

| 判定     | 条件                         | 次のアクション                                             |
| -------- | ---------------------------- | ---------------------------------------------------------- |
| PASS     | 重大な問題がない             | Phase 11 に進む                                            |
| MINOR    | 軽微な指摘がある             | **全て未タスク仕様書に変換後** Phase 11 に進む（省略不可） |
| MAJOR    | 戻り先が必要な問題がある     | 下表の戻り先へ戻す                                         |
| CRITICAL | 要件再確認が必要な問題がある | Phase 1 へ戻して再確認する                                 |

| 問題の種類       | 戻り先                      |
| ---------------- | --------------------------- |
| 要件の問題       | Phase 1（要件定義）         |
| 設計の問題       | Phase 2（設計）             |
| テスト設計の問題 | Phase 4（テスト作成）       |
| 実装の問題       | Phase 5（実装）             |
| 品質の問題       | Phase 8（リファクタリング） |

> **MINOR 判定時の必須対応**: MINOR 指摘は「機能影響なし」であっても全て未タスク仕様書に変換する。省略は認められない（05-task-execution.md Phase 10 ルール）。

## 参照資料

| 参照資料             | パス                                                 | 内容                                                  |
| -------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Phase 1（要件定義）  | `phase-1-requirements.md`                            | 依存する前提成果物を確認する                          |
| Phase 2（設計）      | `phase-2-design.md`                                  | 依存する前提成果物を確認する                          |
| Phase 5（実装）      | `phase-5-implementation.md`                          | 依存する前提成果物を確認する                          |
| Phase 9（品質検証）  | `phase-9-quality-assurance.md`                       | 依存する前提成果物を確認する                          |
| slide skill-executor | `apps/desktop/src/main/slide/skill-executor.ts`      | slide skill execute の current path を確認する        |
| slide agent-client   | `apps/desktop/src/main/slide/agent-client.ts`        | legacy agent client の current path を確認する        |
| SlideWorkspace       | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | slide renderer surface と reverse-sync 導線を確認する |

### システム仕様（aiworkflow-requirements）

> 完全な canonical set は `index.md` を正本とし、この Phase では「最終判定に必要な根拠」だけを重点確認する。

| 参照資料                        | パス                                                                                            | 内容                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| workflow-ai-runtime-authmode    | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | foundation 契約、canonical set、artifact inventory の正本 |
| api-ipc-system                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | slide IPC 契約と rename 対象の正本                        |
| interfaces-auth                 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                          | capability / auth-mode DTO / status transport の正本      |
| llm-ipc-types                   | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                            | runtime health / auth-mode transport DTO の正本           |
| ui-ux-feature-components        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | guidance / error / CTA surface の最終照合元               |
| llm-workspace-chat-edit         | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                  | RuntimeResolver / guidance / handoff DTO の再利用元       |
| api-ipc-agent-core              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                       | `handoff` / `guidance` / `AUTHENTICATION_ERROR` transport |
| security-electron-ipc-core      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`               | validateIpcSender 順序、secret 非中継、auth-mode IPC 境界 |
| arch-state-management-reference | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference.md`          | handoffGuidance / stale state 防止 / dismiss 契約の正本   |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、対象範囲を固定する。

### ステップ2: T-10-1 から T-10-7 を順に検証する

各レビュー観点を grep コマンドと目視確認で検証し、結果を記録する。

### ステップ3: レビューゲート判定を行う

全 T-ID の結果に基づき、PASS / MINOR / MAJOR / CRITICAL を判定する。

### ステップ4: MINOR 指摘の未タスク変換を行う

MINOR 判定がある場合、全て未タスク仕様書に変換する（省略不可）。

### ステップ5: 成果物と完了条件を確認する

final-review-report.md に全 T-ID の結果とゲート判定を記録する。

## サブタスク管理

1. T-10-1: Direct SDK 排除の最終確認
2. T-10-2: Silent Fallback 排除の最終確認
3. T-10-3: UI mode 切替の最終確認
4. T-10-4: Cross-task 契約の最終確認
5. T-10-5: IPC セキュリティの最終確認
6. T-10-6: IPC チャネル名統一の最終確認
7. T-10-7: DIP 準拠の最終確認
8. レビューゲート判定と MINOR 未タスク変換
9. final-review-report.md の作成

## 統合テスト連携

reverse-sync、watcher、guidance、streaming feedback、sync status の release 可否を最終レビューする。

## 成果物

| 成果物           | パス                                      | 内容                               |
| ---------------- | ----------------------------------------- | ---------------------------------- |
| 最終レビュー報告 | `outputs/phase-10/final-review-report.md` | release blocker と戻り先を整理する |

## 完了条件

- [ ] T-10-1 から T-10-7 の全項目が検証済みである
- [ ] レビューゲート判定（PASS / MINOR / MAJOR / CRITICAL）が記録されている
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換済みである
- [ ] release blocker 0 件

## タスク100%実行確認【必須】

- [ ] 全 T-ID（T-10-1 から T-10-7）の検証結果が final-review-report.md に記録されている
- [ ] 各 grep コマンドの出力結果（件数）が記録されている
- [ ] レビューゲート判定が明示的に記録されている
- [ ] MINOR 判定時: 未タスク仕様書の作成パスが記録されている
- [ ] MAJOR/CRITICAL 判定時: 戻り先 Phase が明示されている
- [ ] system spec との整合確認が完了している
- [ ] 成果物パスにファイルが存在する

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md) に進む
