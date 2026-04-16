# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 6                                    |
| 機能名     | TASK-CI-FUTURE-003                   |
| タスク名   | キャッシュヒット率のモニタリング設定 |
| 前提Phase  | Phase 5                              |
| 後続Phase  | Phase 7                              |
| 作成日     | 2026-04-15                           |
| ステータス | pending                              |

## 目的

Phase 4 のテストケースで未カバーの edge case・フェイルパス・回帰ガードを追加し、テストの網羅性を向上させる。

## 実行タスク

### Task 6-A: フェイルパスのテスト追加

Phase 4 では正常系 3 状態を定義した。フェイルパスと境界条件を追加する。

| Case | ID     | 状況                                                    | 期待する動作                                                |
| ---- | ------ | ------------------------------------------------------- | ----------------------------------------------------------- |
| 8    | TC-008 | `CACHE_HIT` 環境変数が未定義の場合                      | ミスとして判定される（空文字列扱い）                        |
| 9    | TC-009 | `CACHE_REASON` に特殊文字（スペース等）が含まれる場合   | 正常に Summary に出力される（引用符付き変数参照で問題ない） |
| 10   | TC-010 | `$GITHUB_STEP_SUMMARY` が利用不可（ローカル実行）の場合 | ステップが `continue-on-error: true` でスキップされる       |
| 11   | TC-011 | キャッシュステップの直前ステップが失敗した場合          | `if: always()` により判定ステップが実行される               |

### Task 6-B: 回帰ガードの定義

本タスクの変更が既存 CI を壊さないことを保証する回帰ガードを定義する。

| ガード ID | 対象                  | 検証内容                                            | 検証タイミング |
| --------- | --------------------- | --------------------------------------------------- | -------------- |
| RG-001    | 既存 lint ジョブ      | lint 結果が変更後も同じ合否結果になること           | CI 実行        |
| RG-002    | 既存 typecheck ジョブ | typecheck 結果が変更後も同じ合否結果になること      | CI 実行        |
| RG-003    | 既存 test ジョブ      | test 結果が変更後も同じ合否結果になること           | CI 実行        |
| RG-004    | CI 実行時間           | 変更後の CI 実行時間が変更前と比べて 5 秒以内の増加 | CI 実行        |

### Task 6-C: 既存テストへの干渉確認

```bash
# Phase 5 実装後の CI 実行ログで以下を確認する
# 1. キャッシュステップに id を追加したことで既存の参照が壊れていないか
# 2. 判定ステップが他のステップの output を上書きしていないか
# 3. GITHUB_STEP_SUMMARY への書き込みが既存の Summary 内容を削除していないか（>> 形式の確認）
```

### Task 6-D: 補助コマンド定義

```bash
# キャッシュ状態の手動確認コマンド
gh cache list --repo daishiman/AIWorkflowOrchestrator

# 特定キャッシュの削除
gh cache delete <cache-id> --repo daishiman/AIWorkflowOrchestrator

# CI 実行結果の確認
gh run list --workflow=ci.yml --limit=5

# 最新 CI 実行のログ確認
gh run view --log $(gh run list --workflow=ci.yml --limit=1 --json databaseId --jq '.[0].databaseId')
```

## 参照資料

| 資料名               | パス                                        | 用途                 |
| -------------------- | ------------------------------------------- | -------------------- |
| Phase 4 テスト仕様   | `outputs/phase-4/test-specification.md`     | 既存テストケース確認 |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md` | 実装内容確認         |
| CI ワークフロー      | `.github/workflows/ci.yml`                  | 実装後の確認         |
| phase 4 成果物       | `outputs/phase-4/ci-execution-plan.md`      | Phase 4 成果物       |
| phase 5 成果物       | `outputs/phase-5/changed-files.md`          | Phase 5 成果物       |

## 実行手順

1. Phase 4 のテストケース（TC-001〜TC-007）の実行結果を確認する
2. フェイルパス TC-008〜TC-011 を追加する
3. 回帰ガード RG-001〜RG-004 を定義し、実行結果を記録する
4. 補助コマンドを確認・実行する
5. 成果物を `outputs/phase-6/` に保存する

## 成果物

| 成果物名         | 保存先                                      | 説明                        |
| ---------------- | ------------------------------------------- | --------------------------- |
| 拡張テストケース | `outputs/phase-6/extended-test-cases.md`    | TC-008〜TC-011 の仕様と結果 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | RG-001〜RG-004 の実行結果   |

## 完了条件

- [ ] フェイルパス TC-008〜TC-011 が定義・実行されている
- [ ] 回帰ガード RG-001〜RG-004 が定義・実行されている
- [ ] 全回帰ガードが PASS していること（CI の既存動作に影響がないこと）
- [ ] 成果物 2 件が `outputs/phase-6/` に保存されている
