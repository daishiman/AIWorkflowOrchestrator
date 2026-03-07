# Phase 2 成果物: 実装順序と分割方針

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスク名 | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 |
| 作成日   | 2026-03-07                                     |

## 1. GAP-ID ベースの実装順序

### 実装フェーズ 1: Renderer 正規化（GAP-01, GAP-03）

| 項目         | 内容                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 対象ファイル | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                                               |
| 変更内容     | `normalizeProviders` 関数の追加。`data` の nullish チェック + `providers` 配列チェック + 要素の type predicate フィルタ |
| 依存関係     | なし（最初に実装）                                                                                                      |
| 見積もり     | 小（関数1つの追加）                                                                                                     |

### 実装フェーズ 2: try-catch ラップ（GAP-04）

| 項目         | 内容                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| 対象ファイル | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                              |
| 変更内容     | `fetchProviders` 関数内の `apiKey.list()` 呼び出しを try-catch でラップ。catch 節でエラー state に遷移 |
| 依存関係     | フェーズ 1 の `normalizeProviders` が try ブロック内で呼び出される                                     |
| 見積もり     | 小                                                                                                     |

### 実装フェーズ 3: 空配列フィードバック（GAP-02）

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| 対象ファイル | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`            |
| 変更内容     | `providers.length === 0` 判定を追加し、フィードバックメッセージを表示する JSX を追加 |
| 依存関係     | フェーズ 1 の正規化結果が空配列の場合に発動                                          |
| 見積もり     | 小                                                                                   |

### 実装フェーズ 4: Main 側バリデーション（GAP-05）

| 項目         | 内容                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| 対象ファイル | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                                               |
| 変更内容     | `apiKey:list` ハンドラのレスポンス生成時に `Array.isArray(result.providers)` チェックを追加 |
| 依存関係     | なし（Renderer 変更と独立）                                                                 |
| 見積もり     | 極小（1行の条件追加）                                                                       |

### 実装フェーズ 5: profileHandlers パターン統一（GAP-06）

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| 対象ファイル | `apps/desktop/src/main/ipc/profileHandlers.ts`                             |
| 変更内容     | `identities ?? []` を `Array.isArray(identities) ? identities : []` に変更 |
| 依存関係     | なし（他の変更と独立）                                                     |
| 見積もり     | 極小（1行の変更）                                                          |

## 2. テスト実装順序

テストは実装フェーズ 1〜3 の完了後に一括で作成する（TDD の Green フェーズ）。

| テスト ID    | 対応 GAP | テスト内容                                                       | 対応フェーズ |
| ------------ | -------- | ---------------------------------------------------------------- | ------------ |
| TEST-GAP-01a | GAP-01   | `result.data` が `undefined` の場合、空 providers でレンダリング | フェーズ 1   |
| TEST-GAP-01b | GAP-01   | `result.data` が `null` の場合、空 providers でレンダリング      | フェーズ 1   |
| TEST-GAP-02  | GAP-02   | `providers` が空配列の場合、フィードバックメッセージ表示         | フェーズ 3   |
| TEST-GAP-03a | GAP-03   | `provider` フィールドが欠損した要素がスキップされる              | フェーズ 1   |
| TEST-GAP-03b | GAP-03   | `status` フィールドが欠損した要素がスキップされる                | フェーズ 1   |
| TEST-GAP-03c | GAP-03   | 正常要素と malformed 要素が混在する場合、正常要素のみ表示        | フェーズ 1   |
| TEST-GAP-04  | GAP-04   | `apiKey.list()` が reject した場合、エラーメッセージ表示         | フェーズ 2   |
| TEST-GAP-05  | GAP-05   | Main ハンドラで非配列 providers が空配列に正規化される           | フェーズ 4   |

## 3. 並列実行可能な分割

```
並列グループ A（Renderer）:
  フェーズ 1 → フェーズ 2 → フェーズ 3  （直列: 依存関係あり）

並列グループ B（Main）:
  フェーズ 4  （独立）
  フェーズ 5  （独立）

実行順序:
  グループ A と グループ B は並列実行可能
```

## 4. リスクと緩和策

| リスク                                                                   | 影響度 | 緩和策                                                                                                                               |
| ------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `normalizeProviders` 導入による既存 `Array.isArray` チェックとの二重防御 | Low    | 既存チェックを `normalizeProviders` に統合し、呼び出し元を1箇所に集約                                                                |
| `fetchProviders` の try-catch 追加による既存テストのモック変更           | Low    | 既存テスト RED-01〜RED-03b は `window.electronAPI` レベルのモックであり、try-catch 追加で影響を受けない                              |
| `profileHandlers` 変更による profile 機能の回帰                          | Low    | DD-04: 変更は `?? []` → `Array.isArray` のみ。動作上は null/undefined の場合に同じ結果を返す。追加で非配列値（文字列等）も防御される |

## 5. 完了基準

| 基準                                       | 検証方法                                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| GAP-01〜04 の Renderer テストが全 PASS     | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/organisms/ApiKeysSection` |
| GAP-05 の Main テストが PASS               | `pnpm --filter @repo/desktop exec vitest run src/main/ipc/apiKeyHandlers`                      |
| 既存テスト RED-01〜RED-03b が引き続き PASS | 上記テスト実行で確認                                                                           |
| TypeScript 型チェック PASS                 | `pnpm --filter @repo/desktop typecheck`                                                        |
| ESLint PASS                                | `pnpm --filter @repo/desktop lint`                                                             |
