# Phase 2 成果物: 実装順序と分割方針

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスク名 | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 |
| 作成日   | 2026-03-08                                     |
| 前提状況 | GAP-01〜06 の全防御が実装済み                  |

## 1. GAP-ID ベースの実装順序と現在の状況

### 実装フェーズ 1: Renderer 正規化（GAP-01, GAP-03）-- 実装済み

| 項目         | 内容                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| 対象ファイル | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                                   |
| 変更内容     | `loadProviders` 内の3層防御: (1) data nullish 吸収、(2) `Array.isArray` ガード、(3) type predicate フィルタ |
| ステータス   | 実装済み                                                                                                    |

### 実装フェーズ 2: try-catch ラップ（GAP-04）-- 実装済み

| 項目         | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| 対象ファイル | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`    |
| 変更内容     | `loadProviders` 関数全体を try-catch でラップ。catch 節でエラー state に遷移 |
| ステータス   | 実装済み                                                                     |

### 実装フェーズ 3: 空配列フィードバック（GAP-02）-- 実装済み

| 項目         | 内容                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| 対象ファイル | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                 |
| 変更内容     | `ALL_PROVIDERS.map()` で常に4プロバイダーを未登録として表示（空メッセージ不要の設計判断） |
| ステータス   | 実装済み                                                                                  |

### 実装フェーズ 4: Main 側バリデーション（GAP-05）-- 実装済み

| 項目         | 内容                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------- |
| 対象ファイル | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                                                 |
| 変更内容     | `apiKey:list` ハンドラの `Array.isArray(result?.providers)` チェック + registeredCount 再計算 |
| ステータス   | 実装済み                                                                                      |

### 実装フェーズ 5: profileHandlers パターン統一（GAP-06）-- 実装済み

| 項目         | 内容                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| 対象ファイル | `apps/desktop/src/main/ipc/profileHandlers.ts`                                   |
| 変更内容     | 3箇所全てで `Array.isArray(user.identities) ? user.identities : []` パターン使用 |
| ステータス   | 実装済み                                                                         |

## 2. テスト実装状況

| テスト ID    | 対応 GAP | テスト内容                                                   | ステータス |
| ------------ | -------- | ------------------------------------------------------------ | ---------- |
| RED-01       | --       | `window.electronAPI` が undefined                            | 実装済み   |
| RED-01b      | --       | `window.electronAPI.apiKey` が undefined                     | 実装済み   |
| RED-02       | --       | `apiKey.list()` が undefined を返却                          | 実装済み   |
| RED-02b      | --       | `apiKey.list()` が null を返却                               | 実装済み   |
| RED-03       | --       | `providers` が配列でない                                     | 実装済み   |
| RED-03b      | --       | `providers` が undefined                                     | 実装済み   |
| TEST-GAP-01  | GAP-01   | `result.data` が `undefined` の場合、エラーメッセージ表示    | 実装済み   |
| TEST-GAP-01b | GAP-01   | `result.data` が `null` の場合、エラーメッセージ表示         | 実装済み   |
| TEST-GAP-02  | GAP-02   | `providers` が空配列の場合、全プロバイダーが未登録として表示 | 実装済み   |
| TEST-GAP-03a | GAP-03   | `provider` フィールドが欠損した要素がスキップされる          | 実装済み   |
| TEST-GAP-03b | GAP-03   | `status` フィールドが欠損した要素がスキップされる            | 実装済み   |
| TEST-GAP-03c | GAP-03   | 正常要素と malformed 要素が混在する場合、正常要素のみ使用    | 実装済み   |
| TEST-GAP-04  | GAP-04   | `apiKey.list()` が reject した場合、エラーメッセージ表示     | 実装済み   |

## 3. 残存する検証作業

全 GAP の実装とテストが完了済みのため、以下の検証作業が Phase 4-9 の主要作業:

| Phase   | 検証作業                                                 |
| ------- | -------------------------------------------------------- |
| Phase 4 | テストケース一覧の確認と追加テスト設計（不足があれば）   |
| Phase 5 | 実装済みコードの最終確認                                 |
| Phase 6 | カバレッジ不足箇所のテスト追加                           |
| Phase 7 | Line Coverage 80%+ / Branch Coverage 60%+ の確認         |
| Phase 8 | リファクタリング検討（type predicate の P49 準拠確認等） |
| Phase 9 | Lint / TypeCheck / 全テスト実行                          |

## 4. リスクと緩和策

| リスク                                                             | 影響度 | 緩和策                                                                                   |
| ------------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------- |
| テスト実行時に GAP テストが FAIL する可能性                        | Low    | 既に実装済みコードに対応するテストのため、基本的に PASS する。FAIL 時は Phase 6 で修正   |
| カバレッジが基準未達の可能性                                       | Medium | Phase 6-7 で追加テストを設計。特に `apiKeyHandlers.ts` の GAP-05 テストの存在を確認      |
| `profileHandlers.ts` の変更が profile 機能の回帰を引き起こす可能性 | Low    | 変更は `?? []` → `Array.isArray` パターンへの統一のみ。null/undefined に対する動作は同一 |

## 5. 完了基準

| 基準                                       | 検証方法                                                                                       | 状況       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- | ---------- |
| GAP-01〜04 の Renderer テストが全 PASS     | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/organisms/ApiKeysSection` | 要確認     |
| 既存テスト RED-01〜RED-03b が引き続き PASS | 上記テスト実行で確認                                                                           | 要確認     |
| TypeScript 型チェック PASS                 | `pnpm --filter @repo/desktop typecheck`                                                        | 要確認     |
| ESLint PASS                                | `pnpm --filter @repo/desktop lint`                                                             | 要確認     |
| Line Coverage 80%+                         | vitest --coverage で確認                                                                       | Phase 7 で |
