# Phase 1 成果物: 要件定義

## メタ情報

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| タスク名 | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| 作成日   | 2026-03-07                                       |
| 対象     | 設定画面 apiKey.list 契約防御と providers 正規化 |

## 1. 既実装範囲の整理

PR #1036/#1038 で以下の防御が実装済み:

| 防御 ID | レイヤー | 実装内容                                                                          | ステータス |
| ------- | -------- | --------------------------------------------------------------------------------- | ---------- |
| DEF-01  | Renderer | `Array.isArray(result.data.providers)` ガード                                     | 実装済み   |
| DEF-02  | Renderer | `window.electronAPI?.apiKey` 存在チェック                                         | 実装済み   |
| DEF-03  | テスト   | RED-01〜RED-03b: providers 非配列 / electronAPI 未定義 / apiKey 未定義（6ケース） | 実装済み   |

## 2. 残存カバレッジ gap（機能要件）

### GAP-01: `result.data` が undefined/null の場合

| 項目       | 内容                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| 異常ケース | `apiKey.list()` の戻り値で `result.data` 自体が `undefined` または `null`                              |
| 影響箇所   | `ApiKeysSection/index.tsx` -- `result.data.providers` アクセス時に TypeError                           |
| リスク     | High                                                                                                   |
| 要件       | `result.data` が falsy の場合、空の `ProviderStatus[]` にフォールバックし TypeError を発生させないこと |

### GAP-02: providers が空配列の場合

| 項目       | 内容                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| 異常ケース | `result.data.providers` が `[]`（空配列）                                                |
| 影響箇所   | UI 表示が空になりユーザーに状態が伝わらない                                              |
| リスク     | Medium                                                                                   |
| 要件       | 空配列時に「プロバイダーが登録されていません」等のフィードバックメッセージを表示すること |

### GAP-03: ProviderStatus 要素の shape malformed

| 項目       | 内容                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| 異常ケース | providers 配列の要素で `provider` / `status` フィールドが欠損                                |
| 影響箇所   | `.find()` / `.map()` 内で undefined アクセス                                                 |
| リスク     | High                                                                                         |
| 要件       | 必須フィールド（`provider`, `status`）が欠損した要素をスキップし、正常な要素のみ表示すること |

### GAP-04: apiKey.list() が reject する場合

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| 異常ケース | `apiKey.list()` が Promise rejection（ネットワークエラー、IPC エラー等） |
| 影響箇所   | 未 catch のまま SettingsView 全体がクラッシュする可能性                  |
| リスク     | High                                                                     |
| 要件       | rejection 時に try-catch でキャッチし、エラー状態を UI に表示すること    |

### GAP-05: Main 側 providers 配列バリデーション不在

| 項目       | 内容                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------- |
| 異常ケース | Main Process `apiKeyHandlers` が providers の配列検証を行っていない                           |
| 影響箇所   | 不正データがそのまま Renderer に到達                                                          |
| リスク     | Medium                                                                                        |
| 要件       | `apiKey:list` ハンドラで `providers` が配列でない場合、空配列に正規化してレスポンスを返すこと |

### GAP-06: profileHandlers の防御パターン不統一

| 項目       | 内容                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| 異常ケース | `profileHandlers` の `identities ?? []` が `Array.isArray` パターンと不統一                                                |
| 影響箇所   | 防御パターンの一貫性欠如                                                                                                   |
| リスク     | Low                                                                                                                        |
| 要件       | `identities ?? []` を `Array.isArray(identities) ? identities : []` に変更し、プロジェクト全体の防御パターンを統一すること |

## 3. 非機能要件

| NFR ID | カテゴリ         | 要件                                                                                                                   |
| ------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| NFR-01 | 型安全           | non-null assertion (`!`) を使用せず、実行時型検証（`Array.isArray` / optional chaining）で安全性を保証する（P48 準拠） |
| NFR-02 | IPC 契約整合     | ipc-contract-checklist 6段チェック（CC-1〜CC-6）に準拠する                                                             |
| NFR-03 | 後方互換         | 既存テスト RED-01〜RED-03b（6ケース）を破壊しない                                                                      |
| NFR-04 | パターン統一     | Renderer / Main の配列防御パターンを `Array.isArray` に統一する                                                        |
| NFR-05 | テストカバレッジ | GAP-01〜04 に対応するテストを追加し、Line Coverage 80% 以上を維持する                                                  |

## 4. 影響範囲

| ファイル                                                                                          | 変更種別 | GAP 対応           |
| ------------------------------------------------------------------------------------------------- | -------- | ------------------ |
| `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                         | 修正     | GAP-01, 02, 03, 04 |
| `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx` | 追加     | GAP-01, 02, 03, 04 |
| `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                                                     | 修正     | GAP-05             |
| `apps/desktop/src/main/ipc/profileHandlers.ts`                                                    | 修正     | GAP-06             |
