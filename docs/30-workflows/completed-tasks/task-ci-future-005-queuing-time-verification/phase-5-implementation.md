# Phase 5: 実装（計測実行）

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 5                   |
| Phase名    | 実装（計測実行）    |
| 対象タスク | TASK-CI-FUTURE-005  |
| 前提Phase  | Phase 4: テスト作成 |
| 次Phase    | Phase 6: テスト拡充 |
| ステータス | pending             |
| 作成日     | 2026-04-15          |

## 目的

Phase 4 で定義した計測コマンドスイートを実際に実行し、
キューイング時間を計測して最終判定を記録する。

**重要**: 本 Phase を実行する前に以下を確認すること：

1. TASK-CI-OPT-001 の PR がマージ済みであること
2. main ブランチで少なくとも 1 回の CI 実行が完了していること
3. `gh auth status` で認証済みであること

## 実行タスク

### Task 1: 前提条件の確認

```bash
# 認証確認
gh auth status

# TASK-CI-OPT-001 のマージ確認
git log --oneline origin/main | head -10

# main ブランチの完了済み CI 確認
gh run list --branch main --status completed --limit 5
```

確認ポイント：

- [ ] `gh auth status` が認証済み状態を示している
- [ ] `git log` でシャード数 17 への変更コミットが main に存在している
- [ ] `gh run list` で完了済みの main ブランチ CI が 1 件以上存在する

### Task 2: TC-001 実行 - Run ID 特定

```bash
# main ブランチの直近完了済み CI を確認
gh run list --branch main --status completed --limit 10
```

実行結果を記録：

- 選択した Run ID: **\*\***\_\_\_**\*\***
- 選択理由: TASK-CI-OPT-001 マージ後の最初の完了済み Run
- 選択日時: **\*\***\_\_\_**\*\***

### Task 3: TC-002 実行 - シャード数確認

```bash
gh run view <run-id> --json jobs | jq '[.jobs[] | select(.name | startswith("test-desktop"))] | length'
```

期待値: `17`
実行結果: **\*\***\_\_\_**\*\***

注意: `startedAt` が null のジョブがある場合（TC-E01 対応）：

```bash
gh run view <run-id> --json jobs | jq '[.jobs[] | select(.name | startswith("test-desktop") and .startedAt != null)] | length'
```

### Task 4: TC-003 実行 - キューイング時間計算

```bash
# メイン計測コマンド（jq fromdateiso8601 使用）
gh run view <run-id> --json jobs \
  | jq '[.jobs[]
      | select(.name | startswith("test-desktop") and .startedAt != null)
      | (.startedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)
    ] | max'
```

jq fromdateiso8601 が使えない場合の代替（TC-E02 対応）：

```bash
gh run view <run-id> --json jobs | python3 -c "
import json, sys
from datetime import datetime
data = json.load(sys.stdin)
max_q = 0
for job in data['jobs']:
    if job['name'].startswith('test-desktop') and job.get('startedAt'):
        created = datetime.fromisoformat(job['createdAt'].replace('Z', '+00:00'))
        started = datetime.fromisoformat(job['startedAt'].replace('Z', '+00:00'))
        queuing = (started - created).total_seconds()
        max_q = max(max_q, queuing)
print(f'{max_q:.0f}')
"
```

実行結果（最大キューイング時間）: **\*\***\_\_\_**\*\*** 秒

### Task 5: TC-004 実行 - 判定

**計測値**: **\*\***\_\_\_**\*\*** 秒

**判定**:

- [ ] キューイング時間 ≤ 60 秒 → シャード数 17 継続
- [ ] キューイング時間 > 60 秒 → シャード数 16 への戻し（Phase 13 実施）

### Task 6: TC-005 実行 - 計測結果記録

計測結果を `outputs/phase-5/measurement-result.md` に記録する：

記録内容：

- 計測 Run ID
- 計測日時
- 最大キューイング時間（秒）
- 判定結果（継続 or 16 への戻し）
- 判定根拠
- 単一 Run 計測の限界と許容根拠（CI-M-01-B 対応）

### Task 7: 実装ファイル一覧（変更対象）

| ファイル                                | 変更内容                | 変更条件                |
| --------------------------------------- | ----------------------- | ----------------------- |
| `outputs/phase-5/measurement-result.md` | 計測結果の記録          | 必須（常に実施）        |
| `.github/workflows/ci.yml`              | シャード数 17→16 の変更 | 条件付き（>60s 時のみ） |

## 参照資料

| 資料名                      | パス                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------- |
| Phase 4 テスト計画          | `./phase-4-test-creation.md`                                                        |
| TASK-CI-FUTURE-005 元仕様書 | `docs/30-workflows/unassigned-task/TASK-CI-FUTURE-005-queuing-time-verification.md` |

## 統合テスト連携

- 前Phase の成果物を受け取り、次Phase へ引き継ぐ
- この Phase の成果物は次Phase の検証入力になる

## 成果物

| 成果物       | パス                                    | 説明                               |
| ------------ | --------------------------------------- | ---------------------------------- |
| 計測結果記録 | `outputs/phase-5/measurement-result.md` | Run ID・計測値・判定根拠・許容根拠 |

## 完了条件

- [ ] 前提条件（TASK-CI-OPT-001 マージ・CI 完了・gh 認証）が確認済み
- [ ] TC-001: Run ID が特定されている
- [ ] TC-002: test-desktop ジョブが 17 件確認できている
- [ ] TC-003: 最大キューイング時間（秒）が算出されている
- [ ] TC-004: 判定（継続 or 16 への戻し）が確定している
- [ ] TC-005: `measurement-result.md` に計測結果が記録されている
- [ ] キューイング > 60 秒の場合: ci.yml 変更の準備が整っている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
