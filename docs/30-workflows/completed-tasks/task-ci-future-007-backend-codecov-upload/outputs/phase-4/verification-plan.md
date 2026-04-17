# Phase 4: 検証計画書 (verification-plan)

## 作成日

2026-04-16

---

## Validation Matrix（Case 1〜6）

| Case | 実行条件               | `VITEST_SHARDED_COVERAGE` | `--coverage` | アーティファクト                      | Codecov アップロード           | 期待結果     |
| ---- | ---------------------- | ------------------------- | ------------ | ------------------------------------- | ------------------------------ | ------------ |
| 1    | PR（ローカル相当）     | 未設定                    | なし         | 生成なし                              | なし                           | PASS（高速） |
| 2    | main push（shard=1/2） | `true`                    | 付与         | `backend-coverage-1` アップロード     | -                              | PASS         |
| 3    | main push（shard=2/2） | `true`                    | 付与         | `backend-coverage-2` アップロード     | -                              | PASS         |
| 4    | coverage ジョブ実行    | -                         | -            | `backend-coverage-*` ダウンロード済み | `backend` フラグでアップロード | PASS         |
| 5    | coverage ジョブ実行    | -                         | -            | `desktop-coverage-*` ダウンロード済み | `desktop` フラグ（回帰なし）   | PASS         |
| 6    | coverage ジョブ全体    | -                         | -            | desktop + backend 両方存在            | 両フラグがアップロード済み     | PASS         |

---

## テスト仕様 1-A: ローカルカバレッジ生成（shard=1/2）

```bash
# VITEST_SHARDED_COVERAGE=true を設定して shard=1/2 でカバレッジ付き実行
cd /path/to/project
VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run \
  --shard=1/2 \
  --coverage

# 期待結果: apps/backend/coverage/ に json・lcov ファイルが生成される
ls -la apps/backend/coverage/
```

**確認観点**:

| 観点                           | 確認方法                    | 期待動作                               |
| ------------------------------ | --------------------------- | -------------------------------------- |
| カバレッジファイルが生成される | `ls apps/backend/coverage/` | `coverage-final.json`/`lcov.info` 存在 |
| vitest exit code が 0 である   | `echo $?`                   | 0 で終了                               |

---

## テスト仕様 2-A: カバレッジなし実行（PR 相当）

```bash
# VITEST_SHARDED_COVERAGE を設定せずに実行（PR 相当）
pnpm --filter @repo/backend exec vitest run --shard=1/2

# 期待結果: apps/backend/coverage/ が生成されない（または空）
ls apps/backend/coverage 2>/dev/null && echo "FAIL: coverage が生成された" || echo "OK: coverage が生成されていない"
```

---

## テスト仕様 3-A: カバレッジレポートファイル形式確認

```bash
# json ファイルの存在確認
ls apps/backend/coverage/coverage-final.json

# lcov.info の存在確認
ls apps/backend/coverage/lcov.info

# YAML 構文チェック
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML OK"
```

---

## テスト仕様 4-A: desktop フラグ回帰確認（CI ログ）

```bash
# 実装後の最初の main push CI 実行 ID を取得（実装後に実行）
LATEST_RUN=$(gh run list --workflow=ci.yml --branch main --limit=1 --json databaseId --jq '.[0].databaseId')

# coverage ジョブのログ確認
gh run view "$LATEST_RUN" --log | grep -A 5 "flags.*desktop\|Upload desktop coverage"
gh run view "$LATEST_RUN" --log | grep -A 5 "flags.*backend\|Upload backend coverage"
```

---

## ci.yml 構文確認スクリプト

```bash
# Python での YAML 構文チェック
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML OK"

# 変更確認
grep -n "pull_request\|VITEST_SHARDED_COVERAGE\|--coverage\|backend-coverage" .github/workflows/ci.yml
grep -n "test-web\|flags.*backend" .github/workflows/ci.yml | grep -A3 coverage
```
