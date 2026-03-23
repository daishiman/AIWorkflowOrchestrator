# Phase 12: 未タスク検出

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 12                                                    |
| 作成日   | 2026-03-23                                            |
| 検出件数 | 5件                                                   |

## 検出結果

| ID                                     | タイトル                            | 優先度 | 依存条件                        |
| -------------------------------------- | ----------------------------------- | ------ | ------------------------------- |
| UT-SLIDE-IMPL-001                      | Modifier / agent-client 実装        | HIGH   | Task08 完了                     |
| UT-SLIDE-UI-001                        | SlideWorkspace UI 4領域実装         | HIGH   | UT-SLIDE-IMPL-001 完了          |
| UT-SLIDE-P31-001                       | P31/P48 無限ループ対策実装          | MEDIUM | UT-SLIDE-UI-001 と同時または後  |
| UT-SLIDE-HANDOFF-DUP-001               | terminal handoff 重複解消           | MEDIUM | Task05 完了 + cleanup 順序9     |
| Task09 follow-up（IPC namespace 統一） | slide:sync:\* legacy channel の統一 | MEDIUM | UT-SLIDE-IMPL-001 完了 + Task09 |

---

## 未タスク詳細

### UT-SLIDE-IMPL-001: Modifier / agent-client 実装

| 項目         | 内容                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| タイトル     | Slide Modifier / agent-client の integrated lane 実装                                                         |
| 概要         | ModifierResponse 拡張（fallback_reason, suggested_action optional）と agent-client.ts の Agent SDK adapter 化 |
| 担当理由     | Task08 設計タスクで確定した型定義・cleanup 順序の実装                                                         |
| 主要ファイル | modifier-skill.ts, agent-client.ts, skill-executor.ts                                                         |
| MN-01 対応   | SlideCapabilityDTO の IPC channel 名（slide:capability:get 仮）を Phase 5 で確定する                          |
| P42 要件     | IPC バリデーション3段（型 → 空文字 → trim）を必ず実装する                                                     |
| 依存         | Task08 完了（本タスク完了）                                                                                   |
| Gate 条件    | cleanup 順序1,2（Task08 完了）が充足されていること                                                            |
| 指示書パス   | `docs/30-workflows/unassigned-task/UT-SLIDE-IMPL-001.md`                                                      |

### UT-SLIDE-UI-001: SlideWorkspace UI 4領域実装

| 項目         | 内容                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- |
| タイトル     | SlideWorkspace の UI 4領域（progress row / guidance block / fallback card / terminal launcher）実装 |
| 概要         | contract-matrix.md の表示マトリクスに基づいた UI 実装。UX-07 TC-ID 5件の screenshot 撮影まで含む    |
| 担当理由     | Task08 設計タスクで確定した UI 4領域の contract を実装する                                          |
| 主要ファイル | SlideWorkspace.tsx, slideStore.ts                                                                   |
| P31/P48 要件 | 個別セレクタ（useSlideUIStatus, useSlideLane 等）を使用し、useShallow を派生セレクタに適用          |
| screenshot   | screenshot-plan.json の5件（UX-07-S01〜S05）を実施する                                              |
| 依存         | UT-SLIDE-IMPL-001 完了（cleanup 順序4）                                                             |
| Gate 条件    | cleanup 順序3（ModifierResponse 実装）が完了していること                                            |
| 指示書パス   | `docs/30-workflows/unassigned-task/UT-SLIDE-UI-001.md`                                              |

### UT-SLIDE-P31-001: P31/P48 無限ループ対策実装

| 項目         | 内容                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------- |
| タイトル     | SlideWorkspace Zustand Hook の P31/P48 無限ループ対策                                         |
| 概要         | slideSettingsStore の合成 Hook を個別セレクタに分解し、派生セレクタには useShallow を適用する |
| 担当理由     | cleanup 順序8（UI 4領域反映と同時またはその直後）として定義済み                               |
| 主要ファイル | slideSettingsStore.ts, SlideWorkspace.tsx                                                     |
| 参照         | known-pitfalls.md P31, P48                                                                    |
| 依存         | UT-SLIDE-UI-001 完了（cleanup 順序4）と同時または後                                           |
| Gate 条件    | cleanup 順序4（SlideWorkspace UI 4領域反映）が完了していること                                |
| 指示書パス   | `docs/30-workflows/unassigned-task/UT-SLIDE-P31-001.md`                                       |

### UT-SLIDE-HANDOFF-DUP-001: terminal handoff 重複解消

| 項目         | 内容                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------- |
| タイトル     | SlideWorkspace と Task05 の terminal handoff 重複解消                                          |
| 概要         | TerminalHandoffCard が Task05 と Task08 で重複実装されている場合、Task05 の共有 DTO に統一する |
| 担当理由     | cleanup 順序9として定義済み。Task05 完了後に実施する                                           |
| 主要ファイル | SlideWorkspace.tsx, TerminalHandoffCard（Task05 共有コンポーネント）                           |
| 依存         | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 完了 + cleanup 順序2完了                     |
| Gate 条件    | Task05（TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001）が完了していること                  |
| 指示書パス   | `docs/30-workflows/unassigned-task/UT-SLIDE-HANDOFF-DUP-001.md`                                |

### Task09 follow-up: IPC namespace 統一

| 項目       | 内容                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| タイトル   | slide:sync:\* legacy IPC channel の namespace 統一                                  |
| 概要       | slide:sync:\* legacy channel を正規 namespace に統一し、dead-end channel を排除する |
| 担当理由   | cleanup 順序6として定義済み。Task09 governance に委譲して影響範囲を管理             |
| 参照       | contract-matrix.md セクション6, known-pitfalls.md P65                               |
| 依存       | UT-SLIDE-IMPL-001 完了（cleanup 順序5）+ Task09 governance 承認                     |
| Gate 条件  | agent-client.ts の Agent SDK adapter 化（cleanup 順序5）が完了していること          |
| 指示書パス | `docs/30-workflows/unassigned-task/UT-SLIDE-TASK09-IPC-NAMESPACE-001.md`            |

---

## 3ステップ完了確認（P3/P38 対策）

| ステップ | 内容                                    | 状態                                                                                                                                                  |
| -------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | `unassigned-task/` に指示書を作成       | 実施済み（5件: UT-SLIDE-IMPL-001.md / UT-SLIDE-UI-001.md / UT-SLIDE-P31-001.md / UT-SLIDE-HANDOFF-DUP-001.md / UT-SLIDE-TASK09-IPC-NAMESPACE-001.md） |
| 2        | `task-workflow.md` 残課題テーブルに登録 | 実施済み（task-workflow-backlog.md に5件登録、2026-03-23）                                                                                            |
| 3        | 関連仕様書に参照リンクを追加            | 実施済み（arch-state-management-core.md に関連タスクテーブル追記、2026-03-23）                                                                        |

**注記（P58 対策）**: 設計タスクであっても3ステップは省略不可。全3ステップ実施完了（2026-03-23）。
