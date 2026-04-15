# Phase 7: カバレッジ確認（改善効果計測）

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 7                        |
| 機能名 | task-ci-optimization-001 |
| 作成日 | 2026-04-14               |

## 目的

CI 改善の達成度を計測・検証する。
実装後 5 回分の CI 実行時間を計測し、目標（全体 7分40秒以内）の達成を確認する。
node_modules キャッシュのヒット率・各ジョブの実行時間内訳も計測し、改善効果を定量的に記録する。

---

## 実行タスク

- **タスク1**: 改善後 5 回分の CI 実行時間を計測する
- **タスク2**: 各ジョブの実行時間内訳を確認する（build-shared・test-desktop シャード）
- **タスク3**: 目標達成判定（7分40秒以内か）
- **タスク4**: node_modules キャッシュのヒット率確認

---

## 参照資料

| 資料名                   | パス                                        | 説明                       |
| ------------------------ | ------------------------------------------- | -------------------------- |
| Phase 4 ベースライン     | `outputs/phase-4/baseline-timing.md`        | 改善前の計測値（比較対象） |
| Phase 6 エッジケース結果 | `outputs/phase-6/edge-case-verification.md` | エッジケース PASS 確認     |
| Phase 5 GREEN 確認結果   | `outputs/phase-5/green-confirmation.md`     | 実装完了確認               |

---

## 実行手順

### ステップ0: Phase 7 事前確認【必須】

```bash
# Phase 6 が完了していることを確認
ls outputs/phase-6/edge-case-verification.md

# 計測対象ブランチの最新 CI 状態確認
gh run list --workflow=ci.yml --limit 5 --json databaseId,headBranch,conclusion,status
```

### ステップ1: 改善後 5 回分の CI 実行時間計測

```bash
# 直近 5 回の CI 実行時間を取得（秒単位）
gh run list --workflow=ci.yml --limit 5 \
  --json databaseId,startedAt,updatedAt,conclusion \
  --jq '.[] | {
    id: .databaseId,
    duration_sec: ((.updatedAt | fromdateiso8601) - (.startedAt | fromdateiso8601)),
    duration_min: (((.updatedAt | fromdateiso8601) - (.startedAt | fromdateiso8601)) / 60 | floor),
    conclusion: .conclusion
  }'
```

計測結果を `outputs/phase-7/ci-timing-report.md` に記録する。

**記録フォーマット**:

| Run ID   | 実行時間（秒） | 実行時間（分） | 結論 |
| -------- | -------------- | -------------- | ---- |
| TBD      | TBD            | TBD            | TBD  |
| TBD      | TBD            | TBD            | TBD  |
| TBD      | TBD            | TBD            | TBD  |
| TBD      | TBD            | TBD            | TBD  |
| TBD      | TBD            | TBD            | TBD  |
| **平均** | **TBD**        | **TBD**        | -    |

### ステップ2: 各ジョブの実行時間内訳確認

最新の CI run について、ジョブごとの実行時間を確認する。

```bash
# 最新 run ID を取得
LATEST_RUN=$(gh run list --workflow=ci.yml --limit 1 --json databaseId --jq '.[0].databaseId')

# 全ジョブの実行時間内訳
gh run view $LATEST_RUN --json jobs \
  --jq '.jobs[] | {
    name: .name,
    duration_sec: ((.completedAt | fromdateiso8601) - (.startedAt | fromdateiso8601)),
    conclusion: .conclusion
  }' | sort -t: -k2 -rn

# build-shared ジョブの時間
gh run view $LATEST_RUN --json jobs \
  --jq '.jobs[] | select(.name == "build-shared") | {
    name: .name,
    duration_sec: ((.completedAt | fromdateiso8601) - (.startedAt | fromdateiso8601))
  }'

# test-desktop 全シャードの最長・最短・平均時間
gh run view $LATEST_RUN --json jobs \
  --jq '[.jobs[] | select(.name | startswith("test-desktop")) |
    (.completedAt | fromdateiso8601) - (.startedAt | fromdateiso8601)] |
    {max: max, min: min, avg: (add/length | floor)'
```

**内訳確認表（`outputs/phase-7/ci-timing-report.md` に記録）**:

| ジョブ名                     | 改善前（分） | 改善後（分） | 削減率 |
| ---------------------------- | ------------ | ------------ | ------ |
| build-shared                 | ~3 分        | TBD          | TBD    |
| test-desktop（最長シャード） | ~12 分       | TBD          | TBD    |
| CI 全体                      | ~15 分       | TBD          | TBD    |

### ステップ3: 目標達成判定

**達成基準（計測値と期待値の対応表）**:

| 受入基準 | 判定条件                                                                | 計測値 | 判定 |
| -------- | ----------------------------------------------------------------------- | ------ | ---- |
| AC-1     | CI ログに "Cache node_modules" ステップが存在し、cache-hit が記録される | TBD    | TBD  |
| AC-2     | 5 回平均の CI 実行時間が 460 秒（7分40秒）以内                          | TBD    | TBD  |
| AC-3     | test-desktop の全 17 シャードが success                                 | TBD    | TBD  |
| AC-4     | matrix に shard: [1..17] が定義され、--shard=N/17 で実行される          | TBD    | TBD  |
| AC-5     | OOM エラーなし（Phase 6 ステップ3 の結果を参照）                        | TBD    | TBD  |
| AC-6     | main ブランチのカバレッジ収集ジョブが success                           | TBD    | TBD  |

**判定フロー**:

| 状態                      | 判定   | 次のアクション                                   |
| ------------------------- | ------ | ------------------------------------------------ |
| 全 AC が達成              | PASS   | Phase 8（リファクタリング）へ進む                |
| AC-2 のみ未達（時間超過） | 要調査 | ジョブ内訳を再分析し、ボトルネックを特定する     |
| AC-3 でシャード失敗あり   | FAIL   | Phase 5 に戻りシャード設定を確認する             |
| AC-5 で OOM 発生          | FAIL   | CI_MAX_FORKS を 2 に戻す（ロールバック基準参照） |

### ステップ4: キャッシュヒット率確認

```bash
# 直近 5 回の run でキャッシュヒット状況を確認
for run_id in $(gh run list --workflow=ci.yml --limit 5 --json databaseId --jq '.[].databaseId'); do
  echo "=== Run $run_id ==="
  gh run view $run_id --log 2>/dev/null | grep -E "Cache node_modules|cache-hit|Cache restored|Cache not found" | head -5
done

# キャッシュ一覧（サイズと作成日時の確認）
gh cache list --limit 10 --json key,sizeInBytes,createdAt \
  --jq '.[] | {key: .key, size_mb: (.sizeInBytes/1048576 | floor), created: .createdAt}'
```

**キャッシュヒット率の記録**（`outputs/phase-7/cache-effectiveness-report.md` に記録）:

| Run ID | キャッシュヒット | ヒットしたジョブ数 | ミスしたジョブ数 |
| ------ | ---------------- | ------------------ | ---------------- |
| TBD    | TBD              | TBD                | TBD              |

**判断基準**:

- 初回実行後: キャッシュが作成される（ヒット率 0%）
- 2 回目以降: キャッシュヒット率 100%（pnpm-lock.yaml が変更されていない場合）

---

## 統合テスト連携

- Phase 4 のベースライン計測値（`outputs/phase-4/baseline-timing.md`）と比較して改善幅を算出する
- 全 AC の達成状況を `outputs/phase-7/ci-timing-report.md` にまとめる
- AC-2 の 7分40秒以内が達成できない場合は、ジョブ内訳からボトルネックを特定し追加改善を検討する

---

## サブタスク管理

| ID     | タスク名                         | ステータス |
| ------ | -------------------------------- | ---------- |
| T-07-1 | 改善後 5 回分の CI 実行時間計測  | 未実施     |
| T-07-2 | 各ジョブの実行時間内訳確認       | 未実施     |
| T-07-3 | 目標達成判定（全 AC の合否確定） | 未実施     |
| T-07-4 | キャッシュヒット率確認           | 未実施     |

---

## 成果物

| 成果物                 | 配置先                                          | 形式     |
| ---------------------- | ----------------------------------------------- | -------- |
| CI 実行時間レポート    | `outputs/phase-7/ci-timing-report.md`           | Markdown |
| キャッシュ効果レポート | `outputs/phase-7/cache-effectiveness-report.md` | Markdown |

---

## 完了条件

- [ ] 改善後 5 回分の CI 実行時間が `outputs/phase-7/ci-timing-report.md` に記録されていること
- [ ] 各ジョブの実行時間内訳が記録されていること
- [ ] AC-1〜AC-6 の全受入基準に対して計測値と判定が記録されていること
- [ ] AC-2: 5 回平均の CI 実行時間が 7分40秒（460 秒）以内であること
- [ ] キャッシュヒット率が `outputs/phase-7/cache-effectiveness-report.md` に記録されていること
- [ ] ゲート判定（PASS/FAIL）が確定していること

---

## タスク100%実行確認【必須】

- [ ] T-07-1: 5 回分の CI 実行時間を計測し `outputs/phase-7/ci-timing-report.md` に記録済み
- [ ] T-07-2: ジョブ内訳（build-shared・test-desktop シャード）の実行時間を記録済み
- [ ] T-07-3: 全 AC（AC-1〜AC-6）の達成状況を判定し記録済み（全 PASS → Phase 8 へ）
- [ ] T-07-4: キャッシュヒット率を確認し `outputs/phase-7/cache-effectiveness-report.md` に記録済み

---

## 次Phase

**Phase 8: リファクタリング** — `pnpm-install-retry` に集約した共通キャッシュのコメント整備・重複排除の確認を行う。

**Phase 8 開始条件**: Phase 7 のゲート判定が PASS（全 AC 達成）であること。
**未達時**: AC-2 未達の場合はジョブ内訳を再分析して追加改善を検討する。AC-3/AC-5 失敗の場合は Phase 5 に戻る。
