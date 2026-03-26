# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| Phase    | 4                                              |
| 機能名   | task-sdk-01-phase12-compliance-sync            |
| 作成日   | 2026-03-26                                     |
| タスクID | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001 |

## 目的

Phase 5 実装前に、4点同期、Phase 12 guide、ledger sync、unassigned-task 監査の確認手順を固定する。

## 実行タスク

- command suite 作成: 実行する validator と grep を固定する
- expected result 定義: 各 command の PASS 条件と FAIL 条件を書く
- drift case 作成: status drift、summary 不足、重複 tracker 起票の失敗パターンを定義する

## 参照資料

| 資料名               | パス                                                                                          | 説明           |
| -------------------- | --------------------------------------------------------------------------------------------- | -------------- |
| phase-1 requirements | `phase-1-requirements.md`                                                                     | AC と scope    |
| phase-2 design       | `phase-2-design.md`                                                                           | lane と matrix |
| phase-3 review       | `phase-3-design-review.md`                                                                    | gate decision  |
| validation matrix    | `outputs/phase-2/validation-matrix.md`                                                        | command 一覧   |
| parent workflow      | `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/index.md` | 実行対象       |

## 実行手順

### ステップ1: command 一覧を確定する

`verify-all-specs`、`validate-phase-output`、`validate-phase12-implementation-guide`、`audit-unassigned-tasks` を固定する。

### ステップ2: expected result を定義する

各 command ごとに PASS 条件、FAIL 時に確認するファイル、戻り先 Phase を記録する。

### ステップ3: drift case を作成する

status 不一致、summary 不足、backlog 未登録、baseline/current 混同の 4 ケースを整理する。

## 統合テスト連携

| 観点           | 実施内容                                               |
| -------------- | ------------------------------------------------------ |
| validator path | command が全て実在する                                 |
| target path    | parent workflow と unassigned-task path が全て実在する |
| fail triage    | FAIL ごとの戻り先が定義されている                      |

## 多角的チェック観点

| 観点     | この Phase で確認する内容           |
| -------- | ----------------------------------- |
| 分析思考 | command が AC に対応しているか      |
| 反証思考 | false complete を見逃す抜けがないか |
| 再現性   | 別担当でも同じ順序で再実行できるか  |

## サブタスク管理

1. command suite 定義
2. expected result 定義
3. drift case 整理
4. Phase 5 input 整理

## 成果物

| 成果物                  | パス                                         | 説明               |
| ----------------------- | -------------------------------------------- | ------------------ |
| test matrix             | `outputs/phase-4/test-matrix.md`             | 観点別テスト一覧   |
| command plan            | `outputs/phase-4/command-plan.md`            | 実行順と pass 条件 |
| status drift checkcases | `outputs/phase-4/status-drift-checkcases.md` | 失敗パターン定義   |

## 完了条件

- [ ] command suite が定義されている
- [ ] expected result が command 単位で書かれている
- [ ] drift case が 4 ケース以上定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 を参照した
- [ ] Phase 2 を参照した
- [ ] Phase 3 を参照した
- [ ] test matrix を定義した

## 次のPhase

Phase 5: 実装
