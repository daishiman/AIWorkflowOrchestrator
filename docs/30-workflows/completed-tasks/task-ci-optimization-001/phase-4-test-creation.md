# Phase 4: テスト作成（検証計画）

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 4                        |
| 機能名 | task-ci-optimization-001 |
| 作成日 | 2026-04-14               |

## 目的

CI 変更（node_modules キャッシュ追加・シャード数変更・CI_MAX_FORKS 変更）の検証方法を定義する。
実装前に「何を・どうやって確認するか」を明確にし、Phase 5 の実装後に客観的な合否判定ができる状態にする。

---

## 実行タスク

- **タスク1**: キャッシュ動作確認手順の作成（`actions/cache` のキーが正しく生成されるか検証する方法）
- **タスク2**: 計測基準の確定（実行前後の時間計測コマンド）
- **タスク3**: 回帰テスト計画（全 16→17 シャードのテスト結果が変わらないことの確認方法）
- **タスク4**: ロールバック計画（キャッシュが逆効果だった場合の検証基準と戻し手順）

---

## 参照資料

| 資料名                         | パス                                                                         | 説明                               |
| ------------------------------ | ---------------------------------------------------------------------------- | ---------------------------------- |
| Phase 3 レビュー結果           | `outputs/phase-3/design-review-result.md`                                    | PASS 判定確認                      |
| 現行 CI ワークフロー           | `.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml` | 変更前のシャード数・キャッシュ設定 |
| vitest 設定                    | `apps/desktop/vitest.config.ts`                                              | CI_MAX_FORKS 変更前の値確認        |
| actions/cache 公式ドキュメント | https://github.com/actions/cache                                             | キャッシュキー設計の参考           |
| 受入基準                       | `outputs/phase-1/acceptance-criteria.md`                                     | Phase 1 成果物                     |
| P50チェック結果                | `outputs/phase-1/p50-check-result.md`                                        | Phase 1 成果物                     |
| ボトルネック分析               | `outputs/phase-1/bottleneck-analysis.md`                                     | Phase 1 成果物                     |
| 設計決定記録                   | `outputs/phase-2/design-decisions.md`                                        | Phase 2 成果物                     |
| キャッシュ設計                 | `outputs/phase-2/cache-design.md`                                            | Phase 2 成果物                     |
| バリデーションマトリックス     | `outputs/phase-2/validation-matrix.md`                                       | Phase 2 成果物                     |
| リスク評価                     | `outputs/phase-3/risk-assessment.md`                                         | Phase 3 成果物                     |
| MINORトラッキング              | `outputs/phase-3/minor-tracking.md`                                          | Phase 3 成果物                     |

---

## 実行手順

### ステップ0: Phase 4 事前確認【必須】

```bash
# 1. 現在の CI ワークフローのシャード数確認
grep -n "shard:" .github/workflows/ci.yml

# 2. 現在の CI_MAX_FORKS 値確認
grep -n "CI_MAX_FORKS" apps/desktop/vitest.config.ts

# 3. 既存のキャッシュ設定確認（重複追加防止）
grep -n "actions/cache\|cache-node-modules\|node_modules" .github/actions/pnpm-install-retry/action.yml .github/workflows/ci.yml | head -30

# 4. 現在の pnpm-lock.yaml の存在確認（キャッシュキーのハッシュ対象）
ls -la pnpm-lock.yaml
```

### ステップ1: キャッシュ動作確認手順の作成

actions/cache の動作を検証するための確認観点を整理する:

**キャッシュキー検証観点**:

| 観点                             | 確認方法                                      | 期待動作                                          |
| -------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| キーの形式                       | CI ログの "Cache node_modules" ステップを確認 | `Linux-node-modules-<hash>` 形式で出力される      |
| キャッシュヒット時の動作         | ログの "Cache restored successfully" を確認   | `cache-hit: true` になり install がスキップされる |
| キャッシュミス時のフォールバック | restore-keys でのパーシャルマッチ確認         | 旧バージョンから部分的に復元される                |
| pnpm-lock.yaml 変更時の動作      | ロックファイル変更後の CI ログを確認          | キャッシュキーが変わり再 install が走る           |

**検証コマンド（CI 実行後）**:

```bash
# 直近 5 回の CI 実行結果を取得（キャッシュヒット率の確認に使用）
gh run list --workflow=ci.yml --limit 5 --json databaseId,startedAt,updatedAt,conclusion,status

# 特定の run のジョブ詳細（キャッシュステップのログ確認）
gh run view <run-id> --log | grep -A 5 "Cache node_modules"

# キャッシュの一覧確認（リポジトリのキャッシュ使用状況）
gh cache list --limit 10
```

### ステップ2: 計測基準の確定

**ベースライン計測（Phase 5 実装前）**:

```bash
# 実装前の直近 5 回の CI 実行時間を取得
gh run list --workflow=ci.yml --limit 5 \
  --json databaseId,startedAt,updatedAt,conclusion \
  --jq '.[] | {id: .databaseId, duration: (.updatedAt | fromdateiso8601) - (.startedAt | fromdateiso8601), conclusion: .conclusion}'
```

**計測対象ジョブ**:

| ジョブ名                   | 計測前の想定時間 | 改善後の目標時間 |
| -------------------------- | ---------------- | ---------------- |
| build-shared               | ~3 分            | ~1.5 分          |
| test-desktop（全シャード） | ~12 分           | ~6 分            |
| CI 全体                    | ~15 分           | ~7分40秒         |

**計測結果を `outputs/phase-4/baseline-timing.md` に記録する**。

### ステップ3: 回帰テスト計画

シャード数が 16 → 17 に変わっても、全テストが PASSし続けることを確認する計画:

**確認方法**:

```bash
# シャード変更後の全シャード結果確認
gh run list --workflow=ci.yml --limit 1 --json databaseId \
  --jq '.[0].databaseId' | xargs gh run view --json jobs \
  --jq '.jobs[] | select(.name | startswith("test-desktop")) | {name: .name, conclusion: .conclusion}'

# 失敗シャードがないことを確認
gh run view <run-id> --json jobs \
  --jq '[.jobs[] | select(.name | startswith("test-desktop")) | select(.conclusion != "success")] | length'
```

**回帰確認基準**:

- シャード数 17 の全シャードが `success` であること
- 失敗シャード数が 0 であること
- テスト総件数が変更前と同等であること（シャード分割による件数変化がないこと）

### ステップ4: ロールバック計画

**ロールバック判断基準**:

| 状況                                      | 判定         | アクション                        |
| ----------------------------------------- | ------------ | --------------------------------- |
| キャッシュ追加後に CI が遅くなった        | ロールバック | node_modules キャッシュ設定を削除 |
| OOM エラーが増加した                      | 調査・修正   | CI_MAX_FORKS を 2 に戻す          |
| 特定シャードが断続的に失敗する            | 調査・修正   | シャード数を 16 に戻す            |
| CI 実行時間が 7分40秒を超えたまま変化なし | 計測継続     | 5 回分の平均で再判定              |

**ロールバック手順**:

```bash
# ロールバック時の確認コマンド（変更前後の diff 確認）
git diff HEAD~1 .github/workflows/ci.yml
git diff HEAD~1 apps/desktop/vitest.config.ts

# 必要に応じてリバート（Phase 5 の変更コミットを指定）
git revert <commit-hash>
```

---

## 統合テスト連携

- 本 Phase の成果物（ベースライン計測結果）は Phase 7 の改善効果計測と比較対象になる
- 回帰テスト計画（ステップ3）は Phase 5 実装後に即座に実行する

---

## サブタスク管理

| ID     | タスク名                           | ステータス |
| ------ | ---------------------------------- | ---------- |
| T-04-1 | 事前確認（現行設定の把握）         | 未実施     |
| T-04-2 | キャッシュ動作確認手順の作成       | 未実施     |
| T-04-3 | 計測基準の確定（ベースライン計測） | 未実施     |
| T-04-4 | 回帰テスト計画の作成               | 未実施     |
| T-04-5 | ロールバック計画の作成             | 未実施     |

---

## 成果物

| 成果物               | 配置先                                 | 形式     |
| -------------------- | -------------------------------------- | -------- |
| 検証計画書           | `outputs/phase-4/verification-plan.md` | Markdown |
| ロールバック基準     | `outputs/phase-4/rollback-criteria.md` | Markdown |
| ベースライン計測結果 | `outputs/phase-4/baseline-timing.md`   | Markdown |

---

## 完了条件

- [ ] 現行 CI の設定（シャード数・CI_MAX_FORKS・キャッシュ有無）が確認済みであること
- [ ] キャッシュ動作確認の観点と確認方法が `outputs/phase-4/verification-plan.md` に記録されていること
- [ ] ベースライン計測（Phase 5 前の実行時間）が `outputs/phase-4/baseline-timing.md` に記録されていること
- [ ] 回帰テスト計画（全 17 シャードの PASS 確認方法）が記録されていること
- [ ] ロールバック基準と手順が `outputs/phase-4/rollback-criteria.md` に記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-04-1: 事前確認（現行設定の grep 確認）を実行済み
- [ ] T-04-2: キャッシュ動作確認手順を `outputs/phase-4/verification-plan.md` に記録済み
- [ ] T-04-3: ベースライン計測を実行し `outputs/phase-4/baseline-timing.md` に記録済み
- [ ] T-04-4: 回帰テスト計画を `outputs/phase-4/verification-plan.md` に記録済み
- [ ] T-04-5: ロールバック基準と手順を `outputs/phase-4/rollback-criteria.md` に記録済み

---

## 次Phase

**Phase 5: 実装** — 3つの CI 改善（node_modules キャッシュ追加・シャード数 16→17・CI_MAX_FORKS 2→3）を実装する。

**Phase 5 開始条件**: Phase 4 の全完了条件を満たし、ベースライン計測結果が記録済みであること。
