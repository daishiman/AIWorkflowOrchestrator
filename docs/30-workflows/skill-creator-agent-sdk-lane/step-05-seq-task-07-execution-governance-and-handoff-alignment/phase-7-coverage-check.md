# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 7                                          |
| 機能名 | execution-governance-and-handoff-alignment |
| 作成日 | 2026-03-26                                 |

## 目的

route priority、consumer auth guard、handoff DTO、approval/disclosure、renderer visible handoff の 5 観点が揃っているか確認する。

## 実行タスク

- governance coverage を concern ごとに棚卸しする
- shared contract 再利用と per-surface duplication 禁止を coverage 観点へ入れる
- Task08 前提の route state が抜けていないか確認する

## カバレッジ観点

| 観点                | 確認内容                                                          |
| ------------------- | ----------------------------------------------------------------- |
| route coverage      | `integrated_api` / `terminal_handoff` / degraded / consumer token |
| handoff coverage    | `HandoffGuidance` / sanitize / visible handoff / no console-only  |
| approval coverage   | grant / reject / expired / already_used                           |
| disclosure coverage | fetch 可否、fallback、renderer summary                            |
| downstream coverage | Task05 / 06 の host と Task08 の persistence 前提                 |

## 参照資料

| 資料名         | パス                             | 説明       |
| -------------- | -------------------------------- | ---------- |
| Phase 5 実装   | `phase-5-implementation.md`      | 実装対象   |
| Phase 4 テスト | `phase-4-test-creation.md`       | 基本観点   |
| Phase 6 拡充   | `phase-6-test-expansion.md`      | edge case  |
| test matrix    | `outputs/phase-4/test-matrix.md` | ケース一覧 |

## 成果物

| 成果物         | パス                        | 説明       |
| -------------- | --------------------------- | ---------- |
| coverage check | `phase-7-coverage-check.md` | 観点棚卸し |

## 統合テスト連携

- カバレッジ漏れは Phase 6 追加ケースへ戻す
- Task08 前提の route state / manual boundary が coverage に入っていることを確認する

## 完了条件

- [ ] governance 5観点が揃っている
- [ ] shared contract 重複禁止の観点が含まれている
- [ ] Task08 前提が coverage 観点に含まれている
- [ ] **本Phase内の全タスクを100%実行完了**
