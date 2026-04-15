# Phase 2: 設計

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 2                     |
| Phase名    | 設計                  |
| 対象タスク | TASK-CI-FUTURE-005    |
| 前提Phase  | Phase 1: 要件定義     |
| 次Phase    | Phase 3: 設計レビュー |
| ステータス | pending               |
| 作成日     | 2026-04-15            |

## 目的

CI キューイング時間計測の実行設計を確定する。
計測コマンド・算出方法・判定フロー・リスクと対策を設計書として記録する。

## 実行タスク

### Task 1: 計測フロー設計

#### Step 1: CI 実行 ID の特定

```bash
# main ブランチの直近 CI 実行一覧を確認
gh run list --branch main --limit 10

# 特定の Run ID の詳細を確認
gh run view <run-id>
```

確認ポイント：

- TASK-CI-OPT-001 マージ後の最初の完了済み Run を選択
- シャード数 17 が反映されていること（test-desktop ジョブが 17 件あること）

#### Step 2: キューイング時間の算出

```bash
# test-desktop ジョブのキューイング時間を算出（秒単位）
gh run view <run-id> --json jobs \
  | jq '.jobs[]
      | select(.name | startswith("test-desktop"))
      | {
          name: .name,
          createdAt: .createdAt,
          startedAt: .startedAt,
          queuing_sec: (
            (.startedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)
          )
        }'

# 最大キューイング時間を取得
gh run view <run-id> --json jobs \
  | jq '[.jobs[]
      | select(.name | startswith("test-desktop"))
      | (.startedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)
    ] | max'
```

#### Step 3: 判定ロジック

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

### Task 2: リスクと対策の設計

| リスク                                         | 影響度 | 発生確率 | 対策                                                           |
| ---------------------------------------------- | ------ | -------- | -------------------------------------------------------------- |
| キューイング時間 > 60 秒で CI が遅延する       | 中     | 中       | Phase 13 でシャード数を 16 に戻す PR を作成する                |
| `gh run view` で `startedAt` が null になる    | 低     | 低       | CI が完全に完了してから実行する。null の場合はスキップして記録 |
| `jq` の `fromdateiso8601` が利用できない       | 低     | 低       | Python や date コマンドで代替計算する                          |
| TASK-CI-OPT-001 の PR マージ前に実行してしまう | 高     | 低       | Phase 1 の前提条件チェックを徹底する                           |
| 計測対象の Run がフォーク PR の CI である      | 低     | 低       | `gh run list --branch main` で main ブランチに絞る             |

### Task 3: 代替計測方法の設計

`jq` の `fromdateiso8601` が利用できない環境向けの代替計算方法：

```bash
# Python を使った代替計算
gh run view <run-id> --json jobs | python3 -c "
import json, sys
from datetime import datetime
data = json.load(sys.stdin)
for job in data['jobs']:
    if job['name'].startswith('test-desktop'):
        created = datetime.fromisoformat(job['createdAt'].replace('Z', '+00:00'))
        started = datetime.fromisoformat(job['startedAt'].replace('Z', '+00:00'))
        queuing = (started - created).total_seconds()
        print(f\"{job['name']}: {queuing:.0f}秒\")
"

# macOS の date コマンドを使った代替計算
# created_ts=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "2026-04-15T10:00:00Z" "+%s")
# started_ts=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "2026-04-15T10:01:30Z" "+%s")
# echo $((started_ts - created_ts))
```

### Task 4: Phase 13 の条件付き設計

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

### Task 5: 成果物記録場所の設計

判定結果は以下に記録する：

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
        └── phase12-task-spec-compliance-check.md  ← Phase 12 準拠確認
```

## 参照資料

| 資料名                      | パス                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------- |
| TASK-CI-FUTURE-005 元仕様書 | `docs/30-workflows/unassigned-task/TASK-CI-FUTURE-005-queuing-time-verification.md` |
| CI ワークフロー設定         | `.github/workflows/ci.yml`                                                          |

## 統合テスト連携

- 前Phase の成果物を受け取り、次Phase へ引き継ぐ
- この Phase の成果物は次Phase の検証入力になる

## 成果物

| 成果物 | パス                        | 説明                 |
| ------ | --------------------------- | -------------------- |
| 設計書 | `outputs/phase-2/design.md` | 計測フロー・判定設計 |

## 完了条件

- [ ] 計測フロー（Step 1→2→3）が設計されている
- [ ] キューイング時間の算出コマンドが設計されている
- [ ] 判定ロジック（60 秒閾値）が明文化されている
- [ ] リスクと対策が 5 件以上記録されている
- [ ] Phase 13 の条件付き設計（ci.yml 変更内容）が記録されている
- [ ] 代替計測方法（jq 不使用時）が設計されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
