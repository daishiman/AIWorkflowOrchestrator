# CI変更設計書

## 作成日

2026-02-02

## 変更対象

`.github/workflows/ci.yml`

## 変更内容

### 1. シャード数変更

**変更前**:

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1, 2, 3, 4, 5, 6, 7, 8]
```

**変更後**:

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
```

### 2. テストコマンド変更

**変更前**:

```yaml
- name: Run desktop app tests (shard ${{ matrix.shard }}/8)
  run: pnpm --filter @repo/desktop test:run -- --shard=${{ matrix.shard }}/8 --coverage
```

**変更後**:

```yaml
- name: Run desktop app tests (shard ${{ matrix.shard }}/16)
  run: |
    if [ "${{ github.event_name }}" = "pull_request" ]; then
      pnpm --filter @repo/desktop test:run -- --shard=${{ matrix.shard }}/16
    else
      pnpm --filter @repo/desktop test:run -- --shard=${{ matrix.shard }}/16 --coverage
    fi
```

### 3. shared packageビルドキャッシュ導入

**追加ステップ**（`Install dependencies`の後に追加）:

```yaml
- name: Cache shared package build
  id: cache-shared-build
  uses: actions/cache@v4
  with:
    path: packages/shared/dist
    key: shared-build-${{ runner.os }}-${{ hashFiles('packages/shared/src/**', 'pnpm-lock.yaml') }}
    restore-keys: |
      shared-build-${{ runner.os }}-

- name: Build shared package
  if: steps.cache-shared-build.outputs.cache-hit != 'true'
  run: pnpm --filter @repo/shared build
```

### 4. カバレッジアーティファクト条件分岐

**変更前**:

```yaml
- name: Upload coverage artifact
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: desktop-coverage-${{ matrix.shard }}
    path: apps/desktop/coverage/
    retention-days: 1
```

**変更後**:

```yaml
- name: Upload coverage artifact
  if: github.event_name != 'pull_request'
  uses: actions/upload-artifact@v4
  with:
    name: desktop-coverage-${{ matrix.shard }}
    path: apps/desktop/coverage/
    retention-days: 1
```

### 5. coverageジョブ条件変更

**変更前**:

```yaml
coverage:
  name: Upload Coverage
  runs-on: ubuntu-latest
  timeout-minutes: 5
  needs: [test-shared, test-desktop]
  if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
```

**変更後**:

```yaml
coverage:
  name: Upload Coverage
  runs-on: ubuntu-latest
  timeout-minutes: 5
  needs: [test-shared, test-desktop]
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

## 適用ジョブ一覧

| ジョブ       | 変更内容                                         |
| ------------ | ------------------------------------------------ |
| test-desktop | シャード数16、カバレッジ条件分岐、キャッシュ導入 |
| typecheck    | キャッシュ導入                                   |
| test-shared  | キャッシュ導入                                   |
| coverage     | 条件変更（main pushのみ）                        |

## 影響範囲

| 項目              | 影響                     |
| ----------------- | ------------------------ |
| PRトリガー        | カバレッジなし、高速化   |
| main pushトリガー | カバレッジあり、通常動作 |
| 他ワークフロー    | 影響なし                 |
| ローカル開発      | 影響なし                 |
