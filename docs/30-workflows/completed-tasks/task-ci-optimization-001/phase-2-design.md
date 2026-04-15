# Phase 2: 設計

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 2                        |
| 機能名 | task-ci-optimization-001 |
| 作成日 | 2026-04-14               |

## 目的

CI 高速化のための3つの改善レイヤーを設計する。
node_modules キャッシュ（`actions/cache@v4`）・テストシャード数最適化（16→17）・Vitest worker 設定（CI_MAX_FORKS: 2→3）の具体的な実装設計を確定し、Phase 3 レビューゲートに入力する。

---

## 実行タスク

- **タスク1**: node_modules キャッシュ設計（actions/cache@v4 の設定・restore-keys・`pnpm-install-retry` 共通 action への配置戦略）
- **タスク2**: テストシャード数設計（16→17 の根拠・GitHub Free Tier 並列上限との関係）
- **タスク3**: Vitest 設定設計（CI_MAX_FORKS: 2→3 の根拠・メモリ影響試算）
- **タスク4**: 変更ファイル一覧の確定（ci.yml / vitest.config.ts）
- **タスク5**: validation matrix コマンドの策定

---

## 参照資料

| 資料名                        | パス                                                                                       | 説明                    |
| ----------------------------- | ------------------------------------------------------------------------------------------ | ----------------------- |
| Phase 1 受入基準              | `outputs/phase-1/acceptance-criteria.md`                                                   | AC-1〜AC-6              |
| CI ワークフロー               | `.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml`               | 改善対象ファイル        |
| Vitest 設定                   | `apps/desktop/vitest.config.ts`                                                            | CI_MAX_FORKS・pool 設定 |
| Phase 1 ボトルネック分析      | `outputs/phase-1/bottleneck-analysis.md`                                                   | ボトルネック優先度      |
| GitHub Actions キャッシュ上限 | https://docs.github.com/actions/using-workflows/caching-dependencies-to-speed-up-workflows | 10GB/リポジトリ         |
| P50チェック結果               | `outputs/phase-1/p50-check-result.md`                                                      | Phase 1 成果物          |

---

## 実行手順

### ステップ1: 設計方針（3つの改善レイヤー）の確定

```bash
# ci.yml の全ジョブ構成を確認（jobs セクション）
grep -n "^  [a-z]" .github/workflows/ci.yml | head -30

# 各ジョブの pnpm install ステップを確認
grep -n -A8 "pnpm install" .github/workflows/ci.yml | head -80

# 現在の runs-on を確認（メモリ容量の把握）
grep -n "runs-on:" .github/workflows/ci.yml
```

**3つの改善レイヤー**:

| レイヤー     | 対象                             | 改善内容                    | 期待削減効果 |
| ------------ | -------------------------------- | --------------------------- | ------------ |
| Setup 最適化 | `pnpm-install-retry` 共通 action | node_modules キャッシュ導入 | ~3〜4min     |
| Shard 最適化 | test-desktop                     | シャード数 16→17            | ~20〜30s     |
| Vitest 設定  | test-desktop                     | CI_MAX_FORKS 2→3            | ~30s前後     |

---

### ステップ2: node_modules キャッシュ設計

#### 設計方針: 共通 composite action への集約 vs. setup job パターン

| アプローチ                | 採用可否 | 根拠                                                                                 |
| ------------------------- | -------- | ------------------------------------------------------------------------------------ |
| **共通 composite action** | **採用** | `pnpm-install-retry` は全ジョブから呼ばれており、cache ロジックを 1 箇所に集約できる |
| setup job パターン        | 不採用   | setup job → 全ジョブで `needs: [setup]` の依存追加が必要。ジョブ数増加・複雑化       |

**採用理由**: CI の現在の構造（第1波・第2波の独立並列実行）を維持しつつ、`pnpm-install-retry` に cache を集約するのが最小変更で最もエレガント。

#### actions/cache@v4 設定仕様

```yaml
# `pnpm-install-retry` の中で利用する
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

# キャッシュ miss 時のみ pnpm install を実行する条件付きステップ
- name: Install dependencies
  if: steps.cache-node-modules.outputs.cache-hit != 'true'
  run: pnpm install --frozen-lockfile
```

**設計上の考慮点**:

- `key`: `pnpm-lock.yaml` のハッシュを使用。ロックファイル変更時に自動的にキャッシュ無効化
- `restore-keys`: OS プレフィックスのみのフォールバック。部分的なキャッシュ再利用が可能
- `path`: モノレポ全 workspace の `node_modules` を網羅。`.pnpm-store` は除外（pnpm ストアキャッシュとの二重化を避ける）
- キャッシュサイズ見積もり: node_modules 合計 ~500MB〜1GB 程度（要実測）
- GitHub Actions キャッシュ上限: 10GB/リポジトリ（容量余裕あり）

**fallback 設計**:

- `cache-hit != 'true'` 条件による `pnpm install` の条件実行で、キャッシュ miss 時も正常動作を保証
- `restore-keys` による部分キャッシュ適用後は `pnpm install` が差分のみインストールするため高速

#### 適用対象ジョブ一覧

```bash
# 現在の全ジョブと pnpm install の有無を確認
grep -n "name:.*\|pnpm install" .github/workflows/ci.yml | head -60
```

| ジョブ名     | キャッシュ適用 | 備考                           |
| ------------ | -------------- | ------------------------------ |
| build-shared | 適用           | 第1波、クリティカルパスの起点  |
| lint         | 適用           | 第1波、並列実行                |
| security     | 適用           | 第1波、統合検討あり（後述）    |
| module-sync  | 適用           | 第1波、統合検討あり（後述）    |
| typecheck    | 適用           | 第2波、depends on build-shared |
| test-shared  | 適用           | 第2波                          |
| test-desktop | 適用           | 第2波、16→17シャード対象       |
| e2e          | 適用           | 第2波                          |
| build-check  | 適用           | 最終ジョブ                     |

---

### ステップ3: シャード数設計（16→17）

#### 根拠

| 項目                      | 現状     | 変更後          | 根拠                                                    |
| ------------------------- | -------- | --------------- | ------------------------------------------------------- |
| 総テストファイル数        | 399      | 399（変更なし） | 実測値                                                  |
| シャード数                | 16       | 17              | GitHub Free Tier 並列上限（20）に収めつつ、微調整で短縮 |
| 1シャードあたりファイル数 | ~25      | ~23〜24         | 399 ÷ 17 = 23.47                                        |
| 推定シャード実行時間      | ~8min30s | ~8min前後       | ファイル数削減比 25→23〜24 ≒ 5〜8%短縮                  |

#### GitHub Free Tier 並列上限との関係

- GitHub Free Tier の並列ジョブ上限: **20**
- シャード 17 + 同時実行される他ジョブ（typecheck / test-shared / e2e など）が重なっても上限 20 に収まる
- **対策**: 第2波は `needs: [build-shared]` で待機するため、第1波（lint / security / module-sync）完了後に第2波が開始。第2波開始時に同時に走るジョブ数が 20 を超えないことを確認する

```bash
# 第2波ジョブの needs 設定を確認
grep -A5 "test-desktop\|typecheck\|test-shared\|e2e" .github/workflows/ci.yml | grep "needs:"
```

#### ci.yml matrix 設定変更

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

**Vitest shard オプションの対応変更**:

```yaml
# 変更前
run: pnpm vitest run --shard=${{ matrix.shard }}/16

# 変更後
run: pnpm vitest run --shard=${{ matrix.shard }}/17
```

---

### ステップ4: Vitest 設定設計（CI_MAX_FORKS: 2→3）

#### 根拠

| 項目            | 現状       | 変更後            | 根拠                                          |
| --------------- | ---------- | ----------------- | --------------------------------------------- |
| CI_MAX_FORKS    | 2          | 3                 | I/O 待機中のアイドル時間をもう1ワーカーで活用 |
| pool            | forks      | forks（変更なし） | Electron 環境での安定性を維持                 |
| fileParallelism | false (CI) | false（変更なし） | CI 環境での安定性を維持                       |

#### メモリ影響試算

- GitHub Actions ubuntu-latest ランナーのメモリ: **7GB**
- 現状: CI_MAX_FORKS=2 → ~2〜3プロセス同時実行
- 変更後: CI_MAX_FORKS=3 → ~3〜4プロセス同時実行
- Electron テストプロセス 1プロセスあたりの推定メモリ: ~200〜400MB
- 変更後の推定合計: ~1.2〜1.6GB（ランナー 7GB に対して余裕あり）

**リスク**: メモリ使用量が想定を超えた場合、OOM（Out of Memory）でジョブがクラッシュする。Phase 3 でリスク許容可否を判定する。

#### `apps/desktop/vitest.config.ts` 変更設計

```typescript
// 変更前
const CI_MAX_FORKS = 2;

// 変更後
const CI_MAX_FORKS = 3;
```

**ELECTRON_SKIP_BINARY_DOWNLOAD の確認**:

```bash
# CI での Electron バイナリダウンロードスキップ設定を確認
grep -n "ELECTRON_SKIP_BINARY_DOWNLOAD\|electronDist\|electronExecutable" \
  apps/desktop/vitest.config.ts .github/workflows/ci.yml
```

- `ELECTRON_SKIP_BINARY_DOWNLOAD=1` が設定済みであることを確認（CI でのビルド時間短縮に寄与）

---

### ステップ5: 変更ファイル一覧

| ファイル                                        | 変更種別 | 変更内容                              |
| ----------------------------------------------- | -------- | ------------------------------------- |
| `.github/actions/pnpm-install-retry/action.yml` | 修正     | node_modules cache step の共通化      |
| `.github/workflows/ci.yml`                      | 修正     | シャード数 16→17 変更                 |
| `apps/desktop/vitest.config.ts`                 | 修正     | `CI_MAX_FORKS` を `2` から `3` に変更 |

**スコープ外（変更しない）**:

- `pnpm-lock.yaml` — キャッシュキーに使用するが直接変更しない
- テストファイル — 本タスクでテストロジックは変更しない
- `packages/` 配下のソースコード — 変更なし

---

## concern 別トポロジー表

| concern      | 対象ファイル                                    | 変更ステップ                   | リスク                       |
| ------------ | ----------------------------------------------- | ------------------------------ | ---------------------------- |
| Setup 最適化 | `.github/actions/pnpm-install-retry/action.yml` | cache step 追加                | 低（fallback あり）          |
| Shard 最適化 | `.github/workflows/ci.yml`                      | matrix 16→17・総シャード数変更 | 低〜中（並列上限内で微調整） |
| Vitest 設定  | `apps/desktop/vitest.config.ts`                 | CI_MAX_FORKS 2→3               | 中（メモリ影響要確認）       |

---

## validation matrix コマンド

Phase 4 実装後の検証コマンド:

```bash
# 1. ci.yml の構文検証（GitHub Actions schema）
# actionlint がインストールされている場合
actionlint .github/workflows/ci.yml

# 2. シャード数変更の確認
grep -n "shard\|total-shards\|/17\|/16" .github/workflows/ci.yml

# 3. キャッシュ設定の確認
grep -n -A10 "cache-node-modules\|actions/cache" .github/actions/pnpm-install-retry/action.yml .github/workflows/ci.yml

# 4. CI_MAX_FORKS の変更確認
grep -n "CI_MAX_FORKS" apps/desktop/vitest.config.ts

# 5. ローカルでの Vitest 動作確認（CI_MAX_FORKS=3 でのテスト実行）
CI=true CI_MAX_FORKS=3 pnpm --filter @repo/desktop vitest run --shard=1/17

# 6. 実際の CI 実行後の所要時間確認
gh run list --workflow=ci.yml --limit=3 \
  --json databaseId,conclusion,createdAt,updatedAt \
  | jq '.[] | {id: .databaseId, status: .conclusion, duration_min: ((((.updatedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)) / 60) | floor)}'
```

---

## 設計判断記録

| 決定事項                      | 選択                                  | 理由                                                    |
| ----------------------------- | ------------------------------------- | ------------------------------------------------------- |
| キャッシュ配置方式            | `pnpm-install-retry` composite action | setup job パターンより変更量少・既存構造維持            |
| キャッシュキー                | `hashFiles('pnpm-lock.yaml')`         | ロックファイル変更時の自動無効化                        |
| シャード数                    | 17                                    | GitHub Free Tier 並列上限（20）内で最適化               |
| CI_MAX_FORKS                  | 3                                     | I/O 待機中のアイドル削減。7GBランナーに対してメモリ余裕 |
| security + module-sync の統合 | Phase 4 で判断                        | 現状の実行時間が short (~1min) のため、優先度低と判断   |

---

## サブタスク管理

| ID     | タスク名                       | ステータス |
| ------ | ------------------------------ | ---------- |
| T-02-1 | node_modules キャッシュ設計    | 未実施     |
| T-02-2 | シャード数設計（16→17）        | 未実施     |
| T-02-3 | CI_MAX_FORKS 設計（2→3）       | 未実施     |
| T-02-4 | 変更ファイル一覧確定           | 未実施     |
| T-02-5 | validation matrix コマンド策定 | 未実施     |

---

## 成果物

| 成果物             | 配置先                                 | 形式     |
| ------------------ | -------------------------------------- | -------- |
| 設計決定記録       | `outputs/phase-2/design-decisions.md`  | Markdown |
| キャッシュ設計仕様 | `outputs/phase-2/cache-design.md`      | Markdown |
| validation matrix  | `outputs/phase-2/validation-matrix.md` | Markdown |

---

## 完了条件

- [ ] node_modules キャッシュ設計（actions/cache@v4 の設定・restore-keys・ジョブ配置戦略）が確定していること
- [ ] シャード数 16→17 の根拠（399÷17・並列上限との関係）が文書化されていること
- [ ] CI_MAX_FORKS 2→3 の根拠（メモリ試算含む）が文書化されていること
- [ ] 変更ファイル一覧（`.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml` / `apps/desktop/vitest.config.ts`）が確定していること
- [ ] validation matrix コマンドが `outputs/phase-2/validation-matrix.md` に記録されていること
- [ ] 設計判断記録が `outputs/phase-2/design-decisions.md` に記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-02-1: キャッシュ設計（key/path/restore-keys/条件付き install）を `outputs/phase-2/cache-design.md` に記録済み
- [ ] T-02-2: シャード数 16→17 の ci.yml 変更差分イメージを記録済み
- [ ] T-02-3: CI_MAX_FORKS 2→3 の vitest.config.ts 変更差分とメモリ試算を記録済み
- [ ] T-02-4: 変更対象ファイル3件（`.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml` / `apps/desktop/vitest.config.ts`）の変更内容が確定済み
- [ ] T-02-5: validation matrix コマンド6種を記録済み

---

## 次Phase

**Phase 3: 設計レビューゲート** — 設計の価値性・実現性・整合性・運用性を評価し、PASS/MINOR/MAJOR を判定して Phase 4 への進行可否を決定する。

**ゲート条件**: Phase 1-2 の全完了条件を満たさない場合、Phase 3 へ進まないこと。
