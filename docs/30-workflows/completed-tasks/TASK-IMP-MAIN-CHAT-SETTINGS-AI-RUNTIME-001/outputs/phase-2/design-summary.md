# Phase 2: 設計サマリー - 成果物

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 2                                          |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | design-summary.md                          |
| 作成日   | 2026-03-17                                 |

---

## 1. Authority 設計

### 1.1 判定主体の確定

| 状態              | 最終判定主体                | 判定ロジック                                         | Renderer の役割                |
| ----------------- | --------------------------- | ---------------------------------------------------- | ------------------------------ |
| access capability | Main (AuthModeService)      | access matrix 消費 + credential 存在確認             | intent 収集 + card 表示        |
| selected config   | Main (llmConfigProvider)    | in-memory config + provider/model validation         | selector UI + 選択 intent 送信 |
| system prompt     | Main (systemPromptHandlers) | テンプレート永続化 + current prompt 解決             | テンプレート CRUD UI           |
| health            | Main (LLMAdapter)           | adapter.checkHealth() 都度実行                       | HealthIndicator 表示           |
| API key 保存状態  | Main (SecureStorage)        | 暗号化ストレージ + 環境変数 fallback                 | 入力 / 保存 / 削除 UI          |
| RAG 状態          | Main (RAGService)           | **移行対象**: ローカル state → Main authority へ昇格 | toggle UI + 状態表示           |

### 1.2 Authority 原則

```
┌─────────────────────────────────────────────────────────────┐
│ Renderer (Source of Intent)                                 │
│ - ユーザー操作の収集                                        │
│ - UI 状態の表示（Main から受け取った値のみ）                │
│ - 独自の判定ロジックを持たない                              │
└───────────────┬─────────────────────────────────────────────┘
                │ IPC (intent → truth)
                ▼
┌─────────────────────────────────────────────────────────────┐
│ Main (Source of Truth)                                      │
│ - runtime 判定（capability resolve）                        │
│ - config 永続化（selected config / system prompt / keys）   │
│ - fail-fast（API key 不足 / provider 不対応 / health 異常） │
│ - error envelope（サニタイズ済み error → Renderer）         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Flow 設計

### 2.1 ChatView → AI_CHAT 送信フロー（改善後）

```
ChatView.handleSend()
  │
  ▼
chatSlice.sendMessage(message)
  │
  ├─ llmSlice から selectedProviderId / selectedModelId を取得
  │  （型キャスト廃止 → 個別セレクタで安全に取得）
  │
  ├─ systemPromptTemplateSlice から currentPrompt を取得
  │
  ▼
IPC AI_CHAT({
  message,
  systemPrompt,
  providerId,      ← 常に明示送信（GAP-01/03 解決）
  modelId,         ← 常に明示送信
  ragEnabled
})
  │
  ▼
Main: aiHandlers
  ├─ providerId/modelId が明示 → そのまま使用
  ├─ 未指定 → getSelectedLLMConfig() fallback
  ├─ API key 確認 → 不足なら fail-fast
  └─ LLMAdapterFactory.getAdapter(providerId) → adapter.sendChat()
```

### 2.2 Settings → Access Capability 同期フロー

```
SettingsView マウント
  │
  ├─ initializeAuthMode() → IPC authMode.get() → mode 取得
  ├─ fetchStatus() → IPC authMode.status() → capability 状態取得
  ├─ loadProviderStatuses() → IPC api-key:list → Provider 状態取得
  └─ checkHealth() → IPC llm:check-health → health 状態取得
  │
  ▼
AuthModeSelector.onModeChange(newMode)
  │
  ▼
IPC authMode.set({mode: newMode})
  │
  ▼
Main: AuthModeService
  ├─ mode 永続化
  ├─ capability 再計算（access matrix 消費）
  └─ onModeChanged イベント発火
  │
  ▼
Renderer: onModeChanged リスナー
  ├─ authModeSlice.mode 更新
  ├─ fetchStatus() → capability card 更新
  └─ AuthKeySection 表示/非表示 切替
```

### 2.3 Provider / Model 選択 → Main 同期フロー

```
LLMSelectorPanel
  │
  ├─ ProviderSelector.onChange(providerId)
  │    └─ llmSlice.selectProvider(providerId)
  │         ├─ selectedProviderId 更新
  │         ├─ getDefaultModel(providerId) → selectedModelId 更新
  │         └─ syncSelectedConfigToMain()
  │              └─ IPC llm:set-selected-config({providerId, modelId})
  │                   └─ Main: setSelectedLLMConfig(config)
  │
  └─ ModelSelector.onChange(modelId)
       └─ llmSlice.selectModel(modelId)
            ├─ selectedModelId 更新
            └─ syncSelectedConfigToMain()
```

### 2.4 Health Check 統一フロー（DRIFT-4 解決）

```
【統一後】
LLMSelectorPanel / SettingsView
  │
  └─ IPC llm:check-health({providerId})
       └─ Main: handleCheckHealth()
            └─ LLMAdapterFactory.getAdapter(providerId).checkHealth()
                 └─ HealthCheckResult {
                      status: "connected"|"disconnected"|"error",
                      providerId, errorMessage?, latency?, checkedAt
                    }

【廃止対象】
AI_CHECK_CONNECTION（aiHandlers.ts 内のダミー実装）→ 削除対象として設計
```

---

## 3. Error Policy 設計

### 3.1 エラーカテゴリと表示方針

| エラーカテゴリ      | 表示方針                                              | CTA                        |
| ------------------- | ----------------------------------------------------- | -------------------------- |
| API key 未設定      | Guidance Block: 「APIキーが設定されていません」       | 「APIキーを設定する」      |
| API key 無効        | Guidance Block: 「APIキーが無効です」                 | 「APIキーを再設定する」    |
| Provider 未対応     | Guidance Block: 「このプロバイダーは利用できません」  | 「別のプロバイダーを選択」 |
| Model drift         | Guidance Block: 「選択したモデルが利用できません」    | 「モデルを再選択する」     |
| Health failure      | Health Row: 「接続に問題があります」                  | 「接続を再確認する」       |
| subscription 未対応 | Guidance Block: 「APIキーモードに切り替えてください」 | 「APIキーモードに切替」    |
| terminal 必要       | Terminal Card: 「この操作は terminal で実行します」   | 「terminal を開く」        |

### 3.2 Fail-Fast 条件

| 条件                                    | 応答                                                  | UI 表現            |
| --------------------------------------- | ----------------------------------------------------- | ------------------ |
| providerId が未設定 or 無効             | `{success: false, error: {code: "VALIDATION_ERROR"}}` | selector に赤枠    |
| API key が SecureStorage に存在しない   | `{success: false, error: {code: "AUTH_ERROR"}}`       | Guidance Block     |
| adapter.checkHealth() が disconnected   | HealthCheckResult.status = "disconnected"             | HealthIndicator 赤 |
| RAG 有効だが embedding service が未起動 | `{success: false, error: {code: "SERVICE_ERROR"}}`    | RAG Row に警告     |

### 3.3 禁止事項

| 禁止                  | 理由                                               |
| --------------------- | -------------------------------------------------- |
| silent fallback       | 誤成功の禁止原則。失敗を隠さない                   |
| Renderer 側 mode 判定 | local 判定禁止。Main の access matrix を消費する   |
| 見かけ上の成功表示    | API key 不足でも送信ボタンが押せる状態を許容しない |
| background auto-retry | ユーザーに失敗を通知し、明示的な再試行を求める     |

---

## 4. SubAgent 分担設計

### 4.1 設計実行時の責務分担

| 役割                  | 責務                                                | 対象ファイル群                                                 |
| --------------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| Chat Authority Agent  | AI_CHAT 経路の authority 確定、GAP-01/03 解決設計   | ChatView, chatSlice, aiHandlers, llmConfigProvider             |
| Selector Sync Agent   | provider/model 選択の同期契約確定、DRIFT-4 解決設計 | LLMSelectorPanel, llmSlice, llm handlers                       |
| Prompt Settings Agent | system prompt / capability / API key の表示契約確定 | SettingsView, AuthModeSelector, AuthKeySection, ApiKeysSection |

### 4.2 責務境界

```
┌─────────────────────┐  ┌──────────────────────┐  ┌──────────────────────────┐
│ Chat Authority      │  │ Selector Sync        │  │ Prompt Settings          │
│                     │  │                      │  │                          │
│ - AI_CHAT path      │  │ - provider/model     │  │ - system prompt          │
│ - streaming         │  │ - health check       │  │ - access capability card │
│ - message handoff   │  │ - selector UI        │  │ - API key management     │
│ - fail-fast path    │  │ - Main sync          │  │ - RAG state              │
│                     │  │ - adapter cache      │  │ - terminal launcher      │
└─────────────────────┘  └──────────────────────┘  └──────────────────────────┘
```

---

## 5. 設計判定サマリー

| 設計判定                                                      | 理由                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------- |
| AI_CHAT で providerId/modelId を常に明示送信                  | GAP-01/03 解決。DEFAULT_CONFIG への暗黙 fallback を排除 |
| AI_CHECK_CONNECTION を廃止し llm:check-health に統一          | DRIFT-4 解決。ダミー実装と実装済みの二重経路を統一      |
| RAG state を Main authority に昇格                            | GAP-04 解決。ローカル state → Main 永続化               |
| authMode の状態語彙を ready/blocked/unavailable に統一        | DRIFT-1 解決。isValid boolean → 3値語彙へ               |
| AuthKeySection を capability card の sub-section に再配置     | DRIFT-2 解決。条件付き表示 → card 内統合                |
| Provider 一覧の状態を capability card と連動                  | DRIFT-3 解決。独立判定 → 共通判定結果を消費             |
| API key 変更時に LLMAdapterFactory.clearInstance() を呼び出す | GAP-05 解決。キャッシュクリア経路を明示化               |
