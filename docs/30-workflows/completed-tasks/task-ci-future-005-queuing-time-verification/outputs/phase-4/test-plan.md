# Phase 4 成果物: テスト計画書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| タスクID   | TASK-CI-FUTURE-005 |
| 作成日     | 2026-04-15         |
| ステータス | completed          |

---

## テストシナリオ定義（TC-001〜TC-005）

| TC-ID  | 対象 AC | シナリオ説明                                                                          | 期待結果                                                                     |
| ------ | ------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| TC-001 | AC-1    | `gh run list --branch main --status completed --workflow CI` で最新 Run ID を特定する | TASK-CI-OPT-001 マージ後の完了済み Run ID が 1 件以上取得できる              |
| TC-002 | AC-2    | `gh api .../jobs` で Test (desktop) ジョブを取得する                                  | 17 件の Test (desktop) ジョブが含まれ、`created_at`・`started_at` が存在する |
| TC-003 | AC-3    | Python で最大キューイング時間を算出する                                               | 数値（秒）として最大キューイング時間が得られる                               |
| TC-004 | AC-4    | 算出した最大キューイング時間を 60 秒閾値と比較して判定する                            | 60秒以下 または 60秒超 の判定が確定する                                      |
| TC-005 | AC-5    | CI-M-01 解決済みの記録を `measurement-result.md` に保存する                           | Run ID・計測値・判定根拠が記録されている                                     |

## エラーケーステスト

| TC-ID  | シナリオ                                             | 対応方法                                              |
| ------ | ---------------------------------------------------- | ----------------------------------------------------- |
| TC-E01 | `started_at` が null のジョブが存在する場合の処理    | null のジョブはスキップし、残りのジョブで計測継続する |
| TC-E02 | `jq` の `fromdateiso8601` が利用できない環境での対処 | Python コマンドで代替計算が成功する                   |

---

## 計測コマンドスイート（ステップ 1〜4）

### ステップ 1: Run ID 特定

```bash
gh run list --branch main --status completed --workflow CI --limit 10
```

期待出力: 完了済み Run の一覧（TASK-CI-OPT-001 マージ後のものを選択）

### ステップ 2: シャード数確認

```bash
gh api repos/daishiman/AIWorkflowOrchestrator/actions/runs/<run-id>/jobs --paginate \
  | python3 -c "
import json, sys
data = json.load(sys.stdin)
jobs = [j for j in data['jobs'] if j['name'].startswith('Test (desktop)')]
print(len(jobs))
"
```

期待出力: `17`

### ステップ 3: キューイング時間計算

```bash
gh api repos/daishiman/AIWorkflowOrchestrator/actions/runs/<run-id>/jobs --paginate \
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
print(f'最大: {max(results):.0f}秒, 最小: {min(results):.0f}秒, 平均: {sum(results)/len(results):.1f}秒')
"
```

期待出力: 数値（秒単位）

### ステップ 4: 判定

```bash
MAX_QUEUING=<calculated_value>
if [ "$MAX_QUEUING" -le 60 ]; then
  echo "判定: シャード数 17 継続（キューイング ${MAX_QUEUING} 秒 <= 60 秒）"
else
  echo "判定: シャード数 16 への戻し（キューイング ${MAX_QUEUING} 秒 > 60 秒）"
fi
```

---

## Phase 3 MINOR 指摘の反映

| 指摘ID    | 内容                     | テスト手順への反映                                              |
| --------- | ------------------------ | --------------------------------------------------------------- |
| CI-M-01-A | `started_at` null ケース | TC-E01 で null ケースの処理シナリオを追加した                   |
| CI-M-01-B | 単一 Run 計測の限界      | TC-005 成果物に「単一 Run 計測の限界と許容根拠」を記載          |
| CI-M-01-C | 代替計算方法の優先順位   | REST API + Python を正規手順として採用（TC-E02 は jq 環境向け） |

---

## 受入条件との対応表

| 受入条件 | 対応テストシナリオ | カバレッジ |
| -------- | ------------------ | ---------- |
| AC-1     | TC-001             | ✅         |
| AC-2     | TC-002             | ✅         |
| AC-3     | TC-003             | ✅         |
| AC-4     | TC-004             | ✅         |
| AC-5     | TC-005             | ✅         |
| エラー   | TC-E01, TC-E02     | ✅         |

---

## private method テスト方針

本タスクはシェルコマンド・API 実行によるブラックボックステストのため、
private method テストの概念は適用しない。
計測コマンドの出力形式と期待値を TC として定義し、Phase 5 実行時に確認する。

---

## 完了チェック

- [x] TC-001〜TC-005 が AC-1〜AC-5 と 1:1 で対応している
- [x] TC-E01・TC-E02 でエラーケースが定義されている
- [x] 計測コマンドスイート（ステップ 1〜4）が定義されている
- [x] Phase 3 MINOR 指摘が全てテスト手順に反映されている
- [x] 受入条件との対応表が完成している
- [x] 本 Phase 内の全タスクを 100% 実行完了
