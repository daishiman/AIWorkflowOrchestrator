# Phase 11: 手動テストレポート

## 作成日時

2026-04-14

## テスト概要

**テスト種別**: NON_VISUAL（CI設定変更のため UI 変更なし）

**検証対象**:

1. `.github/actions/pnpm-install-retry/action.yml` — node_modules キャッシュ追加
2. `.github/workflows/ci.yml` — シャード数 16→17
3. `apps/desktop/vitest.config.ts` — CI_MAX_FORKS 2→3

## ローカル検証結果

### YAML 構文チェック

```bash
$ python3 -c "
import yaml
yaml.safe_load(open('.github/actions/pnpm-install-retry/action.yml'))
yaml.safe_load(open('.github/workflows/ci.yml'))
print('YAML syntax OK')
"
YAML syntax OK
```

**結果**: ✅ PASS

### 設定値確認

```bash
# キャッシュ設定確認
grep -n "cache-node-modules\|actions/cache\|cache-hit" .github/actions/pnpm-install-retry/action.yml
# 11: id: cache-node-modules
# 12: uses: actions/cache@v4
# 27: if: steps.cache-node-modules.outputs.cache-hit != 'true'

# シャード数確認
grep -n "shard\|/17" .github/workflows/ci.yml
# 192: shard: [1, 2, ..., 17]
# 224: Run desktop app tests (shard ${{ matrix.shard }}/17)
# 227: vitest run --shard=${{ matrix.shard }}/17
# 229: vitest run --shard=${{ matrix.shard }}/17 --coverage

# CI_MAX_FORKS 確認
grep -n "CI_MAX_FORKS" apps/desktop/vitest.config.ts
# 14: const CI_MAX_FORKS = 3;
```

**結果**: ✅ 全設定値確認済み

## CI 実行後の確認手順

PR push 後に以下のコマンドで確認する:

```bash
# 1. CI 実行時間の計測
gh run list --workflow=ci.yml --limit 5 \
  --json databaseId,name,status,conclusion,startedAt,updatedAt | \
python3 -c "
import json, sys
from datetime import datetime
data = json.load(sys.stdin)
for r in data:
    s = datetime.fromisoformat(r['startedAt'].replace('Z','+00:00'))
    e = datetime.fromisoformat(r['updatedAt'].replace('Z','+00:00'))
    diff = int((e - s).total_seconds())
    print(f\"{r['databaseId']}: {diff}s ({diff//60}m{diff%60}s) - {r['conclusion']}\")
"

# 2. キャッシュヒット確認
gh run view <RUN_ID> --log | grep -i "cache hit\|cache miss\|node_modules"

# 3. 全シャード PASS 確認
gh run view <RUN_ID> --json jobs \
  --jq '.jobs[] | select(.name | startswith("Test (desktop)")) | {name: .name, conclusion: .conclusion}'
```

## 発見された問題

`outputs/phase-11/discovered-issues.md` に記録済み（0件）。
