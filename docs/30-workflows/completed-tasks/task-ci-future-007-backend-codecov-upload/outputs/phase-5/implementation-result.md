# Phase 5: 実装結果サマリ (implementation-result)

## 実装日

2026-04-16

---

## 変更ファイル一覧

| ファイル                        | 変更種別 | 変更内容                                                                               |
| ------------------------------- | -------- | -------------------------------------------------------------------------------------- |
| `apps/backend/vitest.config.ts` | 修正     | reporter を `['json', 'lcov']` に変更・`enabled` フラグ追加・`reportsDirectory` 明示化 |
| `.github/workflows/ci.yml`      | 修正     | `test-web` の push/main strict 条件分岐・backend artifact 追加                         |
| `.github/workflows/ci.yml`      | 修正     | `coverage` ジョブへの `needs: test-web` + backend ダウンロード/アップロード追加        |
| `.github/workflows/ci.yml`      | 修正     | desktop アップロードの `directory: coverage/` → `directory: coverage/desktop` に修正   |
| `codecov.yml`                   | 修正     | `backend` flag を追加し、`carryforward: true` を設定                                   |

---

## apps/backend/vitest.config.ts の変更内容

```diff
 coverage: {
   provider: "v8",
-  reporter: ["text", "json", "html"],
+  reporter: ["json", "lcov"],
+  reportsDirectory: "./coverage",
+  enabled: !!process.env.VITEST_SHARDED_COVERAGE,
   exclude: ["node_modules/", ".next/", "**/*.config.*"],
 },
```

---

## .github/workflows/ci.yml の変更内容（test-web ジョブ）

```diff
-      # カバレッジ条件分岐:
-      # - PR時: カバレッジなし（高速フィードバック）
-      # - main push時: カバレッジあり（品質メトリクス維持）
       - name: Run web app tests (shard ${{ matrix.shard }}/2)
-        run: pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
+        run: |
+          if [ "${{ github.event_name }}" = "push" ] && [ "${{ github.ref }}" = "refs/heads/main" ]; then
+            VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2 --coverage
+          else
+            pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
+          fi
+
+      - name: Upload backend coverage artifact
+        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
+        uses: actions/upload-artifact@v4
+        with:
+          name: backend-coverage-${{ matrix.shard }}
+          path: apps/backend/coverage/
+          retention-days: 1
+          if-no-files-found: error
```

---

## .github/workflows/ci.yml の変更内容（coverage ジョブ）

```diff
-    needs: [test-shared, test-desktop]
+    needs: [test-shared, test-desktop, test-web]

-      - name: Upload coverage to Codecov
+      - name: Upload desktop coverage to Codecov
         uses: codecov/codecov-action@v5
         with:
           token: ${{ secrets.CODECOV_TOKEN }}
-          directory: coverage/
+          directory: coverage/desktop
           flags: desktop
           fail_ci_if_error: false
           verbose: true
+
+      - name: Download backend coverage artifacts
+        uses: actions/download-artifact@v4
+        with:
+          pattern: backend-coverage-*
+          path: coverage/backend
+
+      - name: Upload backend coverage to Codecov
+        uses: codecov/codecov-action@v5
+        with:
+          token: ${{ secrets.CODECOV_TOKEN }}
+          directory: coverage/backend
+          flags: backend
+          fail_ci_if_error: false
+          verbose: true
```

---

## 補足

- `codecov.yml` の `backend` flag を追加し、`shared` / `desktop` / `backend` の 3 系統で可視化できるようにした。
- `merge-multiple: true` は backend 側では使用せず、アーティファクトは `coverage/backend` 配下に個別展開する。

---

## AC 充足確認

| AC番号 | 基準                                             | 充足 |
| ------ | ------------------------------------------------ | ---- |
| AC-1   | `test-web` に `push` + `main` の strict 条件分岐 | ✓    |
| AC-2   | `VITEST_SHARDED_COVERAGE=true` + `--coverage`    | ✓    |
| AC-3   | `backend-coverage-{shard}` アーティファクト      | ✓    |
| AC-4   | `flags: backend` で Codecov アップロード         | ✓    |
| AC-5   | `push/main` 以外は `--coverage` なし             | ✓    |
