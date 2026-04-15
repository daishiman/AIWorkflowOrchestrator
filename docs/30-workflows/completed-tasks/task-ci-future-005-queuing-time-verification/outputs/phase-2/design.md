# Phase 2 成果物: 設計書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| タスクID   | TASK-CI-FUTURE-005 |
| 作成日     | 2026-04-15         |
| ステータス | completed          |

---

## 計測フロー設計

### Step 1: CI 実行 ID の特定

```bash
# main ブランチの完了済み CI ワークフロー実行一覧を確認
gh run list --branch main --status completed --workflow CI --limit 10
```

確認ポイント：

- TASK-CI-OPT-001 マージ後（コミット `11b9f8b26` 以降）の最初の完了済み Run を選択
- ジョブ名 `Test (desktop)` が 17 件あること（注意: `test-desktop` ではなく `Test (desktop)` が正しいジョブ名）

**選択 Run ID**: `24443907392`  
**Run URL**: https://github.com/daishiman/AIWorkflowOrchestrator/actions/runs/24443907392

### Step 2: キューイング時間の算出

**重要**: `gh run view --json jobs` は `createdAt` フィールドを返さないため、
REST API を直接使用する必要がある。

```bash
# REST API 経由で job の created_at を取得
gh api repos/daishiman/AIWorkflowOrchestrator/actions/runs/<run-id>/jobs --paginate \
  | python3 -c "
import json, sys
from datetime import datetime
data = json.load(sys.stdin)
jobs = data.get('jobs', [])
results = []
for j in jobs:
    if j['name'].startswith('Test (desktop)') and j.get('started_at'):
        created = datetime.fromisoformat(j['created_at'].replace('Z', '+00:00'))
        started = datetime.fromisoformat(j['started_at'].replace('Z', '+00:00'))
        queuing = (started - created).total_seconds()
        results.append(queuing)
        print(f\"{j['name']}: {queuing:.0f}秒\")
print(f'最大: {max(results):.0f}秒')
"
```

### Step 3: 判定ロジック

```
if 最大キューイング時間 ≤ 60 秒:
  → シャード数 17 継続（Phase 13 スキップ）
  → 判定記録を作成して完了
else:
  → シャード数 16 への戻し（Phase 13 実施）
  → ci.yml の matrix.shard を 16 要素に削減
  → --shard=${{ matrix.shard }}/17 を /16 に変更
  → 変更 PR を作成
```

---

## リスクと対策

| リスク                                          | 影響度 | 発生確率 | 対策                                                             |
| ----------------------------------------------- | ------ | -------- | ---------------------------------------------------------------- |
| キューイング時間 > 60 秒で CI が遅延する        | 中     | 中       | Phase 13 でシャード数を 16 に戻す PR を作成する                  |
| `gh run view --json jobs` に `createdAt` がない | 中     | 確定     | REST API `gh api .../jobs` を使用する（`created_at` が存在する） |
| `startedAt` が null になる                      | 低     | 低       | CI が完全に完了してから実行する。null の場合はスキップして記録   |
| TASK-CI-OPT-001 の PR マージ前に実行してしまう  | 高     | 低       | Phase 1 の前提条件チェックを徹底する                             |
| 計測対象の Run がフォーク PR の CI である       | 低     | 低       | `gh run list --branch main` で main ブランチに絞る               |

---

## 代替計測方法

`jq` の `fromdateiso8601` が利用できない環境向けの代替計算方法：

```bash
# Python を使った代替計算（推奨）
gh api repos/daishiman/AIWorkflowOrchestrator/actions/runs/<run-id>/jobs --paginate | python3 -c "
import json, sys
from datetime import datetime
data = json.load(sys.stdin)
for job in data['jobs']:
    if job['name'].startswith('Test (desktop)') and job.get('started_at'):
        created = datetime.fromisoformat(job['created_at'].replace('Z', '+00:00'))
        started = datetime.fromisoformat(job['started_at'].replace('Z', '+00:00'))
        queuing = (started - created).total_seconds()
        print(f\"{job['name']}: {queuing:.0f}秒\")
"
```

---

## Phase 13 の条件付き設計

キューイング > 60 秒の場合の ci.yml 変更内容：

**変更箇所 1**: `matrix.shard` の配列から 17 を削除（16 要素に）

変更前:

```yaml
shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
```

変更後:

```yaml
shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
```

**変更箇所 2**: `--shard` オプションの分母を変更

変更前:

```yaml
--shard=${{ matrix.shard }}/17
```

変更後:

```yaml
--shard=${{ matrix.shard }}/16
```

**ブランチ名**: `fix/ci-shard-reduce-to-16`

**PR タイトル**: `fix(ci): revert shard count 17→16（キューイング時間超過）`

---

## 成果物記録場所

```
docs/30-workflows/task-ci-future-005-queuing-time-verification/
└── outputs/
    ├── phase-5/
    │   └── measurement-result.md  ← Run ID・計測値・判定根拠
    └── phase-12/
        ├── implementation-guide.md
        ├── system-spec-update-summary.md
        ├── documentation-changelog.md
        ├── unassigned-task-detection.md
        ├── skill-feedback-report.md
        └── phase12-task-spec-compliance-check.md
```

---

## 完了チェック

- [x] 計測フロー（Step 1→2→3）が設計されている
- [x] キューイング時間の算出コマンドが設計されている（REST API 使用）
- [x] 判定ロジック（60 秒閾値）が明文化されている
- [x] リスクと対策が 5 件以上記録されている
- [x] Phase 13 の条件付き設計（ci.yml 変更内容）が記録されている
- [x] 代替計測方法（Python）が設計されている
- [x] 本 Phase 内の全タスクを 100% 実行完了
