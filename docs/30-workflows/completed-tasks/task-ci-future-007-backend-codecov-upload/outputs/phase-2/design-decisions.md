# Phase 2: 設計判断記録 (design-decisions)

## 作成日

2026-04-16

---

## 設計判断 1: apps/backend/vitest.config.ts のカバレッジ設定

### 変更内容

| 設定項目           | 変更前                                         | 変更後                                  | 根拠                                         |
| ------------------ | ---------------------------------------------- | --------------------------------------- | -------------------------------------------- |
| `provider`         | `"v8"`                                         | `"v8"`（変更なし）                      | desktop と統一・Node.js ネイティブで高速     |
| `reporter`         | `["text", "json", "html"]`                     | `["json", "lcov"]`                      | Codecov が json/lcov を要求。html は不要     |
| `enabled`          | 未設定（常に有効）                             | `!!process.env.VITEST_SHARDED_COVERAGE` | CI の条件分岐と連動。PR 時はカバレッジ無効化 |
| `reportsDirectory` | 未設定（デフォルト）                           | `"./coverage"`（明示化）                | アーティファクトパスの明示化                 |
| `exclude`          | `["node_modules/", ".next/", "**/*.config.*"]` | 維持                                    | 既存設定を踏襲                               |

### 実装後の設定イメージ

```typescript
coverage: {
  provider: "v8",
  reporter: ["json", "lcov"],
  reportsDirectory: "./coverage",
  enabled: !!process.env.VITEST_SHARDED_COVERAGE,
  exclude: ["node_modules/", ".next/", "**/*.config.*"],
},
```

---

## 設計判断 2: test-web ジョブの条件分岐

| トリガー       | `VITEST_SHARDED_COVERAGE` | `--coverage` オプション | アーティファクト           |
| -------------- | ------------------------- | ----------------------- | -------------------------- |
| `pull_request` | 未設定                    | なし                    | アップロードなし           |
| `push` (main)  | -                         | 付与                    | `backend-coverage-{shard}` |

### 条件分岐実装設計

```yaml
# test-web ジョブへの条件分岐追加
- name: Run web app tests (shard ${{ matrix.shard }}/2)
  run: |
    if [ "${{ github.event_name }}" = "pull_request" ]; then
      pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
    else
      VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2 --coverage
    fi

- name: Upload backend coverage artifact
  if: github.event_name != 'pull_request'
  uses: actions/upload-artifact@v4
  with:
    name: backend-coverage-${{ matrix.shard }}
    path: apps/backend/coverage/
    retention-days: 1
    if-no-files-found: error
```

**設計根拠**:

- `if [ "${{ github.event_name }}" = "pull_request" ]` パターンは `test-desktop` と同一の実装パターン
- `retention-days: 1` は `desktop-coverage-*` と統一（coverage ジョブが即座に処理するため十分）

---

## 設計判断 3: coverage ジョブの backend 対応

### needs の変更

```yaml
# 変更前
needs: [test-shared, test-desktop]

# 変更後
needs: [test-shared, test-desktop, test-web]
```

### ダウンロード・アップロードステップ追加

```yaml
# backend カバレッジアーティファクトのダウンロード（新規追加）
- name: Download backend coverage artifacts
  uses: actions/download-artifact@v4
  with:
    pattern: backend-coverage-*
    path: coverage/backend
    merge-multiple: true

# Codecov へ backend フラグでアップロード（新規追加）
- name: Upload backend coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    directory: coverage/backend
    flags: backend
    fail_ci_if_error: false
    verbose: true
```

### desktop 既存ステップの修正

現行の desktop アップロードは `directory: coverage/` で全体を対象としているが、
`coverage/backend` 追加後は混在するため `directory: coverage/desktop` に修正する:

```yaml
# 変更前
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    directory: coverage/ # ← 変更
    flags: desktop
    fail_ci_if_error: false
    verbose: true

# 変更後
- name: Upload desktop coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    directory: coverage/desktop # ← 修正
    flags: desktop
    fail_ci_if_error: false
    verbose: true
```

---

## 設計判断 4: アーティファクト命名規則

| 項目                   | 選択                       | 根拠                                                   |
| ---------------------- | -------------------------- | ------------------------------------------------------ |
| アーティファクト名     | `backend-coverage-{shard}` | `desktop-coverage-{shard}` と命名規則を統一            |
| ダウンロード先パス     | `coverage/backend`         | `coverage/desktop` との分離で混在防止                  |
| `merge-multiple: true` | 採用                       | 複数シャードのアーティファクトを 1 ディレクトリに統合  |
| Codecov フラグ         | `backend`                  | `desktop` フラグとの区別・Codecov ダッシュボードで識別 |
