# Phase 10: AC 検証記録 (ac-verification)

## 確認日

2026-04-16

---

## AC-1: PR/main push 条件分岐の存在

**証拠**:

```yaml
# .github/workflows/ci.yml L357-365
- name: Run web app tests (shard ${{ matrix.shard }}/2)
  run: |
    if [ "${{ github.event_name }}" = "pull_request" ]; then
      pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
    else
      VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2 --coverage
    fi
```

**判定**: PASS ✓

---

## AC-2: VITEST_SHARDED_COVERAGE=true + --coverage（main push 時）

**証拠**:

- L363: `VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2 --coverage`
- PR 時は else 分岐を通らないため、main push 時のみ実行される

**判定**: PASS ✓

---

## AC-3: backend-coverage-{shard} アーティファクト

**証拠**:

```yaml
# .github/workflows/ci.yml L366-374
- name: Upload backend coverage artifact
  if: github.event_name != 'pull_request'
  uses: actions/upload-artifact@v4
  with:
    name: backend-coverage-${{ matrix.shard }}
    path: apps/backend/coverage/
    retention-days: 1
    if-no-files-found: error
```

**判定**: PASS ✓

---

## AC-4: coverage ジョブに flags: backend の codecov-action

**証拠**:

```yaml
# .github/workflows/ci.yml L463-474
- name: Upload backend coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    directory: coverage/backend
    flags: backend
    fail_ci_if_error: false
    verbose: true
```

**判定**: PASS ✓

---

## AC-5: PR 時カバレッジなし実行

**証拠**:

- PR 時のシェル分岐（L360-361）: `pnpm --filter @repo/backend exec vitest run --shard=.../2`（`--coverage` なし）
- `Upload backend coverage artifact` ステップに `if: github.event_name != 'pull_request'` が設定済み

**判定**: PASS ✓

---

## desktop 回帰なし確認

| 確認項目                                                      | 確認結果                                       | 判定 |
| ------------------------------------------------------------- | ---------------------------------------------- | ---- |
| `flags: desktop` が維持されている                             | L455: `flags: desktop`                         | PASS |
| `desktop-coverage-*` アーティファクト名が維持                 | L446: `pattern: desktop-coverage-*`            | PASS |
| coverage ジョブの needs に `test-desktop` が維持              | `needs: [test-shared, test-desktop, test-web]` | PASS |
| desktop アップロードの directory が `coverage/desktop` に修正 | L450: `directory: coverage/desktop`            | PASS |

---

## 変更スコープ確認

| 変更ファイル                    | 変更内容                                             |
| ------------------------------- | ---------------------------------------------------- |
| `.github/workflows/ci.yml`      | test-web 条件分岐・coverage ジョブ backend 対応      |
| `apps/backend/vitest.config.ts` | reporter 修正・enabled フラグ・reportsDirectory 追加 |

他ファイルへの変更なし ✓
