# TASK-CI-FUTURE-005 実装ガイド

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-CI-FUTURE-005                             |
| 作成日     | 2026-04-15                                     |
| タスク分類 | NON_VISUAL / docs-only（コード変更なし）       |
| 結果       | シャード数 17 継続（キューイング 59秒 ≤ 60秒） |

---

## Part 1（中学生レベル）: GitHub Actions のキューイングって何？

### なぜこれが必要なのか？

たとえば、学校の給食を想像してください。給食当番が 20 人いて、全員が同時に料理を取りに行くと、
配膳口が混雑して「ちょっと待ってね」という状態になりますよね。
これが「キューイング（順番待ち）」です。

GitHub Actions の CI（自動テスト）でも同じことが起きます。
テストを 17 個のグループに分けて同時に実行しようとすると、
GitHub のサーバーが「20 個同時は上限だよ」と言って、
少しだけ待たせることがあります。

### 何をするか

「実際にどれくらい待たされるのか」を計測しました。
60 秒以内なら問題なし。60 秒より長いなら、グループ数を 17 から 16 に減らします。

### 今回作ったもの

- 17 グループ全部を計測しました
- 16 グループ: **3〜4 秒**（ほぼ待ちなし）
- 1 グループ（8番）: **59 秒**（ちょっと待った）
- 60 秒以内なので「17 グループのまま続ける」と決まりました

---

## Part 2（技術者向け）: 計測実装の詳細

### 計測環境

| 項目         | 値                                                                           |
| ------------ | ---------------------------------------------------------------------------- |
| 計測 Run ID  | `24443907392`                                                                |
| 計測日時     | 2026-04-15T08:16:25Z                                                         |
| 対象ブランチ | main（TASK-CI-OPT-001 マージ後）                                             |
| Run URL      | https://github.com/daishiman/AIWorkflowOrchestrator/actions/runs/24443907392 |

### 計測コマンド

```bash
# REST API でジョブの created_at / started_at を取得（gh run view では createdAt が取得不可）
gh api repos/daishiman/AIWorkflowOrchestrator/actions/runs/24443907392/jobs --paginate \
  | python3 -c "
import json, sys
from datetime import datetime
data = json.load(sys.stdin)
results = []
for j in data['jobs']:
    if j['name'].startswith('Test (desktop)') and j.get('started_at'):
        created = datetime.fromisoformat(j['created_at'].replace('Z', '+00:00'))
        started = datetime.fromisoformat(j['started_at'].replace('Z', '+00:00'))
        queuing = (started - created).total_seconds()
        results.append(queuing)
        print(f\"{j['name']}: {queuing:.0f}秒\")
print(f'最大: {max(results):.0f}秒')
"
```

### CLIシグネチャ

```bash
gh run view <run-id> --json jobs
gh api repos/<owner>/<repo>/actions/runs/<run_id>/jobs --paginate
```

### 型定義

```ts
type QueueingJob = {
  name: string;
  created_at: string;
  started_at: string | null;
};

interface QueueingMeasurementResult {
  runId: string;
  maxQueueingSeconds: number;
  minQueueingSeconds: number;
  avgQueueingSeconds: number;
  thresholdSeconds: 60;
  verdict: "continue_17_shards" | "revert_to_16_shards";
  phase13Required: boolean;
}
```

### キューイング時間の定義

```
キューイング時間 = started_at（実行開始時刻） - created_at（キュー投入時刻）
```

### 計測結果サマリー

| 統計値               | 値                             |
| -------------------- | ------------------------------ |
| 最大キューイング時間 | **59秒**（Test (desktop) (8)） |
| 最小キューイング時間 | 3秒                            |
| 平均キューイング時間 | 6.4秒                          |

### 判定

- **判定閾値**: 60 秒
- **計測値**: 59秒 ≤ 60秒
- **判定結果**: シャード数 17 継続（Phase 13 スキップ）

### 重要な技術的知見

| 知見                             | 内容                                                              |
| -------------------------------- | ----------------------------------------------------------------- |
| `gh run view --json jobs` の制限 | `createdAt` フィールドが存在しない。REST API を使用すること       |
| ジョブ名の変更                   | TASK-CI-OPT-001 で `test-desktop` → `Test (desktop)` に変更された |
| Free Tier 上限境界の挙動         | 20 ジョブ中 19 ジョブが 3〜4 秒で開始。1 ジョブのみ 59 秒待ち     |

### 使用例

```bash
RUN_ID=24443907392
gh api repos/daishiman/AIWorkflowOrchestrator/actions/runs/$RUN_ID/jobs --paginate \
  | python3 -c "import json,sys;from datetime import datetime;data=json.load(sys.stdin);print(max((datetime.fromisoformat(j['started_at'].replace('Z','+00:00'))-datetime.fromisoformat(j['created_at'].replace('Z','+00:00'))).total_seconds() for j in data['jobs'] if j['name'].startswith('Test (desktop)') and j.get('started_at')))"
```

### エラーハンドリング

- `started_at` が null のジョブは集計から除外する
- `gh run view --json jobs` に `createdAt` がない場合は REST API に切り替える
- `jq` の `fromdateiso8601` が使えない場合は Python で代替する
- `Test (desktop)` というジョブ名に変わっているため、`test-desktop` 固定検索は避ける

### エッジケース

- 17 シャードのうち 1 件だけ待機時間が突出する場合がある
- GitHub Actions の負荷次第で同一 Run でも計測値が多少変動する
- `created_at` と `started_at` が同じ秒に見えても、内部的には数百ミリ秒差がある可能性がある
- ページネーションがあるため、`--paginate` を省略するとジョブ一覧が欠ける可能性がある

### 設定項目と定数一覧

| 項目                | 値               | 説明                  |
| ------------------- | ---------------- | --------------------- |
| `RUN_ID`            | `24443907392`    | 実測対象 Run          |
| `JOB_PREFIX`        | `Test (desktop)` | 対象ジョブの接頭辞    |
| `THRESHOLD_SECONDS` | `60`             | 継続判定の閾値        |
| `EXPECTED_SHARDS`   | `17`             | 期待シャード数        |
| `PHASE13_REQUIRED`  | `false`          | 閾値超過時のみ `true` |

### テスト構成

| テスト名 | 確認内容                                     |
| -------- | -------------------------------------------- |
| TC-001   | Run ID が特定できること                      |
| TC-002   | 17 シャードが取得できること                  |
| TC-003   | 最大キューイング時間が算出できること         |
| TC-004   | 60 秒閾値で判定できること                    |
| TC-005   | `measurement-result.md` に解決記録が残ること |
| TC-E01   | `started_at` null を除外できること           |
| TC-E02   | Python フォールバックで計測できること        |

### データソース

- GitHub Actions REST API: `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs`
- フィールド: `created_at`（キュー投入時刻）、`started_at`（実行開始時刻）

### 制約

- 単一 Run での計測（複数 Run の平均ではない）
- `started_at` が null のジョブは計測対象外（今回: 0件）
- GitHub インフラの負荷状況に依存する可能性がある

---

## CI-M-01 解決サマリー

| 項目                 | 内容                                       |
| -------------------- | ------------------------------------------ |
| 発見元               | TASK-CI-OPT-001 Phase 3 MINOR 指摘 CI-M-01 |
| 実測日               | 2026-04-15                                 |
| 最大キューイング時間 | 59秒                                       |
| 判定                 | シャード数 17 継続（60秒閾値以内）         |
| 解決状態             | **✅ 解決済み**                            |
