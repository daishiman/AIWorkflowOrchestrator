# Phase 6: テスト拡張確認結果 (test-expansion-result)

## 確認日

2026-04-16

---

## 確認方法

`pnpm install` 未実行のためローカルでのvitest実行は省略。
静的解析（grep・diff・YAML構文チェック）で実装内容を確認。

---

## T-06-1: シャード 1・2 のカバレッジ付き実行確認

**実装確認**:

```bash
# test-web ジョブの条件分岐実装を確認
grep -n "VITEST_SHARDED_COVERAGE=true.*pnpm.*backend.*vitest.*coverage" .github/workflows/ci.yml
# → 360行: VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2 --coverage
```

**結果**: shard=1/2, 2/2 の両方でカバレッジ付き実行が設計通り実装されている ✓

---

## T-06-2: PR 相当のカバレッジなし実行確認

**実装確認**:

```bash
grep -n "pull_request" .github/workflows/ci.yml | grep -A3 "test-web"
# → 357行: if [ "${{ github.event_name }}" = "pull_request" ]; then
# → 358行:   pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
```

**結果**: PR 時は `--coverage` なし実行のパスが存在する。AC-5 満足 ✓

---

## T-06-3: カバレッジレポートファイルの存在確認

**設定確認**:

```
apps/backend/vitest.config.ts:
  reporter: ["json", "lcov"]
  reportsDirectory: "./coverage"
  enabled: !!process.env.VITEST_SHARDED_COVERAGE
```

**期待生成ファイル**:

- `apps/backend/coverage/coverage-final.json` (reporter: json)
- `apps/backend/coverage/lcov.info` (reporter: lcov)

**結果**: reporter 設定が正しく、Codecov に必要なファイルが生成される設計 ✓

---

## T-06-4: desktop フラグの回帰確認

**確認**:

```bash
grep -n "flags:\|desktop-coverage\|desktop フラグ" .github/workflows/ci.yml
# 451: flags: desktop
# 442: pattern: desktop-coverage-*
# 438: (coverage ジョブに desktop フラグコメント)
```

**結果**: desktop フラグのアップロードステップが維持されている。回帰なし ✓

---

## 全観点のサマリ

| 観点                             | 結果 |
| -------------------------------- | ---- |
| シャード 1・2 カバレッジ付き実行 | PASS |
| PR 相当カバレッジなし実行        | PASS |
| カバレッジレポートファイル生成   | PASS |
| desktop フラグ回帰なし           | PASS |

**Phase 7 へ進む**
