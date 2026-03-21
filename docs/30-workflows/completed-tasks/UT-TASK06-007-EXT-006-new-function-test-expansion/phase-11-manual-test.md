# Phase 11: 手動テスト - 新関数テスト拡充

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 11                                                |
| 機能名   | UT-TASK06-007-EXT-006-new-function-test-expansion |
| 作成日   | 2026-03-21                                        |
| タスクID | UT-TASK06-007-EXT-006                             |
| 前Phase  | Phase 10: 最終レビュー                            |

## 目的

CLIスクリプト `check-ipc-contracts.ts` のテスト拡充が正常に機能することを確認する。画面を持たないスクリプトのため、視覚確認は対象外とし、テスト全件PASSと既存スクリプト動作への無影響を確認する。

## 実行タスク

- テスト全件PASS確認: 追加テストを含む全テストが正常終了することを確認
- スクリプト動作影響確認: export追加が既存スクリプトの動作に影響しないことを確認
- カバレッジ確認: テスト拡充によりカバレッジが改善されていることを確認
- 補助チェックリスト作成: `outputs/phase-11/manual-test-checklist.md` に結果を残す

## 参照資料

| 資料名         | パス                                                                                          | 説明                         |
| -------------- | --------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 5成果物  | `outputs/phase-5/green-confirmation.md`                                                       | export追加とGreen確認の記録  |
| Phase 6成果物  | [phase-6-test-expansion.md](phase-6-test-expansion.md)                                        | 追加テストの拡張条件         |
| Phase 7成果物  | `outputs/phase-7/coverage-report.md`                                                          | カバレッジ結果               |
| Phase 8成果物  | `outputs/phase-8/refactoring-report.md`                                                       | テスト構造の最終確認         |
| Phase 9成果物  | `outputs/phase-9/quality-report.md`                                                           | Lint・型チェック・テスト結果 |
| Phase 10成果物 | `outputs/phase-10/final-review-result.md`                                                     | 最終レビュー判定             |
| 対象スクリプト | `apps/desktop/scripts/check-ipc-contracts.ts`                                                 | export追加済みスクリプト本体 |
| テストファイル | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`                                  | 拡充済みテストファイル       |
| 要件定義       | `docs/30-workflows/UT-TASK06-007-EXT-006-new-function-test-expansion/phase-1-requirements.md` | 受け入れ基準の出典           |
| 設計書         | `docs/30-workflows/UT-TASK06-007-EXT-006-new-function-test-expansion/phase-2-design.md`       | テスト設計の出典             |

## 実行手順

### Step 1: テスト全件PASS確認

```bash
# apps/desktop ディレクトリから実行すること（P40対策: vitest.config.ts が適用される）
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts
```

**確認ポイント:**

- [x] 全テストが PASS すること（FAILが0件）
- [x] 新規追加テストグループが出力に含まれること
  - `normalizeTypeAnnotation` 関連テスト
  - `isPrimitiveTypeAnnotation` 関連テスト
  - `mergeChannelMaps` 関連テスト
  - `CHANNEL_OBJECT_PATTERN / PRELOAD_CALL_START_PATTERN` 関連テスト
- [x] 既存49件テストも引き続きPASSすること

**期待出力例:**

```
Test Files  1 passed (1)
Tests       69 passed (69)
```

### Step 2: スクリプト動作影響確認

export追加（`export` キーワードの付与）がスクリプト本体の動作に影響しないことを確認する。

```bash
# tsx を使ってスクリプトを直接実行（read-only 相当の report-only で確認）
cd apps/desktop && npx tsx scripts/check-ipc-contracts.ts --report-only
```

**確認ポイント:**

- [x] スクリプト起動時にモジュール解決エラーが発生しないこと
- [x] export追加による構文エラーが発生しないこと
- [x] `--report-only` 実行でモジュール解決エラーや構文エラーが発生しないこと

注意: 実際のIPC契約チェックはシステム状態に依存するため、ドライラン確認のみで十分。

### Step 3: TypeScript型チェック確認

```bash
cd apps/desktop && pnpm typecheck
```

**確認ポイント:**

- [x] TypeScriptのコンパイルエラーが0件であること
- [x] export追加により型の整合性が崩れていないこと

### Step 4: 視覚確認（非視覚 placeholder 記録）

本タスクは CLI スクリプトのため、画面遷移や要素表示の確認対象はない。一方で Phase 11 の補助成果物整合を保つため、`outputs/phase-11/screenshot-plan.json` と `outputs/phase-11/screenshots/TC-11-NON-VISUAL-cli.png` を「非視覚タスクの placeholder 証跡」として残す。

### Step 5: カバレッジレポート確認（オプション）

```bash
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts --coverage
```

**確認ポイント:**

- [x] Line Coverage が 80% 以上であること（推奨: 90%以上）
- [x] Function Coverage が 80% 以上であること
- [x] `normalizeTypeAnnotation` 関数のカバレッジが向上していること
- [x] `isPrimitiveTypeAnnotation` 関数のカバレッジが向上していること
- [x] `mergeChannelMaps` 関数または関連正規表現テストのカバレッジが向上していること

## 統合テスト連携

本タスクは CLI スクリプトのテスト拡充のみであり、IPC 通信や画面統合の確認対象はない。既存の統合テストへの影響もなし。

## 成果物

| 成果物                   | パス                                                                                                                        | 説明                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 手動テストチェックリスト | `docs/30-workflows/UT-TASK06-007-EXT-006-new-function-test-expansion/outputs/phase-11/manual-test-checklist.md`             | 実施項目と対象外判定    |
| 手動テスト結果レポート   | `docs/30-workflows/UT-TASK06-007-EXT-006-new-function-test-expansion/outputs/phase-11/manual-test-result.md`                | テスト実行結果の記録    |
| screenshot plan          | `docs/30-workflows/UT-TASK06-007-EXT-006-new-function-test-expansion/outputs/phase-11/screenshot-plan.json`                 | 非視覚 placeholder 計画 |
| placeholder screenshot   | `docs/30-workflows/UT-TASK06-007-EXT-006-new-function-test-expansion/outputs/phase-11/screenshots/TC-11-NON-VISUAL-cli.png` | 非視覚タスク証跡        |

## 完了条件

- [x] Step 1: `pnpm vitest run` で全テストがPASS（FAILが0件）
- [x] Step 2: export追加後もスクリプト実行が正常終了（構文エラーなし）
- [x] Step 3: `pnpm typecheck` がエラー0件で完了
- [x] `outputs/phase-11/manual-test-checklist.md` と `outputs/phase-11/manual-test-result.md` を作成
- [x] `outputs/phase-11/screenshot-plan.json` と placeholder screenshot を作成
- [x] 視覚確認: 非視覚タスクとして placeholder 証跡を記録

## 次Phase

Phase 12: ドキュメント更新
→ [`phase-12-documentation.md`](phase-12-documentation.md)
