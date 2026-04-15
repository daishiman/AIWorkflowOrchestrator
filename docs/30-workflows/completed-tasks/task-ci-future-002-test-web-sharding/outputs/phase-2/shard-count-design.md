# シャード数設計書

作成日: 2026-04-15
タスクID: TASK-CI-FUTURE-002

## 設計方針

GitHub Free Tier の並列ジョブ上限（20）を制約条件として、test-web に最小限のシャードを割り当てる。

## シャード数計算式

```
test-web シャード数 = 20 - (test-desktop_shards + typecheck + test-shared + e2e-desktop)
                   = 20 - (15 + 1 + 1 + 1)
                   = 20 - 18
                   = 2
```

## 採用案: 案 A（test-desktop: 15 / test-web: 2）

| ジョブ       | 変更前      | 変更後      | 差分  |
| ------------ | ----------- | ----------- | ----- |
| test-desktop | 17 シャード | 15 シャード | -2    |
| test-web     | 存在しない  | 2 シャード  | +2    |
| typecheck    | 1           | 1           | 0     |
| test-shared  | 1           | 1           | 0     |
| e2e-desktop  | 1           | 1           | 0     |
| **合計**     | **20**      | **20**      | **0** |

## 採用理由

1. **test-web のテストは現在 1 ファイル**: `@repo/backend` は `src/__tests__/health.test.ts` のみ。2 シャードで十分。
2. **test-desktop の削減を最小限に**: 17→15 の -2 シャードで影響を最小化。
3. **将来の拡張性**: test-web のテストが増えた場合、test-desktop をさらに削減して test-web を 3〜4 シャードに増やせる。

## vitest コマンド設計

### test-desktop（変更後）

```bash
pnpm --filter @repo/desktop exec vitest run --shard=${{ matrix.shard }}/15
```

### test-web（新規）

```bash
pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
```

## 検証コマンド（ローカル動作確認手順）

```bash
# シャード 1 の実行確認
pnpm --filter @repo/backend exec vitest run --shard=1/2

# シャード 2 の実行確認
pnpm --filter @repo/backend exec vitest run --shard=2/2

# 単一実行（ベースライン計測）
time pnpm --filter @repo/backend test:run
```
