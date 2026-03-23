# Phase 2: 設計 -- UI isAvailable フィルタリング実装

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 2                        |
| 機能名     | ui-isavailable-filtering |
| タスクID   | TASK-LLM-MOD-08          |
| 作成日     | 2026-03-23               |
| 依存 Phase | Phase 1（要件定義）      |

## 目的

Phase 1 で確定した要件（R-01〜R-04）を満たすための具体的な変更設計を定義する。変更箇所は `InlineModelSelector.tsx` の1行追加のみであり、影響範囲が最小限に抑えられる設計を確定する。

## 実行タスク

### Task 2-1: 変更箇所の設計

**変更箇所**: `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` L334-335

現行コード:

```typescript
// Props override Store (for standalone usage / testing)
const allProviders = providersProp ?? storeProviders ?? [];
```

変更後のコード:

```typescript
// Props override Store (for standalone usage / testing)
// APIキー設定済みのプロバイダーのみ表示（P62: 未設定プロバイダーは非表示）
const allProviders = providersProp ?? storeProviders ?? [];
const providers = allProviders.filter((p) => p.isAvailable);
```

変更点: `allProviders` から `isAvailable === true` のプロバイダーのみを `providers` として抽出する1行を追加する。以降のコンポーネント内では `providers` を使用し、`allProviders` を直接参照しない。

### Task 2-2: コンポーネント内部への影響分析

| 参照箇所                   | 変更前の参照変数 | 変更後の参照変数 | 影響                           |
| -------------------------- | ---------------- | ---------------- | ------------------------------ |
| L355: selectedProvider     | providers        | providers        | フィルタ後の配列から検索       |
| L369: handleProviderSelect | providers        | providers        | フィルタ後の配列から検索       |
| L485: SelectorDropdown     | providers        | providers        | フィルタ後のプロバイダーを表示 |

既存コードで `providers` 変数名は使用されていないため、新たに `providers` を追加しても名前衝突は発生しない（元々 `allProviders` が直接使用されていた箇所を `providers` に置き換える）。

### Task 2-3: UI 動作の使い分け設計

| コンポーネント      | フィルタ適用 | 理由                                                       |
| ------------------- | ------------ | ---------------------------------------------------------- |
| InlineModelSelector | あり         | チャット画面では使用不可なプロバイダーを表示する意味がない |
| ProviderSelector    | なし         | 設定画面ではAPIキー設定を促すためにグレーアウト表示が必要  |
| LLMSelectorPanel    | なし         | ProviderSelector に委譲しているため変更不要                |

### Task 2-4: ゼロプロバイダー時の挙動設計

`providers.filter((p) => p.isAvailable)` の結果が空配列の場合：

1. `selectedProvider` が `undefined` になる（`providers.find()` でヒットしない）
2. `SelectorTrigger` の `providerName` と `modelName` が `undefined` になる
3. `hasSelection` が `false` になる
4. 表示テキストが「モデルを選択」になる
5. `SelectorDropdown` の providers が空配列 → 「プロバイダーがありません」メッセージを表示

この挙動は既存の空配列ハンドリングロジックにより自動的に実現される。追加実装は不要。

### Task 2-5: 変更ファイル一覧

| ファイルパス                                                       | 変更種別 | 変更内容                 |
| ------------------------------------------------------------------ | -------- | ------------------------ |
| `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` | 更新     | isAvailable フィルタ追加 |

変更しないファイル（本タスクのスコープ外）:

- `apps/desktop/src/renderer/components/llm/ProviderSelector.tsx`
- `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`
- `apps/desktop/src/main/handlers/llm.ts`
- `apps/desktop/src/renderer/store/slices/llmSlice.ts`

## 参照資料

| 資料名           | パス                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義 | `docs/30-workflows/llm-provider-model-modernization/tasks/step-06-par-task-08-ui-isavailable-filtering/phase-1-requirements.md` |
| 現行実装         | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                                                              |

## 成果物

| 成果物               | パス                                                                                                                      | 形式     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------- |
| 設計書（本ファイル） | `docs/30-workflows/llm-provider-model-modernization/tasks/step-06-par-task-08-ui-isavailable-filtering/phase-2-design.md` | Markdown |

## 完了条件

- [x] 変更箇所（L334-335）を特定し、変更前後のコードを定義した
- [x] コンポーネント内部への影響を分析し、名前衝突がないことを確認した
- [x] UI 動作の使い分け（InlineModelSelector/ProviderSelector/LLMSelectorPanel）を設計した
- [x] ゼロプロバイダー時の挙動が既存ロジックで対応されることを確認した
- [x] 変更対象が 1 ファイル・1 行追加のみであることを確認した

## 統合テスト連携

Phase 2 では統合テストは実施しない。Phase 4 でテストを設計する際に、本 Phase のフィルタリング設計を参照する。

## 次の Phase

Phase 3: 設計レビュー（`phase-3-design-review.md`）
