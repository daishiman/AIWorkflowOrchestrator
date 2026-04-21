# [#2187] "[TASK-CI-FUTURE-008] test-web 実行時間モニタリング設定"

## メタ情報

```yaml
task_id: TASK-CI-FUTURE-008
task_name: test-web 実行時間モニタリング設定
category: 品質改善
target_feature: GitHub Actions CI / テスト品質
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-CI-FUTURE-002 Phase 12 未タスク検出
created_date: 2026-04-15
dependencies: []
spec_path: docs/30-workflows/unassigned-task/TASK-CI-FUTURE-008-test-web-timing-monitor.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-CI-FUTURE-002 にて `test-web` を 2 シャードで実装し、現時点での実行時間は許容範囲内に収まっている。しかし実装過程において、テスト数の増加による実行時間劣化を自動的に検知する仕組みが存在しないことが明らかになった。

TASK-CI-FUTURE-002 の Phase 11 では `test-web` の実行時間ベースラインを手動で計測・記録した。この手動計測に頼る運用では、テスト数が徐々に増加した場合の劣化を見逃すリスクがある。GitHub Actions の実行時間を定期的に自動計測・記録し、ベースラインを超過した場合にアラートを発する仕組みを整備することで、CI パフォーマンスの継続的な品質維持が可能となる。

### 1.2 問題点・課題

- `test-web` の実行時間を定期的に自動計測する仕組みが存在しない
- ベースライン値が手動で記録されているのみで、継続的な比較が行われていない
- テスト数増加による実行時間の緩やかな劣化（クリープ）を早期に検知できない
- 劣化が発覚するのは開発者が体感的に「遅くなった」と感じた後になりがちであり、対処が後手になる
- GitHub Actions の実行時間データを蓄積・可視化する仕組みが未整備である

### 1.3 放置した場合の影響

- `test-web` のテスト数増加に伴い、気づかないうちに実行時間が許容値を超過する
- CI 全体のボトルネックとなってから初めて問題に気づき、対処工数が増大する
- シャード数の再設計が必要になった場合に、過去の実行時間データがなく設計根拠を作れない
- TASK-CI-FUTURE-002 で確立したシャード構成の効果検証ができなくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

`test-web` の実行時間を定期的に自動計測・記録し、ベースラインを超過した場合にアラートを出す仕組みを GitHub Actions 上に整備する。

### 2.2 最終ゴール

GitHub Actions のスケジュール実行（`workflow_dispatch` または `schedule` トリガー）と GitHub Actions の実行時間計測機能を組み合わせて、`test-web` のシャードごとの実行時間を自動記録する。ベースライン値を設定ファイルで管理し、超過時は PR コメントや GitHub Actions の Summary に警告を表示する仕組みを構築する。

### 2.3 スコープ

#### 含むもの

- `test-web` シャードごとの実行時間を GitHub Actions 上で自動計測する仕組みの実装
- ベースライン値を管理する設定ファイル（JSON または YAML）の作成
- ベースライン超過時の警告出力（GitHub Actions Summary または Step の warning アノテーション）
- 計測結果を GitHub Actions の artifacts として保存する設定
- 定期実行（`schedule` トリガー）または手動実行（`workflow_dispatch` トリガー）のワークフロー追加

#### 含まないもの

- Datadog・Grafana 等の外部監視サービスとの連携
- `test-desktop` や `e2e` の実行時間モニタリング（`test-web` のみを対象とする）
- GitHub Actions の有料ランナーへの移行
- Slack・メール等の外部通知連携
- `apps/web` のアプリケーションコード変更

### 2.4 成果物

- `.github/workflows/ci-timing-monitor.yml`（`test-web` 実行時間モニタリング専用ワークフロー）
- `.github/ci-timing-baseline.json`（ベースライン値管理ファイル）
- 計測結果サンプル（artifacts として保存された実行時間レポート）
- 動作検証結果レポート（計測・比較・アラートの動作確認を含む）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-CI-FUTURE-002 が完了し、`test-web` の 2 シャード構成が CI 上で安定稼働していること
- `.github/workflows/ci.yml` に `test-web` のシャード設定が実装済みであること
- `apps/web` で Vitest が使用されており、`apps/web/vitest.config.ts` が存在していること
- `pnpm install` が完了していること
- GitHub Actions の artifacts 機能が利用可能であること（GitHub Free Tier で利用可能）

### 3.2 依存タスク

- TASK-CI-FUTURE-002（test-web シャード化）の完了が前提

### 3.3 必要な知識

- GitHub Actions の `schedule` トリガー（cron 構文）と `workflow_dispatch` トリガー
- GitHub Actions の `$GITHUB_STEP_SUMMARY` を使った Summary 出力
- GitHub Actions の `::warning::` / `::error::` アノテーション構文
- GitHub Actions の artifacts（`actions/upload-artifact`）の使い方
- Bash での時刻計測（`date +%s%N` または `time` コマンド）
- JSON ファイルの読み書き（`jq` コマンド）
- pnpm monorepo でのフィルタコマンド構文（`pnpm --filter @repo/web test`）

### 3.4 推奨アプローチ

#### Step 1: ベースライン値を確認する

```bash
# TASK-CI-FUTURE-002 で計測した test-web の実行時間を確認する
# （phase-11/ci-timing-measurements.md から取得）
cat docs/30-workflows/task-ci-future-002-test-web-sharding/outputs/phase-11/ci-timing-measurements.md
```

#### Step 2: ベースライン設定ファイルを作成する

```json
// .github/ci-timing-baseline.json の例
{
  "test-web": {
    "shard_count": 2,
    "baseline_seconds": 120,
    "warning_threshold_ratio": 1.2,
    "error_threshold_ratio": 1.5,
    "updated_at": "2026-04-15",
    "updated_by": "TASK-CI-FUTURE-008"
  }
}
```

- `baseline_seconds`: TASK-CI-FUTURE-002 Phase 11 で計測した最長シャードの実行時間（秒）
- `warning_threshold_ratio`: ベースラインの何倍を超えたら警告するか（例: 1.2 = 20% 超過で警告）
- `error_threshold_ratio`: ベースラインの何倍を超えたらエラーとするか（例: 1.5 = 50% 超過でエラー）

#### Step 3: モニタリングワークフローを作成する

#### Step 4: artifacts として計測結果を保存する

各シャードの実行時間を JSON ファイルに記録し、`actions/upload-artifact` でアップロードする。計測結果は 30 日間保存し、過去のトレンドを参照できるようにする。

#### Step 5: 動作検証する

```bash
# ローカルでベースライン確認スクリプトの動作を確認する
BASELINE=120
ELAPSED=150
WARNING_RATIO=1.2
THRESHOLD=$(echo "$BASELINE * $WARNING_RATIO" | bc | cut -d. -f1)
echo "Threshold: ${THRESHOLD}s, Elapsed: ${ELAPSED}s"
[ "$ELAPSED" -gt "$THRESHOLD" ] && echo "WARNING" || echo "OK"
```

---

## 4. 実行手順

### Phase 1: ベースライン値の収集と設定ファイル作成

#### 目的

TASK-CI-FUTURE-002 の計測結果からベースライン値を収集し、モニタリング基準となる設定ファイルを作成する。

#### 手順

1. TASK-CI-FUTURE-002 の Phase 11 成果物（`ci-timing-measurements.md`）から `test-web` の実行時間を確認する
2. シャードごとの実行時間と最長シャードの時間を記録する
3. 警告閾値（ベースラインの 120%）とエラー閾値（ベースラインの 150%）を決定する
4. `.github/ci-timing-baseline.json` を作成し、ベースライン値・閾値・更新日を記録する

```bash
# TASK-CI-FUTURE-002 成果物の確認
ls docs/30-workflows/task-ci-future-002-test-web-sharding/outputs/
```

#### 成果物

- `.github/ci-timing-baseline.json`（ベースライン値・閾値を含む）

#### 完了条件

- `test-web` の各シャードの実行時間ベースラインが設定ファイルに記録されている
- 警告閾値とエラー閾値が決定・記録されている
- JSON ファイルが正しい形式で作成されている（`jq` で構文エラーなし）

---

### Phase 2: モニタリングワークフローの実装

#### 目的

GitHub Actions 上で `test-web` の実行時間を自動計測し、ベースラインと比較してアラートを出すワークフローを実装する。

#### 手順

1. `.github/workflows/ci-timing-monitor.yml` を新規作成する
2. `schedule` トリガー（毎週月曜日 03:00 UTC）と `workflow_dispatch` トリガーを設定する
3. `test-web` の各シャードを実行し、実行時間を計測するジョブを実装する
4. `jq` を使ってベースライン設定ファイルを読み込み、閾値と比較するスクリプトを実装する
5. 閾値超過時に `::warning::` アノテーションを出力する処理を追加する
6. `$GITHUB_STEP_SUMMARY` に計測結果テーブルを出力する処理を追加する
7. 計測結果を JSON ファイルに記録し、`actions/upload-artifact` でアップロードする設定を追加する

#### 成果物

- `.github/workflows/ci-timing-monitor.yml`（モニタリングワークフロー）

#### 完了条件

- ワークフローの YAML 構文が正しく、GitHub Actions の lint（`actionlint` 等）でエラーがない
- `schedule` と `workflow_dispatch` の両トリガーが設定されている
- 閾値比較ロジックが正しく実装されている（手動スクリプト実行で検証）
- artifacts アップロード設定が含まれている

---

### Phase 3: ローカル動作検証

#### 目的

ローカル環境でシャード実行・時刻計測・閾値比較のロジックが正常に動作することを確認する。

#### 手順

1. `test-web` の各シャードを実行し、実行時間を計測する

   ```bash
   # シャード 1 の実行時間計測
   START=$(date +%s)
   pnpm --filter @repo/web test -- --shard=1/2
   END=$(date +%s)
   echo "Elapsed: $((END - START))s"

   # シャード 2 の実行時間計測
   START=$(date +%s)
   pnpm --filter @repo/web test -- --shard=2/2
   END=$(date +%s)
   echo "Elapsed: $((END - START))s"
   ```

2. `.github/ci-timing-baseline.json` を `jq` で読み込み、閾値計算スクリプトの動作を確認する

   ```bash
   BASELINE=$(jq '.["test-web"].baseline_seconds' .github/ci-timing-baseline.json)
   WARNING_RATIO=$(jq '.["test-web"].warning_threshold_ratio' .github/ci-timing-baseline.json)
   echo "Baseline: ${BASELINE}s, Warning ratio: ${WARNING_RATIO}"
   ```

3. ベースライン超過のシナリオをシミュレートし、警告出力ロジックが正しく動作することを確認する

#### 成果物

- ローカル実行ログ（シャードごとの計測時間・閾値比較結果）

#### 完了条件

- 各シャードが正常に完了する
- `jq` でベースライン設定ファイルが正常に読み込める
- 閾値比較ロジックが正しく動作する（超過時に `WARNING` が出力される）

---

### Phase 4: CI 動作検証

#### 目的

GitHub Actions 上でモニタリングワークフローが正常に動作することを確認する。

#### 手順

1. 変更をブランチにプッシュし、`workflow_dispatch` でモニタリングワークフローを手動実行する
2. 各シャードジョブが実行されることを確認する
3. GitHub Actions Summary に計測結果テーブルが出力されることを確認する
4. artifacts に計測結果 JSON がアップロードされることを確認する
5. テスト目的でベースラインを意図的に低い値に変更し、警告アノテーションが出力されることを確認する
6. ベースラインを正しい値に戻してから PR をマージする

#### 成果物

- CI 実行結果スクリーンショットまたは実行 URL（ワークフロー動作確認）
- artifacts としてアップロードされた計測結果 JSON

#### 完了条件

- `workflow_dispatch` でモニタリングワークフローが正常に実行される
- GitHub Actions Summary に計測結果テーブルが表示される
- artifacts に計測結果が保存されている
- 閾値超過テストで `::warning::` アノテーションが表示される

---

### Phase 5: ドキュメント整備と完了処理

#### 目的

モニタリング設定の運用方法をドキュメント化し、タスクを完了する。

#### 手順

1. `.github/ci-timing-baseline.json` のベースライン値更新手順をコメントまたは別ファイルに記載する
2. ワークフローの実行頻度・アラートの解釈・ベースライン更新タイミングの指針を記録する
3. 本タスク仕様書（`TASK-CI-FUTURE-008-test-web-timing-monitor.md`）のステータスを「完了」に更新する
4. 完了レポートを作成し、`docs/30-workflows/` の適切な場所に保存する

#### 成果物

- 更新済みタスク仕様書（ステータス: 完了）
- 完了レポート（ベースライン値・実行確認結果を含む）

#### 完了条件

- ベースライン値更新手順が記録されている
- タスク仕様書のステータスが「完了」に更新されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `.github/workflows/ci-timing-monitor.yml` が作成されており、`test-web` の実行時間を自動計測できる
- [ ] `.github/ci-timing-baseline.json` が作成されており、ベースライン値・警告閾値・エラー閾値が記録されている
- [ ] ベースライン超過時に GitHub Actions の `::warning::` アノテーションが出力される
- [ ] `$GITHUB_STEP_SUMMARY` に計測結果テーブルが出力される
- [ ] 計測結果が artifacts としてアップロードされる

### パフォーマンス要件

- [ ] モニタリングワークフロー自体の実行時間が `test-web` の通常実行時間 + 2 分以内に収まっている
- [ ] `schedule` トリガーが設定されており、定期実行が可能である

### 品質要件

- [ ] YAML 構文が正しく、GitHub Actions の lint でエラーがない
- [ ] 変更がスコープ（`.github/workflows/ci-timing-monitor.yml` / `.github/ci-timing-baseline.json`）のみに限定されている
- [ ] ベースライン値が TASK-CI-FUTURE-002 Phase 11 の計測結果と整合している

### ドキュメント要件

- [ ] ベースライン値更新手順が記録されている
- [ ] アラートの解釈方法（警告 / エラーの意味と対処法）が記録されている

---

## 6. 検証方法

### テストケース

- Case 1: `workflow_dispatch` でモニタリングワークフローを手動実行し、正常に完了する
- Case 2: GitHub Actions Summary に各シャードの実行時間テーブルが表示される
- Case 3: artifacts に計測結果 JSON がアップロードされている
- Case 4: ベースライン値を意図的に低く設定した場合、`::warning::` アノテーションが出力される
- Case 5: `jq` でベースライン設定ファイルを読み込み、正しい値が取得できる

### 検証コマンド

```bash
# ベースライン設定ファイルの構文確認
jq '.' .github/ci-timing-baseline.json

# ベースライン値の読み込み確認
jq '.["test-web"].baseline_seconds' .github/ci-timing-baseline.json
jq '.["test-web"].warning_threshold_ratio' .github/ci-timing-baseline.json

# ローカルでの実行時間計測（シャード 1）
START=$(date +%s) && pnpm --filter @repo/web test -- --shard=1/2 && echo "Elapsed: $(($(date +%s) - START))s"

# ローカルでの実行時間計測（シャード 2）
START=$(date +%s) && pnpm --filter @repo/web test -- --shard=2/2 && echo "Elapsed: $(($(date +%s) - START))s"

# YAML 構文確認（actionlint がインストール済みの場合）
actionlint .github/workflows/ci-timing-monitor.yml
```

---

## 7. リスクと対策

| リスク                                                                         | 影響度 | 発生確率 | 対策                                                                                                                                     |
| ------------------------------------------------------------------------------ | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| ベースライン値が実態に合わず、誤ったアラートが頻発する                         | 中     | 中       | TASK-CI-FUTURE-002 Phase 11 の計測値を初期値とし、初回 CI 実行後に実際の計測値でベースラインを更新する。閾値は保守的な 120% から開始する |
| `schedule` トリガーが不要なジョブ実行を増やし、GitHub Free Tier の枠を消費する | 低     | 低       | 実行頻度を週 1 回（月曜日）に限定し、`test-web` のシャード 2 つのみを実行する。1 回あたりの消費分数は約 5〜10 分と見込む                 |
| `jq` が GitHub Actions ランナーにインストールされていない                      | 中     | 低       | Ubuntu の GitHub Actions ランナーには `jq` がデフォルトでインストールされている。確認ステップを Phase 4 の検証に含める                   |
| 計測時間に GitHub Actions のキュー待ち時間が含まれ、実行時間が不安定になる     | 中     | 中       | ランナーの起動後から計測を開始し（`date +%s` をテスト実行直前で取得）、キュー待ち時間を除外する。複数回計測の中央値をベースラインとする  |
| モニタリングワークフローが `ci.yml` と重複してリソースを消費する               | 低     | 低       | モニタリングワークフローは `schedule` / `workflow_dispatch` トリガーのみとし、PR の push では実行しないよう制限する                      |
| ベースライン値が更新されないまま時間が経過し、アラートが形骸化する             | 中     | 中       | ベースライン設定ファイルに `updated_at` フィールドを設け、四半期ごとに見直すリマインダーをドキュメントに記載する                         |

---

## 8. 参照情報

### 関連ドキュメント

- `.github/workflows/ci.yml`（現在の CI 設定・`test-web` シャード設定）
- `.github/ci-timing-baseline.json`（本タスクで作成するベースライン設定ファイル）
- `apps/web/vitest.config.ts`（Web アプリの Vitest 設定）
- `docs/30-workflows/task-ci-future-002-test-web-sharding/`（TASK-CI-FUTURE-002 仕様書群）
- `docs/30-workflows/task-ci-future-002-test-web-sharding/outputs/phase-11/ci-timing-measurements.md`（ベースライン計測値の出典）
- `docs/30-workflows/unassigned-task/TASK-CI-FUTURE-002-test-web-sharding.md`（本タスクの発見元仕様書）

### 関連タスク

- TASK-CI-OPT-001: GitHub CI 最適化（test-desktop シャード化・node_modules キャッシュ化）
- TASK-CI-FUTURE-002: test-web シャード化（本タスクの直接の前提タスク）

### 参考リンク

- [GitHub Actions の schedule トリガー](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [GitHub Actions の workflow_dispatch トリガー](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch)
- [GitHub Actions の Step Summary](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary)
- [GitHub Actions のワークフローコマンド（アノテーション）](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-a-warning-message)
- [GitHub Actions artifacts（actions/upload-artifact）](https://github.com/actions/upload-artifact)
- [jq ドキュメント](https://jqlang.github.io/jq/manual/)

---

## 9. 備考

### 苦戦箇所【記入必須】

TASK-CI-FUTURE-002 から引き継いだ知見（実作業時に参照すること）:

| 症状                                                                                                          | 原因                                                                                                             | 対応                                                                                                            | 再発防止                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `test-web` の実行時間ベースラインが手動計測のみで管理されており、将来的な比較ができない状態だった             | TASK-CI-FUTURE-002 実装時に自動モニタリングの仕組みが未整備であり、Phase 11 での手動計測が唯一の記録となっていた | Phase 11 の計測結果を初期ベースラインとして設定ファイルに記録し、本タスクで自動化する                           | ベースライン設定ファイルに `updated_at` フィールドを設け、シャード数変更・テスト大幅追加の際は必ずベースライン値を更新する |
| GitHub Actions の実行時間にはキュー待ち時間が含まれるため、計測値が実際のテスト実行時間と乖離する可能性がある | ランナーのキュー待ち時間はネットワーク負荷や GitHub のサーバー状態に依存し、一定ではない                         | `date +%s` による計測をランナー起動後のテスト実行直前・直後に限定し、セットアップ時間を除外した実測値を記録する | 複数回計測の中央値をベースラインとし、単一計測値に依存しない設計にする                                                     |

### 補足事項

- 本タスクは TASK-CI-FUTURE-002 Phase 12 の未タスク検出で発見され、正式なタスクとして切り出したものである
- 現時点での `test-web` 実行時間は許容範囲内であるため優先度は「低」としているが、`apps/web` のテスト数が急増した場合は優先度を「中」に引き上げることを推奨する
- 実装着手前に TASK-CI-FUTURE-002 の成果物（特に `phase-11/ci-timing-measurements.md` の計測結果）を参照し、正確なベースライン値を設定ファイルに反映すること
- ベースライン値は四半期ごとに見直しを行い、テスト数の増加に合わせて適切に更新することを推奨する
- `schedule` トリガーの実行頻度は週 1 回を推奨するが、リポジトリの活発度やテスト追加頻度に応じて調整すること
