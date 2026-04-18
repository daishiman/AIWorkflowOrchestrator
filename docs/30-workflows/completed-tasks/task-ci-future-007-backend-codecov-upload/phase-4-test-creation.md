# Phase 4: テスト作成（検証計画）

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 4                                         |
| 機能名 | task-ci-future-007-backend-codecov-upload |
| 作成日 | 2026-04-16                                |

## 目的

実装前のテスト仕様を策定し、ローカル検証スクリプトを準備する。
「何を・どうやって確認するか」を明確にし、Phase 5 の実装後に客観的な合否判定ができる状態にする。

---

## 実行タスク

- **タスク1**: ローカルカバレッジ生成テスト仕様の策定（`VITEST_SHARDED_COVERAGE=true` + `--coverage` + シャード実行）
- **タスク2**: カバレッジなし実行テスト仕様の策定（PR 相当・`--coverage` なし）
- **タスク3**: `apps/backend/coverage/` へのカバレッジレポート生成確認仕様の策定
- **タスク4**: `desktop` フラグの既存アップロードが回帰しないことの確認仕様の策定
- **タスク5**: validation matrix（Case 1〜6）の策定

---

## 参照資料

| 資料名                    | パス                                      | 説明                                         |
| ------------------------- | ----------------------------------------- | -------------------------------------------- |
| Phase 3 レビュー結果      | `outputs/phase-3/design-review-result.md` | PASS 判定確認                                |
| Phase 2 設計決定記録      | `outputs/phase-2/design-decisions.md`     | 実装設計の参照                               |
| Phase 2 validation matrix | `outputs/phase-2/validation-matrix.md`    | Case A〜C との対応確認                       |
| Phase 1 受入基準          | `outputs/phase-1/acceptance-criteria.md`  | AC-1〜AC-5 との照合                          |
| CI ワークフロー           | `.github/workflows/ci.yml`                | `test-web` / `coverage` ジョブの変更前後確認 |
| backend vitest 設定       | `apps/backend/vitest.config.ts`           | カバレッジ設定の実装確認対象                 |
| desktop vitest 設定       | `apps/desktop/vitest.config.ts`           | 既存カバレッジ動作の回帰確認参照             |
| MINOR 追跡テーブル        | `outputs/phase-3/minor-tracking.md`       | Phase 3 成果物                               |

## 統合テスト連携

- Phase 1 の AC-1〜AC-5 と current-state、Phase 2 の design-decisions、Phase 3 の review result を合わせて `outputs/phase-4/verification-plan.md` の Case 1〜6 に落とし込む。
- `outputs/phase-2/validation-matrix.md` と `outputs/phase-3/minor-tracking.md` を使い、PR 相当・main push 相当・回帰確認の観点を分離する。
- `outputs/phase-4/verification-plan.md` と `outputs/phase-4/rollback-criteria.md` は Phase 5 の実装直後検証の入力になる。
- Phase 5 へ渡す前提として、`apps/backend/coverage/` の生成確認方法と `desktop` フラグ回帰確認まで明文化する。

---

## 実行手順

### ステップ0: Phase 4 事前確認【必須】

```bash
# 1. 現在の apps/backend/vitest.config.ts のカバレッジ設定確認
grep -n "coverage\|VITEST_SHARDED_COVERAGE" apps/backend/vitest.config.ts || echo "coverage設定なし"

# 2. 現在の test-web ジョブの実行コマンド確認（実装前のベースライン）
grep -n -A 20 "^  test-web:" .github/workflows/ci.yml

# 3. 現在の coverage ジョブの Codecov flags 確認
grep -n -A 15 "codecov/codecov-action" .github/workflows/ci.yml

# 4. apps/backend/coverage/ ディレクトリの存在確認
ls apps/backend/coverage 2>/dev/null || echo "coverage ディレクトリ未生成（正常）"

# 5. desktop カバレッジの既存動作確認（回帰テストのベースライン）
grep -n "desktop-coverage\|flags.*desktop" .github/workflows/ci.yml
```

---

### ステップ1: ローカルカバレッジ生成テスト仕様

main push 相当の環境でカバレッジが正しく生成されることをローカルで検証する手順を定義する。

**テスト仕様 1-A: シャード 1/2 でのカバレッジ生成**

```bash
# VITEST_SHARDED_COVERAGE=true を設定して shard=1/2 でカバレッジ付き実行
VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run \
  --shard=1/2 \
  --coverage

# 期待結果: apps/backend/coverage/ に json・lcov ファイルが生成される
ls -la apps/backend/coverage/
```

**テスト仕様 1-B: シャード 2/2 でのカバレッジ生成**

```bash
# VITEST_SHARDED_COVERAGE=true を設定して shard=2/2 でカバレッジ付き実行
VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run \
  --shard=2/2 \
  --coverage

# 期待結果: apps/backend/coverage/ に json・lcov ファイルが生成される
ls -la apps/backend/coverage/
```

**確認観点**:

| 観点                                   | 確認方法                                     | 期待動作                                           |
| -------------------------------------- | -------------------------------------------- | -------------------------------------------------- |
| カバレッジファイルが生成される         | `ls apps/backend/coverage/`                  | `coverage-final.json` / `lcov.info` が存在する     |
| シャード分割後もカバレッジが出力される | shard=1/2 と 2/2 の両方で `coverage/` を確認 | 各シャードで独立したカバレッジファイルが生成される |
| vitest exit code が 0 である           | `echo $?` でコード確認                       | テスト PASS かつ 0 で終了する                      |

---

### ステップ2: カバレッジなし実行テスト仕様（PR 相当）

PR 時のカバレッジ収集なし実行で、実行時間が増加しないことを検証する手順を定義する。

**テスト仕様 2-A: VITEST_SHARDED_COVERAGE 未設定での実行**

```bash
# VITEST_SHARDED_COVERAGE を設定せずに実行（PR 相当）
pnpm --filter @repo/backend exec vitest run \
  --shard=1/2

# 期待結果: apps/backend/coverage/ が生成されない（または空）
ls apps/backend/coverage 2>/dev/null && echo "FAIL: coverage が生成された" || echo "OK: coverage が生成されていない"
```

**テスト仕様 2-B: `--coverage` オプションなしでの実行時間計測**

```bash
# 実行時間計測（カバレッジなし）
time pnpm --filter @repo/backend exec vitest run --shard=1/2

# 比較: カバレッジあり実行時間計測
time VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run \
  --shard=1/2 \
  --coverage
```

**確認観点**:

| 観点                                                         | 確認方法                                 | 期待動作                                          |
| ------------------------------------------------------------ | ---------------------------------------- | ------------------------------------------------- |
| `VITEST_SHARDED_COVERAGE` 未設定時はカバレッジが生成されない | `ls apps/backend/coverage/` で不在を確認 | `coverage/` が空またはディレクトリが存在しない    |
| PR 相当実行でのオーバーヘッドがない                          | `time` コマンドで実行時間比較            | カバレッジなし実行時間がベースラインと同等（±5%） |

---

### ステップ3: `apps/backend/coverage/` カバレッジレポート生成確認仕様

カバレッジレポートの内容と形式が Codecov アップロードに適合することを確認する手順を定義する。

**テスト仕様 3-A: 生成ファイルの形式確認**

```bash
# カバレッジ生成後のファイル一覧確認
VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run \
  --shard=1/2 \
  --coverage

# 生成ファイルの確認
find apps/backend/coverage -type f | sort

# json ファイルの内容確認（Codecov が読める形式か）
head -c 200 apps/backend/coverage/coverage-final.json 2>/dev/null || echo "coverage-final.json が見つからない"

# lcov.info の確認
head -20 apps/backend/coverage/lcov.info 2>/dev/null || echo "lcov.info が見つからない"
```

**確認観点**:

| 観点                                     | 確認方法                                         | 期待動作                         |
| ---------------------------------------- | ------------------------------------------------ | -------------------------------- |
| `coverage-final.json` が生成される       | `ls apps/backend/coverage/`                      | `coverage-final.json` が存在する |
| `lcov.info` が生成される                 | `ls apps/backend/coverage/`                      | `lcov.info` が存在する           |
| JSON が有効な Codecov フォーマットである | `jq . apps/backend/coverage/coverage-final.json` | パースエラーなし                 |

---

### ステップ4: `desktop` フラグ既存アップロードの回帰確認仕様

`coverage` ジョブへの `backend` 対応追加後も、`desktop` フラグのアップロードが回帰しないことを確認する手順を定義する。

**テスト仕様 4-A: CI ログでの `desktop` フラグ確認**

```bash
# 実装後の最初の main push CI 実行 ID を取得
LATEST_RUN=$(gh run list --workflow=ci.yml --branch main --limit=1 --json databaseId --jq '.[0].databaseId')

# coverage ジョブのログを確認（desktop フラグのアップロードが成功しているか）
gh run view "$LATEST_RUN" --log | grep -A 5 "flags.*desktop\|Upload desktop coverage"

# coverage ジョブのログを確認（backend フラグのアップロードが成功しているか）
gh run view "$LATEST_RUN" --log | grep -A 5 "flags.*backend\|Upload backend coverage"

# coverage ジョブ全体の conclusion を確認
gh run view "$LATEST_RUN" --json jobs \
  --jq '.jobs[] | select(.name == "coverage") | {name: .name, conclusion: .conclusion}'
```

**確認観点**:

| 観点                                              | 確認方法                                | 期待動作                                      |
| ------------------------------------------------- | --------------------------------------- | --------------------------------------------- |
| `desktop` フラグアップロードが成功している        | CI ログの `flags: desktop` ステップ確認 | `conclusion: success`                         |
| `backend` フラグアップロードが成功している        | CI ログの `flags: backend` ステップ確認 | `conclusion: success`                         |
| `coverage` ジョブ全体が success である            | `gh run view` でジョブ結果確認          | `conclusion: success`                         |
| `desktop-coverage-*` アーティファクトが維持される | `gh run view` でアーティファクト確認    | `desktop-coverage-{shard}` が全シャード分存在 |

---

## validation matrix（Case 1〜6）

| Case | 実行条件               | `VITEST_SHARDED_COVERAGE` | `--coverage` | アーティファクト                      | Codecov アップロード           | 期待結果     |
| ---- | ---------------------- | ------------------------- | ------------ | ------------------------------------- | ------------------------------ | ------------ |
| 1    | PR（ローカル相当）     | 未設定                    | なし         | 生成なし                              | なし                           | PASS（高速） |
| 2    | main push（shard=1/N） | `true`                    | 付与         | `backend-coverage-1` アップロード     | -                              | PASS         |
| 3    | main push（shard=2/N） | `true`                    | 付与         | `backend-coverage-2` アップロード     | -                              | PASS         |
| 4    | coverage ジョブ実行    | -                         | -            | `backend-coverage-*` ダウンロード済み | `backend` フラグでアップロード | PASS         |
| 5    | coverage ジョブ実行    | -                         | -            | `desktop-coverage-*` ダウンロード済み | `desktop` フラグ（回帰なし）   | PASS         |
| 6    | coverage ジョブ全体    | -                         | -            | desktop + backend 両方存在            | 両フラグがアップロード済み     | PASS         |

---

## サブタスク管理

| ID     | タスク名                                      | ステータス |
| ------ | --------------------------------------------- | ---------- |
| T-04-1 | 事前確認（現行設定の把握）                    | 未実施     |
| T-04-2 | ローカルカバレッジ生成テスト仕様の策定        | 未実施     |
| T-04-3 | カバレッジなし実行テスト仕様の策定（PR 相当） | 未実施     |
| T-04-4 | `apps/backend/coverage/` 生成確認仕様の策定   | 未実施     |
| T-04-5 | `desktop` フラグ回帰確認仕様の策定            | 未実施     |

---

## 成果物

| 成果物           | 配置先                                 | 形式     |
| ---------------- | -------------------------------------- | -------- |
| 検証計画書       | `outputs/phase-4/verification-plan.md` | Markdown |
| ロールバック基準 | `outputs/phase-4/rollback-criteria.md` | Markdown |

---

## 完了条件

- [ ] Phase 4 事前確認（現行設定の grep 確認）が実行済みであること
- [ ] ローカルカバレッジ生成テスト仕様（`VITEST_SHARDED_COVERAGE=true` + `--coverage` + シャード実行）が記録されていること
- [ ] カバレッジなし実行テスト仕様（PR 相当・`--coverage` なし）が記録されていること
- [ ] `apps/backend/coverage/` へのカバレッジレポート生成確認仕様が記録されていること
- [ ] `desktop` フラグ既存アップロードの回帰確認仕様が記録されていること
- [ ] validation matrix（Case 1〜6）が `outputs/phase-4/verification-plan.md` に記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-04-1: 事前確認（`apps/backend/vitest.config.ts` / `ci.yml` の現行設定確認）を実行済み
- [ ] T-04-2: ローカルカバレッジ生成テスト仕様（Case 2・3 相当）を `outputs/phase-4/verification-plan.md` に記録済み
- [ ] T-04-3: カバレッジなし実行テスト仕様（Case 1 相当）を `outputs/phase-4/verification-plan.md` に記録済み
- [ ] T-04-4: `apps/backend/coverage/` 生成確認仕様（json / lcov 形式確認）を記録済み
- [ ] T-04-5: `desktop` フラグ回帰確認仕様（Case 5・6 相当）を `outputs/phase-4/verification-plan.md` に記録済み

---

## 次Phase

**Phase 5: 実装** — `.github/workflows/ci.yml` への `test-web` 条件分岐・アーティファクトアップロード追加、`coverage` ジョブへの `backend` 対応、および必要な場合の `apps/backend/vitest.config.ts` カバレッジ設定追加を実装する。

**Phase 5 開始条件**: Phase 4 の全完了条件を満たし、validation matrix（Case 1〜6）が記録済みであること。
