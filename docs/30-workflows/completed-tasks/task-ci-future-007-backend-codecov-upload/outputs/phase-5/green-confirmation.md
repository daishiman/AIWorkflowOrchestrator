# Phase 5: GREEN 確認結果 (green-confirmation)

## 確認日

2026-04-16

---

## YAML 構文チェック

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML OK"
```

**結果**: `YAML OK` ✓

---

## 実装内容の確認（grep）

```bash
grep -n "github.event_name == 'push' && github.ref == 'refs/heads/main'\|VITEST_SHARDED_COVERAGE\|backend-coverage\|flags: backend\|flags: desktop\|directory: coverage/" .github/workflows/ci.yml codecov.yml apps/backend/vitest.config.ts
```

確認結果:

```text
12:      reporter: ["json", "lcov"]
13:      reportsDirectory: "./coverage"
14:      enabled: !!process.env.VITEST_SHARDED_COVERAGE
360:          if [ "${{ github.event_name }}" = "push" ] && [ "${{ github.ref }}" = "refs/heads/main" ]; then
361:            VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2 --coverage
367:        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
370:          name: backend-coverage-${{ matrix.shard }}
446:          path: coverage/desktop
455:          flags: desktop
462:          path: coverage/backend
469:          flags: backend
49:  backend:
```

---

## AC 充足確認

| AC番号 | 確認方法                                                 | 結果 |
| ------ | -------------------------------------------------------- | ---- |
| AC-1   | `ci.yml` に `push` + `main` の strict 条件分岐が存在する | PASS |
| AC-2   | `VITEST_SHARDED_COVERAGE=true` + `--coverage` が実装     | PASS |
| AC-3   | `backend-coverage-${{ matrix.shard }}` が実装            | PASS |
| AC-4   | `flags: backend` + `directory: coverage/backend`         | PASS |
| AC-5   | `push/main` 以外は `--coverage` なし（else 分岐）        | PASS |

---

## 補足

- `codecov.yml` に `backend` flag を追加し、`shared` / `desktop` / `backend` の 3 系統を整理した。
- Phase 6 以降へ進行可能。
