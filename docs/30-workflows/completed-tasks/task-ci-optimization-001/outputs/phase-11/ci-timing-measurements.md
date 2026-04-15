# Phase 11: CI 実行時間計測値

## 作成日時

2026-04-14

## 改善前ベースライン（再掲）

| Run ID      | 実行時間   | 結論    |
| ----------- | ---------- | ------- |
| 24401596710 | 15m35s     | success |
| 24399727537 | 15m21s     | success |
| 24396184045 | 15m21s     | success |
| 24385579547 | 15m13s     | success |
| 24381819838 | 15m32s     | success |
| **平均**    | **15m24s** | -       |

## 改善後計測（PR push 後に記入）

| Run #     | Run ID | 実行時間     | キャッシュ状態   | 全シャード PASS | AC-2 判定 |
| --------- | ------ | ------------ | ---------------- | --------------- | --------- |
| 1（初回） | -      | 計測待ち     | キャッシュミス   | -               | -         |
| 2         | -      | 計測待ち     | キャッシュヒット | -               | -         |
| 3         | -      | 計測待ち     | キャッシュヒット | -               | -         |
| 4         | -      | 計測待ち     | キャッシュヒット | -               | -         |
| 5         | -      | 計測待ち     | キャッシュヒット | -               | -         |
| **平均**  | -      | **計測待ち** | -                | -               | **-**     |

## AC-2 達成基準

- **目標**: 5回平均が 460 秒（7m40s）以内
- **現状**: PR push 後の CI 実行で確認
- **計測コマンド**:

```bash
gh run list --workflow=ci.yml --limit 5 \
  --json databaseId,name,status,conclusion,startedAt,updatedAt | \
python3 -c "
import json, sys
from datetime import datetime
data = json.load(sys.stdin)
total = 0
for r in data:
    s = datetime.fromisoformat(r['startedAt'].replace('Z','+00:00'))
    e = datetime.fromisoformat(r['updatedAt'].replace('Z','+00:00'))
    diff = int((e - s).total_seconds())
    total += diff
    print(f\"{r['databaseId']}: {diff}s ({diff//60}m{diff%60}s) - {r['conclusion']}\")
avg = total // len(data)
print(f'Average: {avg}s ({avg//60}m{avg%60}s)')
print(f'AC-2: {\"PASS\" if avg <= 460 else \"FAIL\"} (target: 460s)')
"
```
