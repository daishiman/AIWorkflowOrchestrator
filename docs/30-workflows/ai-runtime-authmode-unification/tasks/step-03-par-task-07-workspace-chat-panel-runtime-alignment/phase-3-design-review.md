# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 3                                            |
| Phase名    | 設計レビュー                                 |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）         |
| 後続Phase  | Phase 4（テスト作成）                        |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 機能名     | workspace-chat-panel-runtime-alignment       |

## 目的

Workspace Chat Panel の同期設計が矛盾なく流用できるか確認する。

## 実行タスク

- レビュー実施: レビュー観点に沿って PASS、MINOR、MAJOR の判定根拠を整理する

## レビュー観点

- streaming と file context の責務が混線していないか
- cancel 時に stale content や誤完了表示が残らないか
- selected config と access capability の判定順が UI と矛盾しないか
- `subscription` 未対応時の guidance と fail-fast が不足していないか

## レビューゲート

設計レビュー の判定基準は .claude/skills/task-specification-creator/references/review-gate-criteria.md に従う。

| 判定  | 条件                     | 次のアクション         |
| ----- | ------------------------ | ---------------------- |
| PASS  | 重大な問題がない         | Phase 4 に進む         |
| MINOR | 軽微な指摘がある         | 指摘を記録して次へ進む |
| MAJOR | 戻り先が必要な問題がある | 下表の戻り先へ戻す     |

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

## 参照資料

| 参照資料                   | パス                                                                                | 内容                                                              |
| -------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Phase 1（要件定義）        | `phase-1-requirements.md`                                                           | 依存する前提成果物を確認する                                      |
| Phase 2（設計）            | `phase-2-design.md`                                                                 | 依存する前提成果物を確認する                                      |
| WorkspaceChatPanel         | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | workspace chat UI surface を確認する                              |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | stream / selected config / file context handoff を確認する        |
| llm handlers               | `apps/desktop/src/main/handlers/llm.ts`                                             | `llm:stream-chat` / cancel / selected config authority を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                 | パス                                                                            | 内容                                  |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------- |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | workspace chat と conversation の正本 |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`            | stream chat / cancel 契約の正本       |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Workspace Chat Panel UI の正本        |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | selected files / state handoff の正本 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Workspace Chat Panel の runtime / access capability 同期 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

設計レビュー の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

stream、cancel、selected files、mention、conversation、access capability、selected config の設計が Phase 1 と Phase 2 に整合するかをレビューする。

## 成果物

| 成果物           | パス                                      | 内容                                    |
| ---------------- | ----------------------------------------- | --------------------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | PASS、MINOR、MAJOR の判定根拠を記録する |

## 完了条件

- [ ] MAJOR 指摘 0 件
- [ ] Task01 契約との矛盾がない

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む
