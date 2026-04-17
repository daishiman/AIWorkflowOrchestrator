# Phase 1 成果物: 要件定義書

## タスク: TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY

## 問題定義

### 影響コンポーネント

| コンポーネント      | ファイル                                                         | 状態                      | 本タスク対象 |
| ------------------- | ---------------------------------------------------------------- | ------------------------- | ------------ |
| InlineModelSelector | apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx | description 未表示        | ✅ 対象      |
| ModelSelector       | apps/desktop/src/renderer/components/llm/ModelSelector.tsx       | description 表示済み      | ❌ baseline  |
| ProviderSelector    | apps/desktop/src/renderer/components/llm/ProviderSelector.tsx    | provider description なし | ❌ 対象外    |
| LLMSelectorPanel    | apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx    | integration surface       | ❌ 対象外    |

### 根本原因

`packages/shared/src/types/llm/schemas/provider.ts` の `LLMModelSchema` に `description: z.string().optional()` が既に定義済みだが、`InlineModelSelector` の `SelectorDropdown` コンポーネントがそのフィールドをレンダリングしていない。

## 受入条件

| ID   | 内容                                                                        | 検証方法                     |
| ---- | --------------------------------------------------------------------------- | ---------------------------- |
| AC-1 | InlineModelSelector で description フィールドが表示される                   | T-1, T-4, T-12 テスト        |
| AC-2 | description が undefined または空文字列の場合、UIレイアウトが崩れず安全処理 | T-2, T-3, T-10 テスト        |
| AC-3 | 既存の model selection フロー・アクセシビリティが壊れていない               | T-5, T-13, T-14, T-15 テスト |
| AC-4 | 既存テストへ description 表示の期待値が追加されている                       | T-1〜T-15 テストケース追加   |
| AC-5 | TypeScript 型エラー・ESLint エラーなし                                      | typecheck + lint PASS        |
| AC-6 | docs と UI の文言が一致している                                             | 仕様書と実装の目視確認       |

## スコープ境界

### 含む

- InlineModelSelector への description 表示実装
- tooltip / aria-describedby / sr-only による補助表示
- 空文字・undefined の安全処理
- 既存テストへの description 期待値追加
- T-1〜T-15 テストケース追加

### 含まない

- description フィールドの型定義変更（既存のまま）
- ModelSelector / ProviderSelector / LLMSelectorPanel の実装変更
- Main Process 実装変更
- IPC 契約変更
- PR 作成（ユーザー承認後のみ）

## 命名規則

| 種別                   | 規則                               | 例                           |
| ---------------------- | ---------------------------------- | ---------------------------- |
| コンポーネントファイル | PascalCase                         | InlineModelSelector.tsx      |
| テストファイル         | `__tests__/ComponentName.test.tsx` | InlineModelSelector.test.tsx |
| CSS クラス             | Tailwind CSS utility               | sr-only, truncate            |
| 型定義参照             | LLMModel 型                        | model.description            |

## 安全処理の要件

- `description` が `undefined` → 補助表示を出さない
- `description` が `null`（型違反） → description なし扱い
- `description` が `""` → `trim()` で除外する
- `description` が空白のみ → `trim()` で除外する

## Phase 1 完了確認

- [x] description 未表示問題が影響コンポーネントごとに固定されている
- [x] AC-1〜AC-6 が検証可能な形で定義されている
- [x] 含む/含まないが明確である
- [x] 命名規則が記録されている
- [x] 本 Phase 内の全タスクを 100% 実行完了
