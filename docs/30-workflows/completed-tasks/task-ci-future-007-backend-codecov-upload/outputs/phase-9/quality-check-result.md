# Phase 9: 品質チェック結果 (quality-check-result)

## 確認日

2026-04-16

---

## AC-1〜AC-5 照合テーブル

| 受入基準 | 内容                                                                        | 証拠（grep 結果）                                                                                             | 判定 |
| -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---- |
| AC-1     | `test-web` に PR / main push の条件分岐が追加されている                     | L360: `if [ "${{ github.event_name }}" = "pull_request" ]`<br>L367: `if: github.event_name != 'pull_request'` | PASS |
| AC-2     | main push 時に `VITEST_SHARDED_COVERAGE=true` + `--coverage` が付与される   | L363: `VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=... --coverage`       | PASS |
| AC-3     | `backend-coverage-${{ matrix.shard }}` アーティファクトがアップロードされる | L370: `name: backend-coverage-${{ matrix.shard }}`                                                            | PASS |
| AC-4     | `coverage` ジョブで `backend` フラグで Codecov アップロードされる           | L467-471: `uses: codecov/codecov-action@v5` + `flags: backend`                                                | PASS |
| AC-5     | PR 時の分岐でカバレッジなし実行になっている                                 | L361: `pnpm --filter @repo/backend exec vitest run --shard=.../2`（`--coverage` なし）                        | PASS |

---

## 追加確認

| 項目             | 確認内容                                                     | 結果 |
| ---------------- | ------------------------------------------------------------ | ---- |
| desktop 回帰なし | `flags: desktop`（L455）・`desktop-coverage-*`（L446）が維持 | PASS |
| YAML 構文        | `python3 -c "import yaml; yaml.safe_load(...)"` → YAML OK    | PASS |
| vitest reporter  | `reporter: ["json", "lcov"]` が設定済み                      | PASS |
| `enabled` フラグ | `enabled: !!process.env.VITEST_SHARDED_COVERAGE`             | PASS |

---

## 判定

**全 AC-1〜AC-5: PASS → Phase 10 へ進む**
