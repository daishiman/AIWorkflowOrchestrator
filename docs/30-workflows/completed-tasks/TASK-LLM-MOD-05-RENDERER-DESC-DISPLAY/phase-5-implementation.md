# Phase 5: 実装

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 5                                     |
| Phase名    | 実装                                  |
| 対象機能   | TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY |
| 前提Phase  | Phase 4: テスト作成                   |
| 次Phase    | Phase 6: テスト拡充                   |
| ステータス | pending                               |
| 作成日     | 2026-04-16                            |

## 目的

Phase 4 の TDD Red テストを Green にするため、`InlineModelSelector` のみに最小実装を行う。

## 実行タスク

### Task 1: InlineModelSelector への description 表示実装

**新規作成/修正ファイル**:

- `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` （修正）

**実装内容**:

- `LLMModel.description` を tooltip / helper text として表示する
- `description` が存在する場合のみ補助要素を描画する安全条件を追加する
- visible layout を変えず、`title` / `aria-describedby` を利用する
- アクセシビリティ: `sr-only` もしくは `aria-describedby` で補助文を付与する

### Task 2: 型整合確認

実装後、以下を確認する:

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

### Task 3: 実装ファイル一覧の記録

| ファイル                                                           | 修正種別 | 内容                         |
| ------------------------------------------------------------------ | -------- | ---------------------------- |
| `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` | 修正     | description tooltip 表示追加 |

## 参照資料

| 資料名       | パス                                                | 説明             |
| ------------ | --------------------------------------------------- | ---------------- |
| 設計書       | `phase-2-design.md`                                 | 実装パターン     |
| テスト仕様書 | `phase-4-test-creation.md`                          | TDD テストケース |
| 型定義       | `packages/shared/src/types/llm/schemas/provider.ts` | LLMModelSchema   |

## 統合テスト連携

- Phase 4 で定義した T-1〜T-9 のテストが全て GREEN になることを確認する
- Phase 6 でエッジケースのテストを追加する

## 成果物

| 成果物   | パス                                       | 説明                             |
| -------- | ------------------------------------------ | -------------------------------- |
| 実装記録 | `outputs/phase-5/implementation-record.md` | 変更ファイル一覧・変更内容サマリ |

## 完了条件

- [ ] T-1〜T-9 の全テストが GREEN である
- [ ] TypeScript 型エラーなし
- [ ] ESLint エラーなし
- [ ] description ありの場合に UI で表示が確認できる
- [ ] description なし/空文字の場合に UI が崩れない
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
