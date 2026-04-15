# Phase 2: キャッシュ設計仕様

## 実行日時

2026-04-14

## actions/cache@v4 設定仕様

### キャッシュステップ設計

```yaml
# .github/actions/pnpm-install-retry/action.yml に追加する
- name: Cache node_modules
  id: cache-node-modules
  uses: actions/cache@v4
  with:
    path: |
      node_modules
      apps/desktop/node_modules
      apps/web/node_modules
      packages/shared/node_modules
      packages/ui/node_modules
    key: ${{ runner.os }}-node-modules-${{ hashFiles('pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-node-modules-

- name: Install dependencies with retry
  if: steps.cache-node-modules.outputs.cache-hit != 'true'
  shell: bash
  run: |
    set -euo pipefail
    # ... 既存のリトライロジック
```

## 設計上の考慮点

| 考慮点                   | 設計                                                               | 根拠                                                                  |
| ------------------------ | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| キャッシュキー           | `${{ runner.os }}-node-modules-${{ hashFiles('pnpm-lock.yaml') }}` | ロックファイル変更時の自動無効化                                      |
| restore-keys             | `${{ runner.os }}-node-modules-`                                   | OS プレフィックスのみのフォールバック。部分的なキャッシュ再利用が可能 |
| キャッシュ path          | モノレポ全 workspace の `node_modules` を網羅                      | apps/desktop, apps/web, packages/shared, packages/ui                  |
| `.pnpm-store` 除外       | キャッシュ対象外                                                   | pnpm ストアキャッシュ（`cache: "pnpm"`）と二重化を避ける              |
| キャッシュサイズ見積もり | ~500MB〜1GB                                                        | GitHub Actions キャッシュ上限 10GB/リポジトリに対して余裕あり         |

## fallback 設計

| 状態               | 動作                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| 完全ヒット時       | `cache-hit: true` → pnpm install スキップ（最速）                        |
| パーシャルヒット時 | `cache-hit: false` → pnpm install 実行（古いキャッシュを起点に差分のみ） |
| 完全ミス時         | キャッシュなしから pnpm install 実行（従来と同等）                       |

## 適用対象ジョブ一覧

| ジョブ名           | キャッシュ適用 | 波                            |
| ------------------ | -------------- | ----------------------------- |
| build-shared       | 適用           | 第1波（クリティカルパス起点） |
| lint               | 適用           | 第1波                         |
| security           | 適用           | 第1波                         |
| check-module-sync  | 適用           | 第1波                         |
| typecheck          | 適用           | 第2波                         |
| test-shared        | 適用           | 第2波                         |
| test-desktop (×17) | 適用           | 第2波                         |
| e2e-desktop        | 適用           | 第2波                         |
| build              | 適用           | 最終                          |

全ジョブが `pnpm-install-retry` composite action を使用しているため、1箇所の変更で全ジョブに適用される。

## シャード数設計（16→17）

| 項目                      | 現状 | 変更後          | 根拠                                                    |
| ------------------------- | ---- | --------------- | ------------------------------------------------------- |
| 総テストファイル数        | 399  | 399（変更なし） | 実測値                                                  |
| シャード数                | 16   | 17              | GitHub Free Tier 並列上限（20）に収めつつ、微調整で短縮 |
| 1シャードあたりファイル数 | ~25  | ~23〜24         | 399 ÷ 17 = 23.47                                        |

### ci.yml matrix 設定変更

```yaml
# 変更前
strategy:
  matrix:
    shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

# 変更後
strategy:
  matrix:
    shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
```

### Vitest shard オプション変更

```yaml
# 変更前
run: pnpm vitest run --shard=${{ matrix.shard }}/16

# 変更後
run: pnpm vitest run --shard=${{ matrix.shard }}/17
```
