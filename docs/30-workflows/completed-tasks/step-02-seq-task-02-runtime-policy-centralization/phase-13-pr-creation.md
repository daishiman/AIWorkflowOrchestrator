# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 13                                         |
| Phase 名   | PR作成                                     |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 前提 Phase | Phase 12                                   |
| 後続 Phase | なし                                       |
| ステータス | blocked                                    |
| 作成日     | 2026-03-19                                 |
| 機能名     | runtime-policy-centralization              |

## 目的

設計タスクのため、Phase 13 はプロダクションコードの変更を伴わない。
ユーザーからの指示があるまで PR は作成しない。本 Phase では PR 作成前の evidence bundle 整理と
レビュー担当者向け handover 情報のみを `outputs/phase-13/pr-preparation.md` にまとめる。

## 実行タスク

- PR blocked 条件確認: **ユーザー指示がない限り PR を作成しない**ことを pr-preparation.md に明記する。
  設計タスクのため、PR が必要になるのは後続実装タスク（Task03-09）のマージ後である旨も記録する。
- evidence bundle 整理: Phase 1-12 の全成果物パスを整理し、PR レビュー時に参照すべきドキュメントを pr-preparation.md にリスト化する。
  優先度の高い参照先（validation-matrix.md / final-gate-decision.md / risk-register.md / implementation-guide.md）を先頭に記載する。
- handover 整理: レビュー担当者が確認すべき docs / evidence / risk を pr-preparation.md にまとめる。
  未解決リスク（M-1・M-2）と担当 Phase、および残課題（M-3 タスクID割当結果）を明示する。
- ブランチ・コミット方針: diff-to-pr スキルの使用方針と、PR タイトル・本文テンプレートを pr-preparation.md に定義する。

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
| Phase 10                   | phase-10-final-review.md                                                                                      | Phase 10（最終レビュー）の仕様書                  |
| Phase 11                   | phase-11-manual-test.md                                                                                       | Phase 11（手動テスト）の仕様書                    |
| Phase 12                   | phase-12-documentation.md                                                                                     | Phase 12（ドキュメント）の仕様書                  |
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

### ステップ1: Phase 12 の成果物を確認する

`outputs/phase-12/documentation-changelog.md`・`outputs/phase-12/unassigned-task-detection.md` を確認し、
全タスクが完了していることを検証する。未完了タスクがある場合は Phase 12 に戻る。

### ステップ2: PR blocked 条件を明記する

`outputs/phase-13/pr-preparation.md` の冒頭に以下を記載する:

```
PR 作成ステータス: BLOCKED（ユーザー指示待ち）
理由: 設計タスクのため。後続実装タスク（Task03-09）完了後にユーザー指示に基づき PR を作成する。
```

### ステップ3: evidence bundle を整理する

Phase 1-12 の全成果物パスを以下の優先度順で pr-preparation.md にリスト化する:

1. **設計の核心**: phase-2-design.md（validation-matrix.md）/ phase-3-design-review.md
2. **最終判定**: outputs/phase-10/final-gate-decision.md / outputs/phase-9/risk-register.md
3. **後続実装向け**: outputs/phase-12/implementation-guide.md
4. **品質証跡**: outputs/phase-9/quality-checklist.md / outputs/phase-11/manual-test-plan.md
5. **変更記録**: outputs/phase-12/documentation-changelog.md / outputs/phase-12/system-spec-update-summary.md

### ステップ4: handover 情報と PR テンプレートを作成する

レビュー担当者向け handover 情報を記録する:

- 未解決リスク: M-1（サニタイズ型未定義 → Phase 5 担当）・M-2（resolveシグネチャ曖昧 → Phase 4 担当）
- 残課題: M-3（cleanup）のタスクID割当結果と参照先
- diff-to-pr スキルの使用方針と PR タイトル（70文字以内）・本文テンプレートを定義する

## 統合テスト連携（Phase 1〜11は必須）

Phase 13 は PR 準備フェーズ。統合テスト連携として Phase 1-12 の evidence bundle が全て揃っていることを
pr-preparation.md のチェックリストで確認する。

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 設計タスク。PR 作成はユーザー指示待ち（BLOCKED）。evidence bundle 整理と handover 情報のみを作成する。プロダクションコードの変更は行わない。

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 12 全成果物の完了確認）
2. PR blocked 条件の明記
3. evidence bundle の整理（Phase 1-12 成果物パスを優先度順にリスト化）
4. handover 情報の作成（未解決リスク M-1・M-2 + 残課題 M-3）
5. PR テンプレートの定義（タイトル70文字以内・本文テンプレート）
6. 成果物パスと outputs/phase-13 の整合確認
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物     | パス                               | 内容                                                                              |
| ---------- | ---------------------------------- | --------------------------------------------------------------------------------- |
| PR準備メモ | outputs/phase-13/pr-preparation.md | PR blocked 条件 + evidence bundle + handover 情報 + PR タイトル・本文テンプレート |

## 完了条件

- [ ] PR blocked 条件（「ユーザー指示待ち」）が pr-preparation.md の冒頭に明記されている
- [ ] Phase 1-12 の全成果物パスが優先度付きで evidence bundle としてリスト化されている
- [ ] 未解決リスク（M-1・M-2）と残課題（M-3）が handover 情報に明記されている
- [ ] PR タイトル（70文字以内）と本文テンプレートが定義されている
- [ ] diff-to-pr スキルの使用方針が記載されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-13/` と一致している
- [ ] 設計タスクのためプロダクションコード変更が0件であることを確認
- [ ] **PR は作成していない**（ユーザー指示なしの PR 作成禁止を遵守）
- [ ] Phase 12 の全成果物が完了していることを確認した上で pr-preparation.md を作成している

## 次のPhase

- なし（ユーザー指示待ち）
