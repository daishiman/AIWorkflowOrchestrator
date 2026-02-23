# Phase 11: 手動テストレポート

## タスク情報

| 項目           | 値                                      |
| -------------- | --------------------------------------- |
| タスクID       | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 |
| Phase          | 11 (手動テスト)                         |
| 実行日         | 2026-02-22                              |
| 対象スクリプト | `scripts/check-shared-module-sync.ts`   |

## 手動テスト結果

### シナリオ実行結果

| シナリオ# | 名称                       | 結果 | 備考                                                                        |
| --------- | -------------------------- | ---- | --------------------------------------------------------------------------- |
| 1         | 正常系 -- 全チェック PASS  | PASS | exit code 0、5つ全てPASSED、`ALL CHECKS PASSED` 表示                        |
| 2         | 異常系 -- 架空サブパス追加 | PASS | exit code 1、Check 1/3/5がFAILED、Check 2/4がPASSED                         |
| 3         | MISSING 表示確認           | PASS | `Missing: ./fake-test-subpath` が各FAILEDチェックに表示                     |
| 4         | サマリーセクション確認     | PASS | `SYNC CHECK FAILED: 3 issue(s) found` が正確に表示                          |
| 5         | 修正方法ガイダンス確認     | N/A  | 4ステップガイダンス未実装（Phase 10 MINOR M1 指摘済み、未タスク化対応予定） |
| 6         | 復帰 -- 正常終了確認       | PASS | exit code 0、`ALL CHECKS PASSED`、git diff 差分なし                         |

### シナリオ 1: 正常系 -- 全チェック PASS

```
  Check 1: exports -> paths (PASSED)
  Check 2: paths -> exports (PASSED)
  Check 3: exports -> aliases (PASSED)
  Check 4: aliases -> exports (PASSED)
  Check 5: exports -> typesVersions (PASSED)

  ALL CHECKS PASSED
EXIT_CODE=0
```

**確認項目:**

- [x] exit code 0
- [x] `ALL CHECKS PASSED` が含まれる
- [x] FAILED (`SYNC CHECK FAILED`) が含まれない
- [x] 5つ全て PASSED

### シナリオ 2: 異常系 -- 架空サブパス追加

`packages/shared/package.json` の `exports` に以下を追加:

```json
"./fake-test-subpath": {
  "types": "./dist/fake-test-subpath/index.d.ts",
  "import": "./dist/fake-test-subpath/index.js"
}
```

```
  Check 1: exports -> paths (FAILED)
   Missing: ./fake-test-subpath
  Check 2: paths -> exports (PASSED)
  Check 3: exports -> aliases (FAILED)
   Missing: ./fake-test-subpath
  Check 4: aliases -> exports (PASSED)
  Check 5: exports -> typesVersions (FAILED)
   Missing: ./fake-test-subpath

  SYNC CHECK FAILED: 3 issue(s) found
EXIT_CODE=1
```

**確認項目:**

- [x] exit code 1
- [x] Check 1 (exports -> paths): FAILED -- `./fake-test-subpath` MISSING
- [x] Check 2 (paths -> exports): PASSED（paths には追加していないため正常）
- [x] Check 3 (exports -> aliases): FAILED -- `./fake-test-subpath` MISSING
- [x] Check 4 (aliases -> exports): PASSED（aliases には追加していないため正常）
- [x] Check 5 (exports -> typesVersions): FAILED -- `./fake-test-subpath` MISSING

### シナリオ 3: MISSING 表示確認

シナリオ 2 の出力にて:

- [x] `Missing:` 行が表示されている
- [x] `./fake-test-subpath` が含まれている
- [x] インデントにより視覚的に区別しやすい（`   Missing:` の3スペースインデント）

### シナリオ 4: サマリーセクション確認

シナリオ 2 の出力にて:

- [x] `SYNC CHECK FAILED` メッセージが表示されている
- [x] 失敗チェック数が正確（`3 issue(s) found` -- Check 1, 3, 5 の3件）

### シナリオ 5: 修正方法ガイダンス確認

- [ ] 4ステップ修正ガイダンスの表示: **未実装**

Phase 10 の MINOR 指摘 M1 により「4ステップガイダンス未実装」が指摘されており、未タスク `task-imp-module-sync-report-enhancement` として管理されている。現時点では修正方法ガイダンスは出力に含まれない。これは既知の制限であり、後続タスクで対応予定。

### シナリオ 6: 復帰 -- 正常終了確認

```
  Check 1: exports -> paths (PASSED)
  Check 2: paths -> exports (PASSED)
  Check 3: exports -> aliases (PASSED)
  Check 4: aliases -> exports (PASSED)
  Check 5: exports -> typesVersions (PASSED)

  ALL CHECKS PASSED
EXIT_CODE=0
```

**確認項目:**

- [x] `mv` で `package.json.bak` を `package.json` に復元
- [x] exit code 0
- [x] `ALL CHECKS PASSED` が表示
- [x] `package.json.bak` が残っていない（`ls` で確認済み）

### 復元確認

- `git diff --stat packages/shared/package.json`: **差分なし**（出力空）
- `packages/shared/package.json.bak`: **ファイル不存在**（確認済み）

## 総合判定

**PASS: Phase 12 へ進む**

6つのシナリオのうち、シナリオ 5（修正方法ガイダンス確認）のみ N/A（Phase 10 MINOR M1 指摘として未タスク化済み）。残り5シナリオは全て期待どおりの動作を確認。スクリプトは正常系・異常系ともに正確に動作しており、Phase 12 進行の条件を満たす。
