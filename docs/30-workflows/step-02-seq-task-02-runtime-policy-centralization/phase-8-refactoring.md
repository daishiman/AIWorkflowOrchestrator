# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 8                                          |
| Phase 名   | リファクタリング                           |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 前提 Phase | Phase 7                                    |
| 後続 Phase | Phase 9（品質検証）                        |
| ステータス | completed                                  |
| 作成日     | 2026-03-19                                 |
| 機能名     | runtime-policy-centralization              |

## 目的

設計タスクのため、Phase 8 はプロダクションコードの変更を伴わない。
Phase 4-7 の設計成果物を対象に、3 concern の境界整合・命名一貫性・簡素化候補を静的検査し、後続実装タスク（Task03-09）向けの refactor 境界を確定する。

## 実行タスク

- simpler alternative 再評価: Phase 5 実装計画で複雑化した箇所（Policy Authority / Health Contract / Handoff Contract の境界重複や責務の二重表現）がないか設計文書を静的確認する
- 責務再整列: 3 concern（Runtime Policy Authority / Health Contract Unification / Handoff Contract Standardization）の境界が Phase 4-7 の設計成果物で崩れていないかを確認し、Ownership Table（4カテゴリ）との整合を検証する
- 命名整合: DD-5 の SurfaceType / buildForSurface 等の命名が Phase 1-7 の設計成果物全体で一貫しているか確認し、不整合箇所を列挙する

## 参照資料

| 参照資料                   | パス                                                                                                          | 内容                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 依存順・並列可否・設計ゲート                      |
| Task index                 | docs/30-workflows/step-02-seq-task-02-runtime-policy-centralization/index.md                                  | 対象 task のメタ情報と受入基準                    |
| Phase 1                    | phase-1-requirements.md                                                                                       | 要件定義の確定内容                                |
| Phase 2                    | phase-2-design.md                                                                                             | 設計内容と validation matrix                      |
| Phase 3                    | phase-3-design-review.md                                                                                      | review gate の判定                                |
| Phase 4                    | phase-4-test-creation.md                                                                                      | Phase 4（テスト作成）の仕様書                     |
| Phase 5                    | phase-5-implementation.md                                                                                     | Phase 5（実装）の仕様書                           |
| Phase 6                    | phase-6-test-expansion.md                                                                                     | Phase 6（テスト拡充）の仕様書                     |
| Phase 7                    | phase-7-coverage-check.md                                                                                     | Phase 7（カバレッジ確認）の仕様書                 |
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

### ステップ1: Phase 7 までの設計成果物を確認する

Phase 1-7 の outputs ディレクトリおよび phase-3-design-review.md の MINOR 指摘（M-1〜M-3）を確認し、
今回のレビュースコープを固定する。設計タスクのためコード変更は行わない。

### ステップ2: simpler alternative 再評価を実施する

Phase 5 実装計画書（phase-5-implementation.md）の各設計判断（DD-1〜DD-6）を読み直し、
Policy Consumption Contract の4原則と照らして複雑化・重複・不整合がある箇所を特定する。
発見した候補を `outputs/phase-8/simplification-candidates.md` に記録する。

### ステップ3: 責務再整列と命名整合を確認する

3 concern の Ownership Table（runtime実行可否 / health check / handoff bundle / authMode参照）と
DD-5 の SurfaceType 命名が、Phase 4-7 の設計成果物全体で一貫しているかを確認する。
禁止事項（崩してはいけない contract）を `outputs/phase-8/refactor-boundaries.md` に明文化する。

### ステップ4: 完了条件と次Phase handoff を確認する

残件・blocked 条件・次Phase（Phase 9: 品質検証）への前提を記録する。
設計タスクのため「実装を変更しない」ことが本 Phase の invariant である。

## 統合テスト連携（Phase 1〜11は必須）

設計タスクのため自動テスト実行は対象外。ただし以下の integration invariant を成果物に記録する:

- Policy Consumption Contract の4原則が Phase 4-7 の設計でどのように具体化されているか
- surface-local な runtime 判定が設計上残存していないか（実装タスクへの引き継ぎ前提）

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 設計タスク。3 concern 境界・Ownership Table 4カテゴリ・DD-5 命名の一貫性を設計文書のみで静的確認し、後続実装タスク向けの refactor 境界を確定する。プロダクションコードの変更は行わない。

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1-7 成果物 + MINOR 指摘 M-1〜M-3）
2. simpler alternative 再評価（Phase 5 実装計画の複雑化箇所を特定）
3. 責務再整列確認（3 concern 境界が Phase 4-7 で崩れていないか）
4. 命名整合確認（DD-5 SurfaceType / buildForSurface の一貫性）
5. 成果物パスと outputs/phase-8 の整合確認
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物         | パス                                         | 内容                                                           |
| -------------- | -------------------------------------------- | -------------------------------------------------------------- |
| リファクタ境界 | outputs/phase-8/refactor-boundaries.md       | 崩してはいけない contract 一覧と禁止事項（後続実装タスク向け） |
| 簡素化候補     | outputs/phase-8/simplification-candidates.md | Phase 4-7 の命名・構造簡素化提案と判断根拠                     |

## 完了条件

- [ ] simpler alternative 再評価が完了し、複雑化箇所が特定または「なし」が明記されている
- [ ] 3 concern の境界整合が確認され、Ownership Table との照合結果が記録されている
- [ ] DD-5 命名の一貫性が確認され、不整合箇所が列挙または「なし」が明記されている
- [ ] 崩してはいけない contract（Policy Consumption Contract 4原則）が明文化されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-8/` と一致している
- [ ] 設計タスクのためプロダクションコード変更が0件であることを確認
- [ ] 前Phaseの gate 条件（Phase 3 MINOR → Phase 4 着手可）を前提として実行手順が書かれている

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md)
