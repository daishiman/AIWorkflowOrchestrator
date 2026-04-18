# Phase 7: カバレッジチェック

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 7                                         |
| 機能名 | task-ci-future-007-backend-codecov-upload |
| 作成日 | 2026-04-16                                |

## 目的

`apps/backend/coverage/` の内容確認・シャード間でカバレッジが重複なく生成されることの確認・
`VITEST_SHARDED_COVERAGE=true` の動作確認の 3 観点でカバレッジデータの品質を検証する。
`coverage` ジョブは backend 側で `merge-multiple` を使わず、`coverage/backend` 配下にアーティファクトを分離して Codecov に渡す。

---

## 実行タスク

- **タスク1**: `apps/backend/coverage/` の内容確認（`coverage-final.json` または `lcov.info` の存在）
- **タスク2**: シャード間でカバレッジが重複なく生成されることの確認
- **タスク3**: `VITEST_SHARDED_COVERAGE=true` の動作確認

---

## 参照資料

| 資料名                     | パス                                       | 説明                                  |
| -------------------------- | ------------------------------------------ | ------------------------------------- |
| Phase 6 テスト拡張確認結果 | `outputs/phase-6/test-expansion-result.md` | Phase 6 完了状態確認                  |
| vitest 設定                | `apps/backend/vitest.config.ts`            | カバレッジ設定（provider / reporter） |
| CI ワークフロー            | `.github/workflows/ci.yml`                 | backend artifact / Codecov 設定の確認 |
| Codecov 設定               | `codecov.yml`                              | `backend` flag 定義確認               |
| Phase 5 実装結果           | `outputs/phase-5/implementation-result.md` | 実装内容の参照                        |

---

## 実行手順

### ステップ0: Phase 7 事前確認【必須】

```bash
# Phase 6 が完了していることを確認
ls outputs/phase-6/test-expansion-result.md

# vitest.config.ts のカバレッジ設定を再確認
grep -n "coverage\|provider\|reporter\|reportsDirectory\|enabled" apps/backend/vitest.config.ts

# backend flag の存在を確認
grep -n "backend:" codecov.yml

# backend artifact の設定を確認
grep -n "backend-coverage\|upload-artifact\|flags: backend\|coverage/backend" .github/workflows/ci.yml
```

### ステップ1: `apps/backend/coverage/` の内容確認

カバレッジ付き実行後に Codecov が要求するファイルが生成されていることを確認する。

**確認コマンド**:

```bash
# カバレッジディレクトリをクリーンにしてから実行
rm -rf apps/backend/coverage/

# カバレッジ付き実行
cd apps/backend
VITEST_SHARDED_COVERAGE=true pnpm vitest run --shard=1/2 --coverage

# カバレッジディレクトリの全ファイルを確認
echo "=== coverage/ の内容 ==="
find apps/backend/coverage/ -type f | sort

# coverage-final.json の確認
ls -lh apps/backend/coverage/coverage-final.json 2>/dev/null && echo "OK: coverage-final.json が存在する" || echo "INFO: coverage-final.json なし"

# lcov.info の確認
ls -lh apps/backend/coverage/lcov.info 2>/dev/null && echo "OK: lcov.info が存在する" || echo "WARNING: lcov.info なし"
```

### ステップ2: シャード間でカバレッジが重複なく生成されることの確認

シャード 1 とシャード 2 それぞれのカバレッジデータが独立して生成され、
`coverage/backend` に個別保持される前提で重複なく Codecov に渡せることを確認する。

**確認コマンド**:

```bash
# シャード 1 のカバレッジ生成
rm -rf apps/backend/coverage/
cd apps/backend
VITEST_SHARDED_COVERAGE=true pnpm vitest run --shard=1/2 --coverage
cp -r coverage/ coverage-shard1/
echo "シャード 1 カバレッジファイル数: $(find coverage-shard1/ -type f | wc -l)"

# シャード 2 のカバレッジ生成
rm -rf coverage/
VITEST_SHARDED_COVERAGE=true pnpm vitest run --shard=2/2 --coverage
cp -r coverage/ coverage-shard2/
echo "シャード 2 カバレッジファイル数: $(find coverage-shard2/ -type f | wc -l)"

# 生成ファイルのサイズ確認
echo "=== シャード 1 coverage-final.json サイズ ==="
wc -c coverage-shard1/coverage-final.json 2>/dev/null || echo "ファイルなし"

echo "=== シャード 2 coverage-final.json サイズ ==="
wc -c coverage-shard2/coverage-final.json 2>/dev/null || echo "ファイルなし"

# クリーンアップ
rm -rf coverage-shard1/ coverage-shard2/
```

### ステップ3: `VITEST_SHARDED_COVERAGE=true` の動作確認

`VITEST_SHARDED_COVERAGE=true` を設定した場合と設定しない場合で、
カバレッジファイルの出力先や内容が想定どおり制御されていることを確認する。

**確認コマンド**:

```bash
# VITEST_SHARDED_COVERAGE=true ありの場合
rm -rf apps/backend/coverage/
cd apps/backend
VITEST_SHARDED_COVERAGE=true pnpm vitest run --shard=1/2 --coverage
echo "VITEST_SHARDED_COVERAGE=true の場合のカバレッジファイル:"
find coverage/ -type f | sort

# VITEST_SHARDED_COVERAGE なしの場合（main push 以外）
rm -rf coverage/
pnpm vitest run --shard=1/2
echo "VITEST_SHARDED_COVERAGE なしの場合のカバレッジファイル:"
find coverage/ -type f 2>/dev/null | sort || echo "coverage/ ディレクトリなし（期待動作）"
```

---

## 統合テスト連携

- ステップ1〜3 の確認結果を `outputs/phase-7/coverage-check-result.md` にまとめる
- カバレッジファイルが正しく生成されない場合は `apps/backend/vitest.config.ts` の設定を見直す
- Phase 8 のリファクタリングへ進む前に、カバレッジデータの品質が確認済みであることを確認する

---

## サブタスク管理

| ID     | タスク名                                  | ステータス |
| ------ | ----------------------------------------- | ---------- |
| T-07-1 | `apps/backend/coverage/` の内容確認       | 完了       |
| T-07-2 | シャード間のカバレッジ重複なし生成確認    | 完了       |
| T-07-3 | `VITEST_SHARDED_COVERAGE=true` の動作確認 | 完了       |

---

## 成果物

| 成果物                     | 配置先                                     | 形式     |
| -------------------------- | ------------------------------------------ | -------- |
| カバレッジチェック確認結果 | `outputs/phase-7/coverage-check-result.md` | Markdown |

---

## 完了条件

- [ ] `apps/backend/coverage/` に `coverage-final.json` または `lcov.info` が生成されていること
- [ ] シャード 1・2 それぞれのカバレッジファイルが空でないことが確認済みであること
- [ ] `VITEST_SHARDED_COVERAGE=true` かつ `--coverage` 時のみカバレッジファイルが生成されることが確認済みであること
- [ ] 3 観点全ての確認結果が `outputs/phase-7/coverage-check-result.md` に記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-07-1: `apps/backend/coverage/` の内容確認を実施し `outputs/phase-7/coverage-check-result.md` に記録済み
- [ ] T-07-2: シャード間のカバレッジ重複なし生成確認を実施し結果を記録済み
- [ ] T-07-3: `VITEST_SHARDED_COVERAGE=true` の動作確認を実施し結果を記録済み

---

## 次Phase

**Phase 8: リファクタリング** — 実装コードの品質向上（コメント追加・命名整理・`desktop` との一貫性確保）を行う。

**Phase 8 開始条件**: Phase 7 の全完了条件を満たし、カバレッジデータが正しく生成されることが確認済みであること（`outputs/phase-7/coverage-check-result.md` に記録済み）。
