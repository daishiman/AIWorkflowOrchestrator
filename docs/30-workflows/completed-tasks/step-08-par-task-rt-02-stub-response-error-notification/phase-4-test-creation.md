# Phase 4: テスト作成

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 4                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

false-success 再発防止と explicit error union の整合をテストケースへ落とす。

## 実行タスク

- plan logical error のテストを作成する
- improve logical error のテストを作成する
- execute 抑止の UI テストを作成する
- IPC transport failure 分離テストを作成する
- 正常系 / terminal handoff 回帰テストを作成する

## 参照資料

| 資料名           | パス                                                                                 | 説明               |
| ---------------- | ------------------------------------------------------------------------------------ | ------------------ |
| Phase 2 設計     | `phase-2-design.md`                                                                  | 目標契約           |
| Phase 3 レビュー | `phase-3-design-review.md`                                                           | gate 結果          |
| Facade test      | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | 既存テストパターン |
| renderer test    | `apps/desktop/src/renderer/components/skill/__tests__/`                              | UI テストパターン  |

## 実行手順

### ステップ1: テストマトリクス

| TC    | 対象            | 条件                  | 期待結果                                       | AC         |
| ----- | --------------- | --------------------- | ---------------------------------------------- | ---------- |
| TC-01 | plan            | `llmAdapter` 未注入   | `success:false` の plan error union            | AC-1       |
| TC-02 | plan            | `resourceLoader` 不足 | `error.code === "resource_loader_unavailable"` | AC-1       |
| TC-03 | improve         | degraded 条件         | `RuntimeSkillCreatorImproveErrorResponse`      | AC-3       |
| TC-04 | IPC             | plan logical error    | outer `success:true`, `data.success:false`     | AC-5       |
| TC-05 | IPC             | validation failure    | outer `success:false`                          | AC-5       |
| TC-06 | renderer        | plan logical error    | error message 表示、execute CTA 無効           | AC-2, AC-6 |
| TC-07 | renderer        | unknown reason code   | fallback message を表示                        | AC-6       |
| TC-08 | plan 正常系     | runtime 初期化済み    | 既存成功 shape 維持                            | AC-7       |
| TC-09 | improve handoff | `terminal_handoff`    | 既存 union 維持                                | AC-7       |

## 統合テスト連携

- Phase 6 で edge case を追加する
- Phase 7 で TC と concern coverage を対応付ける

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                             |
| ------------------ | -------- | ------------------------------------------------------ |
| エラーハンドリング | 必須     | `aiworkflow-requirements: error-handling.md`           |
| UI/UX              | 必須     | `aiworkflow-requirements: ui-ux-*.md`                  |
| IPC通信            | 必須     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |

## 成果物

| 成果物      | パス                             | 説明       |
| ----------- | -------------------------------- | ---------- |
| テスト仕様  | `phase-4-test-creation.md`       | テスト計画 |
| test matrix | `outputs/phase-4/test-matrix.md` | TC 一覧    |

## 完了条件

- [ ] logical error / transport error / 正常系 / handoff が分離されている
- [ ] execute 抑止が UI テストに含まれている
- [ ] wizard / lifecycle の両導線が対象化されている
- [ ] **本Phase内の全タスクを100%実行完了**
