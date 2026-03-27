# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 4                                          |
| 機能名   | task-exec-scope-definition-path-update-001 |
| 作成日   | 2026-03-27                                 |
| タスクID | UT-EXEC-01                                 |

## 目的

docs-only patch の完了条件を command と expected result へ変換し、追記後の判断を曖昧にしない。

## 実行タスク

- existence check を定義する
- row insertion check を定義する
- existing row preservation check を定義する
- workflow self-validation command を定義する

## 参照資料

| 資料名               | パス                                         | 説明              |
| -------------------- | -------------------------------------------- | ----------------- |
| Phase 1 requirements | `outputs/phase-1/requirements-definition.md` | AC の元定義       |
| Phase 2              | `phase-2-design.md`                          | validation matrix |
| validation matrix    | `outputs/phase-2/validation-matrix.md`       | AC 対応           |
| Phase 3 gate         | `outputs/phase-3/gate-decision.md`           | test 着手可否     |

## 成果物

| 成果物                  | パス                                         | 説明                                       |
| ----------------------- | -------------------------------------------- | ------------------------------------------ |
| test matrix             | `outputs/phase-4/test-matrix.md`             | command × expected                         |
| command plan            | `outputs/phase-4/command-plan.md`            | 実行順                                     |
| status drift checkcases | `outputs/phase-4/status-drift-checkcases.md` | stale path / duplicate source の確認ケース |

## 統合テスト連携

- docs-only task のため unit test は不要だが、path・grep・diff・workflow validator を合わせて integration evidence とみなす。

## 完了条件

- [ ] existence / insertion / preservation / validator の 4 系統が定義されている
- [ ] command 順が actual target を前提にしている
- [ ] **本Phase内の全タスクを100%実行完了**
