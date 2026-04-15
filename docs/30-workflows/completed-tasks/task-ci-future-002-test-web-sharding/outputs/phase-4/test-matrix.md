# テストマトリクス（TC-01〜TC-05）

作成日: 2026-04-15
タスクID: TASK-CI-FUTURE-002

## テストケース一覧

| TC番号 | テストケース名                              | 検証内容                                                                             | 期待結果                                |
| ------ | ------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------- |
| TC-01  | シャード 1/2 で EXIT 0 終了                 | `pnpm --filter @repo/backend exec vitest run --shard=1/2` の終了コード               | EXIT 0（正常終了）                      |
| TC-02  | 全シャードのテスト合計件数が単一実行と一致  | shard=1/2 と shard=2/2 の件数合計 = 単一実行件数                                     | 件数一致（差分 0）                      |
| TC-03  | ci.yml に正しい matrix 設定が追加されている | test-web ジョブに `strategy.matrix.shard: [1, 2]` が存在                             | 正規表現にマッチする YAML 定義が存在    |
| TC-04  | 並列数合計が 20 以内に収まる                | test-desktop(15) + test-web(2) + typecheck(1) + test-shared(1) + e2e-desktop(1) ≤ 20 | 合計 = 20 ≤ 20                          |
| TC-05  | CI で test-web が 2 並列で実行される        | GitHub Actions の matrix により 2 ジョブが起動する                                   | test-web (1/2) と test-web (2/2) が存在 |

## 詳細検証手順

### TC-01: シャード 1/2 で EXIT 0 終了

```bash
pnpm --filter @repo/backend exec vitest run --shard=1/2
echo "Exit code: $?"  # 期待値: 0
```

### TC-02: 全シャード合計件数の確認

```bash
# シャード 1 の件数
SHARD1=$(pnpm --filter @repo/backend exec vitest run --shard=1/2 --reporter=json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['numTotalTests'])" 2>/dev/null || echo "N/A")

# シャード 2 の件数
SHARD2=$(pnpm --filter @repo/backend exec vitest run --shard=2/2 --reporter=json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['numTotalTests'])" 2>/dev/null || echo "N/A")

# 単一実行の件数
TOTAL=$(pnpm --filter @repo/backend test:run --reporter=json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['numTotalTests'])" 2>/dev/null || echo "N/A")

echo "Shard 1: $SHARD1, Shard 2: $SHARD2, Total: $TOTAL"
```

### TC-03: ci.yml の matrix 設定確認

```bash
python3 -c "
import yaml
with open('.github/workflows/ci.yml') as f:
    data = yaml.safe_load(f)
job = data['jobs'].get('test-web', {})
matrix = job.get('strategy', {}).get('matrix', {})
shards = matrix.get('shard', [])
assert shards == [1, 2], f'Expected [1, 2], got {shards}'
print('TC-03: PASS')
"
```

### TC-04: 並列数合計の確認

```bash
python3 -c "
import yaml
with open('.github/workflows/ci.yml') as f:
    data = yaml.safe_load(f)
jobs = data['jobs']
desktop_shards = len(jobs['test-desktop']['strategy']['matrix']['shard'])
web_shards = len(jobs['test-web']['strategy']['matrix']['shard'])
total = desktop_shards + web_shards + 1 + 1 + 1  # typecheck + test-shared + e2e-desktop
print(f'test-desktop: {desktop_shards}, test-web: {web_shards}, total: {total}')
assert total <= 20, f'Total {total} exceeds limit 20!'
print('TC-04: PASS')
"
```

### TC-05: CI での 2 並列確認

GitHub Actions の実行ログで `Test (web) (1/2)` と `Test (web) (2/2)` の 2 ジョブが並列表示されることを確認（Phase 11 での手動確認）。
