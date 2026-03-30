# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 6                                      |
| 機能名   | workflow-manifest-production-placement |
| 作成日   | 2026-03-29                             |
| タスクID | TASK-P0-03                             |

## 目的

Phase 5 で作成した manifest に対して、変更された manifest の edge case と regression を防ぐ追加テストを定義する。

## 実行タスク

- edge case 定義: manifest を部分的に変更した場合の検証失敗パターンを追加する
- regression case 追加: resource path の移動・削除時に検出できるテストを追加する
- fixture 互換性テスト: テストフィクスチャと本番 manifest の構造差分が意図的であることを確認する

## 参照資料

| 資料名                 | パス                                                  | 説明               |
| ---------------------- | ----------------------------------------------------- | ------------------ |
| phase-4 test creation  | `phase-4-test-creation.md`                            | base テストケース  |
| phase-5 implementation | `phase-5-implementation.md`                           | 実装済み manifest  |
| workflow-manifest.json | `.claude/skills/skill-creator/workflow-manifest.json` | 本番 manifest 正本 |
| test plan              | `outputs/phase-4/test-plan.md`                        | テスト実行計画     |

## テスト拡充内容

### edge case 一覧

| ID    | edge case                                       | 期待動作                        |
| ----- | ----------------------------------------------- | ------------------------------- |
| EC-01 | phase の dependsOn に存在しない phase ID を指定 | validation error がスローされる |
| EC-02 | resource の kind を空文字にする                 | validation error がスローされる |
| EC-03 | entry hook の command を空文字にする            | validation error がスローされる |
| EC-04 | phases を 1 つだけにする                        | 検証は通過する（最低 1 phase）  |
| EC-05 | resource の phaseIds に存在しない phase を指定  | 検証動作を確認する              |

### regression case 一覧

| ID    | regression case                          | 検出方法                                |
| ----- | ---------------------------------------- | --------------------------------------- |
| RC-01 | resource path のファイルが削除された     | fs.existsSync() で false を検出する     |
| RC-02 | schemaVersion が変更された               | manifest.schemaVersion !== 1 を検出する |
| RC-03 | workflowId が空文字に変更された          | validation error を検出する             |
| RC-04 | `.agents` mirror が `.claude` と乖離した | parity check で差分を検出する           |

## 実行手順

### ステップ1: edge case テストを作成する

EC-01 から EC-05 の変更パターンに対する検証テストを追加する。

### ステップ2: regression case テストを作成する

RC-01 から RC-04 のパターンに対する検出テストを追加する。

### ステップ3: fixture 互換性を確認する

テストフィクスチャと本番 manifest の構造差分を列挙し、各差分が意図的であることを記録する。

## 統合テスト連携

| 観点               | 実施内容                                     |
| ------------------ | -------------------------------------------- |
| edge case coverage | 全 edge case にテストが対応していること      |
| regression guard   | resource path の変更を検出できること         |
| fixture compat     | テストフィクスチャとの差分が意図的であること |

## 多角的チェック観点

| 観点     | この Phase で確認する内容                               |
| -------- | ------------------------------------------------------- |
| 再発防止 | manifest 変更時に自動検出される仕組みが定義されているか |
| 網羅性   | ManifestLoader の全検証パスに対してテストがあるか       |
| 保守性   | テスト自体が manifest 構造変更に過剰に依存していないか  |

## サブタスク管理

1. edge case テスト作成
2. regression case テスト作成
3. fixture 互換性確認
4. Phase 7 input 整理

## 成果物

| 成果物                | パス                                       | 説明                 |
| --------------------- | ------------------------------------------ | -------------------- |
| edge case test plan   | `outputs/phase-6/edge-case-test-plan.md`   | edge case 一覧       |
| regression test plan  | `outputs/phase-6/regression-test-plan.md`  | regression case 一覧 |
| fixture compat report | `outputs/phase-6/fixture-compat-report.md` | 構造差分の記録       |

## 完了条件

- [ ] edge case EC-01 から EC-05 が定義されている
- [ ] regression case RC-01 から RC-04 が定義されている
- [ ] fixture 互換性の確認が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 4 を参照した
- [ ] Phase 5 を参照した
- [ ] edge case テストを定義した
- [ ] regression case テストを定義した

## 次のPhase

Phase 7: カバレッジ確認
