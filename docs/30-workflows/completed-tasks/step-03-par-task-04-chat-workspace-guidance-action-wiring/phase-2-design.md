# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 2                                                  |
| Phase 名   | 設計                                               |
| タスクID   | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| 前提 Phase | Phase 1                                            |
| 後続 Phase | Phase 3（設計レビュー）                            |
| ステータス | completed                                          |
| 作成日     | 2026-03-19                                         |
| 機能名     | chat-workspace-guidance-action-wiring              |

## 目的

reason-action matrix、store/controller boundary、surface 間 copy consistency を設計するための target topology と validation matrix を固める。

## 実行タスク

- concern 分解: reason-action matrix、store/controller boundary、surface 間 copy consistency を設計する
- guidance 配置先決定: guidance 生成ロジックの配置先を以下から選択し、根拠を記録する
  - 選択肢A: PolicyResolver の出力 DTO に guidance フィールドを追加（一元管理）
  - 選択肢B: 共有 Hook（useBlockedGuidance）で reason → guidance を変換（UI層で完結）
  - 選択肢C: Store の derived state として computed guidance を提供（リアクティブ更新）
- 契約設計: state / action / ownership / DTO を定義する
- 検証設計: Phase 3 / 4 / 11 / 12 で再利用する matrix を作る
- lane 制御: lane 数を 3 以下に保ち、責務重複を排除する

## 参照資料

| 参照資料                         | パス                                                                                                          | 内容                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 親パック index                   | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 依存順・並列可否・設計ゲート                      |
| Task index                       | docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring/index.md                          | 対象 task のメタ情報と受入基準                    |
| Phase 1                          | phase-1-requirements.md                                                                                       | 要件定義の確定内容                                |
| 旧canonical workflow             | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                 | execution responsibility を主語にした既存問題設定 |
| 親パック UI/UX 正本              | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                        | 状態語彙・CTA・handoff 契約                       |
| 親パック UI/UX 図解              | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md                           | 状態遷移・画面構成・導線図                        |
| 親パック監査マトリクス           | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                      | 矛盾・依存・漏れの監査軸                          |
| workflow 正本                    | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | runtime 責務再配線の current canonical            |
| resource map                     | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                                                | 必要仕様の初動選定                                |
| quick reference                  | .claude/skills/aiworkflow-requirements/indexes/quick-reference.md                                             | 型・IPC・UI 仕様の即時参照                        |
| interfaces-auth                  | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                                          | auth/access 契約の親入口                          |
| api-ipc-system                   | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                                           | system IPC 契約の親入口                           |
| arch-state-management            | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                                    | Renderer 責務境界の親入口                         |
| Task02 index                     | docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md                  | policy / DTO の消費境界                           |
| interfaces-llm                   | .claude/skills/aiworkflow-requirements/references/interfaces-llm.md                                           | LLM / streaming / chat-edit の親入口              |
| llm-workspace-chat-edit          | .claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md                                  | RuntimeResolver / HandoffGuidance 契約            |
| ui-ux-feature-components-details | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-details.md                         | Workspace guidance / state UX                     |
| arch-state-management-core       | .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md                               | controller vs local state の境界                  |

## 実行手順

### ステップ1: concern を 3 以下に分解する

reason-action matrix、store/controller boundary、surface 間 copy consistency を設計する観点で concern を分け、所有境界を表にする。

### ステップ2: guidance 配置先を決定する

上記3つの選択肢を評価し、以下の基準で判断する:

- 単一責務: guidance 生成が1箇所に集約されるか
- テスタビリティ: Mock差し替えでテスト可能か
- P31/P48リスク: Store の再描画ループを誘発しないか

### ステップ3: simpler alternative を併記する

今の案より単純な代替案と、採用しない理由を記録する。

### ステップ4: Phase 3 review 観点を明示する

どこが drift しやすいか、どこが blocked 条件かを phase-3-design-review に handoff する。

## 統合テスト連携（Phase 1〜11は必須）

state / action / DTO / screenshot 契約を integration matrix として整理し、Phase 3 review の観点に渡す。

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: main chat と workspace の CTA 差分、P31/P48 再描画リスク、no-op 漏れをレビューする

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物         | パス                                 | 内容                              |
| -------------- | ------------------------------------ | --------------------------------- |
| 設計サマリー   | outputs/phase-2/design-summary.md    | 設計の結論と concern 分解         |
| 契約マトリクス | outputs/phase-2/contract-matrix.md   | state / action / ownership 契約   |
| 検証マトリクス | outputs/phase-2/validation-matrix.md | Phase 3 以降の review / test 観点 |

## 完了条件

- [ ] concern が 3 つ以下に整理されている
- [ ] state / action / ownership 契約が表で定義されている
- [ ] validation matrix と simpler alternative が記録されている
- [ ] Phase 3 review の論点が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-2/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] Phase 4 へ進む前提として Phase 1-3 の gate 条件が明記されている

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md)
