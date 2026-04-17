# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 9                                         |
| 機能名 | task-ci-future-007-backend-codecov-upload |
| 作成日 | 2026-04-16                                |

## 目的

受入基準 AC-1〜AC-5 の全項目を照合し、品質を確認する。
`ci.yml` の条件分岐・カバレッジ付き実行フラグ・アーティファクト名・codecov-action の flags・
PR 時のスキップ動作を機械的に検証し、全 AC が充足されていることを確認する。

---

## 実行タスク

- **タスク1**: AC-1〜AC-5 の受入基準照合（`ci.yml` の grep による機械的確認）

---

## 参照資料

| 資料名                         | パス                                       | 説明                 |
| ------------------------------ | ------------------------------------------ | -------------------- |
| Phase 8 リファクタ結果         | `outputs/phase-8/refactoring-result.md`    | Phase 8 完了状態確認 |
| CI ワークフロー                | `.github/workflows/ci.yml`                 | 品質チェック対象     |
| vitest 設定                    | `apps/backend/vitest.config.ts`            | カバレッジ設定の確認 |
| Phase 5 実装結果               | `outputs/phase-5/implementation-result.md` | 実装内容の参照       |
| Phase 7 カバレッジチェック結果 | `outputs/phase-7/coverage-check-result.md` | カバレッジ動作の確認 |

---

## 実行手順

### ステップ0: Phase 9 事前確認【必須】

```bash
# Phase 8 が完了していることを確認
ls outputs/phase-8/refactoring-result.md

# ci.yml の存在確認
ls -la .github/workflows/ci.yml
```

### ステップ1: AC-1 の確認

**AC-1**: `ci.yml` に `github.event_name == 'pull_request'` による条件分岐が存在すること。

```bash
# PR 条件分岐の存在確認
grep -n "github.event_name.*pull_request\|pull_request.*github.event_name" .github/workflows/ci.yml
```

**期待結果**: `github.event_name == 'pull_request'`（または `!= 'pull_request'`）を含む行が存在すること。

**判定基準**:

| 状態                       | 判定 |
| -------------------------- | ---- |
| 条件分岐の記述が存在する   | PASS |
| 条件分岐の記述が存在しない | FAIL |

### ステップ2: AC-2 の確認

**AC-2**: `VITEST_SHARDED_COVERAGE=true` かつ `--coverage` が main push 時に付与されること。

```bash
# VITEST_SHARDED_COVERAGE 環境変数の存在確認
grep -n "VITEST_SHARDED_COVERAGE" .github/workflows/ci.yml

# --coverage フラグの存在確認
grep -n "\-\-coverage" .github/workflows/ci.yml

# 両方が同じジョブ（test-web）に存在することを確認
grep -n -B5 "VITEST_SHARDED_COVERAGE\|--coverage" .github/workflows/ci.yml | grep -E "test-web|VITEST_SHARDED|--coverage"
```

**期待結果**: `VITEST_SHARDED_COVERAGE=true` と `--coverage` が `test-web` ジョブの main push 時の実行ステップに存在すること。

**判定基準**:

| 状態                                               | 判定 |
| -------------------------------------------------- | ---- |
| 両方が存在し main push 時の条件分岐内にある        | PASS |
| どちらか一方が欠けている                           | FAIL |
| 両方が存在するが条件分岐なしで常時実行になっている | FAIL |

### ステップ3: AC-3 の確認

**AC-3**: `backend-coverage-${{ matrix.shard }}` アーティファクトのアップロードステップが存在すること。

```bash
# アーティファクト名の確認
grep -n "backend-coverage" .github/workflows/ci.yml

# upload-artifact ステップの存在確認
grep -n -B2 -A5 "backend-coverage" .github/workflows/ci.yml | head -30
```

**期待結果**: `name: backend-coverage-${{ matrix.shard }}` を含む `actions/upload-artifact` ステップが `test-web` ジョブに存在すること。

**判定基準**:

| 状態                                              | 判定 |
| ------------------------------------------------- | ---- |
| `backend-coverage-${{ matrix.shard }}` が存在する | PASS |
| アーティファクト名が異なる                        | FAIL |
| ステップ自体が存在しない                          | FAIL |

### ステップ4: AC-4 の確認

**AC-4**: `coverage` ジョブに `flags: backend` 付きの `codecov/codecov-action@v5` ステップが存在すること。

```bash
# flags: backend の存在確認
grep -n "flags: backend" .github/workflows/ci.yml

# codecov-action のバージョン確認
grep -n "codecov/codecov-action" .github/workflows/ci.yml

# coverage ジョブ内での backend フラグ付きステップを確認
grep -n -B10 "flags: backend" .github/workflows/ci.yml | head -20
```

**期待結果**: `coverage` ジョブに `codecov/codecov-action@v5` かつ `flags: backend` を含むステップが存在すること。

**判定基準**:

| 状態                                              | 判定  |
| ------------------------------------------------- | ----- |
| `flags: backend` 付きの codecov-action が存在する | PASS  |
| `flags: backend` が存在しない                     | FAIL  |
| codecov-action のバージョンが v5 でない           | MINOR |

### ステップ5: AC-5 の確認

**AC-5**: PR 時の分岐でカバレッジなし実行になっていること。

```bash
# PR 時の実行ステップを確認（--coverage が付いていないこと）
grep -n -A10 "event_name == 'pull_request'" .github/workflows/ci.yml | head -30

# PR 時のステップに --coverage が含まれていないことを確認
grep -n -A10 "event_name == 'pull_request'" .github/workflows/ci.yml | grep -- "--coverage" && echo "FAIL: PR 時に --coverage が付与されている" || echo "OK: PR 時は --coverage なし"
```

**期待結果**: `github.event_name == 'pull_request'` の条件ステップに `--coverage` が含まれていないこと。

**判定基準**:

| 状態                                            | 判定 |
| ----------------------------------------------- | ---- |
| PR 時の実行ステップに `--coverage` が含まれない | PASS |
| PR 時の実行ステップに `--coverage` が含まれる   | FAIL |

### ステップ6: 確認コマンドまとめ（一括実行）

```bash
echo "=== AC-1: PR 条件分岐の確認 ==="
grep -n "github.event_name.*pull_request\|pull_request.*github.event_name" .github/workflows/ci.yml

echo ""
echo "=== AC-2: VITEST_SHARDED_COVERAGE と --coverage の確認 ==="
grep -n "VITEST_SHARDED_COVERAGE\|--coverage" .github/workflows/ci.yml

echo ""
echo "=== AC-3: backend-coverage アーティファクトの確認 ==="
grep -n "backend-coverage" .github/workflows/ci.yml

echo ""
echo "=== AC-4: flags: backend 付き codecov-action の確認 ==="
grep -n "flags: backend\|codecov/codecov-action" .github/workflows/ci.yml

echo ""
echo "=== AC-5: PR 時のカバレッジなし確認 ==="
grep -n "backend\|VITEST_SHARDED_COVERAGE\|--coverage" .github/workflows/ci.yml
```

---

## AC 照合テーブル

確認結果を以下のテーブルに記録し `outputs/phase-9/quality-check-result.md` に保存する。

| 受入基準 | 内容                                                                         | 確認コマンド                                                             | 判定 |
| -------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---- |
| AC-1     | PR 条件分岐が存在する                                                        | `grep -n "github.event_name.*pull_request" .github/workflows/ci.yml`     | TBD  |
| AC-2     | `VITEST_SHARDED_COVERAGE=true` かつ `--coverage` が main push 時に付与される | `grep -n "VITEST_SHARDED_COVERAGE\|--coverage" .github/workflows/ci.yml` | TBD  |
| AC-3     | `backend-coverage-${{ matrix.shard }}` アーティファクトが存在する            | `grep -n "backend-coverage" .github/workflows/ci.yml`                    | TBD  |
| AC-4     | `flags: backend` 付きの `codecov/codecov-action@v5` が存在する               | `grep -n "flags: backend" .github/workflows/ci.yml`                      | TBD  |
| AC-5     | PR 時の分岐でカバレッジなし実行になっている                                  | `grep -n -A10 "event_name == 'pull_request'" .github/workflows/ci.yml`   | TBD  |

---

## 統合テスト連携

- AC-1〜AC-5 の全項目が PASS であることが Phase 10 への前提条件
- 品質保証の全チェック結果を `outputs/phase-9/quality-check-result.md` に記録する

---

## サブタスク管理

| ID     | タスク名                          | ステータス |
| ------ | --------------------------------- | ---------- |
| T-09-1 | AC-1 の確認（PR 条件分岐）        | 未実施     |
| T-09-2 | AC-2 の確認（カバレッジフラグ）   | 未実施     |
| T-09-3 | AC-3 の確認（アーティファクト名） | 未実施     |
| T-09-4 | AC-4 の確認（codecov flags）      | 未実施     |
| T-09-5 | AC-5 の確認（PR 時スキップ）      | 未実施     |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | Markdown |

---

## 完了条件

- [ ] AC-1: `ci.yml` に `github.event_name == 'pull_request'` 条件分岐が存在すること（PASS）
- [ ] AC-2: `VITEST_SHARDED_COVERAGE=true` かつ `--coverage` が main push 時に付与されること（PASS）
- [ ] AC-3: `backend-coverage-${{ matrix.shard }}` アーティファクトのアップロードステップが存在すること（PASS）
- [ ] AC-4: `coverage` ジョブに `flags: backend` 付きの `codecov/codecov-action@v5` ステップが存在すること（PASS）
- [ ] AC-5: PR 時の分岐でカバレッジなし実行になっていること（PASS）
- [ ] AC-1〜AC-5 の全照合結果が `outputs/phase-9/quality-check-result.md` に記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-09-1: AC-1 確認コマンドを実行し結果を記録済み（PASS）
- [ ] T-09-2: AC-2 確認コマンドを実行し結果を記録済み（PASS）
- [ ] T-09-3: AC-3 確認コマンドを実行し結果を記録済み（PASS）
- [ ] T-09-4: AC-4 確認コマンドを実行し結果を記録済み（PASS）
- [ ] T-09-5: AC-5 確認コマンドを実行し結果を記録済み（PASS）

---

## 次Phase

**Phase 10: 最終レビューゲート** — AC-1〜AC-5 との完全照合・PASS/MINOR/MAJOR 判定を行い、Phase 11 への進行可否を確定する。

**Phase 10 開始条件**: Phase 9 の全完了条件を満たし、AC-1〜AC-5 が全て PASS であること（`outputs/phase-9/quality-check-result.md` に記録済み）。
