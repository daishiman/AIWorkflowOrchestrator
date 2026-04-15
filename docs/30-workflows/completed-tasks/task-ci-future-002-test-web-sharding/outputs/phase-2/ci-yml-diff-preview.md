# ci.yml 修正差分イメージ

作成日: 2026-04-15
タスクID: TASK-CI-FUTURE-002

## 変更 1: test-desktop シャード数削減（17→15）

```diff
   test-desktop:
     name: Test (desktop)
     runs-on: ubuntu-latest
     needs: [build-shared]
     timeout-minutes: 15
     strategy:
       fail-fast: false
       matrix:
-        # CI Optimization (TASK-CI-OPT-001):
-        # 17シャードに分割して各シャードの実行時間を短縮（16→17に微調整）
-        # 399テストファイル ÷ 17 ≒ 23〜24ファイル/シャード
-        # GitHub Free Tier 並列上限20に対して: test-desktop×17+typecheck×1+test-shared×1+e2e×1=20
-        shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
+        # CI Optimization (TASK-CI-OPT-001 + TASK-CI-FUTURE-002):
+        # test-web シャード化のため 17→15 に削減（-2シャード）
+        # 399テストファイル ÷ 15 ≒ 26〜27ファイル/シャード
+        # GitHub Free Tier 並列上限20の内訳:
+        #   test-desktop: 15シャード
+        #   test-web:      2シャード（TASK-CI-FUTURE-002 新規追加）
+        #   typecheck:     1ジョブ / test-shared: 1ジョブ / e2e-desktop: 1ジョブ
+        #   合計:         20ジョブ（上限 = 20）
+        # シャード数変更時は上記合計が 20 以内に収まることを確認すること。
+        shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
```

## 変更 2: test-desktop vitest コマンド更新（/17→/15）

```diff
-      - name: Run desktop app tests (shard ${{ matrix.shard }}/17)
+      - name: Run desktop app tests (shard ${{ matrix.shard }}/15)
         run: |
           if [ "${{ github.event_name }}" = "pull_request" ]; then
-            pnpm --filter @repo/desktop exec vitest run --shard=${{ matrix.shard }}/17
+            pnpm --filter @repo/desktop exec vitest run --shard=${{ matrix.shard }}/15
           else
-            VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/desktop exec vitest run --shard=${{ matrix.shard }}/17 --coverage
+            VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/desktop exec vitest run --shard=${{ matrix.shard }}/15 --coverage
           fi
```

## 変更 3: test-web ジョブ新規追加

```diff
+  test-web:
+    name: Test (web)
+    runs-on: ubuntu-latest
+    needs: [build-shared]
+    timeout-minutes: 15
+    strategy:
+      fail-fast: false
+      matrix:
+        # test-web シャード化 (TASK-CI-FUTURE-002):
+        # @repo/backend テストを 2 並列で実行
+        shard: [1, 2]
+    env:
+      NODE_OPTIONS: --max-old-space-size=4096
+      CI: true
+    steps:
+      - name: Checkout
+        uses: actions/checkout@v4
+
+      - name: Setup pnpm
+        uses: pnpm/action-setup@v4
+
+      - name: Setup Node.js
+        uses: actions/setup-node@v6
+        with:
+          node-version: "22"
+          cache: "pnpm"
+
+      - name: Configure git to use HTTPS instead of SSH
+        run: git config --global url."https://github.com/".insteadOf "git@github.com:"
+
+      - name: Install dependencies
+        uses: ./.github/actions/pnpm-install-retry
+
+      - name: Download shared build artifact
+        uses: actions/download-artifact@v4
+        with:
+          name: shared-build
+          path: packages/shared/dist/
+
+      - name: Run web app tests (shard ${{ matrix.shard }}/2)
+        run: pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
```

## 変更 4: build ジョブの needs に test-web を追加

```diff
   build:
     name: Build Check
     runs-on: ubuntu-latest
     timeout-minutes: 15
     needs:
       [
         lint,
         typecheck,
         test-shared,
         test-desktop,
+        test-web,
         e2e-desktop,
         build-shared,
         check-module-sync,
       ]
```
