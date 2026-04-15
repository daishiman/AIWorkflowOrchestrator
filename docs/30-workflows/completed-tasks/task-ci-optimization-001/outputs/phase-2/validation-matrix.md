# Phase 2: Validation Matrix

## 実行日時

2026-04-14

## Phase 5 実装後の検証コマンド

### 1. YAML 構文検証

```bash
# Python yaml モジュールで構文チェック
python3 -c "import yaml; yaml.safe_load(open('.github/actions/pnpm-install-retry/action.yml')); yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML OK"

# actionlint がインストールされている場合
actionlint .github/workflows/ci.yml
```

### 2. シャード数変更の確認

```bash
grep -n "shard\|total-shards\|/17\|/16" .github/workflows/ci.yml
```

**期待結果**: `/17` が3箇所あり、`/16` が0件であること。

### 3. キャッシュ設定の確認

```bash
grep -n -A10 "cache-node-modules\|actions/cache" .github/actions/pnpm-install-retry/action.yml .github/workflows/ci.yml
```

**期待結果**: `actions/cache@v4` が `pnpm-install-retry/action.yml` に存在し、`hashFiles('pnpm-lock.yaml')` を含むこと。

### 4. CI_MAX_FORKS の変更確認

```bash
grep -n "CI_MAX_FORKS" apps/desktop/vitest.config.ts
```

**期待結果**: `CI_MAX_FORKS = 3` が確認できること。

### 5. ローカルでの Vitest 動作確認

```bash
CI=true CI_MAX_FORKS=3 pnpm --filter @repo/desktop vitest run --shard=1/17
```

**期待結果**: 1シャード分のテストが PASS すること。

### 6. 実際の CI 実行後の所要時間確認

```bash
gh run list --workflow=ci.yml --limit=3 \
  --json databaseId,conclusion,createdAt,updatedAt \
  | python3 -c "
import json, sys
from datetime import datetime
data = json.load(sys.stdin)
for r in data:
    s = datetime.fromisoformat(r['createdAt'].replace('Z','+00:00'))
    e = datetime.fromisoformat(r['updatedAt'].replace('Z','+00:00'))
    diff = int((e - s).total_seconds())
    print(f\"{r['databaseId']}: {diff}s ({diff//60}m{diff%60}s) - {r['conclusion']}\")
"
```

**期待結果**: 460秒（7分40秒）以内の CI 実行時間が確認できること。
