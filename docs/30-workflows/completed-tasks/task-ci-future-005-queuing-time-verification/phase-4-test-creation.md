# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 4                         |
| Phase名    | テスト作成                |
| 対象タスク | TASK-CI-FUTURE-005        |
| 前提Phase  | Phase 3: 設計レビュー     |
| 次Phase    | Phase 5: 実装（計測実行） |
| ステータス | pending                   |
| 作成日     | 2026-04-15                |

## 目的

AC-1〜AC-5 を 1:1 でカバーする計測シナリオとコマンドスイートを定義する。
NON_VISUAL タスクのため、テストは計測コマンドの実行確認と結果検証で構成する。

## 実行タスク

- Task 1: テストシナリオ定義
- Task 2: 計測コマンドスイートの定義
- Task 3: Phase 3 MINOR 指摘の反映
- Task 4: 受入条件との対応表の作成
- Task 5: private method テスト方針の確認

### Task 1: テストシナリオ定義

| TC-ID  | 対象 AC | シナリオ説明                                                            | 期待結果                                                                 |
| ------ | ------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| TC-001 | AC-1    | `gh run list --branch main --status completed` で最新 Run ID を特定する | TASK-CI-OPT-001 マージ後の完了済み Run ID が 1 件以上取得できる          |
| TC-002 | AC-2    | `gh run view <run-id> --json jobs` で test-desktop ジョブを取得する     | 17 件の test-desktop ジョブが含まれ、`createdAt`・`startedAt` が存在する |
| TC-003 | AC-3    | `jq` で最大キューイング時間を算出する                                   | 数値（秒）として最大キューイング時間が得られる                           |
| TC-004 | AC-4    | 算出した最大キューイング時間を 60 秒閾値と比較して判定する              | ≤60s または >60s の判定が確定する                                        |
| TC-005 | AC-5    | CI-M-01 解決済みの記録を `measurement-result.md` に保存する             | Run ID・計測値・判定根拠が記録されている                                 |
| TC-E01 | -       | `startedAt` が null のジョブが存在する場合の処理                        | null のジョブはスキップし、残りのジョブで計測継続する                    |
| TC-E02 | -       | `jq` の `fromdateiso8601` が利用できない環境でのフォールバック          | Python コマンドで代替計算が成功する                                      |

### Task 2: 計測コマンドスイートの定義

以下のコマンドを実行順に定義する：

**ステップ 1: Run ID 特定**

```bash
gh run list --branch main --status completed --limit 10
```

期待出力: 完了済み Run の一覧（TASK-CI-OPT-001 マージ後のものを選択）

**ステップ 2: シャード数確認**

```bash
gh run view <run-id> --json jobs | jq '[.jobs[] | select(.name | startswith("test-desktop"))] | length'
```

期待出力: `17`

**ステップ 3: キューイング時間計算**

```bash
gh run view <run-id> --json jobs \
  | jq '[.jobs[]
      | select(.name | startswith("test-desktop"))
      | (.startedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)
    ] | max'
```

期待出力: 数値（秒単位）

**ステップ 4: 判定**

```bash
# 以下のように変数に代入して比較
MAX_QUEUING=$(gh run view <run-id> --json jobs \
  | jq '[.jobs[] | select(.name | startswith("test-desktop"))
      | (.startedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)] | max')

if [ "$MAX_QUEUING" -le 60 ]; then
  echo "判定: シャード数 17 継続（キューイング ${MAX_QUEUING} 秒 ≤ 60 秒）"
else
  echo "判定: シャード数 16 への戻し（キューイング ${MAX_QUEUING} 秒 > 60 秒）"
fi
```

### Task 3: Phase 3 MINOR 指摘の反映

| 指摘ID    | 内容                    | テスト手順への反映                                     |
| --------- | ----------------------- | ------------------------------------------------------ |
| CI-M-01-A | `startedAt` null ケース | TC-E01 で null ケースの処理シナリオを追加した          |
| CI-M-01-B | 単一 Run 計測の限界     | TC-005 成果物に「単一 Run 計測の限界と許容根拠」を記載 |
| CI-M-01-C | 代替計算方法の優先順位  | TC-E02 で jq 失敗時の Python フォールバックを追加した  |

### Task 4: 受入条件との対応表

| 受入条件 | 対応テストシナリオ | カバレッジ |
| -------- | ------------------ | ---------- |
| AC-1     | TC-001             | ✅         |
| AC-2     | TC-002             | ✅         |
| AC-3     | TC-003             | ✅         |
| AC-4     | TC-004             | ✅         |
| AC-5     | TC-005             | ✅         |
| エラー   | TC-E01, TC-E02     | ✅         |

### Task 5: private method テスト方針（NON_VISUAL タスク向け）

本タスクはシェルコマンド実行によるブラックボックステストのため、
private method テストの概念は適用しない。
計測コマンドの出力形式と期待値を TC として定義し、Phase 5 実行時に確認する。

## 参照資料

| 資料名                      | パス                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------- |
| Phase 1 要件定義            | `outputs/phase-1/requirements.md`                                                   |
| Phase 2 設計書              | `./phase-2-design.md`                                                               |
| Phase 3 レビュー書          | `./phase-3-design-review.md`                                                        |
| TASK-CI-FUTURE-005 元仕様書 | `docs/30-workflows/unassigned-task/TASK-CI-FUTURE-005-queuing-time-verification.md` |

## 統合テスト連携

- 前Phase の成果物を受け取り、次Phase へ引き継ぐ
- この Phase の成果物は次Phase の検証入力になる

## 成果物

| 成果物       | パス                           | 説明                                |
| ------------ | ------------------------------ | ----------------------------------- |
| テスト計画書 | `outputs/phase-4/test-plan.md` | TC-001〜TC-005・TC-E01〜TC-E02 定義 |

## 完了条件

- [ ] TC-001〜TC-005 が AC-1〜AC-5 と 1:1 で対応している
- [ ] TC-E01・TC-E02 でエラーケースが定義されている
- [ ] 計測コマンドスイート（ステップ 1〜4）が定義されている
- [ ] Phase 3 MINOR 指摘が全てテスト手順に反映されている
- [ ] 受入条件との対応表が完成している
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 5: 実装（計測実行）](./phase-5-implementation.md)
