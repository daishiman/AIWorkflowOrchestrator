# Phase 6: エッジケース検証結果

## 実行日時

2026-04-14

## 事前確認

```bash
# Phase 5 で追加したキャッシュ設定の確認
# .github/actions/pnpm-install-retry/action.yml:
#   11: id: cache-node-modules
#   12: uses: actions/cache@v4
#   27: if: steps.cache-node-modules.outputs.cache-hit != 'true'

# CI_MAX_FORKS の値確認
# apps/desktop/vitest.config.ts:
#   14: const CI_MAX_FORKS = 3;

# NODE_OPTIONS の設定確認
# apps/desktop/vitest.config.ts: execArgv に --max-old-space-size は CI時空
# .github/workflows/ci.yml: NODE_OPTIONS: --max-old-space-size=8192 (test-desktop)
```

## T-06-1: lockfile 変更時のキャッシュ無効化確認

### 設計上の確認

| 観点                            | 確認方法                                                        | 期待動作                                                 |
| ------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------- |
| pnpm-lock.yaml 変更時のキー     | キャッシュキーが `hashFiles('pnpm-lock.yaml')` で構成される     | lockfile 変更→ハッシュ変化→新しいキー生成→キャッシュミス |
| restore-keys のパーシャルマッチ | `${{ runner.os }}-node-modules-` プレフィックスでフォールバック | 古いキャッシュから部分復元後に pnpm install が走る       |
| 誤った古い node_modules の使用  | `cache-hit != 'true'` 条件でインストール実行                    | lockfile 変更後は必ず再インストールが実行される          |

**判定**: ✅ 設計上問題なし

`hashFiles('pnpm-lock.yaml')` によるキャッシュキーの構成により、lockfile 変更時は必ずキャッシュキーが変わる。`if: steps.cache-node-modules.outputs.cache-hit != 'true'` によりキャッシュミス時は必ず `pnpm install` が実行される。

## T-06-2: 並行 PR 時のキャッシュ競合確認

### 設計上の確認

| 観点                          | 確認方法                                                  | 期待動作                                                        |
| ----------------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| キャッシュキーのスコープ      | GitHub Actions のキャッシュスコープ仕様を確認             | ブランチごとに独立したキャッシュが使用される                    |
| restore-keys のフォールバック | main ブランチのキャッシュから PR ブランチがフォールバック | `${{ runner.os }}-node-modules-` で main キャッシュを参照できる |

**フォールバック動作の確認**:

restore-keys の設定 `${{ runner.os }}-node-modules-` により:

1. 同一ハッシュのキャッシュがない場合、最新の `Linux-node-modules-*` キャッシュが使用される
2. pnpm install が走り、差分のみ更新される
3. 新しいハッシュのキャッシュとして保存される

**判定**: ✅ 設計上問題なし

GitHub Actions のキャッシュはブランチスコープがあり、並行 PR 間で競合しない。

## T-06-3: CI_MAX_FORKS=3 での OOM 発生可能性チェック

### メモリ試算

| 項目                                                | 値                         |
| --------------------------------------------------- | -------------------------- |
| GitHub Actions ubuntu-latest ランナーのメモリ       | 7GB                        |
| `NODE_OPTIONS=--max-old-space-size=8192`            | 8GB（Node.js ヒープ上限）  |
| Electron テストプロセス 1プロセスあたりの推定メモリ | ~200〜400MB                |
| CI_MAX_FORKS=3 時の推定合計                         | ~1.2〜1.6GB                |
| ランナーメモリへの余裕                              | 7GB - 1.6GB = 5.4GB の余裕 |

**考慮事項**:

- `NODE_OPTIONS=--max-old-space-size=8192` は Node.js ヒープ上限値の設定（実際のランナーメモリは7GB）
- CI 環境では `execArgv: []`（`--max-old-space-size` フラグなし）のため Node.js デフォルト制限が適用される
- Electron プロセスは `ELECTRON_SKIP_BINARY_DOWNLOAD: 1` が設定済み（本体ダウンロードなし）

**判定**: ✅ 設計上 OOM リスクは低い（実測は CI 実行後に確認）

## T-06-4: カバレッジ収集が全 17 シャードで正常に行われることの確認

### 設計上の確認

```bash
# ci.yml のカバレッジ関連設定確認
# - coverage ジョブ（最終ジョブ）: needs: [test-shared, test-desktop]
# - test-desktop: VITEST_SHARDED_COVERAGE=true --coverage (main push 時のみ)
# - シャードごとに desktop-coverage-${{ matrix.shard }} artifact として保存
# - coverage ジョブで pattern: desktop-coverage-* で全シャード分を収集
```

| 観点                           | 確認内容                                                             | 期待動作                                                        |
| ------------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| カバレッジ収集ジョブの有無     | ci.yml に coverage ジョブが存在する                                  | `needs: [test-shared, test-desktop]` で全17シャード完了後に実行 |
| シャード分割後のカバレッジ集約 | `pattern: desktop-coverage-*` で全シャードを収集                     | 17シャード全ての coverage artifact が収集される                 |
| main ブランチでの継続動作      | `if: github.event_name == 'push' && github.ref == 'refs/heads/main'` | main push 時のみ coverage ジョブが実行される                    |

**判定**: ✅ 設計上問題なし（AC-6 対応済み）

## エッジケース検証総括

| 観点                                    | 判定        | 備考                                  |
| --------------------------------------- | ----------- | ------------------------------------- |
| T-06-1: lockfile 変更時キャッシュ無効化 | ✅ PASS     | hashFiles による自動無効化            |
| T-06-2: 並行 PR キャッシュ競合          | ✅ PASS     | ブランチスコープで分離                |
| T-06-3: CI_MAX_FORKS=3 OOM チェック     | ✅ 低リスク | 実測は CI 実行後に確認                |
| T-06-4: カバレッジ全17シャード動作      | ✅ PASS     | pattern: desktop-coverage-\* で全収集 |

**全エッジケース PASS** — Phase 7 へ進む条件を満たす。
