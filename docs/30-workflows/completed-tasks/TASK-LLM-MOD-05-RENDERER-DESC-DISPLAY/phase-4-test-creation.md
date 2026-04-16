# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 4                                     |
| Phase名    | テスト作成                            |
| 対象機能   | TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY |
| 前提Phase  | Phase 3: 設計レビュー                 |
| 次Phase    | Phase 5: 実装                         |
| ステータス | pending                               |
| 作成日     | 2026-04-16                            |

## 目的

TDD Red フェーズとして、実装前に `InlineModelSelector` の `description` 表示期待値テストを作成する。

## 実行タスク

### Task 1: テストフィクスチャの定義

テスト用フィクスチャ（`description` あり/なし の2パターン）を定義する:

```typescript
// description ありのモデルフィクスチャ
const mockModelWithDescription = {
  id: "gpt-4o",
  name: "GPT-4o",
  description: "高性能マルチモーダルモデル",
  contextWindow: 128000,
};

// description なし（undefined）のモデルフィクスチャ
const mockModelWithoutDescription = {
  id: "gpt-4o-mini",
  name: "GPT-4o Mini",
  description: undefined,
  contextWindow: 128000,
};

// description が空文字のフィクスチャ
const mockModelWithEmptyDescription = {
  id: "gpt-4o-nano",
  name: "GPT-4o Nano",
  description: "",
  contextWindow: 128000,
};
```

### Task 2: InlineModelSelector コアテストケースの定義

テスト対象: `apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx`

| テストケース | 説明                                                      | 検証内容                                        |
| ------------ | --------------------------------------------------------- | ----------------------------------------------- |
| T-1          | description ありのモデル option に tooltip/補助情報が付く | `title` もしくは `aria-describedby` が存在する  |
| T-2          | description が undefined のとき補助要素が非表示           | description 関連属性が DOM に存在しない         |
| T-3          | description が空文字のとき補助要素が非表示                | description 関連属性が DOM に存在しない         |
| T-4          | description ありでもモデル選択イベントが正常に発火する    | onSelectionChange が description に依存せず発火 |
| T-5          | description ありでもキーボード操作が正常に動作する        | Enter / Escape / Arrow 操作が維持される         |

### Task 3: InlineModelSelector レグレッションテストの定義

テスト対象: `apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx`

| テストケース | 説明                                               | 検証内容                                       |
| ------------ | -------------------------------------------------- | ---------------------------------------------- |
| T-6          | provider 切り替え後に tooltip 内容が更新される     | 選択中 model に応じて description が更新される |
| T-7          | 長文 description でもレイアウトが崩れない          | dropdown 高さや配置が維持される                |
| T-8          | HTML 風文字列がそのままテキストとして扱われる      | XSS 的な HTML 解釈が起きない                   |
| T-9          | 選択中 model の名称表示が description 追加後も安定 | trigger の表示が model 名のまま維持される      |

### Task 4: 依存関係確認

TDD Red Phase 開始前の依存関係確認:

```bash
pnpm install
pnpm --filter @repo/shared build
```

### Task 5: 命名規則との整合確認

- テストファイルのコンポーネント名が PascalCase になっているか確認
- テストの describe ブロックがコンポーネント名と一致しているか確認

## 参照資料

| 資料名              | パス                                                               | 説明                 |
| ------------------- | ------------------------------------------------------------------ | -------------------- |
| 設計書              | `phase-2-design.md`                                                | 表示パターン設計     |
| 型定義              | `packages/shared/src/types/llm/schemas/provider.ts`                | LLMModelSchema       |
| データ元            | `packages/shared/src/types/llm/schemas/provider-registry.ts`       | description 実データ |
| InlineModelSelector | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` | 修正対象             |

## 統合テスト連携

- Phase 6 でテストフィクスチャを拡充し境界値テストを追加する
- Phase 7 でカバレッジが AC-4 を満たしていることを確認する

## 成果物

| 成果物       | パス                                     | 説明                           |
| ------------ | ---------------------------------------- | ------------------------------ |
| テスト仕様書 | `outputs/phase-4/test-specifications.md` | TDD Red Phase テストケース一覧 |

## 完了条件

- [ ] T-1〜T-9 のテストケース定義が完了している
- [ ] フィクスチャ（description あり/なし/空文字）が定義されている
- [ ] 依存関係確認（pnpm install + build）が完了している
- [ ] 命名規則との整合が確認されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
