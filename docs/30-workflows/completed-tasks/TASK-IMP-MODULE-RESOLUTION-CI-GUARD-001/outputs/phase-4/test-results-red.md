# Phase 4: テスト実行結果（Red フェーズ）

## 実行日時

2026-02-22

## 実行コマンド

```bash
pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts
```

## 結果サマリー

| 項目           | 結果                            |
| -------------- | ------------------------------- |
| テストファイル | 1 failed                        |
| テストケース   | 27 failed / 1 passed / 28 total |
| 実行時間       | 1.33s                           |

## Red 状態の確認

- 全関数がスタブ（`throw new Error('Not implemented')`）状態
- 27件がFAIL（Not implemented エラー）
- 1件がPASS: #11「vitest.config.ts が存在しない場合はエラーをスローする」
  - スタブ自体がエラーをスローするため、テストケースの期待値と一致してPASS
  - Phase 5 の本体実装後もこのテストは同様にPASSする想定

## FAIL テスト一覧

### パーサー関数（#1-13、11件FAIL）

| #   | テストケース                                          | 結果 | エラー                      |
| --- | ----------------------------------------------------- | ---- | --------------------------- |
| 1   | 標準的な exports を正しくパースする                   | FAIL | Not implemented             |
| 2   | exports が空オブジェクトの場合は空 Map を返す         | FAIL | Not implemented             |
| 3   | `.` のみの exports は `.` を1件含む Map を返す        | FAIL | Not implemented             |
| 4   | string 形式の export エントリを正しく処理する         | FAIL | Not implemented             |
| 5   | 標準的な paths を正しくパースする                     | FAIL | Not implemented             |
| 6   | ワイルドカード paths エントリ（`*`）をスキップする    | FAIL | Not implemented             |
| 7   | paths が空オブジェクトの場合は空 Map を返す           | FAIL | Not implemented             |
| 8   | 標準的な alias を正しくパースする                     | FAIL | Not implemented             |
| 9   | resolve パス末尾にカンマがある場合も正しくパースする  | FAIL | Not implemented             |
| 10  | alias が0件の場合は空 Map を返す                      | FAIL | Not implemented             |
| 11  | vitest.config.ts が存在しない場合はエラーをスローする | PASS | (スタブがthrowするため一致) |
| 12  | 標準的な typesVersions を正しくパースする             | FAIL | Not implemented             |
| 13  | typesVersions が未定義の場合は空 Map を返す           | FAIL | Not implemented             |

### チェッカー関数（#14-23、10件FAIL）

| #   | テストケース                                                 | 結果 | エラー          |
| --- | ------------------------------------------------------------ | ---- | --------------- |
| 14  | 全 exports エントリが paths に存在する場合は差分なし         | FAIL | Not implemented |
| 15  | exports にあるが paths にないエントリを検出する              | FAIL | Not implemented |
| 16  | 全 paths エントリが exports に存在する場合は差分なし         | FAIL | Not implemented |
| 17  | paths にあるが exports にないエントリを検出する              | FAIL | Not implemented |
| 18  | 全 exports エントリが alias に存在する場合は差分なし         | FAIL | Not implemented |
| 19  | exports にあるが alias にないエントリを検出する              | FAIL | Not implemented |
| 20  | 全 alias エントリが exports に存在する場合は差分なし         | FAIL | Not implemented |
| 21  | alias にあるが exports にないエントリを検出する              | FAIL | Not implemented |
| 22  | 全 exports サブパスが typesVersions に存在する場合は差分なし | FAIL | Not implemented |
| 23  | exports にあるが typesVersions にないエントリを検出する      | FAIL | Not implemented |

### レポーター関数（#24-26、3件FAIL）

| #   | テストケース                                    | 結果 | エラー          |
| --- | ----------------------------------------------- | ---- | --------------- |
| 24  | 不整合なしの場合「ALL CHECKS PASSED」を出力する | FAIL | Not implemented |
| 25  | 不整合ありの場合、差分エントリを一覧出力する    | FAIL | Not implemented |
| 26  | 複数チェックの不整合を全て出力する              | FAIL | Not implemented |

### 統合テスト（#27-28、2件FAIL）

| #   | テストケース                                             | 結果 | エラー          |
| --- | -------------------------------------------------------- | ---- | --------------- |
| 27  | 3層が完全一致する場合 process.exitCode は 0 または未設定 | FAIL | Not implemented |
| 28  | 不整合がある場合 process.exitCode は 1                   | FAIL | Not implemented |

## P9 対策確認

- 各テストケースで `beforeEach` / `afterEach` により `vi.restoreAllMocks()` でモック状態をリセット
- テスト間で状態を共有していない

## 結論

TDD Red フェーズ完了。27/28 テストが FAIL であることを確認。Phase 5（Green）で本体実装を行い、全28件をPASSさせる。
