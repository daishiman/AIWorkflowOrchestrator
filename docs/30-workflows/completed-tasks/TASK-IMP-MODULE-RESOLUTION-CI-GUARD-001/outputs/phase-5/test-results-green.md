# Phase 5: テスト実行結果（Green フェーズ）

## 実行日時

2026-02-22

## テスト実行結果

### コマンド

```bash
pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts
```

### 結果

| 項目           | 結果                            |
| -------------- | ------------------------------- |
| テストファイル | 1 passed                        |
| テストケース   | 28 passed / 0 failed / 28 total |
| 実行時間       | 748ms                           |

```
 RUN  v2.1.9

 ✓ scripts/__tests__/check-shared-module-sync.test.ts (28 tests) 19ms

 Test Files  1 passed (1)
      Tests  28 passed (28)
   Start at  22:25:47
   Duration  748ms
```

## 実プロジェクト実行結果

### コマンド

```bash
pnpm tsx scripts/check-shared-module-sync.ts
```

### 結果

```
  Check 1: exports -> paths (PASSED)
  Check 2: paths -> exports (PASSED)
  Check 3: exports -> aliases (PASSED)
  Check 4: aliases -> exports (PASSED)
  Check 5: exports -> typesVersions (PASSED)

  ALL CHECKS PASSED
EXIT CODE: 0
```

- 全5チェックがPASS
- exit code: 0（正常終了）
- 現在のプロジェクトの exports / paths / aliases / typesVersions は完全に同期している

## CI ジョブ追加

### 追加したジョブ

`.github/workflows/ci.yml` に `check-module-sync` ジョブを追加:

- name: Module Sync Check
- runs-on: ubuntu-latest
- timeout-minutes: 2
- ステップ: checkout -> pnpm setup -> node setup -> install -> check script 実行

### build ジョブの needs 更新

`build` ジョブの `needs` 配列に `check-module-sync` を追加:

- 変更前: `[lint, typecheck, test-shared, test-desktop, build-shared]`
- 変更後: `[lint, typecheck, test-shared, test-desktop, build-shared, check-module-sync]`

## テスト一覧（全28件 PASS）

### パーサー関数（#1-13）

| #   | テストケース                                          | 結果 |
| --- | ----------------------------------------------------- | ---- |
| 1   | 標準的な exports を正しくパースする                   | PASS |
| 2   | exports が空オブジェクトの場合は空 Map を返す         | PASS |
| 3   | `.` のみの exports は `.` を1件含む Map を返す        | PASS |
| 4   | string 形式の export エントリを正しく処理する         | PASS |
| 5   | 標準的な paths を正しくパースする                     | PASS |
| 6   | ワイルドカード paths エントリ（`*`）をスキップする    | PASS |
| 7   | paths が空オブジェクトの場合は空 Map を返す           | PASS |
| 8   | 標準的な alias を正しくパースする                     | PASS |
| 9   | resolve パス末尾にカンマがある場合も正しくパースする  | PASS |
| 10  | alias が0件の場合は空 Map を返す                      | PASS |
| 11  | vitest.config.ts が存在しない場合はエラーをスローする | PASS |
| 12  | 標準的な typesVersions を正しくパースする             | PASS |
| 13  | typesVersions が未定義の場合は空 Map を返す           | PASS |

### チェッカー関数（#14-23）

| #   | テストケース                                                 | 結果 |
| --- | ------------------------------------------------------------ | ---- |
| 14  | 全 exports エントリが paths に存在する場合は差分なし         | PASS |
| 15  | exports にあるが paths にないエントリを検出する              | PASS |
| 16  | 全 paths エントリが exports に存在する場合は差分なし         | PASS |
| 17  | paths にあるが exports にないエントリを検出する              | PASS |
| 18  | 全 exports エントリが alias に存在する場合は差分なし         | PASS |
| 19  | exports にあるが alias にないエントリを検出する              | PASS |
| 20  | 全 alias エントリが exports に存在する場合は差分なし         | PASS |
| 21  | alias にあるが exports にないエントリを検出する              | PASS |
| 22  | 全 exports サブパスが typesVersions に存在する場合は差分なし | PASS |
| 23  | exports にあるが typesVersions にないエントリを検出する      | PASS |

### レポーター関数（#24-26）

| #   | テストケース                                    | 結果 |
| --- | ----------------------------------------------- | ---- |
| 24  | 不整合なしの場合「ALL CHECKS PASSED」を出力する | PASS |
| 25  | 不整合ありの場合、差分エントリを一覧出力する    | PASS |
| 26  | 複数チェックの不整合を全て出力する              | PASS |

### 統合テスト（#27-28）

| #   | テストケース                                             | 結果 |
| --- | -------------------------------------------------------- | ---- |
| 27  | 3層が完全一致する場合 process.exitCode は 0 または未設定 | PASS |
| 28  | 不整合がある場合 process.exitCode は 1                   | PASS |

## 結論

TDD Green フェーズ完了。全28件のテストがPASS。実プロジェクトファイルに対しても全5チェックがPASSし、exit code 0 で正常終了。CI ジョブも正常に追加。
