# Phase 1: 要件定義 - 成果物

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 1                                          |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | requirements-definition.md                 |
| 作成日   | 2026-03-17                                 |

---

## 1. Inventory 整理

### 1.1 Renderer 層 - UI コンポーネント

| コンポーネント   | ファイルパス                                                               | 責務                                                |
| ---------------- | -------------------------------------------------------------------------- | --------------------------------------------------- |
| ChatView         | `apps/desktop/src/renderer/views/ChatView/index.tsx`                       | Main Chat UI、メッセージ表示、送信操作              |
| LLMSelectorPanel | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`            | Provider/Model 選択パネル統合 UI                    |
| HealthIndicator  | `apps/desktop/src/renderer/components/llm/HealthIndicator.tsx`             | 接続状態表示（connected/disconnected/error）        |
| ProviderSelector | `apps/desktop/src/renderer/components/llm/ProviderSelector.tsx`            | Provider 選択ドロップダウン（キーボード操作対応）   |
| ModelSelector    | `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`               | Model 選択ドロップダウン（context window 表示付き） |
| SettingsView     | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                   | Settings 画面全体のレイアウトとセクション管理       |
| AuthModeSelector | `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx` | subscription/api-key ラジオボタン UI                |
| AuthKeySection   | `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`   | Anthropic APIキー入力/保存/削除/状態表示            |
| ApiKeysSection   | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`  | 4プロバイダーの APIキー一覧/設定/削除               |

### 1.2 Renderer 層 - Zustand Store

| スライス                  | ファイルパス                                                          | 責務                                              |
| ------------------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| chatSlice                 | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                 | チャットメッセージ/送信状態管理、AI_CHAT 送信経路 |
| llmSlice                  | `apps/desktop/src/renderer/store/slices/llmSlice.ts`                  | Provider/Model 選択管理、Main 同期                |
| authModeSlice             | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`             | 認証方式（subscription/api-key）の状態管理        |
| systemPromptTemplateSlice | `apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts` | System Prompt テンプレート永続化と current prompt |

### 1.3 Main Process 層 - IPC ハンドラ

| ハンドラ             | ファイルパス                                        | 責務                                                        |
| -------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| aiHandlers           | `apps/desktop/src/main/ipc/aiHandlers.ts`           | AI_CHAT / AI_CHECK_CONNECTION IPC 処理                      |
| llm handlers         | `apps/desktop/src/main/handlers/llm.ts`             | llm:set-selected-config / health / streaming                |
| llmConfigProvider    | `apps/desktop/src/main/ipc/llmConfigProvider.ts`    | selected config の in-memory 管理（DEFAULT: openai/gpt-4o） |
| systemPromptHandlers | `apps/desktop/src/main/ipc/systemPromptHandlers.ts` | System Prompt テンプレート CRUD                             |
| authKeyHandlers      | `apps/desktop/src/main/ipc/authKeyHandlers.ts`      | Anthropic APIキー保存/削除/検証/存在確認                    |
| apiKeyHandlers       | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`       | 4プロバイダー APIキー管理（list/set/validate/delete）       |

### 1.4 Main Process 層 - サービス

| サービス          | ファイルパス                                              | 責務                                    |
| ----------------- | --------------------------------------------------------- | --------------------------------------- |
| LLMAdapterFactory | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` | Provider アダプター生成・キャッシュ管理 |
| buildMessages     | `apps/desktop/src/main/utils/buildMessages.ts`            | メッセージ正規化と model handoff        |

---

## 2. State 整理 - Authority 列挙

### 2.1 Authority マトリクス

| 状態                    | Source of Truth                         | 保存先                           | 同期経路                                      |
| ----------------------- | --------------------------------------- | -------------------------------- | --------------------------------------------- |
| provider / model 選択   | Main (llmConfigProvider)                | in-memory (currentConfig)        | Renderer → IPC llm:set-selected-config → Main |
| access capability       | Main (authModeHandlers)                 | 永続ストレージ                   | Renderer → IPC authMode.set → Main            |
| system prompt           | Main (systemPromptHandlers)             | ファイル/DB                      | Renderer → IPC systemPrompt:\* → Main         |
| API key 保存状態        | Main (authKeyHandlers / apiKeyHandlers) | SecureStorage / 暗号化ストレージ | Renderer → IPC auth-key:_ / api-key:_ → Main  |
| health 状態             | Main (llm handlers)                     | 都度計算（非永続）               | Renderer → IPC llm:check-health → Main        |
| RAG 状態                | Renderer (SettingsView)                 | localStorage (ragEnabled)        | ローカル state のみ（Main 非同期）            |
| selected config default | Main (llmConfigProvider)                | in-memory                        | DEFAULT_CONFIG = openai/gpt-4o                |

### 2.2 同期方向の整理

```
Renderer (source of intent)
    │
    ├─ provider/model 選択 ─────→ IPC llm:set-selected-config ──→ Main (source of truth)
    ├─ authMode 切替 ───────────→ IPC authMode.set ─────────────→ Main
    ├─ API key 保存/削除 ───────→ IPC auth-key:set/delete ──────→ Main
    ├─ system prompt 保存 ──────→ IPC systemPrompt:save ────────→ Main
    │
    ├─ health check 要求 ───────→ IPC llm:check-health ─────────→ Main → LLMAdapter
    ├─ AI_CHAT 送信 ────────────→ IPC AI_CHAT ──────────────────→ Main → LLMAdapter
    │
    └─ RAG 有効化 ──────────────→ ローカル state のみ（Main 未同期）
```

---

## 3. Gap 整理

### 3.1 Critical Gaps

| ID     | Gap                                | 箇所                     | 影響度 | 説明                                                                                                                  |
| ------ | ---------------------------------- | ------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------- |
| GAP-01 | Renderer 型キャスト                | chatSlice.ts L190-195    | HIGH   | `selectedProviderId/selectedModelId` を `as ChatSlice & {...}` で型キャストして取得。常に undefined の可能性          |
| GAP-02 | AI_CHECK_CONNECTION ダミー実装     | aiHandlers.ts L162-183   | MEDIUM | TODO コメント付き。mock データのみ返却。実 health check は llm handlers 側で実装済み                                  |
| GAP-03 | DEFAULT_CONFIG 常時適用リスク      | llmConfigProvider.ts L34 | MEDIUM | currentConfig が null のまま AI_CHAT すると DEFAULT (openai/gpt-4o) が使われる。Renderer 選択との非同期タイミング問題 |
| GAP-04 | RAG 状態が Main 未同期             | SettingsView             | MEDIUM | ragEnabled はローカル state のみ。Main authority に載っていない                                                       |
| GAP-05 | Adapter キャッシュ未クリア         | LLMAdapterFactory        | MEDIUM | APIキー変更時の clearInstance() 呼び出し元が不明確。古いキーで通信される可能性                                        |
| GAP-06 | authKey.exists() source 契約不明確 | AuthKeySection L70-72    | MEDIUM | Main 側で `source` フィールドを返す実装の仕様が不透明                                                                 |
| GAP-07 | apiKey.validate() デバウンス未実装 | ApiKeysSection L165-190  | LOW    | 入力ごとに IPC 呼び出し。連続入力時の通信量増大                                                                       |

### 3.2 Display Drift

| ID      | Drift                                       | 箇所                              | 説明                                                                           |
| ------- | ------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------ |
| DRIFT-1 | authMode toggle と capability card の語彙差 | AuthModeSelector / SettingsView   | `isValid` (boolean) と `ready/blocked/unavailable` (3値) が混在                |
| DRIFT-2 | AuthKeySection 条件付き表示                 | SettingsView L150                 | authMode === "api-key" でのみ表示。access capability card とは独立した条件分岐 |
| DRIFT-3 | Provider 一覧と上位 capability の不整合     | ApiKeysSection / AuthModeSelector | Provider の「登録/未登録」と上位の authModeStatus.isValid が独立判定           |
| DRIFT-4 | health 表示の二重経路                       | aiHandlers / llm handlers         | AI_CHECK_CONNECTION（ダミー）と llm:check-health（実装済み）が併存             |

### 3.3 Future TODO / Local-only State

| ID     | 項目                                     | 箇所          | 説明                                                              |
| ------ | ---------------------------------------- | ------------- | ----------------------------------------------------------------- |
| TODO-1 | AI_CHECK_CONNECTION の本実装             | aiHandlers.ts | TODO コメント付き mock 実装                                       |
| TODO-2 | RAG state の Main 同期                   | SettingsView  | ローカル state のみで Main authority に未反映                     |
| TODO-3 | legacy authMode → access capability 移行 | authModeSlice | subscription/api-key toggle から capability card への移行が未着手 |

---

## 4. 受入基準

| ID   | 基準                                                                                             | 検証方法                                |
| ---- | ------------------------------------------------------------------------------------------------ | --------------------------------------- |
| AC-1 | provider / model / prompt / auth key 保存状態 / health / RAG state の authority が列挙されている | Section 2 の Authority マトリクスで確認 |
| AC-2 | Main Chat / Settings 間の drift 箇所が後続設計へ割り当てられている                               | Section 3 の Gap/Drift 一覧で確認       |

---

## 5. 制約

| 制約                                                   | 理由                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------- |
| consumer subscription token をアプリが取得・保存しない | 親パック Access Model 方針による制約                                      |
| terminal surface での自動コマンド送信禁止              | 親パック リスク境界による制約                                             |
| local 判定禁止                                         | 各 surface は独自の mode 判定を持たず、Task01 の access matrix を消費する |
| silent fallback 禁止                                   | 誤成功の禁止原則（ui-ux-realization.md）                                  |

---

## 6. 後続設計への引き継ぎ

Phase 2（設計）では、以下の Gap/Drift を解決する設計を行う:

1. **GAP-01/03**: Renderer ↔ Main の selected config 同期タイミングの確定
2. **GAP-02/DRIFT-4**: health check 経路の統一（AI_CHECK_CONNECTION vs llm:check-health）
3. **GAP-04/TODO-2**: RAG state の authority 確定
4. **DRIFT-1/TODO-3**: legacy authMode → access capability card への移行設計
5. **DRIFT-2/DRIFT-3**: AuthKeySection/ApiKeysSection と capability card の整合設計
6. **GAP-05**: APIキー変更時の Adapter キャッシュクリア経路の確定
