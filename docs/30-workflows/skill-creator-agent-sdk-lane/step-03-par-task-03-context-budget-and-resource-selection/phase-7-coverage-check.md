# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 7                                     |
| 機能名 | context-budget-and-resource-selection |
| 作成日 | 2026-03-26                            |

## 目的

`agent` / `reference` / `schema` / `asset` の選択ロジックと candidate root の網羅性を確認する。

## 実行タスク

- resource kind coverage を確認する
- source root coverage を確認する
- provenance / degrade reason coverage を確認する

## 参照資料

| 資料名                 | パス                             | 説明                 |
| ---------------------- | -------------------------------- | -------------------- |
| Phase 5 実装           | `phase-5-implementation.md`      | suite 対象の実装範囲 |
| Phase 4 test matrix    | `outputs/phase-4/test-matrix.md` | coverage 基準        |
| Phase 6 test expansion | `phase-6-test-expansion.md`      | edge case 追加結果   |

## 実行手順

### ステップ1: resource kind coverage を数える

- `agent` / `reference` / `schema` / `asset` の各 kind が suite に入っているか確認する。

### ステップ2: source root coverage を数える

- manifest / explicit / env / home / repo bundle が suite に入っているか確認する。

## 統合テスト連携

- coverage 観点が Phase 9 の QA checklist に流用できる形か確認する。
- Phase 10 で downstream handoff を再点検する。

## 成果物

| 成果物         | パス                        | 説明                |
| -------------- | --------------------------- | ------------------- |
| coverage check | `phase-7-coverage-check.md` | coverage 観点の本文 |

## 完了条件

- [ ] 4 resource 種別がカバーされている
- [ ] manifest / explicit / env / home / repo bundle の root が coverage 対象にある
- [ ] provenance と degrade reason が coverage 対象にある
- [ ] **本Phase内の全タスクを100%実行完了**
