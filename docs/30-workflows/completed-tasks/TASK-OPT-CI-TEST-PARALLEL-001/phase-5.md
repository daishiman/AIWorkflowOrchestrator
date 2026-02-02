# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                      |
| ------ | ----------------------- |
| Phase  | 5                       |
| 機能名 | CI テスト並列実行最適化 |
| 作成日 | 2026-02-02              |

## 目的

設計に基づいてCI設定とVitest設定を変更し、パフォーマンス目標を達成する。

## 実行タスク

### Task 1: ci.yml のシャード数変更

**変更ファイル**: `.github/workflows/ci.yml`

**変更内容**:

1. `matrix.shard` を8から16に変更
2. テストコマンドの `--shard=N/8` を `--shard=N/16` に変更
3. カバレッジアーティファクトのパターンを調整

```yaml
# 変更前
strategy:
  matrix:
    shard: [1, 2, 3, 4, 5, 6, 7, 8]

# 変更後
strategy:
  matrix:
    shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
```

### Task 2: shared packageビルドキャッシュ導入

**変更ファイル**: `.github/workflows/ci.yml`

**追加ステップ**:

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

### Task 3: カバレッジ条件分岐の実装

**変更ファイル**: `.github/workflows/ci.yml`

**変更内容**:

```yaml
- name: Run desktop app tests (shard ${{ matrix.shard }}/16)
  run: |
    if [ "${{ github.event_name }}" = "pull_request" ]; then
      pnpm --filter @repo/desktop test:run -- --shard=${{ matrix.shard }}/16
    else
      pnpm --filter @repo/desktop test:run -- --shard=${{ matrix.shard }}/16 --coverage
    fi

- name: Upload coverage artifact
  if: github.event_name != 'pull_request'
  uses: actions/upload-artifact@v4
  with:
    name: desktop-coverage-${{ matrix.shard }}
    path: apps/desktop/coverage/
    retention-days: 1
```

**coverageジョブの条件変更**:

```yaml
coverage:
  name: Upload Coverage
  runs-on: ubuntu-latest
  timeout-minutes: 5
  needs: [test-shared, test-desktop]
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

### Task 4: Vitest設定の最適化

**変更ファイル**: `apps/desktop/vitest.config.ts`

**変更内容**:

```typescript
poolOptions: {
  forks: {
    maxForks: process.env.CI ? 4 : 2,
    isolate: true,
  },
},
fileParallelism: process.env.CI ? true : false,
```

### Task 5: 変更の検証

```bash
# ローカルでの動作確認
pnpm --filter @repo/desktop test:run

# CI設定のYAML構文検証
npx yaml-lint .github/workflows/ci.yml
```

## 参照資料

| 資料名           | パス                                     | 説明          |
| ---------------- | ---------------------------------------- | ------------- |
| 設計書           | `outputs/phase-2/architecture-design.md` | Phase 2成果物 |
| テスト仕様書     | `outputs/phase-4/test-specification.md`  | Phase 4成果物 |
| 現在のCI設定     | `.github/workflows/ci.yml`               | 変更対象      |
| 現在のVitest設定 | `apps/desktop/vitest.config.ts`          | 変更対象      |

## 統合テスト連携【必須】

**フロント/バック接続の実装とテスト支援コード整備**:

| 実装項目       | 内容                                         |
| -------------- | -------------------------------------------- |
| シャード分割   | 16シャード対応の`--shard`オプション          |
| キャッシュ連携 | shared buildキャッシュとpnpm storeキャッシュ |
| カバレッジ集約 | 16シャードからのカバレッジマージ             |

## 成果物

| 成果物           | パス                            | 説明                 |
| ---------------- | ------------------------------- | -------------------- |
| 変更後CI設定     | `.github/workflows/ci.yml`      | 最適化済みCI設定     |
| 変更後Vitest設定 | `apps/desktop/vitest.config.ts` | 最適化済みテスト設定 |

## 完了条件

- [ ] ci.yml のシャード数が16に変更されている
- [ ] shared packageビルドキャッシュが導入されている
- [ ] カバレッジ計測の条件分岐が実装されている
- [ ] Vitest設定のmaxForks/fileParallelismが最適化されている
- [ ] ローカルでのテスト実行が成功する
- [ ] YAML構文エラーがない
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
