# Phase 6: テスト拡張

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 6                                         |
| 機能名 | task-ci-future-007-backend-codecov-upload |
| 作成日 | 2026-04-16                                |

## 目的

Phase 5 の実装後のテスト網羅性を確認し、不足テストを補完する。
シャード 1・2 のカバレッジ付き実行確認・PR 相当のカバレッジなし実行確認・
カバレッジレポートファイルの存在確認・`desktop` フラグの回帰確認の 4 観点でテストを網羅する。

---

## 実行タスク

- **タスク1**: シャード 1・2 のカバレッジ付き実行確認（main push 相当）
- **タスク2**: PR 相当のカバレッジなし実行確認（`github.event_name == 'pull_request'` の動作確認）
- **タスク3**: カバレッジレポートファイルの存在確認（`coverage-final.json` または `lcov.info`）
- **タスク4**: `desktop` フラグの回帰確認（既存の `test-desktop` カバレッジ収集が壊れていないこと）

---

## 参照資料

| 資料名                   | パス                                              | 説明                                 |
| ------------------------ | ------------------------------------------------- | ------------------------------------ |
| Phase 5 GREEN 確認結果   | `outputs/phase-5/green-confirmation.md`           | Phase 5 完了状態確認                 |
| CI ワークフロー          | `.github/workflows/ci.yml`                        | 条件分岐・アーティファクト設定の確認 |
| vitest 設定              | `apps/backend/vitest.config.ts`                   | カバレッジ設定の確認                 |
| 実装結果                 | `outputs/phase-5/implementation-result.md`        | Phase 5 成果物                       |
| desktop カバレッジ実装例 | `.github/workflows/ci.yml`（test-desktop ジョブ） | 回帰確認の比較対象                   |

---

## 実行手順

### ステップ0: Phase 6 事前確認【必須】

```bash
# Phase 5 が完了していることを確認
ls outputs/phase-5/green-confirmation.md

# test-web ジョブの条件分岐設定を再確認
grep -n "pull_request\|VITEST_SHARDED_COVERAGE\|--coverage\|backend-coverage" .github/workflows/ci.yml

# coverage ジョブの backend 対応を再確認
grep -n "flags: backend\|backend-coverage\|test-web" .github/workflows/ci.yml
```

### ステップ1: シャード 1・2 のカバレッジ付き実行確認

main push 相当の条件でシャード 1・2 それぞれのカバレッジ付き実行を確認する。

**確認観点**:

| 観点                            | 検証方法                                                              | 期待動作                                        |
| ------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| シャード 1 のカバレッジ付き実行 | `VITEST_SHARDED_COVERAGE=true pnpm vitest run --shard=1/2 --coverage` | テストが PASS しカバレッジファイルが生成される  |
| シャード 2 のカバレッジ付き実行 | `VITEST_SHARDED_COVERAGE=true pnpm vitest run --shard=2/2 --coverage` | テストが PASS しカバレッジファイルが生成される  |
| カバレッジファイルの生成        | `ls apps/backend/coverage/`                                           | `coverage-final.json` または `lcov.info` が存在 |

**確認コマンド**:

```bash
# シャード 1 のカバレッジ付き実行
cd apps/backend
VITEST_SHARDED_COVERAGE=true pnpm vitest run --shard=1/2 --coverage
echo "シャード 1 終了: $?"

# カバレッジファイルの確認
ls -la coverage/

# シャード 2 のカバレッジ付き実行
VITEST_SHARDED_COVERAGE=true pnpm vitest run --shard=2/2 --coverage
echo "シャード 2 終了: $?"

# カバレッジファイルの確認
ls -la coverage/
```

**判断基準**:

- 両シャードのテストが PASS すること
- 各シャード実行後にカバレッジファイルが `apps/backend/coverage/` に生成されること

### ステップ2: PR 相当のカバレッジなし実行確認

PR 時の条件（`github.event_name == 'pull_request'`）でカバレッジなし実行となることを確認する。
ローカルでは環境変数を使わずに実行することで PR 相当の動作を検証する。

**確認コマンド**:

```bash
# PR 相当: VITEST_SHARDED_COVERAGE なし・--coverage なし
cd apps/backend
pnpm vitest run --shard=1/2

# カバレッジファイルが生成されていないことを確認
ls apps/backend/coverage/ 2>/dev/null && echo "ERROR: カバレッジファイルが生成されてしまっている" || echo "OK: カバレッジファイルなし（期待動作）"
```

**期待結果**: カバレッジなし実行でテストが PASS し、`coverage/` ディレクトリが生成されないこと。

### ステップ3: カバレッジレポートファイルの存在確認

カバレッジ付き実行後に Codecov へのアップロードに必要なファイルが生成されることを確認する。

**確認コマンド**:

```bash
# カバレッジ付き実行後のファイル確認
cd apps/backend
VITEST_SHARDED_COVERAGE=true pnpm vitest run --shard=1/2 --coverage

# lcov.info の存在確認
ls -la coverage/lcov.info && echo "OK: lcov.info が存在する" || echo "WARNING: lcov.info が存在しない"

# coverage-final.json の存在確認
ls -la coverage/coverage-final.json && echo "OK: coverage-final.json が存在する" || echo "WARNING: coverage-final.json が存在しない"

# カバレッジディレクトリの全ファイル確認
find coverage/ -type f | sort
```

**期待結果**: `lcov.info` および `coverage-final.json` の少なくとも一方が存在すること。

### ステップ4: `desktop` フラグの回帰確認

既存の `test-desktop` ジョブのカバレッジ収集設定が、今回の変更によって壊れていないことを確認する。

**確認コマンド**:

```bash
# test-desktop ジョブのカバレッジ関連設定を確認
grep -n -A50 "test-desktop:" .github/workflows/ci.yml | grep -E "coverage|VITEST_SHARDED|artifact|flags: desktop" | head -20

# coverage ジョブの desktop 関連設定を確認
grep -n "flags: desktop\|desktop-coverage" .github/workflows/ci.yml

# coverage ジョブの needs に test-desktop が含まれているか確認
grep -n -A10 "^\s\{2\}coverage:" .github/workflows/ci.yml | grep "needs\|test-desktop"
```

**判断基準**:

- `test-desktop` ジョブの条件分岐・アーティファクト名・カバレッジ設定が変更前と同一であること
- `coverage` ジョブに `flags: desktop` 付きの codecov-action ステップが残存していること
- `coverage` ジョブの `needs` に `test-desktop` が維持されていること

---

## 統合テスト連携

- ステップ1〜4 の確認結果を `outputs/phase-6/test-expansion-result.md` にまとめる
- 異常が検出された場合は Phase 5 に戻り実装を修正する
- Phase 7 でのカバレッジファイル詳細確認前に、テスト実行の正常動作を確認する

---

## サブタスク管理

| ID     | タスク名                               | ステータス |
| ------ | -------------------------------------- | ---------- |
| T-06-1 | シャード 1・2 のカバレッジ付き実行確認 | 未実施     |
| T-06-2 | PR 相当のカバレッジなし実行確認        | 未実施     |
| T-06-3 | カバレッジレポートファイルの存在確認   | 未実施     |
| T-06-4 | `desktop` フラグの回帰確認             | 未実施     |

---

## 成果物

| 成果物             | 配置先                                     | 形式     |
| ------------------ | ------------------------------------------ | -------- |
| テスト拡張確認結果 | `outputs/phase-6/test-expansion-result.md` | Markdown |

---

## 完了条件

- [ ] シャード 1・2 それぞれのカバレッジ付き実行が PASS し、カバレッジファイルが生成されていること
- [ ] PR 相当のカバレッジなし実行でテストが PASS し、カバレッジファイルが生成されないことが確認済みであること
- [ ] `lcov.info` または `coverage-final.json` の存在が確認済みであること
- [ ] `test-desktop` ジョブのカバレッジ収集設定が回帰していないことが確認済みであること
- [ ] 4 観点全ての確認結果が `outputs/phase-6/test-expansion-result.md` に記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-06-1: シャード 1・2 のカバレッジ付き実行を実施し `outputs/phase-6/test-expansion-result.md` に記録済み
- [ ] T-06-2: PR 相当のカバレッジなし実行を実施し結果を記録済み
- [ ] T-06-3: カバレッジレポートファイルの存在を確認し結果を記録済み
- [ ] T-06-4: `desktop` フラグの回帰確認を実施し問題なしを記録済み

---

## 次Phase

**Phase 7: カバレッジチェック** — カバレッジデータが正しく生成されることを確認し、シャード間での重複なし生成・`VITEST_SHARDED_COVERAGE=true` の動作を詳細確認する。

**Phase 7 開始条件**: Phase 6 の全完了条件を満たし、4 観点のテストが全て PASS であること（`outputs/phase-6/test-expansion-result.md` に記録済み）。
