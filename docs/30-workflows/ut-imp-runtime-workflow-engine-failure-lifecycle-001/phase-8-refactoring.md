# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 8                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

失敗系遷移追加で増える条件分岐を、helper と命名規約で整理し、後続 task が読める形に保つ。

## 実行タスク

- failure transition helper の抽出方針を定義する
- artifact append helper と latest accessor の分離を定義する
- guard error message の命名規約を定義する

## 参照資料

| 資料名  | パス                        | 説明               |
| ------- | --------------------------- | ------------------ |
| Phase 5 | `phase-5-implementation.md` | 変更対象           |
| Phase 7 | `phase-7-coverage-check.md` | 保護すべき concern |

## 成果物

| 成果物        | パス                     | 説明                     |
| ------------- | ------------------------ | ------------------------ |
| refactor plan | `phase-8-refactoring.md` | helper / naming 整理方針 |

## 統合テスト連携

- Phase 1 の `outputs/phase-1/spec-extraction-map.md`、Phase 2 の 2成果物、Phase 6 の edge case を参照し、helper 抽出後も責務境界と failure semantics が変わらないことを確認する。
- リファクタリングは Phase 7 で不足がなかった concern を減らさないことを条件に実施する。
- append helper と latest accessor の責務分離は回帰テスト名にも反映し、読み手が経路を追えるようにする。

## 完了条件

- [ ] failure 専用 helper 抽出方針がある
- [ ] artifact append と consumer access の境界が明記されている
- [ ] error / reason 命名規約が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
