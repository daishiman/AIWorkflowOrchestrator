# Phase 6 成果物: テスト拡充書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| タスクID   | TASK-CI-FUTURE-005 |
| 作成日     | 2026-04-15         |
| ステータス | completed          |

---

## Phase 5 実行結果の確認

| 項目                 | 値                 |
| -------------------- | ------------------ |
| 計測 Run ID          | `24443907392`      |
| 最大キューイング時間 | **59秒**           |
| 判定                 | シャード数 17 継続 |
| null ジョブ数        | 0件（問題なし）    |

---

## 失敗パスのテスト追加（TC-F01〜TC-F04）

| TC-ID  | シナリオ                                | 対応方法                                                                                |
| ------ | --------------------------------------- | --------------------------------------------------------------------------------------- |
| TC-F01 | Run ID が見つからない場合               | `gh run list` の出力が空の場合はエラーメッセージを記録して作業を中断する                |
| TC-F02 | Test (desktop) ジョブが 17 件未満の場合 | ci.yml の shard 設定を再確認する。TASK-CI-OPT-001 マージ前の Run でないか確認           |
| TC-F03 | 全ジョブの `started_at` が null の場合  | CI 完了を再確認して別の完了済み Run を選択する（`status: completed` の Run のみ対象）   |
| TC-F04 | jq も Python もない環境での対処         | `date` コマンドで手動計算する手順を実行する（macOS: `date -j -f "%Y-%m-%dT%H:%M:%SZ"`） |

---

## 回帰ガードの確認

キューイング ≤ 60 秒（今回の判定）の場合: ci.yml 変更不要のため回帰リスクなし。

キューイング > 60 秒で Phase 13 を実施する場合の追加確認（参考）:

| 確認項目                                          | 確認方法                                 |
| ------------------------------------------------- | ---------------------------------------- |
| ci.yml の matrix.shard が 16 要素になっている     | `grep "shard:" .github/workflows/ci.yml` |
| `--shard=N/17` が `--shard=N/16` に変更されている | `grep "shard=" .github/workflows/ci.yml` |
| 変更後の CI が全て PASS している                  | `gh pr checks` で確認                    |

---

## 補助コマンドの定義

計測精度を上げるための補助コマンド：

```bash
# 全 Test (desktop) ジョブの詳細キューイング時間一覧（ソート付き）
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
        results.append({'name': j['name'], 'queuing_sec': queuing})
for r in sorted(results, key=lambda x: x['queuing_sec']):
    print(f\"{r['name']}: {r['queuing_sec']:.0f}秒\")
"

# 統計情報（最小・最大・平均）
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
        results.append((started - created).total_seconds())
print(f'min={min(results):.0f}秒, max={max(results):.0f}秒, avg={sum(results)/len(results):.1f}秒')
"
```

**実行結果（Phase 5 と同一）**:

- min=3秒, max=59秒, avg=6.4秒

---

## Phase 5 で発見した知見

| 知見ID | 内容                                                                  | 対応                 |
| ------ | --------------------------------------------------------------------- | -------------------- |
| F5-001 | `gh run view --json jobs` の `jobs` 配列には `createdAt` が含まれない | REST API を使用      |
| F5-002 | ジョブ名が `test-desktop` ではなく `Test (desktop)` に変更されていた  | 正規手順を修正       |
| F5-003 | Test (desktop) (8) だけが 59秒のキューイング（他は 3〜4 秒）          | 正常な挙動として記録 |

---

## 完了チェック

- [x] Phase 5 の計測結果が確認されている
- [x] TC-F01〜TC-F04 の失敗パステストが定義されている
- [x] 回帰ガードの確認項目が定義されている
- [x] 補助コマンド（統計情報含む）が定義されている
- [x] Phase 5 で発生した知見が記録されている
- [x] 本 Phase 内の全タスクを 100% 実行完了
