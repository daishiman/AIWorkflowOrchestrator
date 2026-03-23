# Phase 8: リファクタリング（実施済み） -- OpenRouter プロバイダー統合

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase番号  | 8                         |
| 機能名     | openrouter-integration    |
| タスクID   | TASK-LLM-MOD-07           |
| 作成日     | 2026-03-23                |
| ステータス | 実施済み                  |
| 依存Phase  | Phase 7（カバレッジ確認） |

## 目的

Green 状態を維持しながら、変更コードとテストコードの品質を改善する。

## 実行タスク（実施済み記録）

### Task 8-1: isValidProviderId の二重管理解消（完了）

**変更前**: `isValidProviderId` はハードコードされた配列（`["openai", "anthropic", "google", "xai"]`）で有効性を判定しており、`LLMProviderIdSchema` と二重管理の状態だった。

**変更後**: `LLMProviderIdSchema.safeParse(id).success` に統一した。

```typescript
// 変更前（二重管理）
function isValidProviderId(id: unknown): id is LLMProviderId {
  return ["openai", "anthropic", "google", "xai"].includes(id as string);
}

// 変更後（Single Source of Truth）
function isValidProviderId(id: unknown): id is LLMProviderId {
  return LLMProviderIdSchema.safeParse(id).success;
}
```

**効果**: 新規プロバイダー追加時に `LLMProviderIdSchema` のみ更新すれば `isValidProviderId` も自動的に対応する。二重管理による不整合リスクを排除した。

### Task 8-2: ハードコード型リテラルの LLMProviderId 統一（完了）

**対象ファイル**:

- `apps/desktop/src/main/ipc/aiHandlers.ts`: `"openai" | "anthropic" | "google" | "xai"` を `LLMProviderId` に置換
- `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts`: 同上

**効果**: 型定義の Single Source of Truth が `LLMProviderIdSchema` から推論される `LLMProviderId` 型に統一され、プロバイダー追加時の型更新漏れを防止する。

### Task 8-3: inferProviderId の o3/o4 パターンとスラッシュパターンの整理（完了）

`inferProviderId` 関数の判定順序を以下のように整理した:

1. OpenAI: `gpt-` / `o3` / `o4` プレフィックス
2. Anthropic: `claude-` プレフィックス
3. Google: `gemini-` プレフィックス
4. xAI: `grok-` プレフィックス
5. OpenRouter: `/` を含むモデルID（fallback）
6. `null`（該当なし）

**設計上の考慮**: `/` パターンを最後に配置することで、直接プロバイダーのモデルIDとして認識される名前（`gpt-4o` 等）がOpenRouterに誤判定されることを防止している。

### Task 8-4: Green 状態の維持確認（完了）

リファクタリング後も全テスト（20 ケース）が PASS であることを確認した。

### Task 8-5: 未タスク候補の記録

| 候補                                                       | 理由                                       | 優先度 |
| ---------------------------------------------------------- | ------------------------------------------ | ------ |
| `PROVIDER_CONFIGS` のモデル一覧をJSON/設定ファイルに外出し | ハンドラファイルの肥大化防止               | 低     |
| `inferProviderId` のプレフィックスルールをデータ駆動化     | 新規プロバイダー追加時のコード変更を最小化 | 低     |

これらは Phase 12 にて未タスク候補として記録した。

## 参照資料

| ドキュメント                                                                        | 用途                                                       |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `phase-7-coverage.md`                                                               | カバレッジ基準充足の確認（前提）                           |
| `apps/desktop/src/main/handlers/llm.ts`                                             | リファクタリング対象（isValidProviderId, inferProviderId） |
| `apps/desktop/src/main/ipc/aiHandlers.ts`                                           | リファクタリング対象（型統一）                             |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | リファクタリング対象（型統一）                             |

## 成果物

| 成果物                        | パス                                                                                | 備考                                     |
| ----------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------- |
| isValidProviderId 統一        | `apps/desktop/src/main/handlers/llm.ts`                                             | 二重管理解消                             |
| 型リテラル LLMProviderId 統一 | `apps/desktop/src/main/ipc/aiHandlers.ts`                                           | ハードコード型を LLMProviderId に置換    |
| 型リテラル LLMProviderId 統一 | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | ハードコード型を LLMProviderId に置換    |
| inferProviderId 判定順序整理  | `apps/desktop/src/main/handlers/llm.ts`                                             | `/` パターンを最後の fallback として配置 |

## 完了条件

- [x] `isValidProviderId` の二重管理を解消し、`LLMProviderIdSchema.safeParse` に統一した
- [x] ハードコード型リテラルを `LLMProviderId` 型に置換した（2 ファイル）
- [x] `inferProviderId` の判定順序を整理し、`/` パターンを最後の fallback に配置した
- [x] リファクタリング後も全テスト（20 ケース）が PASS であることを確認した
- [x] 未タスク候補（PROVIDER_CONFIGS 外出し、inferProviderId データ駆動化）を記録した

## 次のPhase

[Phase 9: 品質保証](./phase-9-quality-assurance.md)
