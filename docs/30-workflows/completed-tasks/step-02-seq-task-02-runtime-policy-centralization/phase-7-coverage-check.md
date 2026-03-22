# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 7                                          |
| Phase 名   | カバレッジ確認                             |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 前提 Phase | Phase 6                                    |
| 後続 Phase | Phase 8（リファクタリング）                |
| ステータス | completed                                  |
| 作成日     | 2026-03-19                                 |
| 機能名     | runtime-policy-centralization              |

## 目的

surface 横断 runtime policy の中央集約 の coverage gate と統合再確認条件を定義する。
設計タスクとして、将来の実装者が Phase 4-6 で定義したテスト観点の網羅状況を確認し、ownership table の4カテゴリごとのカバレッジ目標と Phase 9 への持ち越しリスクを文書成果物として残す。

## 実行タスク

- coverage gate 設計: ownership table の4カテゴリ（runtime 実行可否 / health check / handoff bundle / authMode 参照）ごとの line / branch / function / scenario の最低基準を定義する
- 統合ゲート設計: Phase 4-6 で定義したテスト観点（Unit / Integration / Manual / Edge case）の網羅確認リストを作成する
- residual risk 整理: Phase 9 へ持ち越す未検証観点を理由付きで整理する

## 参照資料

| 参照資料                   | パス                                                                                                          | 内容                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 依存順・並列可否・設計ゲート                      |
| Task index                 | docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md                  | 対象 task のメタ情報と受入基準                    |
| Phase 1                    | phase-1-requirements.md                                                                                       | 要件定義の確定内容                                |
| Phase 2                    | phase-2-design.md                                                                                             | 設計内容と validation matrix                      |
| Phase 3                    | phase-3-design-review.md                                                                                      | review gate の判定                                |
| Phase 4                    | phase-4-test-creation.md                                                                                      | Phase 4（テスト作成）の仕様書                     |
| Phase 5                    | phase-5-implementation.md                                                                                     | Phase 5（実装）の仕様書                           |
| Phase 6                    | phase-6-test-expansion.md                                                                                     | Phase 6（テスト拡充）の仕様書                     |
| 旧canonical workflow       | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                 | execution responsibility を主語にした既存問題設定 |
| 親パック UI/UX 正本        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                        | 状態語彙・CTA・handoff 契約                       |
| 親パック UI/UX 図解        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md                           | 状態遷移・画面構成・導線図                        |
| 親パック監査マトリクス     | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                      | 矛盾・依存・漏れの監査軸                          |
| workflow 正本              | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | runtime 責務再配線の current canonical            |
| resource map               | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                                                | 必要仕様の初動選定                                |
| quick reference            | .claude/skills/aiworkflow-requirements/indexes/quick-reference.md                                             | 型・IPC・UI 仕様の即時参照                        |
| interfaces-auth            | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                                          | auth/access 契約の親入口                          |
| api-ipc-system             | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                                           | system IPC 契約の親入口                           |
| arch-state-management      | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                                    | Renderer 責務境界の親入口                         |
| Task01 index               | docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md   | foundation で固定した capability 契約             |
| api-ipc-system-core        | .claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md                                      | health route / llm IPC canonical                  |
| llm-ipc-types              | .claude/skills/aiworkflow-requirements/references/llm-ipc-types.md                                            | health / selected-config 型契約                   |
| security-electron-ipc-core | .claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md                               | preload / sender 検証の境界                       |
| arch-state-management-core | .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md                               | store ownership と selector 境界                  |

## 実行手順

### ステップ1: Phase 4-6 のテスト観点を集約する

以下の成果物を読み込み、テスト観点の総リストを作成する。

- `outputs/phase-4/test-case-specification.md`（Unit / Integration / Manual テストケース仕様）
- `outputs/phase-4/mock-strategy.md`（mock 境界定義）
- `outputs/phase-6/regression-expansion-plan.md`（回帰観点・統合シナリオ）
- `outputs/phase-6/edge-case-matrix.md`（edge case 一覧）

### ステップ2: ownership table カテゴリごとのカバレッジ目標を設定する

ownership table の4カテゴリについて、それぞれ以下の基準を `outputs/phase-7/coverage-targets.md` に記録する。

- runtime 実行可否: line ≥ 90% / branch ≥ 70% / function ≥ 90%（policy 判定ロジックは高精度を要求）
- health check: line ≥ 80% / branch ≥ 60% / timeout 境界テスト必須
- handoff bundle: line ≥ 80% / scenario（surface 横断連続実行）≥ 2 シナリオ
- authMode 参照: line ≥ 80% / authMode 未定義境界テスト必須

### ステップ3: Phase 4-6 のテスト観点の網羅確認リストを作成する

以下の確認軸で `outputs/phase-7/integration-gate.md` を作成する。

- Unit テストが ownership 4カテゴリを全て対象としているか
- Integration テストが surface 横断シナリオを含んでいるか
- Edge case（authMode 未定義 / apiKey 不正形式 / health timeout / surface 未知値）が全て対象になっているか
- 回帰テスト（P31 / P48 / P50）観点が明示されているか

### ステップ4: 未カバー観点を residual risk として整理する

Phase 4-6 の観点で未検証・未定義のものを「理由」「Phase 9 での対処方針」とともに `coverage-targets.md` の末尾に記録する。

### ステップ5: 統合テスト連携を更新し、完了条件と次 Phase handoff を確認する

phase 固有の integration 観点を outputs とチェックリストへ反映した後、残件・blocked 条件・次 Phase 前提を記録する。

## 統合テスト連携（Phase 1〜11は必須）

coverage と統合ゲートの不足を整理し、Phase 9 へ handoff する。

- coverage gate と integration gate が定義された状態で Phase 8（リファクタリング）へ進む
- residual risk として整理された観点は Phase 9 の品質検証で再確認する

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 各 surface のローカル runtime 判定を中央 policy / resolver に寄せ、消費契約を統一する

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物               | パス                                | 内容                                                                                        |
| -------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| カバレッジ目標       | outputs/phase-7/coverage-targets.md | ownership 4カテゴリごとの line / branch / function / scenario 最低基準と residual risk 一覧 |
| 統合ゲート確認リスト | outputs/phase-7/integration-gate.md | Phase 4-6 テスト観点の網羅確認軸（Unit / Integration / Edge case / 回帰）と各観点の充足状況 |

## 完了条件

- [ ] ownership table の4カテゴリそれぞれに対してカバレッジ目標（line / branch / function）が `coverage-targets.md` に定義されている
- [ ] Phase 4-6 のテスト観点が `integration-gate.md` の確認軸で網羅されているか判定されている
- [ ] 未カバー観点が「理由」「Phase 9 での対処方針」とともに residual risk として整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-7/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md)
