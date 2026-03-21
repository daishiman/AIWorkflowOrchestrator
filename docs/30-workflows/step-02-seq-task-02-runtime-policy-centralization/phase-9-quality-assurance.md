# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 9                                          |
| Phase 名   | 品質検証                                   |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 前提 Phase | Phase 8                                    |
| 後続 Phase | Phase 10（最終レビュー）                   |
| ステータス | completed                                  |
| 作成日     | 2026-03-19                                 |
| 機能名     | runtime-policy-centralization              |

## 目的

設計タスクのため、Phase 9 はプロダクションコードの変更を伴わない。
Phase 1-8 の設計成果物を横断的に品質確認し、残余リスクを登録したうえで後続実装タスク（Task03-09）が
着手可能な状態（implementation_ready）かどうかを判定する。

## 実行タスク

- 品質観点確認: UX / architecture / IPC / security / workflow の5観点で Phase 1-8 の設計成果物を横断確認する。
  各観点の確認結果を `outputs/phase-9/quality-checklist.md` にチェックリスト形式で記録する。
- risk 登録: Phase 7 から引き継いだ residual risk と Phase 8 で新たに発見したリスクを `outputs/phase-9/risk-register.md` に登録し、mitigation を明記する。
  M-1（サニタイズ型未定義）・M-2（resolveシグネチャ曖昧）も未解決リスクとして登録する。
- implementation_ready 判定: 後続実装タスク（Task03-09）が着手可能かどうかの条件を整理し、
  「着手可 / 着手不可（理由）」を quality-checklist.md の最終セクションに明記する。

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
| Phase 8                    | phase-8-refactoring.md                                                                                        | Phase 8（リファクタリング）の仕様書               |
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

### ステップ1: Phase 8 の成果物を確認する

`outputs/phase-8/refactor-boundaries.md` と `outputs/phase-8/simplification-candidates.md` を確認し、
引き継ぎ事項と今回のスコープを固定する。設計タスクのためコード変更は行わない。

### ステップ2: 品質観点確認（5観点）を実施する

以下の5観点で Phase 1-8 の設計成果物を確認し、`outputs/phase-9/quality-checklist.md` に記録する:

1. **UX**: ui-ux-realization.md の状態語彙・CTA・handoff 契約が設計に反映されているか
2. **アーキテクチャ**: 3 concern の Ownership Table が arch-state-management-core.md と整合しているか
3. **IPC**: Policy Consumption Contract の4原則が api-ipc-system-core.md と整合しているか
4. **セキュリティ**: security-electron-ipc-core.md の境界が設計で維持されているか
5. **ワークフロー**: DD-1〜DD-6 の設計判断が validation-matrix.md の AC に対応しているか

### ステップ3: リスク登録を実施する

Phase 7 residual risk + Phase 3 MINOR 指摘（M-1: サニタイズ型未定義、M-2: resolveシグネチャ曖昧）を
`outputs/phase-9/risk-register.md` に登録し、各リスクの mitigation と担当 Phase を明記する。
M-3（cleanupタスクID未割当）は Phase 12 担当として登録する。

### ステップ4: implementation_ready 判定と次Phase handoff

quality-checklist.md の全項目確認後、implementation_ready の判定（着手可 / 着手不可）を記録する。
次Phase（Phase 10: 最終レビュー）への前提条件を明記する。

## 統合テスト連携（Phase 1〜11は必須）

設計タスクのため自動テスト実行は対象外。ただし以下の integration 観点を成果物に記録する:

- 品質確認の5観点それぞれが「設計成果物上で確認可能」であることの明示
- リスク登録簿の各リスクが「実装タスクで解決可能」であることの確認

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 設計タスク。UX / architecture / IPC / security / workflow の5観点で設計成果物を横断確認し、M-1・M-2 を未解決リスクとして登録、implementation_ready 判定を確定する。プロダクションコードの変更は行わない。

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1-8 成果物 + residual risk 引き継ぎ）
2. 品質観点確認: UX 観点（ui-ux-realization.md との照合）
3. 品質観点確認: アーキテクチャ / IPC / セキュリティ / ワークフロー観点
4. リスク登録（M-1・M-2 + Phase 7 residual risk + M-3 Phase 12 担当）
5. implementation_ready 判定
6. 成果物パスと outputs/phase-9 の整合確認
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物             | パス                                 | 内容                                                             |
| ------------------ | ------------------------------------ | ---------------------------------------------------------------- |
| 品質チェックリスト | outputs/phase-9/quality-checklist.md | 5観点の確認結果 + implementation_ready 判定（着手可 / 着手不可） |
| リスク登録簿       | outputs/phase-9/risk-register.md     | 残余リスク一覧（M-1・M-2・M-3 含む）と mitigation・担当 Phase    |

## 完了条件

- [ ] 品質確認の5観点が全て記録されている（確認済み / 未確認 / 該当なし のいずれか）
- [ ] M-1（サニタイズ型未定義）・M-2（resolveシグネチャ曖昧）がリスク登録簿に登録されている
- [ ] M-3（cleanupタスクID未割当）が Phase 12 担当として登録されている
- [ ] implementation_ready の判定結果（着手可 / 着手不可 + 条件）が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-9/` と一致している
- [ ] 設計タスクのためプロダクションコード変更が0件であることを確認
- [ ] 前Phaseの gate 条件（Phase 8 refactor-boundaries.md 完成）を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md)
