# Phase 1: 要件定義

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 1                        |
| 機能名 | task-ci-optimization-001 |
| 作成日 | 2026-04-14               |

## 目的

GitHub Actions CI（`.github/actions/pnpm-install-retry/action.yml`、`.github/workflows/ci.yml`）の実行時間を現状の直近5回 main 平均 15m21s から 7分40秒以内へ削減する（50%削減を目標）ための要件を定義する。
node_modules キャッシュの導入・テストシャード数の微調整・Vitest worker設定の見直しによって、全テスト品質を維持しながら高速化を実現する。

---

## Step 0: P50チェック【必須】

Phase 1 開始前に、対象ファイルの実装状態と直近のCI実績を確認し、既実装キャッシュ設定との重複・齟齬を防止する。

```bash
# 直近5回の main ブランチ CI 実行状況を確認（P50計測）
gh run list --workflow=ci.yml --branch main --limit=5 --json databaseId,conclusion,createdAt,updatedAt,status \
  | jq '.[] | select(.status=="completed") | {id: .databaseId, status: .conclusion, duration_sec: ((.updatedAt | fromdateiso8601) - (.createdAt | fromdateiso8601))}'

# action.yml / ci.yml の現在のキャッシュ設定を確認
grep -n "cache\|restore-keys\|node_modules\|pnpm-lock" .github/actions/pnpm-install-retry/action.yml .github/workflows/ci.yml

# test-desktop ジョブのシャード数を確認
grep -n "shard\|matrix\|shards\|total-shards" .github/workflows/ci.yml

# Vitest の現在の fork 設定を確認
grep -n "CI_MAX_FORKS\|pool\|fileParallelism\|forks" apps/desktop/vitest.config.ts

# 現在の pnpm install ステップ（全ジョブ）を確認
grep -A5 "pnpm install" .github/workflows/ci.yml | head -60
```

**確認事項**:

- [ ] `.github/actions/pnpm-install-retry/action.yml` に `actions/cache` で `node_modules` をキャッシュするステップが存在しないこと（未実装の証拠）
- [ ] `test-desktop` のシャード数が `16` であること
- [ ] `apps/desktop/vitest.config.ts` の `CI_MAX_FORKS` が `2` であること
- [ ] 各ジョブが独立して `pnpm install --frozen-lockfile` を実行していること

---

## 実行タスク

- **タスク1**: P50チェック — CI実績・対象ファイルの現状を確認
- **タスク2**: ボトルネック特定 — クリティカルパス上の遅延要因を文書化
- **タスク3**: 改善目標設定 — 数値目標（7分40秒以内）を合意・確定
- **タスク4**: 受入基準（AC-1〜AC-6）の定義
- **タスク5**: 依存関係・前提条件・リスクの整理

---

## 参照資料

| 資料名                    | パス                                                                                       | 説明                                         |
| ------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------- |
| CI ワークフロー           | `.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml`               | 改善対象: キャッシュ・シャード数・ジョブ構成 |
| Vitest 設定               | `apps/desktop/vitest.config.ts`                                                            | CI_MAX_FORKS・pool・fileParallelism 設定     |
| pnpm ロックファイル       | `pnpm-lock.yaml`                                                                           | キャッシュキー生成に使用                     |
| GitHub Actions cache docs | https://docs.github.com/actions/using-workflows/caching-dependencies-to-speed-up-workflows | キャッシュ設計の参考                         |

---

## 実行手順

### ステップ1: 現状分析（CI実績の数値化）

```bash
# 直近5回の main ブランチ CI 実行状況を再確認
gh run list --workflow=ci.yml --branch main --limit=5 --json databaseId,conclusion,createdAt,updatedAt,status \
  | jq '.[] | select(.status=="completed") | {id: .databaseId, conclusion: .conclusion, duration_sec: ((.updatedAt | fromdateiso8601) - (.createdAt | fromdateiso8601))}'

# 最新 main run の pnpm install ステップを特定
LATEST_MAIN_RUN=$(gh run list --workflow=ci.yml --branch main --limit=1 --json databaseId --jq '.[0].databaseId')
gh run view "$LATEST_MAIN_RUN" --log | grep -E "pnpm install|##\[timing\]" | head -40
```

**把握すべき情報**:

- `pnpm install --frozen-lockfile` の典型的所要時間（推定: ~90s）
- 第1波ジョブ（build-shared / lint / security / module-sync）のセットアップ時間割合
- `test-desktop` 1シャードあたりの実行時間（推定: ~8min30s 前後）

### ステップ2: ボトルネック特定

**ボトルネック一覧（既調査結果の確認）**:

| ボトルネック                                           | 推定時間削減効果                    | 優先度 |
| ------------------------------------------------------ | ----------------------------------- | ------ |
| 各ジョブでの pnpm install（node_modules 非キャッシュ） | ~90s × クリティカルパス上のジョブ数 | 最高   |
| test-desktop シャード数 16（~25ファイル/シャード）     | ~20〜30s（17シャードに微調整）      | 中     |
| CI_MAX_FORKS = 2（I/O待機中の並列不足）                | ~30s前後                            | 中     |
| security + module-sync の独立実行（第1波に余裕あり）   | ~15s                                | 低     |

```bash
# 各ジョブの並列構造を確認（needs: 依存関係）
grep -A3 "needs:" .github/workflows/ci.yml
```

### ステップ3: 改善目標設定

**目標値**:

- CI 実行時間: 現状 ~15分 → 目標 **7分40秒以内**（50%削減）
- 全テスト（399テストファイル）: PASS 維持
- コード変更: `.github/actions/pnpm-install-retry/action.yml`、`.github/workflows/ci.yml`、`apps/desktop/vitest.config.ts`

**改善インパクト試算**:

| 施策                        | 削減効果（見込み）     | 根拠                           |
| --------------------------- | ---------------------- | ------------------------------ |
| node_modules キャッシュ導入 | ~3〜4min（固定費削減） | install/postinstall の重複削減 |
| シャード数 16→17            | ~20〜30s               | 17 で free 上限を超えない      |
| CI_MAX_FORKS 2→3            | ~30s前後               | I/O待機中の並列化促進          |

### ステップ4: 受入基準の確定

以下の受入基準を確定し、成果物として `outputs/phase-1/acceptance-criteria.md` に記録する。

**受入基準（AC-1〜AC-6）**:

| AC番号 | 基準                                                                                        | 検証方法                         |
| ------ | ------------------------------------------------------------------------------------------- | -------------------------------- |
| AC-1   | `actions/cache@v4` による node_modules キャッシュが正常動作すること（lockfileハッシュキー） | CI ログで cache hit/miss 確認    |
| AC-2   | CI 実行時間（成功ラン）が 7分40秒以内に削減されること                                       | `gh run list` で duration 確認   |
| AC-3   | 全テスト（16シャード → 17シャード後も含む）が PASS を維持すること                           | CI 全ジョブ green                |
| AC-4   | `test-desktop` シャード数が 16→17 に更新され、各シャード ~24ファイルで動作すること          | ci.yml matrix 設定 + CI ログ確認 |
| AC-5   | `apps/desktop/vitest.config.ts` の `CI_MAX_FORKS` が `3` に更新されること                   | コードレビュー / CI ログ確認     |
| AC-6   | main ブランチの `build-check` ジョブでカバレッジ収集が継続動作すること                      | CI ログで coverage 出力確認      |

---

## 統合テスト連携

- 本施策はテストロジックを変更しない（Vitest の並列度・シャード数の調整のみ）
- AC-3 の「全テスト PASS 維持」が Phase 4 実装後の統合確認ポイントとなる
- `CI_MAX_FORKS` 増加によるメモリ使用量変化を Phase 4 で CI ログで確認

---

## 多角的チェック観点（AIが判断）

### システム系

- **因果ループ**: node_modules 非キャッシュ → 各ジョブで pnpm install (~2min) → クリティカルパス長期化 → CI フィードバック遅延（強化ループ）
- **並列制限**: GitHub Free Tier の並列ジョブ上限は 20。シャード 17 + typecheck/test-shared/e2e でちょうど 20 に収まるため、20 シャードは採用しない
- **キャッシュ整合性**: `pnpm-lock.yaml` ハッシュをキーにすることで、ロックファイル変更時に自動的にキャッシュ無効化される

### 価値・コスト系

- **価値**: CI 待機時間 50%削減 → 開発フィードバックループ高速化
- **コスト**: `.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml` / `apps/desktop/vitest.config.ts` の3か所変更。影響範囲は明確
- **トレードオフ**: node_modules キャッシュサイズ増大 vs. GitHub Actions キャッシュ上限（10GB/リポジトリ）

### 問題解決系

- **優先順位**: AC-1（node_modulesキャッシュ）が最大インパクト。これだけで ~3〜4min 削減見込み
- **リスク**: CI_MAX_FORKS 増加によるメモリ圧迫。GitHub Actions ランナーのメモリ上限（7GB）との関係を Phase 2 で設計

---

## サブタスク管理

| ID     | タスク名             | 担当 | ステータス |
| ------ | -------------------- | ---- | ---------- |
| T-01-1 | P50チェック          | -    | 未実施     |
| T-01-2 | ボトルネック特定     | -    | 未実施     |
| T-01-3 | 改善目標設定         | -    | 未実施     |
| T-01-4 | 受入基準定義         | -    | 未実施     |
| T-01-5 | 依存関係・リスク整理 | -    | 未実施     |

---

## 成果物

| 成果物               | 配置先                                   | 形式     |
| -------------------- | ---------------------------------------- | -------- |
| 受入基準ドキュメント | `outputs/phase-1/acceptance-criteria.md` | Markdown |
| P50チェック結果      | `outputs/phase-1/p50-check-result.md`    | Markdown |
| ボトルネック分析書   | `outputs/phase-1/bottleneck-analysis.md` | Markdown |

---

## 完了条件

- [ ] P50チェックを実行し、直近5回のCI実行時間・ジョブ別タイミングが確認済みであること
- [ ] `pnpm install` の各ジョブでの所要時間が計測・記録済みであること
- [ ] node_modules キャッシュが現在未実装であることが確認済みであること
- [ ] 受入基準 AC-1〜AC-6 が全て定義・文書化されていること
- [ ] 変更対象ファイル（`.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml` / `apps/desktop/vitest.config.ts`）が確定していること
- [ ] `outputs/phase-1/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

Phase 1 完了時に以下を確認して記録すること:

- [ ] T-01-1: P50チェック実行済み（`gh run list` で直近5回の duration 計測）
- [ ] T-01-2: ボトルネックを `outputs/phase-1/bottleneck-analysis.md` に記録済み
- [ ] T-01-3: 改善目標（7分40秒以内）を合意・文書化済み
- [ ] T-01-4: 受入基準 AC-1〜AC-6 を `outputs/phase-1/acceptance-criteria.md` に記録済み
- [ ] T-01-5: リスク（キャッシュ上限・並列上限・メモリ圧迫）を文書化済み

---

## 次Phase

**Phase 2: 設計** — node_modules キャッシュ設計（`.github/actions/pnpm-install-retry/action.yml` に `actions/cache@v4` を集約）・シャード数設計（16→17）・CI_MAX_FORKS 設計（2→3）を行う。

**ゲート条件**: Phase 1 の全完了条件を満たさない場合、Phase 2 へ進まないこと。
