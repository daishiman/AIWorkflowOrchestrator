# Phase 11: 手動テスト（NON_VISUAL）

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 11                        |
| 機能名     | task-rt-05-test-rerun-ac4 |
| 前提Phase  | Phase 10                  |
| 後続Phase  | Phase 12                  |
| ステータス | 未実施                    |
| 作成日     | 2026-03-31                |

## 目的

本タスクは docs-only task（新規画面実装なし）であり、Phase 11 は NON_VISUAL として扱う。
更新したドキュメントの内容が正確であることを確認し、手動テスト結果を記録する。

## タスク分類確認

| 属性          | 値                                                 |
| ------------- | -------------------------------------------------- |
| タスク分類    | docs-only task（testing / doc-update）             |
| Phase 11 種別 | NON_VISUAL                                         |
| 証跡方針JSON  | 不要                                               |
| 理由          | 新規画面コンポーネント実装なし、既存テスト確認のみ |

## 実行タスク

- Phase 1 要件定義、Phase 2 設計、Phase 5 実装、Phase 6 テスト拡充、Phase 7 カバレッジ、Phase 8 リファクタリング、Phase 9 品質保証、Phase 10 最終レビューの結果を人手で突き合わせる
- 更新したドキュメントの事実関係を確認し、NON_VISUAL 判定を `outputs/phase-11/manual-test-checklist.md` と `outputs/phase-11/manual-test-result.md` に記録する
- 親 TASK-RT-05 の更新内容と本 workflow の記録が整合していることを確認する

### タスク1: 更新ドキュメントの内容確認

**目的**: Phase 10 で更新したドキュメントが正確であることを確認する

**確認チェックリスト**:

| 確認項目                                                             | 確認方法         |
| -------------------------------------------------------------------- | ---------------- |
| `quality-report.md` に実行日時が記録されている                       | ファイル内容確認 |
| `quality-report.md` にテスト件数（Engine・Renderer）が記録されている | ファイル内容確認 |
| `quality-report.md` の総合判定が「PASS」になっている                 | ファイル内容確認 |
| `final-review-result.md` の AC-4 が「PASS」になっている              | ファイル内容確認 |
| 更新日時が正確に記録されている                                       | ファイル内容確認 |

### タスク2: Phase 9 テスト結果の整合確認

**目的**: Phase 9 のテスト結果と Phase 10 のドキュメント更新内容が整合していることを確認する

**確認コマンド**:

```bash
# quality-report.md の現在の内容確認
cat docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-9/quality-report.md

# final-review-result.md の現在の内容確認
cat docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-10/final-review-result.md
```

## 参照資料

| 資料名                   | パス                                                                                                                            | 内容               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 要件定義         | `phase-1-requirements.md`                                                                                                       | AC と scope の基準 |
| Phase 2 設計             | `phase-2-design.md`                                                                                                             | rerun 計画         |
| Phase 5 実装             | `phase-5-implementation.md`                                                                                                     | 環境再構築の根拠   |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`                                                                                                     | AC-3 事前確認      |
| Phase 7 カバレッジ       | `phase-7-coverage-check.md`                                                                                                     | AC 対応表          |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                                                                                                        | N/A 判定           |
| Phase 9 テスト結果       | `outputs/phase-9/quality-report.md`                                                                                             | 更新の根拠         |
| Phase 10 更新結果        | `outputs/phase-10/doc-update-result.md`                                                                                         | before/after 記録  |
| 更新済み Phase 9 doc     | `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-9/quality-report.md`       | 確認対象           |
| 更新済み Phase 10 doc    | `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-10/final-review-result.md` | 確認対象           |

## 成果物

| 成果物         | パス                                        | 内容                               |
| -------------- | ------------------------------------------- | ---------------------------------- |
| 手動テスト仕様 | `phase-11-manual-test.md`                   | NON_VISUAL 確認手順                |
| 手動確認表     | `outputs/phase-11/manual-test-checklist.md` | 確認項目一覧と実施状態             |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md`    | ドキュメント確認結果（NON_VISUAL） |

## 統合テスト連携

- Phase 12 は本 Phase の `manual-test-checklist.md` と `manual-test-result.md` を入力として close-out する
- 本 Phase の発見事項は `outputs/phase-12/unassigned-task-detection.md` と `outputs/phase-12/skill-feedback-report.md` に引き継ぐ

## 完了条件

- [ ] NON_VISUAL 判定が記録されている（タスク分類: docs-only task）
- [ ] 更新ドキュメントの内容確認チェックリストが完了している
- [ ] Phase 9 テスト結果とドキュメントの整合が確認されている
- [ ] `outputs/phase-11/manual-test-checklist.md` が作成されている
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## Phase末端アクション【必須】

- `outputs/phase-11/manual-test-checklist.md` を作成し、確認項目と実施状態を記録する
- `outputs/phase-11/manual-test-result.md` を作成し、NON_VISUAL 判定と確認結果を記録する
- `artifacts.json` の Phase 11 ステータスを `completed` に更新する
