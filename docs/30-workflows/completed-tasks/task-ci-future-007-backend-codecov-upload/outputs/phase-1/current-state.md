# Phase 1: 現状確認 (current-state)

## 調査日

2026-04-16

## apps/backend/vitest.config.ts の現行設定

### カバレッジ設定（既存）

```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html"],
  exclude: ["node_modules/", ".next/", "**/*.config.*"],
},
```

**確認事項**:

- `provider: "v8"` → 設定済み（変更不要）
- `reporter: ["text", "json", "html"]` → Codecov が要求する `lcov` が不足
- `enabled: !!process.env.VITEST_SHARDED_COVERAGE` → 未設定（追加必要）
- `reportsDirectory` → 未設定（デフォルト `coverage/` に出力）

**変更要否**: reporter に `lcov` 追加 + `enabled` 条件の追加が必要

---

## test-web ジョブの現行設定

### シャード数

- `shard: [1, 2]` （2シャード）

### 実行コマンド（現行）

```bash
pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
```

### 条件分岐

- なし（PR / main push 両方で同じコマンドを実行）

### アーティファクトアップロード

- なし（カバレッジアーティファクトのアップロードステップが存在しない）

---

## coverage ジョブの現行設定

### needs

```yaml
needs: [test-shared, test-desktop]
```

→ `test-web` が未追加

### ダウンロード設定

```yaml
- name: Download desktop coverage artifacts
  uses: actions/download-artifact@v4
  with:
    pattern: desktop-coverage-*
    path: coverage/desktop
    merge-multiple: true
```

→ `backend-coverage-*` のダウンロードなし

### Codecov アップロード設定

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    directory: coverage/
    flags: desktop
    fail_ci_if_error: false
    verbose: true
```

→ `flags: backend` の追加なし
→ `directory: coverage/` は `coverage/backend` 追加後に混在リスクあり（設計で分離が必要）

---

## test-desktop ジョブの参照パターン

```yaml
- name: Run desktop app tests (shard ${{ matrix.shard }}/15)
  run: |
    if [ "${{ github.event_name }}" = "pull_request" ]; then
      pnpm --filter @repo/desktop exec vitest run --shard=${{ matrix.shard }}/15
    else
      VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/desktop exec vitest run --shard=${{ matrix.shard }}/15 --coverage
    fi

- name: Upload coverage artifact
  if: github.event_name != 'pull_request'
  uses: actions/upload-artifact@v4
  with:
    name: desktop-coverage-${{ matrix.shard }}
    path: apps/desktop/coverage/
    retention-days: 1
```

**参照可能な実装パターン**: 同じ条件分岐ロジックを `test-web` に適用する

---

## 変更対象ファイル確定

| ファイル                        | 変更内容                                                    |
| ------------------------------- | ----------------------------------------------------------- |
| `apps/backend/vitest.config.ts` | reporter に `lcov` 追加・`enabled` フラグ追加               |
| `.github/workflows/ci.yml`      | `test-web`: 条件分岐・カバレッジ・アーティファクト追加      |
| `.github/workflows/ci.yml`      | `coverage`: `needs` + backend ダウンロード/アップロード追加 |

---

## TASK-CI-FUTURE-002 との整合性

- TASK-CI-FUTURE-002 が `test-web` ジョブの 2 シャード化を設計・実装済み
- 本タスクはそのシャード数（2）に基づいてアーティファクト命名 `backend-coverage-{1,2}` を設計する
