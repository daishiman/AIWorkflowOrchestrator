# Phase 12 成果物: 未タスク検出レポート

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 12                                                |
| 成果物種別 | 未タスク検出レポート                              |
| 作成日     | 2026-03-22                                        |

---

## 重要注記

P3/P38/P58 の教訓に基づき、0 件であっても本レポートは必ず作成する。検出した未タスクは以下の 3 ステップ全てを完了させる:

1. `docs/30-workflows/unassigned-task/` に指示書を作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

---

## 検出件数

**合計: 8 件**（MINOR 指摘 3 件 + 設計 GAP 残課題 5 件）

---

## 検出一覧

### UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001（MN-1 由来）

| 項目       | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| タイトル   | toHandoffGuidance adapter の配置先確定と実装                                                |
| 概要       | MN-1: `toHandoffGuidance()` の配置先（`packages/shared/` vs 各 service 内）を確定し実装する |
| 優先度     | high（後続実装タスクのブロッカー）                                                          |
| 指示書パス | `docs/30-workflows/unassigned-task/UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001.md`            |
| 追跡先     | task-workflow.md 残課題テーブル                                                             |
| 関連仕様書 | interfaces-agent-sdk-skill-reference-share-debug-analytics.md                               |

---

### UT-TERMINAL-DOCK-ABORTED-STATE-001（MN-2 由来）

| 項目       | 内容                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| タイトル   | Terminal Dock の aborted state 定義と実装                                             |
| 概要       | MN-2: Terminal Dock 状態遷移で `aborted` state の遷移条件・表示・CTA を定義し実装する |
| 優先度     | medium                                                                                |
| 指示書パス | `docs/30-workflows/unassigned-task/UT-TERMINAL-DOCK-ABORTED-STATE-001.md`             |
| 追跡先     | task-workflow.md 残課題テーブル                                                       |
| 関連仕様書 | ui-ux-agent-execution-core.md                                                         |

---

### UT-GUIDANCE-BLOCK-HANDOFF-CARD-RULE-001（MN-3 由来）

| 項目       | 内容                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| タイトル   | GuidanceBlock vs TerminalHandoffCard 使い分けルール明確化                                            |
| 概要       | MN-3: handoff DTO あり → TerminalHandoffCard、guidance-only → GuidanceBlock のルールを実装に明記する |
| 優先度     | medium                                                                                               |
| 指示書パス | `docs/30-workflows/unassigned-task/UT-GUIDANCE-BLOCK-HANDOFF-CARD-RULE-001.md`                       |
| 追跡先     | task-workflow.md 残課題テーブル                                                                      |
| 関連仕様書 | ui-ux-agent-execution-core.md                                                                        |

---

### UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001

| 項目       | 内容                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| タイトル   | Terminal Dock session persistence 実装                                                                            |
| 概要       | Terminal Dock を閉じ再度開いた際に transcript が保持される仕組みを実装する（Task06 Transcript Provenance に依存） |
| 優先度     | medium（Task06 完了後に着手可能）                                                                                 |
| ブロッカー | Task06 Transcript Provenance 完了待ち                                                                             |
| 指示書パス | `docs/30-workflows/unassigned-task/UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001.md`                                   |
| 追跡先     | task-workflow.md 残課題テーブル                                                                                   |
| 関連仕様書 | ui-ux-agent-execution-core.md                                                                                     |

---

### UT-RUNTIME-BUILDER-MIGRATION-001

| 項目       | 内容                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| タイトル   | buildForSurface() への migration と旧メソッド deprecated 化                                                                                 |
| 概要       | `TerminalHandoffBuilder` に `buildForSurface(request, surfaceType, reason)` 統一メソッドを追加し、旧メソッドに `@deprecated` タグを付与する |
| 優先度     | high（Consumer Adapter 実装の前提）                                                                                                         |
| 指示書パス | `docs/30-workflows/unassigned-task/UT-RUNTIME-BUILDER-MIGRATION-001.md`                                                                     |
| 追跡先     | task-workflow.md 残課題テーブル                                                                                                             |
| 関連仕様書 | llm-workspace-chat-edit.md                                                                                                                  |

---

### UT-SKILLDOCS-TERMINAL-HANDOFF-PATH-001

| 項目       | 内容                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| タイトル   | Skill Docs terminal-handoff 実パス実装                                                                                                         |
| 概要       | `SkillDocsCapabilityResult` から `HandoffGuidance` への adapter を実装し、Skill Docs surface で TerminalHandoffCard が表示されるパスを実現する |
| 優先度     | medium                                                                                                                                         |
| 指示書パス | `docs/30-workflows/unassigned-task/UT-SKILLDOCS-TERMINAL-HANDOFF-PATH-001.md`                                                                  |
| 追跡先     | task-workflow.md 残課題テーブル                                                                                                                |
| 関連仕様書 | interfaces-agent-sdk-skill-reference-share-debug-analytics.md                                                                                  |

---

### UT-GUIDANCE-BLOCK-PROPS-UNIFICATION-001

| 項目       | 内容                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| タイトル   | GuidanceBlock handoff variant の HandoffGuidance Props 統一                                                          |
| 概要       | GuidanceBlock の `handoff` variant が独自 variant props ではなく `HandoffGuidance` を受け取るように Props を統一する |
| 優先度     | medium                                                                                                               |
| 指示書パス | `docs/30-workflows/unassigned-task/UT-GUIDANCE-BLOCK-PROPS-UNIFICATION-001.md`                                       |
| 追跡先     | task-workflow.md 残課題テーブル                                                                                      |
| 関連仕様書 | ui-ux-agent-execution-core.md                                                                                        |

---

### UT-EXECUTION-ENV-TERMINAL-001

| 項目       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タイトル   | ExecutionEnvironment terminal case の placeholder から実実装への移行                                                                                             |
| 概要       | `ExecutionEnvironment.terminal` の placeholder 実装を本実装に移行し、`assertNoSilentFallback` により DEFAULT_CONFIG への暗黙 fallback が発生しないことを保証する |
| 優先度     | high（P62 対策）                                                                                                                                                 |
| 指示書パス | `docs/30-workflows/unassigned-task/UT-EXECUTION-ENV-TERMINAL-001.md`                                                                                             |
| 追跡先     | task-workflow.md 残課題テーブル                                                                                                                                  |
| 関連仕様書 | interfaces-agent-sdk-skill-reference-share-debug-analytics.md                                                                                                    |

---

## 3 ステップ完了状況

| 未タスク ID                               | ステップ 1: 指示書作成                                                                 | ステップ 2: task-workflow 登録 | ステップ 3: 仕様書リンク追加    |
| ----------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------- |
| UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 | 完了（docs/30-workflows/unassigned-task/UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001.md） | system-spec-update-summary.md  | interfaces-agent-sdk.md 参照    |
| UT-TERMINAL-DOCK-ABORTED-STATE-001        | 完了（docs/30-workflows/unassigned-task/UT-TERMINAL-DOCK-ABORTED-STATE-001.md）        | system-spec-update-summary.md  | ui-ux-agent.md 参照             |
| UT-GUIDANCE-BLOCK-HANDOFF-CARD-RULE-001   | 完了（docs/30-workflows/unassigned-task/UT-GUIDANCE-BLOCK-HANDOFF-CARD-RULE-001.md）   | system-spec-update-summary.md  | ui-ux-agent.md 参照             |
| UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001  | 完了（docs/30-workflows/unassigned-task/UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001.md）  | system-spec-update-summary.md  | ui-ux-agent.md 参照             |
| UT-RUNTIME-BUILDER-MIGRATION-001          | 完了（docs/30-workflows/unassigned-task/UT-RUNTIME-BUILDER-MIGRATION-001.md）          | system-spec-update-summary.md  | llm-workspace-chat-edit.md 参照 |
| UT-SKILLDOCS-TERMINAL-HANDOFF-PATH-001    | 完了（docs/30-workflows/unassigned-task/UT-SKILLDOCS-TERMINAL-HANDOFF-PATH-001.md）    | system-spec-update-summary.md  | interfaces-agent-sdk.md 参照    |
| UT-GUIDANCE-BLOCK-PROPS-UNIFICATION-001   | 完了（docs/30-workflows/unassigned-task/UT-GUIDANCE-BLOCK-PROPS-UNIFICATION-001.md）   | system-spec-update-summary.md  | ui-ux-agent.md 参照             |
| UT-EXECUTION-ENV-TERMINAL-001             | 完了（docs/30-workflows/unassigned-task/UT-EXECUTION-ENV-TERMINAL-001.md）             | system-spec-update-summary.md  | interfaces-agent-sdk.md 参照    |

**P58 対策完了**: 設計タスクの未タスクであっても独立した指示書ファイルを `docs/30-workflows/unassigned-task/` に作成した（2026-03-22 実施済み）。全 8 件の指示書ファイルが実在する。

---

## 再評価クローズ状況

本タスクでは再評価クローズした未タスクはなし。P56 対策として、再評価クローズが発生した場合は GitHub Issue も同時に Close する。
