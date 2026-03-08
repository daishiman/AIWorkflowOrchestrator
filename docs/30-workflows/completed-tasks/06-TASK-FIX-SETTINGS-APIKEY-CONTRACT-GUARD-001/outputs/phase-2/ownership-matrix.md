# Phase 2 成果物: 責務分担表

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスク名 | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 |
| 作成日   | 2026-03-08                                     |
| 前提状況 | GAP-01〜06 の全防御が実装済み                  |

## 1. 既実装 / 追加変更 分離マトリクス

### Renderer 層

| ファイル                   | 責務                                      | 実装内容                                                                          | GAP 対応   | 状況     |
| -------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------- | ---------- | -------- |
| `ApiKeysSection/index.tsx` | `window.electronAPI?.apiKey` 存在チェック | optional chaining + `apiKeyApi?.list` チェックで存在確認                          | --         | 実装済み |
| `ApiKeysSection/index.tsx` | `result.data` nullish 吸収                | `result?.success && result?.data` で data undefined/null を else 分岐に誘導       | GAP-01     | 実装済み |
| `ApiKeysSection/index.tsx` | `providers` 配列チェック                  | `Array.isArray(result.data.providers)` + 非配列時は空配列 + warn ログ             | GAP-01     | 実装済み |
| `ApiKeysSection/index.tsx` | 要素 shape フィルタ                       | P49 準拠 type predicate（`in` 演算子 + typeof）で provider/status を検証          | GAP-03     | 実装済み |
| `ApiKeysSection/index.tsx` | 空配列時の表示                            | `ALL_PROVIDERS.map()` で常に4プロバイダーを未登録として表示                       | GAP-02     | 実装済み |
| `ApiKeysSection/index.tsx` | Promise rejection ハンドリング            | try-catch で `apiKey.list()` をラップ、catch でエラー state 遷移                  | GAP-04     | 実装済み |
| `ApiKeysSection.test.tsx`  | 既存異常系テスト                          | RED-01〜RED-03b（6ケース）: electronAPI 未定義 / providers 非配列等               | --         | 実装済み |
| `ApiKeysSection.test.tsx`  | GAP 対応テスト                            | GAP-01/01b/02/03/03b/03c/04（7ケース）: data nullish / 空配列 / 要素欠損 / reject | GAP-01〜04 | 実装済み |

### Main Process 層

| ファイル             | 責務                         | 実装内容                                                                                    | GAP 対応 | 状況     |
| -------------------- | ---------------------------- | ------------------------------------------------------------------------------------------- | -------- | -------- |
| `apiKeyHandlers.ts`  | `apiKey:list` レスポンス生成 | `Array.isArray(result?.providers)` チェック + 空配列フォールバック + registeredCount 再計算 | GAP-05   | 実装済み |
| `profileHandlers.ts` | `identities` 配列防御        | 3箇所全てで `Array.isArray(user.identities) ? user.identities : []` パターン使用            | GAP-06   | 実装済み |

### Shared / Preload 層

| ファイル                    | 責務                             | 実装内容 | GAP 対応 | 状況     |
| --------------------------- | -------------------------------- | -------- | -------- | -------- |
| `ProviderStatus` 型定義     | providers 要素の型               | 既存定義 | --       | 変更不要 |
| `ProviderListResult` 型定義 | list レスポンスの data 型        | 既存定義 | --       | 変更不要 |
| Preload `apiKey.ts`         | `safeInvoke` 経由の IPC 呼び出し | 既存実装 | --       | 変更不要 |

## 2. 変更オーナーシップ

全ての変更が実装済みのため、残存作業はテスト実行とカバレッジ確認:

| 作業 ID | 内容                                            | 担当                   | 状況             |
| ------- | ----------------------------------------------- | ---------------------- | ---------------- |
| VRF-01  | GAP-01〜04 テスト PASS 確認                     | SubAgent-Test-Fallback | Phase 4-7 で実施 |
| VRF-02  | RED-01〜RED-03b 回帰テスト PASS 確認            | SubAgent-Test-Fallback | Phase 4-7 で実施 |
| VRF-03  | Line Coverage 80% 以上確認                      | SubAgent-Test-Fallback | Phase 7 で実施   |
| VRF-04  | `apiKeyHandlers.ts` GAP-05 防御のコードレビュー | SubAgent-Contract-IPC  | Phase 3 で完了   |
| VRF-05  | `profileHandlers.ts` GAP-06 パターン統一確認    | SubAgent-Contract-IPC  | Phase 3 で完了   |

## 3. 既実装テストとの互換性

| 既存テスト ID | テスト内容                           | 互換性 | 理由                                                            |
| ------------- | ------------------------------------ | ------ | --------------------------------------------------------------- |
| RED-01        | `window.electronAPI` が未定義        | 互換   | `loadProviders` 先頭の `apiKeyApi` 存在チェックで処理           |
| RED-01b       | `window.electronAPI.apiKey` が未定義 | 互換   | 同上                                                            |
| RED-02        | `apiKey.list()` が undefined を返却  | 互換   | `result?.success && result?.data` チェックで else 分岐に入る    |
| RED-02b       | `apiKey.list()` が null を返却       | 互換   | 同上                                                            |
| RED-03        | `providers` が配列でない             | 互換   | `Array.isArray(result.data.providers)` で空配列にフォールバック |
| RED-03b       | `providers` が undefined             | 互換   | 同上                                                            |

## 4. 依存関係

```
全 GAP 実装済みのため、依存関係は検証作業のみ:

VRF-01 (テスト PASS 確認)     ← VRF-03 (カバレッジ確認) : カバレッジはテスト結果に依存
VRF-04 (Main レビュー)        : 独立
VRF-05 (profileHandlers 確認) : 独立
```
