# Phase 1 成果物: 受入基準

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスク名 | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 |
| 作成日   | 2026-03-08                                     |
| 前提状況 | GAP-01〜06 の全防御が実装済み                  |

## 受入基準一覧

### AC-01: result.data undefined/null 時の TypeError 防止

| 項目       | 内容                                                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GAP 対応   | GAP-01                                                                                                                                                               |
| 判定条件   | `apiKey.list()` が `{ success: true, data: undefined }` または `{ success: true, data: null }` を返した場合、TypeError が発生せず providers が空として処理されること |
| Yes 条件   | `result?.success && result?.data` チェックにより data 不在時は else 分岐に入り、エラーメッセージを表示                                                               |
| No 条件    | `result.data.providers` アクセス時に `TypeError: Cannot read properties of undefined` が発生する                                                                     |
| 検証方法   | `ApiKeysSection.test.tsx` の GAP-01, GAP-01b テストケースが PASS すること                                                                                            |
| 現在の状況 | **PASS** -- 実装済み + テスト済み                                                                                                                                    |

### AC-02: 空配列時のフィードバック表示

| 項目       | 内容                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| GAP 対応   | GAP-02                                                                                                 |
| 判定条件   | `providers` が空配列 `[]` の場合、ユーザーに状態を伝える表示がされること                               |
| Yes 条件   | `ALL_PROVIDERS.map()` により全4プロバイダーが「未登録」バッジ付きで表示される（silent failure でない） |
| No 条件    | 画面が空白のまま何も表示されない（silent failure）                                                     |
| 検証方法   | `ApiKeysSection.test.tsx` の GAP-02 テストケースで4プロバイダーの「未登録」表示を確認                  |
| 現在の状況 | **PASS** -- 実装済み + テスト済み                                                                      |

### AC-03: ProviderStatus 要素欠損時のスキップ

| 項目       | 内容                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| GAP 対応   | GAP-03                                                                                                                                 |
| 判定条件   | `providers` 配列に `provider` または `status` フィールドが欠損した要素が含まれる場合、その要素をスキップし正常な要素のみ使用されること |
| Yes 条件   | P49 準拠の type predicate（`in` 演算子）で malformed 要素が除外され、正常要素のみ使用される                                            |
| No 条件    | malformed 要素の `provider` / `status` アクセス時に undefined 参照エラーが発生する                                                     |
| 検証方法   | `ApiKeysSection.test.tsx` の GAP-03, GAP-03b, GAP-03c テストケースが PASS すること                                                     |
| 現在の状況 | **PASS** -- 実装済み + テスト済み                                                                                                      |

### AC-04: apiKey.list() reject 時のエラー表示

| 項目       | 内容                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------- |
| GAP 対応   | GAP-04                                                                                             |
| 判定条件   | `apiKey.list()` が Promise rejection した場合、ApiKeysSection がクラッシュせずエラー表示されること |
| Yes 条件   | try-catch でキャッチされ、エラーメッセージが UI に表示される。画面は継続描画される                 |
| No 条件    | unhandled rejection により画面全体がクラッシュまたは白画面になる                                   |
| 検証方法   | `ApiKeysSection.test.tsx` の GAP-04 テストケースが PASS すること                                   |
| 現在の状況 | **PASS** -- 実装済み + テスト済み                                                                  |

### AC-05: Main 側 providers 配列バリデーション

| 項目       | 内容                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| GAP 対応   | GAP-05                                                                                                          |
| 判定条件   | Main Process の `apiKey:list` ハンドラで `providers` が非配列の場合、空配列に正規化して正常レスポンスを返すこと |
| Yes 条件   | `Array.isArray(result?.providers)` チェックが存在し、非配列時は `{ providers: [], registeredCount: 0 }` を返す  |
| No 条件    | 非配列の `providers` がそのまま Renderer に渡される                                                             |
| 検証方法   | `apiKeyHandlers.ts` のコードレビューで `Array.isArray` チェックの存在を確認                                     |
| 現在の状況 | **PASS** -- 実装済み                                                                                            |

### AC-06: profileHandlers の Array.isArray パターン統一

| 項目       | 内容                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| GAP 対応   | GAP-06                                                                                       |
| 判定条件   | `profileHandlers.ts` の `identities` 取得箇所で `Array.isArray` パターンが使用されていること |
| Yes 条件   | 3箇所全てで `Array.isArray(user.identities) ? user.identities : []` パターンが使用されている |
| No 条件    | `identities ?? []`（nullish coalescing のみ）が残っている                                    |
| 検証方法   | `profileHandlers.ts` L435, L566, L1258 のコードレビューで確認                                |
| 現在の状況 | **PASS** -- 実装済み（3箇所全て）                                                            |

### AC-07: GAP-01〜04 テスト全 PASS + 既存テスト非破壊

| 項目       | 内容                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| GAP 対応   | GAP-01〜04（横断）                                                                                          |
| 判定条件   | GAP-01〜04 テストケース（7件）が全て PASS し、かつ既存テスト RED-01〜RED-03b（6件）が引き続き PASS すること |
| Yes 条件   | `pnpm --filter @repo/desktop exec vitest run` で該当テストが全 PASS                                         |
| No 条件    | いずれかのテストが FAIL する                                                                                |
| 検証方法   | CI / ローカルでテスト実行し、全ケース PASS を確認                                                           |
| 現在の状況 | テスト実行による最終確認が必要                                                                              |

## AC と GAP の対応マトリクス

| AC    | GAP-01 | GAP-02 | GAP-03 | GAP-04 | GAP-05 | GAP-06 |
| ----- | ------ | ------ | ------ | ------ | ------ | ------ |
| AC-01 | o      |        |        |        |        |        |
| AC-02 |        | o      |        |        |        |        |
| AC-03 |        |        | o      |        |        |        |
| AC-04 |        |        |        | o      |        |        |
| AC-05 |        |        |        |        | o      |        |
| AC-06 |        |        |        |        |        | o      |
| AC-07 | o      | o      | o      | o      |        |        |
