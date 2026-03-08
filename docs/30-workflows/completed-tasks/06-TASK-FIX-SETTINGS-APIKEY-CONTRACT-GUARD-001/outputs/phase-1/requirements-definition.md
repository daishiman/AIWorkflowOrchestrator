# Phase 1 成果物: 要件定義

## メタ情報

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| タスク名 | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| 作成日   | 2026-03-08                                       |
| 対象     | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 前提状況 | GAP-01〜06 の全防御が実装済み                    |

## 1. 既実装範囲の整理

PR #1036/#1038 および後続実装で以下の防御が全て実装済み:

| 防御 ID | レイヤー | 実装内容                                                                                        | ステータス |
| ------- | -------- | ----------------------------------------------------------------------------------------------- | ---------- |
| DEF-01  | Renderer | `Array.isArray(result.data.providers)` ガード（`loadProviders` 内で正規化）                     | 実装済み   |
| DEF-02  | Renderer | `window.electronAPI?.apiKey` 存在チェック + `apiKeyApi?.list` 存在チェック                      | 実装済み   |
| DEF-03  | Renderer | `result?.success && result?.data` で data undefined/null を処理                                 | 実装済み   |
| DEF-04  | Renderer | `.filter()` で ProviderStatus の必須フィールド (`provider`, `status`) を検証する type predicate | 実装済み   |
| DEF-05  | Renderer | try-catch で `apiKey.list()` の rejection をハンドリング                                        | 実装済み   |
| DEF-06  | Main     | `Array.isArray(result?.providers)` バリデーション（P48 準拠）                                   | 実装済み   |
| DEF-07  | Main     | `profileHandlers.ts` で `Array.isArray(user.identities)` パターン使用（3箇所）                  | 実装済み   |
| DEF-08  | テスト   | RED-01〜RED-03b: electronAPI未定義 / providers 非配列等（6ケース）                              | 実装済み   |
| DEF-09  | テスト   | GAP-01〜GAP-04: data undefined/null / 空配列 / 要素欠損 / reject（7ケース）                     | 実装済み   |

## 2. GAP 定義と実装状況

### GAP-01: `result.data` が undefined/null の場合（実装済み）

| 項目         | 内容                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| 異常ケース   | `apiKey.list()` の戻り値で `result.data` 自体が `undefined` または `null`                   |
| 実装箇所     | `ApiKeysSection/index.tsx`: `if (result?.success && result?.data)` チェック                 |
| テストケース | GAP-01 (`result.data` undefined), GAP-01b (`result.data` null) -- `ApiKeysSection.test.tsx` |
| ステータス   | 実装済み + テスト済み                                                                       |

### GAP-02: providers が空配列の場合（実装済み / 仕様上フィードバック不要）

| 項目         | 内容                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| 異常ケース   | `result.data.providers` が `[]`（空配列）                                               |
| 実装箇所     | `ApiKeysSection/index.tsx`: `ALL_PROVIDERS.map()` で常に4プロバイダーを未登録として表示 |
| 設計判断     | 空配列でも `ALL_PROVIDERS` から未登録状態で表示するため、空メッセージ不要               |
| テストケース | GAP-02 -- 全プロバイダーが未登録として表示されることを確認                              |
| ステータス   | 実装済み + テスト済み                                                                   |

### GAP-03: ProviderStatus 要素の shape malformed（実装済み）

| 項目         | 内容                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| 異常ケース   | providers 配列の要素で `provider` / `status` フィールドが欠損                             |
| 実装箇所     | `ApiKeysSection/index.tsx`: P49 準拠の type predicate フィルタ（`in` 演算子で実行時検証） |
| テストケース | GAP-03 (provider欠損), GAP-03b (status欠損), GAP-03c (混在)                               |
| ステータス   | 実装済み + テスト済み                                                                     |

### GAP-04: apiKey.list() が reject する場合（実装済み）

| 項目         | 内容                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| 異常ケース   | `apiKey.list()` が Promise rejection                                                       |
| 実装箇所     | `ApiKeysSection/index.tsx`: try-catch で catch し error state に遷移、エラーメッセージ表示 |
| テストケース | GAP-04 -- reject 時のエラー表示・画面継続描画を確認                                        |
| ステータス   | 実装済み + テスト済み                                                                      |

### GAP-05: Main 側 providers 配列バリデーション（実装済み）

| 項目       | 内容                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| 異常ケース | Main Process `apiKeyHandlers` の `apiKey:list` で providers が非配列                                       |
| 実装箇所   | `apiKeyHandlers.ts`: `Array.isArray(result?.providers) ? result.providers : []` + `registeredCount` 再計算 |
| ステータス | 実装済み                                                                                                   |

### GAP-06: profileHandlers の Array.isArray パターン統一（実装済み）

| 項目       | 内容                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------- |
| 異常ケース | `profileHandlers.ts` の identities 配列防御パターン不統一                                     |
| 実装箇所   | `profileHandlers.ts` L435-437, L566-567, L1258-1259: 3箇所全てで `Array.isArray` パターン使用 |
| ステータス | 実装済み                                                                                      |

## 3. 非機能要件

| NFR ID | カテゴリ         | 要件                                                                  | 状況     |
| ------ | ---------------- | --------------------------------------------------------------------- | -------- |
| NFR-01 | 型安全           | non-null assertion (`!`) 不使用、実行時型検証で安全性保証（P48 準拠） | 充足済み |
| NFR-02 | IPC 契約整合     | ipc-contract-checklist 6段チェック（CC-1〜CC-6）に準拠                | 充足済み |
| NFR-03 | 後方互換         | 既存テスト RED-01〜RED-03b（6ケース）を破壊しない                     | 充足済み |
| NFR-04 | パターン統一     | Renderer / Main の配列防御パターンを `Array.isArray` に統一           | 充足済み |
| NFR-05 | テストカバレッジ | GAP-01〜04 に対応するテストケースが存在し、全 PASS であること         | 充足済み |

## 4. 残存作業

本タスクの防御実装は全て完了済みのため、テストカバレッジの検証と品質保証が主な残存作業:

| 作業項目                  | 内容                                                         |
| ------------------------- | ------------------------------------------------------------ |
| カバレッジ計測            | GAP-01〜06 対応のテストが Line Coverage 80% 以上を維持するか |
| 回帰テスト確認            | RED-01〜RED-03b + GAP-01〜04 の全テストが PASS すること      |
| コードレビュー（Phase 3） | 防御パターンの一貫性・IPC 契約整合の最終確認                 |

## 5. 影響範囲

| ファイル                                                                                          | 変更種別 | GAP 対応           | 状況     |
| ------------------------------------------------------------------------------------------------- | -------- | ------------------ | -------- |
| `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                         | 修正     | GAP-01, 02, 03, 04 | 実装済み |
| `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx` | 追加     | GAP-01, 02, 03, 04 | 実装済み |
| `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                                                     | 修正     | GAP-05             | 実装済み |
| `apps/desktop/src/main/ipc/profileHandlers.ts`                                                    | 確認     | GAP-06             | 実装済み |
