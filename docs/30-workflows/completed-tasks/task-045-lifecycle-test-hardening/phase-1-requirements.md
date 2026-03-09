# Phase 1: 要件定義 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| タスクID   | TASK-10A-G                       |
| Phase      | 1 - 要件定義                     |
| 実行モード | verification-and-gap-fill（P50） |
| 次Phase    | Phase 2（設計）                  |

## 目的

既存の Renderer / Store テスト群を棚卸しし、`TASK-10A-F` から引き渡された RT-01〜RT-07 を **どの既存 suite で守るか** を定義する。

## Step 0: 既存実装監査

| 観点                | 監査結果                                                                                                 | 根拠                                                                                                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 既存 test suite     | 6ファイルが既に存在する                                                                                  | `SkillCreateWizard.test.tsx`, `SkillAnalysisView.test.tsx`, `useSkillAnalysis.test.ts`, `SkillManagementPanel.integration.test.tsx`, `agentSlice.skill-lifecycle.test.ts`, `ChatPanel.skill-management.test.tsx` |
| 旧draftの新規成果物 | `skillHandlers.create.test.ts` と `SkillLifecycle.integration.test.tsx` は存在せず、引き渡し元にも未定義 | 本ワークツリー監査                                                                                                                                                                                               |
| 後続未タスク        | `TASK-10A-G-SKILLEDITOR-FILEOPS-STORE-MIGRATION` は別管理済み                                            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                             |
| 検証環境            | `typecheck` は通るが `vitest` は Rollup optional dependency 欠落で起動失敗し得る                         | 2026-03-09 監査                                                                                                                                                                                                  |

## 要件一覧

### REQ-01: 差分スコープの固定

- 既存 test suite への追記・修正を優先し、新規 test file は客観的不足が確認された場合のみ許可する。
- Main IPC `skill:create` の新規契約テストは本タスクの既定スコープに含めない。

### REQ-02: create / list / view 往復の回帰保護

- RT-01 作成後一覧同期
- RT-05 ビュー再開時の状態初期化
- create view / analysis view から list view に戻る導線の維持

### REQ-03: analyze / improve / recovery の回帰保護

- RT-02 改善後再分析
- RT-03 全自動改善後再分析
- RT-04 エラー回復
- RT-06 analyze → improve → reanalyze の一貫性
- RT-07 `isAnalyzing` / `isImproving` 中の排他制御

### REQ-04: ChatPanel 起点の回帰保護

- `skill-management-toggle` の表示・開閉・`isExecuting` 連動を維持する。
- 上位導線の回帰確認に留め、ChatPanel から直接 analyze / improve の統合テストを新設しない。

### REQ-05: 品質ゲートと環境 preflight

- `pnpm --filter @repo/desktop typecheck` を必須とする。
- `vitest` 実行前に Rollup optional dependency の存在確認を行う。
- 本タスクではコミット / PR を勝手に行わない。

## 受入基準

- [x] 既存 suite 棚卸し結果が記録されている
- [x] RT-01〜RT-07 が REQ-02 / 03 / 04 に分解されている
- [x] `TASK-10A-G-SKILLEDITOR-FILEOPS-STORE-MIGRATION` をスコープ外として分離している
- [x] `vitest` 起動前 preflight が定義されている
- [x] コミット / PR 禁止が明記されている

## 完了条件

- [x] Step 0 監査結果（既存 suite / backlog / 環境）を記録した
- [x] REQ-01〜REQ-05 を確定し、RT-01〜RT-07 の対応方針を固定した
- [x] スコープ外（Main IPC 新規契約、SkillEditor backlog 先行着手、コミット / PR）を明記した

## 参照資料

| 参照資料           | パス                                                                                                     | 用途                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| quick-reference    | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                      | 入口確認                                                |
| 状態管理仕様       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                             | RT-01〜RT-07 の根拠                                     |
| UI仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                          | View 契約確認                                           |
| Skill実行I/F仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                        | `analyzeSkill` / `improveSkill` / `executeSkill` の契約 |
| IPC契約仕様        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                     | skill系 IPC の戻り値・失敗契約                          |
| Agent実行UI仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                             | 実行中排他制御の UI 契約                                |
| SkillStream UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md`                        | ChatPanel 実行中表示契約                                |
| テストパターン     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                        | 既存 suite 拡張方針                                     |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                              | gate 基準                                               |
| 引き渡し元         | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`                          | RT-01〜RT-07                                            |
| 品質ゲート引き渡し | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-043d-test-quality-gate-design.md` | unit / integration / regression の分類                  |

## スコープ外

- 新規 IPC チャンネル追加
- Main Process サービス実装
- `SkillEditor.tsx` の direct IPC 移行
- コミット、PR、`/ai:diff-to-pr`

## テンプレート準拠追補

## 実行タスク

- T1: P50 前提の既存 suite / handoff / backlog を棚卸しする
- T2: RT-01〜RT-07 を要件へ再分解する
- T3: 非スコープと user 制約を固定する

## 実行手順

1. Step 0 監査で既存 file・環境 blocker・別 backlog を確認する
2. REQ-01〜REQ-05 と受入基準を確定する
3. Phase 2 に渡す suite 割当条件と禁止事項を明文化する

## 統合テスト連携

| 連携面 | 内容                                                         |
| ------ | ------------------------------------------------------------ |
| G1     | create/list/view 往復の回帰対象を Phase 2 へ引き渡す         |
| G2     | analyze/improve/recovery/排他制御の要件を Phase 2 へ引き渡す |
| G3     | ChatPanel 回帰と品質ゲート連携を Phase 2 へ引き渡す          |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                              |
| ------------------ | ---- | ----------------------------------------------------- |
| アーキテクチャ     | ✅   | Renderer / Store / backlog の境界を混ぜない           |
| UI/UX              | ✅   | create / analysis / chat の view 契約だけを要件化する |
| エラーハンドリング | ✅   | `vitest` 起動失敗を環境 blocker として扱う            |
| セキュリティ       | △    | 新規 IPC や direct IPC 再導入を要件化しない           |

## 成果物

| 成果物     | パス                      | 説明                                |
| ---------- | ------------------------- | ----------------------------------- |
| 要件定義書 | `phase-1-requirements.md` | P50 判定、REQ、受入基準、非スコープ |
| タスク概要 | `index.md`                | task-045 全体の正本入口             |

## サブタスク管理

1. 参照資料確認
2. P50 / backlog / 環境監査
3. REQ / 受入基準 / 非スコープ確定
4. Phase 2 への handoff 事項整理

## タスク100%実行確認

- [x] P50 判定と既存 suite 棚卸しを完了した
- [x] REQ-01〜REQ-05 と受入基準を確定した
- [x] backlog 重複起票防止と no-PR 制約を明記した

## 次のPhase

Phase 2（設計）
