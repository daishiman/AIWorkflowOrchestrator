# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 6                         |
| Phase名    | テスト拡充                |
| 対象タスク | TASK-CI-FUTURE-005        |
| 前提Phase  | Phase 5: 実装（計測実行） |
| 次Phase    | Phase 7: カバレッジ確認   |
| ステータス | pending                   |
| 作成日     | 2026-04-15                |

## 目的

Phase 5 の計測実行結果を受けて、追加の検証シナリオとエッジケースのテストを拡充する。
計測の信頼性と判定の妥当性を強化する。

## 実行タスク

### Task 1: Phase 5 実行結果の確認

Phase 5 で記録された内容を確認する：

- 計測 Run ID: **\*\***\_\_\_**\*\***
- 最大キューイング時間: **\*\***\_\_\_**\*\*** 秒
- 判定: **\*\***\_\_\_**\*\***

### Task 2: 失敗パスのテスト追加

Phase 5 で発生したエラーや予期しない状況に対するテストを追加：

| TC-ID  | シナリオ                              | 対応方法                                       |
| ------ | ------------------------------------- | ---------------------------------------------- |
| TC-F01 | Run ID が見つからない場合             | エラーメッセージを記録して作業を中断する       |
| TC-F02 | test-desktop ジョブが 17 件未満の場合 | シャード数の設定を再確認する                   |
| TC-F03 | 全ジョブの `startedAt` が null の場合 | CI 完了を再確認して別の完了済み Run を選択する |
| TC-F04 | jq も Python もない環境での対処       | date コマンドで手動計算する手順を実行する      |

### Task 3: 回帰ガードの確認

キューイング > 60 秒で Phase 13 を実施する場合の追加確認：

| 確認項目                                          | 確認方法                                 |
| ------------------------------------------------- | ---------------------------------------- |
| ci.yml の matrix.shard が 16 要素になっている     | `grep "shard:" .github/workflows/ci.yml` |
| `--shard=N/17` が `--shard=N/16` に変更されている | `grep "shard=" .github/workflows/ci.yml` |
| 変更後の CI が全て PASS している                  | `gh pr checks` で確認                    |

### Task 4: 補助コマンドの定義

計測精度を上げるための補助コマンド：

```bash
# 全 test-desktop ジョブの詳細キューイング時間一覧
gh run view <run-id> --json jobs \
  | jq '.jobs[]
      | select(.name | startswith("test-desktop") and .startedAt != null)
      | {
          name: .name,
          queuing_sec: (
            (.startedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)
          )
        }' | jq -s 'sort_by(.queuing_sec)'

# 統計情報（最小・最大・平均）
gh run view <run-id> --json jobs \
  | jq '[.jobs[]
      | select(.name | startswith("test-desktop") and .startedAt != null)
      | (.startedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)
    ] | {min: min, max: max, avg: (add/length)}'
```

### Task 5: Phase 5 で発生した MINOR 指摘の記録

Phase 5 実行中に発見した問題点や改善点をここに記録する：

| 指摘ID                   | 内容 | 対応 |
| ------------------------ | ---- | ---- |
| （Phase 5 実行後に記入） |      |      |

## 参照資料

| 資料名         | パス                                    |
| -------------- | --------------------------------------- |
| Phase 5 実装   | `./phase-5-implementation.md`           |
| Phase 5 成果物 | `outputs/phase-5/measurement-result.md` |

## 統合テスト連携

- 前Phase の成果物を受け取り、次Phase へ引き継ぐ
- この Phase の成果物は次Phase の検証入力になる

## 成果物

| 成果物       | パス                                | 説明                               |
| ------------ | ----------------------------------- | ---------------------------------- |
| テスト拡充書 | `outputs/phase-6/test-expansion.md` | 失敗パス・回帰ガード・補助コマンド |

## 完了条件

- [ ] Phase 5 の計測結果が確認されている
- [ ] TC-F01〜TC-F04 の失敗パステストが定義されている
- [ ] 回帰ガードの確認項目が定義されている
- [ ] 補助コマンド（統計情報含む）が定義されている
- [ ] Phase 5 で発生した MINOR 指摘が記録されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
