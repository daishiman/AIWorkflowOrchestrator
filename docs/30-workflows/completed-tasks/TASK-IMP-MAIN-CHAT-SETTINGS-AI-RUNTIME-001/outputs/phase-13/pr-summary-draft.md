# Phase 13: PR サマリードラフト

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 13                                         |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | pr-summary-draft.md                        |
| 作成日   | 2026-03-17                                 |

---

## 1. PR タイトル案

```
feat(chat/settings): AI runtime 同期 - providerId/modelId 明示送信・authMode 語彙統一・health check 統合
```

**代替案（70文字以内）**:

```
feat(runtime): Main Chat/Settings の AI provider 同期と authMode 語彙統一
```

---

## 2. Summary（1-3 箇条書き）

- **AI_CHAT に providerId/modelId を必須フィールドとして追加**し、`DEFAULT_CONFIG` への暗黙 fallback と型キャストを除去（GAP-01/03）
- **AI_CHECK_CONNECTION を廃止**し `llm:check-health` に統一。authMode 語彙を `auto/ask/deny` から `ready/blocked/unavailable` に統一（GAP-02, DRIFT-1/4）
- **API key 変更時の adapter cache クリア**と **Access Capability Card の新設**で Settings ↔ Chat の状態同期を改善（GAP-05, DRIFT-2/3）

---

## 3. Changes（変更内容詳細）

### 3.1 Main Process

| ファイル                             | 変更内容                                                               |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `main/handlers/aiHandlers.ts`        | `AI_CHECK_CONNECTION` ハンドラ削除、`AI_CHAT` の引数バリデーション強化 |
| `main/handlers/apiKeyHandlers.ts`    | API key 変更時に `LLMAdapterFactory.clearInstance()` 呼び出しを追加    |
| `main/handlers/authModeHandlers.ts`  | `ready/blocked/unavailable` 語彙での IPC 契約に更新                    |
| `main/services/LLMAdapterFactory.ts` | `clearInstance()` を public メソッドとして追加                         |
| `main/handlers/authKeyHandlers.ts`   | `authKey.exists` の source フィールドを `secure-storage` 固定で明示化  |

### 3.2 Renderer (Store)

| ファイル                                 | 変更内容                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `renderer/store/slices/chatSlice.ts`     | `modelId` の型キャスト除去、明示的な string 型宣言                       |
| `renderer/store/slices/authModeSlice.ts` | `AuthMode` 型を `ready/blocked/unavailable` に変更                       |
| `renderer/store/slices/llmSlice.ts`      | `healthStatus` の初期値を `Record<LLMProviderId, HealthStatus>` で明示化 |

### 3.3 Renderer (Components/Views)

| ファイル                                           | 変更内容                                                                                                  |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `renderer/views/ChatView/index.tsx`                | `isLLMProviderId()` 型ガード適用、Provider 未選択時のエラー表示                                           |
| `renderer/views/ChatView/RuntimeBanner.tsx`        | `AI_CHECK_CONNECTION` を削除し `llm:check-health` のみを参照                                              |
| `renderer/views/SettingsView/index.tsx`            | 6 セクション構成に整理（Access Cards, Provider/Model, API Key, System Prompt, Health/RAG, Profile/Theme） |
| `renderer/components/AuthModeSelector/`            | `auto/ask/deny` を `ready/blocked/unavailable` に変更                                                     |
| `renderer/components/AccessCapabilityCard/` (新規) | ready/missing-key/blocked/unavailable の 4 状態 Card コンポーネント                                       |
| `renderer/components/AuthKeySection/`              | 独立 Section から Access Capability Card sub-section に移動                                               |
| `renderer/components/ApiKeysSection/`              | capability card と連動した表示制御に統合                                                                  |
| `renderer/components/LLMSelectorPanel/`            | `DEFAULT_CONFIG` fallback 除去、Provider 未選択時の明示的エラー                                           |
| `renderer/components/SystemPromptPanel/`           | current template 変更時の `AI_CHAT` への反映を保証                                                        |

### 3.4 Shared

| ファイル                           | 変更内容                               |
| ---------------------------------- | -------------------------------------- | --------- | --------------------- |
| `packages/shared/src/types.ts`     | `AuthMode = 'ready'                    | 'blocked' | 'unavailable'` に変更 |
| `packages/shared/src/guards.ts`    | `isLLMProviderId()` 型ガード関数を追加 |
| `packages/shared/src/constants.ts` | `AI_CHECK_CONNECTION` 定数を削除       |

### 3.5 Preload

| ファイル           | 変更内容                                                       |
| ------------------ | -------------------------------------------------------------- |
| `preload/index.ts` | `ai.checkConnection()` を削除、`ai.chat()` の型定義を更新      |
| `preload/types.ts` | `AI_CHAT` の型定義に `providerId/modelId` 必須フィールドを追加 |

---

## 4. Test Plan

### 自動テスト

```bash
# 全パッケージテスト
pnpm --filter @repo/shared test
cd apps/desktop && pnpm vitest run

# 型チェック
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck

# Lint
pnpm lint
```

### 手動テスト（重要確認項目）

1. Settings で Provider/Model を選択後、Chat でメッセージを送信 → DevTools で `AI_CHAT` の `providerId/modelId` フィールドを確認
2. `AI_CHECK_CONNECTION` チャンネルへの呼び出しがないことを DevTools で確認
3. Access Capability Card が authMode の変更に応じて 4 状態（ready/missing-key/blocked/unavailable）を正しく表示することを確認
4. API Key 変更後に Chat でメッセージを送信 → 新しい API Key が使用されることを確認（adapter cache クリアの確認）
5. アプリ再起動後も Provider/Model/authMode が保持されることを確認

---

## 5. Breaking Changes

### 5.1 IPC 契約変更（重要）

**AI_CHAT チャンネル**: `providerId` と `modelId` が必須フィールドになった。

```typescript
// 移行前
window.electronAPI.ai.chat({ message, systemPrompt });

// 移行後（providerId/modelId 必須）
window.electronAPI.ai.chat({ message, systemPrompt, providerId, modelId });
```

**AI_CHECK_CONNECTION チャンネル**: 廃止。代わりに `llm:check-health` を使用する。

```typescript
// 移行前
window.electronAPI.ai.checkConnection();

// 移行後
window.electronAPI.llm.checkHealth({ providerId });
```

### 5.2 AuthMode 型変更

```typescript
// 移行前
type AuthMode = "auto" | "ask" | "deny";

// 移行後
type AuthMode = "ready" | "blocked" | "unavailable";
```

---

## 6. Related Issues

- Phase 3 MINOR-01 → UT-TASK06-001（RAG state IPC チャンネル仕様書整備）
- Phase 3 MINOR-02 → UT-TASK06-002（apiKey.validate() デバウンス完全実装）
- Phase 3 MINOR-03 → UT-TASK06-003（AccountSection header 統合完全実装）
- GAP-02 解決後 → UT-TASK06-004（AI_CHECK_CONNECTION コード完全削除確認）

---

## 7. PR 作成前の確認事項

> **重要**: PR を作成する前に、必ずユーザーにローカル環境での動作確認を依頼すること。
>
> 確認項目:
>
> 1. `pnpm --filter @repo/desktop dev` でアプリを起動し、Settings 画面と Main Chat 画面の動作を確認
> 2. DevTools で `AI_CHAT` の `providerId/modelId` が送信されていること、`AI_CHECK_CONNECTION` が呼ばれていないことを確認
> 3. Access Capability Card が authMode の変更に応じて正しく状態遷移することを確認
> 4. アプリ再起動後も設定が保持されることを確認
>
> ユーザーの動作確認が完了してから、PR 作成の指示を受けること。

---

## 8. Reviewers チェックリスト

PR レビュアーへのお願い：

- [ ] `AI_CHAT` の `providerId/modelId` 必須フィールドが正しく型定義されているか
- [ ] `AI_CHECK_CONNECTION` の参照が全てのファイルから削除されているか
- [ ] authMode 語彙が `ready/blocked/unavailable` に統一されているか
- [ ] `LLMAdapterFactory.clearInstance()` が API key 変更時に呼ばれているか
- [ ] P42 バリデーション（3段チェック）が全 IPC ハンドラに適用されているか
- [ ] テストカバレッジが 80% 以上を維持しているか
