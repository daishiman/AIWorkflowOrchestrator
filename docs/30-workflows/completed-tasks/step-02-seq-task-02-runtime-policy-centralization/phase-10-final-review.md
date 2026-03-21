# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 10                                         |
| Phase 名   | 最終レビュー                               |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 前提 Phase | Phase 9                                    |
| 後続 Phase | Phase 11（手動テスト）                     |
| ステータス | completed                                  |
| 作成日     | 2026-03-19                                 |
| 機能名     | runtime-policy-centralization              |

## 目的

設計タスクのため、Phase 10 はプロダクションコードの変更を伴わない。
validation-matrix.md の Phase 10 チェックリストに従い、AC-1〜AC-4 と全 Phase 設計成果物の最終照合を実施する。
判定結果（PASS / MINOR / MAJOR / CRITICAL）に応じて戻り先を決定し、MINOR 指摘は全て未タスク仕様書に変換する。

## 実行タスク

- 最終レビュー: validation-matrix.md の Phase 10 チェックリストを全項目実行し、AC-1〜AC-4 の検証可能条件を確認する。
  Phase 3 MINOR 指摘（M-1〜M-3）の処置状況を確認し、final-review-report.md に記録する。
- 戻り先決定: PASS / MINOR / MAJOR / CRITICAL の判定を行い、
  MAJOR は影響範囲に応じて Phase 1-5 へ戻る戻り先、CRITICAL は Phase 1 再確認を final-gate-decision.md に明記する。
- MINOR 指摘の未タスク変換: MINOR 判定の指摘は全て未タスク仕様書に変換する（省略不可）。
  設計タスクの場合も、指示書ファイルを `docs/30-workflows/unassigned-task/` に作成し P58 防止策を適用する。

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
| Phase 7                    | phase-7-coverage-check.md                                                                                     | Phase 7（カバレッジ確認）の仕様書                 |
| Phase 8                    | phase-8-refactoring.md                                                                                        | Phase 8（リファクタリング）の仕様書               |
| Phase 9                    | phase-9-quality-assurance.md                                                                                  | Phase 9（品質検証）の仕様書                       |
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

### ステップ1: Phase 9 の成果物を確認する

`outputs/phase-9/quality-checklist.md`（implementation_ready 判定）と
`outputs/phase-9/risk-register.md`（残余リスク一覧）を確認し、今回のレビュースコープを固定する。

### ステップ2: AC-1〜AC-4 の最終照合を実施する

validation-matrix.md の Phase 10 チェックリストを上から全項目実行し、
各 AC の検証可能条件が設計成果物で満たされているかを確認する。
確認結果を `outputs/phase-10/final-review-report.md` に記録する。

AC 確認観点（例）:

- AC-1: Runtime Policy Authority が Ownership Table 通りに単一箇所に集約されているか
- AC-2: Health Contract の型が llm-ipc-types.md と整合しているか
- AC-3: Handoff Contract の標準形式が全 surface の設計で採用されているか
- AC-4: Policy Consumption Contract の4原則が全 consumer 設計に適用されているか

### ステップ3: ゲート判定と戻り先を決定する

以下の基準でゲート判定を実施し、`outputs/phase-10/final-gate-decision.md` に記録する:

| 判定     | 対応                                           |
| -------- | ---------------------------------------------- |
| PASS     | Phase 11 へ                                    |
| MINOR    | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 影響範囲に応じて Phase 1-5 へ戻る              |
| CRITICAL | Phase 1 へ戻り要件再確認                       |

MINOR 指摘は全て `docs/30-workflows/unassigned-task/` に指示書ファイルを作成する（P58 適用）。

### ステップ4: 完了条件と次Phase handoff を確認する

Phase 3 MINOR 指摘（M-1〜M-3）の処置状況を最終確認し、
次Phase（Phase 11: 手動テスト）への前提条件を記録する。

## 統合テスト連携（Phase 1〜11は必須）

設計タスクのため自動テスト実行は対象外。ただし以下の completeness を同時確認する:

- AC-1〜AC-4 が全て「確認済み」または「未タスク変換済み」であること
- Phase 3 MINOR 指摘（M-1〜M-3）の処置方針が全て記録されていること

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 設計タスク。validation-matrix.md の Phase 10 チェックリストを全項目実行し、AC-1〜AC-4 と設計成果物の最終照合を完了する。MINOR 指摘は全て未タスク仕様書に変換する（P58 適用、省略不可）。

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 9 成果物 + validation-matrix.md Phase 10 チェックリスト）
2. AC-1〜AC-4 の最終照合（各 AC を個別サブタスクで確認）
3. ゲート判定（PASS / MINOR / MAJOR / CRITICAL）
4. MINOR 指摘の未タスク仕様書変換（docs/30-workflows/unassigned-task/ への指示書作成）
5. final-gate-decision.md への戻り先記録
6. 成果物パスと outputs/phase-10 の整合確認
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物           | パス                                    | 内容                                                              |
| ---------------- | --------------------------------------- | ----------------------------------------------------------------- |
| 最終レビュー報告 | outputs/phase-10/final-review-report.md | AC-1〜AC-4 照合結果 + Phase 3 MINOR（M-1〜M-3）の処置状況         |
| 最終ゲート判定   | outputs/phase-10/final-gate-decision.md | 判定（PASS/MINOR/MAJOR/CRITICAL）と戻り先・MINOR 未タスク変換一覧 |

## 完了条件

- [ ] validation-matrix.md の Phase 10 チェックリストが全項目実行済みである
- [ ] AC-1〜AC-4 の検証可能条件が全て「確認済み」または「未タスク変換済み」である
- [ ] ゲート判定（PASS/MINOR/MAJOR/CRITICAL）と戻り先が final-gate-decision.md に明記されている
- [ ] MINOR 指摘が存在する場合、全て `docs/30-workflows/unassigned-task/` に指示書ファイルが作成されている
- [ ] Phase 3 MINOR 指摘（M-1〜M-3）の処置方針が全て記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-10/` と一致している
- [ ] 設計タスクのためプロダクションコード変更が0件であることを確認
- [ ] 前Phaseの gate 条件（Phase 9 implementation_ready 判定完了）を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md)
