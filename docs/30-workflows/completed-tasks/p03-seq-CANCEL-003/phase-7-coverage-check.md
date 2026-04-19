# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 7                                 |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 6                           |
| 後続Phase  | Phase 8                           |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

cancel Main 層の concern と dependency edge が targeted test で押さえられているか確認する。

## 背景

この task の重要点は、数値カバレッジよりも「abort/reset」「register/unregister」「consumer 調査」という関心の網羅である。Phase 7 では観点ベースの coverage を明示する。

## 実行タスク

### タスク0: concern coverage 確認

**目的**: 主要観点の到達有無を整理する。

**実行手順**:

1. `AbortController` 保持、abort、reset の3観点を確認する。
2. handler register、delegation、unregister の3観点を確認する。
3. `AbortSignal` consumer 調査が証跡として残っているか確認する。

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`

### タスク1: dependency edge 確認

**目的**: CANCEL-002/003/004 の依存関係を coverage 観点に反映する。

**実行手順**:

1. CANCEL-002 → 003 の接続が仕様上閉じているか確認する。
2. CANCEL-003 単体では E2E 完了にならないことを明記する。
3. CANCEL-004 側へ残る edge を一覧化する。

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`

## 参照資料

| 参照資料               | パス                                                           | 内容                       |
| ---------------------- | -------------------------------------------------------------- | -------------------------- |
| Phase 4 テスト設計     | `outputs/phase-4/test-design.md`                               | concern 一覧               |
| Phase 5 差分確認       | `outputs/phase-5/implementation-summary.md`                    | 補修有無と regression 対象 |
| Phase 6 テスト拡充記録 | `outputs/phase-6/test-expansion-record.md`                     | edge case 一覧             |
| 設計レビュー           | `docs/30-workflows/00-task-spec-design-docs/phase-3-review.md` | dependency edge            |

## 成果物

| 成果物                 | パス                                 | 内容                                          |
| ---------------------- | ------------------------------------ | --------------------------------------------- |
| カバレッジ確認レポート | `outputs/phase-7/coverage-report.md` | concern coverage、dependency edge、未到達観点 |

## 統合テスト連携【必須】

| 判定項目                             | 基準 | 結果    |
| ------------------------------------ | ---- | ------- |
| concern coverage が記録されている    | 完了 | pending |
| dependency edge が記録されている     | 完了 | pending |
| 未到達観点がある場合は明示されている | 完了 | pending |

## 完了条件

- [ ] concern coverage を記録している
- [ ] dependency edge を記録している
- [ ] 未到達観点を明示している
- [ ] outputs にレポートを残している
