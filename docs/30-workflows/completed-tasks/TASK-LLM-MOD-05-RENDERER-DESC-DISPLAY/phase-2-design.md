# Phase 2: 設計

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 2                                     |
| Phase名    | 設計                                  |
| 対象機能   | TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY |
| 前提Phase  | Phase 1: 要件定義                     |
| 次Phase    | Phase 3: 設計レビュー                 |
| ステータス | pending                               |
| 作成日     | 2026-04-16                            |

## 目的

`InlineModelSelector` に対する `description` 表示実装の設計を確定する。表示方法・レイアウト・安全処理・テスト戦略を決定する。

## 実行タスク

### Task 1: トポロジー確認

- `InlineModelSelector.tsx` の現在の UI 構造を確認し、description の表示方法を設計する
- `LLMSelectorPanel.tsx` は既存のコンテナとして扱い、直接修正しない方針を確認する
- `ModelSelector.tsx` は baseline として維持し、今回の変更対象外であることを確認する
- `ProviderSelector.tsx` は provider description を持たないため今回の変更対象外であることを確認する

### Task 2: 実装パターンの選択

**表示パターン設計**:

```tsx
// compact UI では visible text を増やさず、hover/focus 時に説明を出す
const descriptionId = model.description
  ? `inline-model-desc-${model.id}`
  : undefined;

<button title={model.description || undefined} aria-describedby={descriptionId}>
  {model.name}
  {model.description ? (
    <span id={descriptionId} className="sr-only">
      {model.description}
    </span>
  ) : null}
</button>;
```

- `description` が `undefined` / `null` / 空文字の場合は tooltip と補助テキストを非表示にする
- visible layout は変えず、`title` と `sr-only` で情報を補う
- 長文は native tooltip に任せ、必要以上の DOM を増やさない
- アクセシビリティ: `aria-describedby` で補助テキストを提供する

### Task 3: バリデーションパス

- **正常系（description あり）**: `title` と `aria-describedby` で補助情報を付与し、`sr-only` でアクセシブルに伝える
- **正常系（description なし）**: tooltip と sr-only 要素を出さず、レイアウトは変化なし
- **境界値**: `description = ""` / `"   "` → 非表示扱い（空文字・空白チェックを含む）
- 既存の model selection フロー（選択イベント・アクセシビリティ）に影響なし

### Task 4: 修正箇所の特定

| コンポーネント      | ファイル                                                           | 修正内容                                    | 表示形式     |
| ------------------- | ------------------------------------------------------------------ | ------------------------------------------- | ------------ |
| InlineModelSelector | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` | tooltip / sr-only で description を補助表示 | tooltip/text |
| ModelSelector       | `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`       | baseline（変更なし）                        | -            |
| ProviderSelector    | `apps/desktop/src/renderer/components/llm/ProviderSelector.tsx`    | baseline（変更なし）                        | -            |
| LLMSelectorPanel    | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`    | integration surface（変更なし）             | -            |

### Task 5: テスト戦略

- `description` がある場合、`title` または `aria-describedby` が正しく付与されることを確認する
- `description` が `undefined` / 空文字 / 空白のみ の場合、補助要素が出ないことを確認する
- モデル選択、キーボード操作、フォーカス復帰が従来どおり動くことを確認する

## 参照資料

| 資料名              | パス                                                               | 説明                   |
| ------------------- | ------------------------------------------------------------------ | ---------------------- |
| 要件定義            | `phase-1-requirements.md`                                          | AC-1〜AC-6             |
| 型定義              | `packages/shared/src/types/llm/schemas/provider.ts`                | LLMModelSchema         |
| データ元            | `packages/shared/src/types/llm/schemas/provider-registry.ts`       | description の実データ |
| InlineModelSelector | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` | 修正対象               |
| ModelSelector       | `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`       | baseline               |

## 統合テスト連携

- `description` の有無でテストフィクスチャを分けて定義する
- VISUAL テスト（Phase 11）で description あり/なしの両状態のスクリーンショットを取得する

## 成果物

| 成果物 | パス                                 | 説明                                           |
| ------ | ------------------------------------ | ---------------------------------------------- |
| 設計書 | `outputs/phase-2/design-document.md` | 修正パターン・バリデーションパス・修正箇所一覧 |

## 完了条件

- [ ] `InlineModelSelector` の `description` 表示方法が確定している
- [ ] 空文字・undefined の安全処理設計が確定している
- [ ] Tailwind CSS スタイリングが決定している
- [ ] テスト戦略が定義されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
