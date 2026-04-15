# 実装結果サマリー

作成日: 2026-04-15
タスクID: TASK-CI-FUTURE-002

## 変更ファイル

| ファイル                        | 変更種別 | 変更内容                           |
| ------------------------------- | -------- | ---------------------------------- |
| `.github/workflows/ci.yml`      | 修正     | 4箇所（下記参照）                  |
| `apps/backend/vitest.config.ts` | 変更なし | 修正不要と判断（Phase 2 設計通り） |

## 変更内容詳細

### 変更 1: test-desktop シャード数削減（17→15）

```yaml
# 変更前
shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

# 変更後
shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
```

コメントも TASK-CI-OPT-001 + TASK-CI-FUTURE-002 に更新し、並列数内訳を明記。

### 変更 2: test-desktop vitest コマンド更新（/17→/15）

```yaml
# 変更前
- name: Run desktop app tests (shard ${{ matrix.shard }}/17)
  run: pnpm --filter @repo/desktop exec vitest run --shard=${{ matrix.shard }}/17

# 変更後
- name: Run desktop app tests (shard ${{ matrix.shard }}/15)
  run: pnpm --filter @repo/desktop exec vitest run --shard=${{ matrix.shard }}/15
```

### 変更 3: test-web ジョブ新規追加

```yaml
test-web:
  name: Test (web)
  runs-on: ubuntu-latest
  needs: [build-shared]
  timeout-minutes: 15
  strategy:
    fail-fast: false
    matrix:
      shard: [1, 2]
  env:
    NODE_OPTIONS: --max-old-space-size=4096
    CI: true
  steps:
    # ... checkout, setup, install, download-artifact ...
    - name: Run web app tests (shard ${{ matrix.shard }}/2)
      run: pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
```

### 変更 4: build ジョブの needs に test-web を追加

```yaml
needs:
  [
    lint,
    typecheck,
    test-shared,
    test-desktop,
    test-web,
    e2e-desktop,
    build-shared,
    check-module-sync,
  ]
```

## 検証結果（Python による自動検証）

| 確認項目                       | 結果                           |
| ------------------------------ | ------------------------------ |
| test-web ジョブの存在          | ✅ 存在する                    |
| test-web matrix shard          | ✅ `[1, 2]`                    |
| test-desktop シャード数        | ✅ 15                          |
| 並列数合計                     | ✅ 20（= 上限）                |
| build ジョブ needs に test-web | ✅ 含まれている                |
| YAML 構文エラー                | ✅ なし（yaml.safe_load 成功） |

## AC 充足状況

| AC番号 | 充足   | 備考                                                 |
| ------ | ------ | ---------------------------------------------------- |
| AC-1   | ✅     | test-web が 2 シャードの matrix で定義済み           |
| AC-2   | 未確認 | CI 実行後に確認（Phase 11）                          |
| AC-3   | ✅     | 20 ≤ 20 を計算式で確認済み                           |
| AC-4   | 未確認 | CI 実行後に確認（Phase 11）                          |
| AC-5   | ✅     | outputs/phase-2/shard-count-design.md に計算根拠あり |
| AC-6   | ✅     | 変更ファイルは ci.yml のみ                           |
