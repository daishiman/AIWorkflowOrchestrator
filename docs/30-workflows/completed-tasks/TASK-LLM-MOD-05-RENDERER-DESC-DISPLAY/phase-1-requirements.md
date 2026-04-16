# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 1                                     |
| Phase名    | 要件定義                              |
| 対象機能   | TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY |
| 前提Phase  | -                                     |
| 次Phase    | Phase 2: 設計                         |
| ステータス | pending                               |
| 作成日     | 2026-04-16                            |

## 目的

LLM provider catalog の `description` フィールドを、compact な renderer UI である `InlineModelSelector` に表示するための受入条件を固定し、修正スコープと検証可能な完了基準を定義する。

## 背景

- `packages/shared/src/types/llm/schemas/provider.ts` の `LLMModelSchema` には `description: z.string().optional()` が既に存在する
- `ModelSelector` は description 表示済みであり、この task の対象外
- `ProviderSelector` には provider description が存在しないため、この task の対象外
- `InlineModelSelector` だけが compact UI として description を補完できていない

## 実行タスク

### Task 1: 問題の固定

- `InlineModelSelector` の各モデル option に `description` が表示されていない事実を記録する
- 既存の `ModelSelector` は baseline として扱い、`ProviderSelector` / `LLMSelectorPanel` は変更対象外であることを記録する
- description が未設定（`undefined` / `null` / `""`）の場合に UI レイアウトが崩れないよう安全処理が必要であることを記録する

### Task 2: 受入条件の確定

- AC-1: `InlineModelSelector` で `description` フィールドが表示される
- AC-2: `description` が `undefined` または空文字列の場合、UI レイアウトが崩れず安全に処理される
- AC-3: 既存の model selection フロー・アクセシビリティが壊れていない（回帰なし）
- AC-4: 既存テストへ `description` 表示の期待値が追加されている
- AC-5: TypeScript 型エラー・ESLint エラーなし
- AC-6: docs と UI の文言が一致している

### Task 3: スコープ境界

- 含む: `InlineModelSelector` への `description` 表示、レイアウト調整、空文字・未設定の安全処理、既存テストへの期待値追加
- 含まない: `description` フィールドの型定義変更（既存のまま）、`ModelSelector` / `ProviderSelector` / `LLMSelectorPanel` の実装変更、Main Process 実装変更、IPC 契約変更、PR 作成（ユーザー承認後のみ）

### Task 4: 命名規則の記録

- コンポーネントファイル: PascalCase（例: `InlineModelSelector.tsx`）
- テストファイル: `__tests__/ComponentName.test.tsx` 形式
- CSS クラス: Tailwind CSS utility クラス使用
- 型定義: TypeScript の `LLMModel` 型を参照

## 参照資料

| 資料名               | パス                                                               | 説明                             |
| -------------------- | ------------------------------------------------------------------ | -------------------------------- |
| プロバイダースキーマ | `packages/shared/src/types/llm/schemas/provider.ts`                | `LLMModel.description` の参照先  |
| ModelSelector        | `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`       | baseline（既に表示済み）         |
| ProviderSelector     | `apps/desktop/src/renderer/components/llm/ProviderSelector.tsx`    | baseline（本 task では変更なし） |
| LLMSelectorPanel     | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`    | integration surface              |
| InlineModelSelector  | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` | main target                      |
| 関連 Issue           | GitHub Issue #2159                                                 | 問題報告・CLOSED                 |
| 親ワークフロー       | `docs/30-workflows/llm-provider-model-modernization/index.md`      | LLM モダナイゼーション全体像     |

## 統合テスト連携

- Phase 4 で `description` の表示・非表示（空文字・undefined）の両シナリオをテスト定義する
- Phase 10 で AC-1〜AC-6 とテストの対応表を再確認する
- Phase 11 で VISUAL テスト（スクリーンショット証跡取得）を実施する

## 成果物

| 成果物     | パス                                         | 説明                                       |
| ---------- | -------------------------------------------- | ------------------------------------------ |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 問題定義・受入条件・スコープ境界・命名規則 |

## 完了条件

- [ ] description 未表示問題が影響コンポーネントごとに固定されている
- [ ] AC-1〜AC-6 が検証可能な形で定義されている
- [ ] 含む/含まないが明確である
- [ ] 命名規則が記録されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
