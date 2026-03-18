# Phase 4: テストマトリクス

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 4                                          |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | test-matrix.md                             |
| 作成日   | 2026-03-17                                 |

---

## 1. テスト方針

### 1.1 基本方針

- **TDD（テストファースト）**: 実装前にテストケースを設計し、Red → Green → Refactor のサイクルを遵守する
- **GAP/DRIFT 対応の網羅性**: Phase 1 で特定した GAP-01〜07 / DRIFT-1〜4 の解決を各テストで検証する
- **IPC 契約検証**: Phase 2 で定義した全 IPC チャンネルの引数バリデーション・レスポンス形式を確認する
- **P42 準拠バリデーション**: 型チェック → 空文字列 → トリム空文字列の3段バリデーションを全 IPC ハンドラでテストする
- **P31/P48 対策**: Zustand セレクタの無限ループリスクを useShallow / 個別セレクタで防止されていることを確認する
- **P5 対策**: IPC リスナーが二重登録されないことを確認する

### 1.2 テスト分類の定義

| 分類        | 対象レイヤー         | ツール             | 実行時間目安 |
| ----------- | -------------------- | ------------------ | ------------ |
| Unit Test   | 純粋関数・サービス   | Vitest             | < 50ms/件    |
| Integration | IPC 経路 End-to-End  | Vitest + vi.mock   | < 200ms/件   |
| Component   | React コンポーネント | Vitest + happy-dom | < 100ms/件   |

---

## 2. テストカテゴリ別マトリクス

### 2.1 Unit Tests

GAP/DRIFT の各解決策に対する純粋ロジックのテスト。

#### 2.1.1 chatSlice (GAP-01/03)

| テスト対象                   | 検証内容                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| sendMessage()                | selectedProviderId/selectedModelId を llmSlice から取得して AI_CHAT に明示送信する |
| sendMessage() - 型安全       | providerId が null の場合に VALIDATION_ERROR を返す（型キャスト廃止）              |
| sendMessage() - fallback廃止 | DEFAULT_CONFIG への暗黙 fallback が発生しないことを確認                            |

#### 2.1.2 llmSlice (DRIFT-4 / GAP-05)

| テスト対象                     | 検証内容                                                                   |
| ------------------------------ | -------------------------------------------------------------------------- |
| selectProvider()               | selectedProviderId と selectedModelId が更新される                         |
| selectProvider() - API key変更 | clearInstance() が呼び出されることを確認（GAP-05）                         |
| syncSelectedConfigToMain()     | llm:set-selected-config IPC が providerId/modelId で呼び出される           |
| checkHealth()                  | llm:check-health のみ使用、AI_CHECK_CONNECTION が呼び出されない（DRIFT-4） |
| healthStatus 更新              | checkHealth() の結果が healthStatus レコードに格納される                   |

#### 2.1.3 authModeSlice (DRIFT-1 / GAP-06)

| テスト対象             | 検証内容                                                                        |
| ---------------------- | ------------------------------------------------------------------------------- |
| initializeAuthMode()   | authMode.get IPC を呼び出し mode を取得する                                     |
| fetchStatus()          | authMode.status IPC から `{mode, isValid, hasCredentials, guidance}` を取得する |
| setMode()              | authMode.set IPC → onModeChanged イベントで mode が更新される                   |
| onModeChanged リスナー | P5 対策: 二重登録されないことを確認（登録回数 = 1）                             |
| mode 語彙統一          | mode が "ready"/"blocked"/"unavailable" のいずれかであることを確認（DRIFT-1）   |

#### 2.1.4 systemPromptTemplateSlice

| テスト対象           | 検証内容                                                                |
| -------------------- | ----------------------------------------------------------------------- |
| fetchTemplates()     | systemPrompt:list IPC からテンプレート一覧を取得する                    |
| saveTemplate()       | systemPrompt:save IPC を name/content で呼び出す                        |
| deleteTemplate()     | systemPrompt:delete IPC を id で呼び出す                                |
| getCurrentPrompt()   | systemPrompt:current IPC から現在のテンプレートを取得する               |
| currentTemplate 反映 | AI_CHAT 送信時に currentTemplate.content が systemPrompt として含まれる |

#### 2.1.5 LLMConfigProvider (GAP-03)

| テスト対象                            | 検証内容                                                            |
| ------------------------------------- | ------------------------------------------------------------------- |
| getSelectedLLMConfig()                | in-memory config を返す（永続化なし確認）                           |
| setSelectedLLMConfig()                | providerId/modelId を更新する                                       |
| getSelectedLLMConfig() - fallback廃止 | config が未設定の場合に DEFAULT_CONFIG を無条件適用しない（GAP-03） |

#### 2.1.6 AuthModeService (GAP-06)

| テスト対象                    | 検証内容                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| getMode()                     | 永続ストレージから mode を読み込む                                                  |
| setMode()                     | 永続ストレージへ mode を保存し onModeChanged イベントを発火する                     |
| getStatus()                   | `{mode, isValid, hasCredentials, source}` を返す                                    |
| auth-key:exists - source 契約 | source が "saved" / "env-fallback" / "not-set" のいずれかであることを確認（GAP-06） |

### 2.2 Integration Tests

IPC 経路の End-to-End テスト。Main ハンドラを実際に呼び出してレスポンス形式を確認する。

#### 2.2.1 AI_CHAT IPC (GAP-01/03)

| テスト対象                          | 検証内容                                                             |
| ----------------------------------- | -------------------------------------------------------------------- |
| AI_CHAT - providerId/modelId 必須化 | リクエストに providerId/modelId が含まれる場合に成功レスポンスを返す |
| AI_CHAT - providerId 未指定         | VALIDATION_ERROR を返す（暗黙 fallback なし）                        |
| AI_CHAT - providerId 空文字         | VALIDATION_ERROR を返す（P42: 空文字バリデーション）                 |
| AI_CHAT - providerId スペースのみ   | VALIDATION_ERROR を返す（P42: トリム空文字バリデーション）           |
| AI_CHAT - API key 未設定            | AUTH_ERROR を返す（fail-fast）                                       |
| AI_CHAT - systemPrompt 注入         | systemPrompt が Main の adapter に渡される                           |
| AI_CHAT - ragEnabled=true           | ragEnabled フラグが RAG サービスに伝搬される                         |

#### 2.2.2 llm:set-selected-config IPC

| テスト対象                                | 検証内容                                             |
| ----------------------------------------- | ---------------------------------------------------- |
| llm:set-selected-config - 正常            | providerId/modelId を受け取り config を更新する      |
| llm:set-selected-config - providerId 無効 | VALIDATION_ERROR を返す                              |
| llm:set-selected-config - modelId 空文字  | VALIDATION_ERROR を返す（P42: 空文字バリデーション） |

#### 2.2.3 llm:check-health IPC (DRIFT-4 / GAP-02)

| テスト対象                           | 検証内容                                                                |
| ------------------------------------ | ----------------------------------------------------------------------- |
| llm:check-health - 正常              | HealthCheckResult `{status, providerId, latency, checkedAt}` を返す     |
| llm:check-health - disconnected      | `{status: "disconnected", errorMessage}` を返す                         |
| llm:check-health - providerId 空文字 | VALIDATION_ERROR を返す（P42）                                          |
| AI_CHECK_CONNECTION 廃止確認         | AI_CHECK_CONNECTION チャンネルへのハンドラが登録されていない（DRIFT-4） |

#### 2.2.4 authMode 系 IPC (DRIFT-1)

| テスト対象                      | 検証内容                                                      |
| ------------------------------- | ------------------------------------------------------------- |
| authMode.get                    | 保存された mode を返す                                        |
| authMode.set - 正常             | mode を永続化し `{success: true}` を返す                      |
| authMode.set - 無効値           | VALIDATION_ERROR を返す（P42）                                |
| authMode.status                 | `{mode, isValid, hasCredentials, guidance, errorCode}` を返す |
| authMode.validate               | mode に対応した `{isValid, message, guidance}` を返す         |
| authMode.onModeChanged イベント | setMode() 後に Renderer へイベントが送信される                |

#### 2.2.5 auth-key 系 IPC (GAP-06)

| テスト対象                     | 検証内容                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------- |
| auth-key:exists - source 契約  | `{exists: true, source: "saved"}` を返す（GAP-06: source 明示化）            |
| auth-key:exists - env fallback | `{exists: true, source: "env-fallback"}` を返す                              |
| auth-key:exists - not-set      | key が存在しない場合に `{exists: false, source: "not-set"}` を返す（GAP-06） |
| auth-key:set - 正常            | SecureStorage に key を保存し `{success: true}` を返す                       |
| auth-key:set - 空文字          | VALIDATION_ERROR を返す（P42）                                               |
| auth-key:delete                | SecureStorage から key を削除し `{success: true}` を返す                     |
| auth-key:validate - 正常       | `{isValid: true}` を返す                                                     |

#### 2.2.6 api-key 系 IPC (GAP-05/07)

| テスト対象                 | 検証内容                                                       |
| -------------------------- | -------------------------------------------------------------- |
| api-key:set - cache クリア | LLMAdapterFactory.clearInstance() が呼び出される（GAP-05）     |
| api-key:set - 空文字       | VALIDATION_ERROR を返す（P42）                                 |
| api-key:validate           | `{valid, validationStatus, message}` を返す                    |
| api-key:list               | ProviderStatus[] を返す（設定済み/未設定の状態を含む）         |
| api-key:delete             | provider key を削除し clearInstance() が呼び出される（GAP-05） |

#### 2.2.7 systemPrompt 系 IPC

| テスト対象               | 検証内容                                                |
| ------------------------ | ------------------------------------------------------- |
| systemPrompt:list        | テンプレート一覧を返す                                  |
| systemPrompt:save - 新規 | id なしで呼び出した場合に新規 UUID を割り当てて保存する |
| systemPrompt:save - 更新 | id ありで呼び出した場合に既存レコードを更新する         |
| systemPrompt:delete      | id で指定したテンプレートを削除する                     |
| systemPrompt:current     | 現在選択中のテンプレートを返す（null の場合も含む）     |

### 2.3 Component Tests

React コンポーネントの状態表示テスト。UI が Store 状態を正しく反映するかを確認する。

#### 2.3.1 ChatView (GAP-01/03)

| テスト対象              | 検証内容                                                             |
| ----------------------- | -------------------------------------------------------------------- |
| 送信ボタン - 活性       | selectedProviderId/selectedModelId が設定されている場合に活性        |
| 送信ボタン - 非活性     | selectedProviderId が null の場合に非活性                            |
| 送信処理                | handleSend() が providerId/modelId を含む引数で chatSlice を呼び出す |
| Streaming 表示          | isStreaming=true の場合にローディングインジケータを表示              |
| エラー表示 - AUTH_ERROR | AUTH_ERROR の場合に Guidance Block を表示                            |

#### 2.3.2 LLMSelectorPanel (DRIFT-4 / GAP-05)

| テスト対象                      | 検証内容                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------- |
| Provider 変更                   | onChange が llmSlice.selectProvider() を呼び出す                                 |
| Model 変更                      | onChange が llmSlice.selectModel() を呼び出す                                    |
| Health Indicator 表示           | healthStatus が "connected" の場合に緑インジケータを表示                         |
| Health Indicator - disconnected | healthStatus が "disconnected" の場合に赤インジケータを表示                      |
| Health Check 経路確認           | checkHealth() が llm:check-health のみを呼び出す（AI_CHECK_CONNECTION 廃止確認） |

#### 2.3.3 SettingsView - Access Capability (DRIFT-1/2/3)

| テスト対象                     | 検証内容                                                                   |
| ------------------------------ | -------------------------------------------------------------------------- |
| authMode "ready" 表示          | capability="ready" の場合に Access Card が緑で Primary CTA 活性            |
| authMode "missing-key" 表示    | capability="missing-key" の場合に Access Card が橙で Guidance 表示         |
| authMode "blocked" 表示        | capability="blocked" の場合に Access Card が赤で説明のみ表示               |
| AuthKeySection 表示条件        | authMode の capability に応じて AuthKeySection が card 内に表示（DRIFT-2） |
| Provider 状態連動              | api-key:list の結果に基づいて Provider 一覧の状態が更新される（DRIFT-3）   |
| capability "integratedRuntime" | Foundation 契約: runtime=integratedRuntime の場合の設定画面表示が正しい    |
| capability "terminalSurface"   | Foundation 契約: runtime=terminalSurface の場合の設定画面表示が正しい      |
| capability "both"              | Foundation 契約: runtime=both の場合に両方のセクションが表示される         |
| capability "none"              | Foundation 契約: runtime=none の場合に Access Card が非活性表示される      |

#### 2.3.4 AuthModeSelector (DRIFT-1)

| テスト対象         | 検証内容                                       |
| ------------------ | ---------------------------------------------- |
| mode 表示          | authModeSlice.mode を正しく表示する            |
| mode 変更          | onChange が authModeSlice.setMode() を呼び出す |
| 変更中ローディング | isLoading=true の間は変更 UI が非活性          |

#### 2.3.5 SystemPromptPanel

| テスト対象           | 検証内容                                                   |
| -------------------- | ---------------------------------------------------------- |
| テンプレート一覧表示 | systemPromptSlice.templates を一覧で表示する               |
| テンプレート保存     | 保存ボタンが systemPromptSlice.saveTemplate() を呼び出す   |
| テンプレート削除     | 削除ボタンが systemPromptSlice.deleteTemplate() を呼び出す |
| currentTemplate 選択 | setCurrentTemplate() で currentTemplate が更新される       |

---

## 3. テストケース一覧テーブル

| ID      | カテゴリ    | 対象                          | テスト内容                                                     | 期待結果                                                       | 優先度 | GAP/DRIFT |
| ------- | ----------- | ----------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | ------ | --------- |
| UT-001  | Unit        | chatSlice.sendMessage()       | providerId/modelId を llmSlice から取得して AI_CHAT に送信する | IPC 呼び出しに providerId/modelId が含まれる                   | P0     | GAP-01    |
| UT-002  | Unit        | chatSlice.sendMessage()       | providerId が null の場合                                      | VALIDATION_ERROR を返す                                        | P0     | GAP-01    |
| UT-003  | Unit        | chatSlice.sendMessage()       | DEFAULT_CONFIG への fallback が発生しない                      | providerId が未設定の場合にエラーを返す                        | P0     | GAP-03    |
| UT-004  | Unit        | llmSlice.selectProvider()     | API key 変更時に clearInstance() が呼ばれる                    | LLMAdapterFactory.clearInstance() が1回呼ばれる                | P1     | GAP-05    |
| UT-005  | Unit        | llmSlice.checkHealth()        | llm:check-health のみ使用                                      | AI_CHECK_CONNECTION が呼ばれない                               | P0     | DRIFT-4   |
| UT-006  | Unit        | llmSlice.syncSelectedConfig() | providerId/modelId で llm:set-selected-config を呼ぶ           | IPC 呼び出しに providerId/modelId が含まれる                   | P1     | GAP-01    |
| UT-007  | Unit        | authModeSlice.onModeChanged   | P5: リスナーの二重登録がない                                   | リスナー登録回数が1回                                          | P1     | P5        |
| UT-008  | Unit        | authModeSlice.mode 語彙       | mode が ready/blocked/unavailable のいずれか                   | 不正な語彙が設定された場合に型エラー                           | P1     | DRIFT-1   |
| UT-009  | Unit        | LLMConfigProvider.get()       | DEFAULT_CONFIG への無条件 fallback がない                      | config が null の場合に null を返す                            | P1     | GAP-03    |
| UT-010  | Unit        | AuthModeService.getStatus()   | source が "saved"/"env-fallback"/"not-set" のいずれか          | source フィールドが必ず存在する                                | P1     | GAP-06    |
| UT-011  | Unit        | systemPromptSlice.getPrompt() | currentTemplate.content が AI_CHAT の systemPrompt に含まれる  | systemPrompt が currentTemplate.content と一致                 | P1     | -         |
| UT-012  | Unit        | P48: useFilteredProviders()   | useShallow が適用されている                                    | 再レンダー時に新しい参照を返さない                             | P1     | P48       |
| IT-001  | Integration | AI_CHAT                       | providerId/modelId が含まれる場合に成功                        | `{success: true, data: {message, conversationId}}` を返す      | P0     | GAP-01    |
| IT-002  | Integration | AI_CHAT                       | providerId が未指定                                            | `{success: false, error: {code: "VALIDATION_ERROR"}}` を返す   | P0     | GAP-01    |
| IT-003  | Integration | AI_CHAT                       | providerId が空文字（P42）                                     | `{success: false, error: {code: "VALIDATION_ERROR"}}` を返す   | P0     | P42       |
| IT-004  | Integration | AI_CHAT                       | providerId がスペースのみ（P42 トリム）                        | `{success: false, error: {code: "VALIDATION_ERROR"}}` を返す   | P0     | P42       |
| IT-005  | Integration | AI_CHAT                       | API key 未設定                                                 | `{success: false, error: {code: "AUTH_ERROR"}}` を返す         | P0     | GAP-01    |
| IT-006  | Integration | llm:check-health              | 正常接続時                                                     | `{status: "connected", providerId, latency, checkedAt}` を返す | P0     | DRIFT-4   |
| IT-007  | Integration | llm:check-health              | 接続不可時                                                     | `{status: "disconnected", errorMessage}` を返す                | P0     | GAP-02    |
| IT-008  | Integration | llm:check-health              | providerId が空文字（P42）                                     | VALIDATION_ERROR を返す                                        | P1     | P42       |
| IT-009  | Integration | AI_CHECK_CONNECTION廃止       | AI_CHECK_CONNECTION チャンネルにハンドラが登録されていない     | ipcMain.handlers に該当エントリが存在しない                    | P0     | DRIFT-4   |
| IT-010  | Integration | authMode.set                  | 無効な mode 値（P42）                                          | VALIDATION_ERROR を返す                                        | P1     | DRIFT-1   |
| IT-011  | Integration | authMode.onModeChanged        | setMode() 後にイベント発火                                     | Renderer のリスナーが mode 更新を受信する                      | P1     | DRIFT-1   |
| IT-012  | Integration | auth-key:exists               | source フィールドの存在確認（saved）                           | `{exists: true, source: "saved"}` を返す                       | P1     | GAP-06    |
| IT-012b | Integration | auth-key:exists               | source フィールドの存在確認（not-set）                         | `{exists: false, source: "not-set"}` を返す                    | P1     | GAP-06    |
| IT-013  | Integration | auth-key:set                  | 空文字バリデーション（P42）                                    | VALIDATION_ERROR を返す                                        | P1     | P42       |
| IT-014  | Integration | api-key:set                   | 保存後に clearInstance() が呼ばれる                            | LLMAdapterFactory.clearInstance() が呼ばれる                   | P1     | GAP-05    |
| IT-015  | Integration | api-key:validate              | デバウンス後に1回のみ呼ばれる（GAP-07）                        | 連続入力で300ms 後に1回だけ IPC が発火                         | P2     | GAP-07    |
| IT-016  | Integration | systemPrompt:save             | id なしで新規保存                                              | UUID が割り当てられて保存される                                | P1     | -         |
| IT-017  | Integration | llm:set-selected-config       | modelId が空文字（P42）                                        | VALIDATION_ERROR を返す                                        | P1     | P42       |
| CT-001  | Component   | ChatView                      | selectedProviderId が null の場合に送信ボタン非活性            | disabled 属性が付与される                                      | P0     | GAP-01    |
| CT-002  | Component   | ChatView                      | isStreaming=true でローディング表示                            | ローディングインジケータが表示される                           | P1     | -         |
| CT-003  | Component   | ChatView                      | AUTH_ERROR 後に Guidance Block 表示                            | Guidance Block が DOM に存在する                               | P0     | GAP-01    |
| CT-004  | Component   | LLMSelectorPanel              | Provider 変更で llmSlice.selectProvider() 呼び出し             | モックが1回呼ばれる                                            | P1     | DRIFT-4   |
| CT-005  | Component   | LLMSelectorPanel              | health "connected" で緑インジケータ                            | 緑の CSS クラスが付与される                                    | P1     | DRIFT-4   |
| CT-006  | Component   | SettingsView                  | capability "ready" で Access Card 緑 + CTA 活性                | 対応する CSS クラスと aria 属性                                | P1     | DRIFT-1   |
| CT-007  | Component   | SettingsView                  | capability "missing-key" で Guidance Block 表示                | Guidance Block が表示され「キーを設定」CTA がある              | P1     | DRIFT-2   |
| CT-008  | Component   | SettingsView                  | Provider 状態が api-key:list 結果と連動                        | 各 Provider Card が設定状態を正しく表示                        | P1     | DRIFT-3   |
| CT-009  | Component   | AuthModeSelector              | mode 変更で authModeSlice.setMode() 呼び出し                   | モックが1回呼ばれる                                            | P1     | DRIFT-1   |
| CT-010  | Component   | SystemPromptPanel             | 保存ボタンで saveTemplate() 呼び出し                           | モックが1回呼ばれる                                            | P1     | -         |

---

## 4. テスト実行順序

```
Phase 4 テスト実行順序（TDD: Red → Green → Refactor）

1. Unit Tests（各サービス・スライス単体）
   1.1 LLMConfigProvider テスト（GAP-03 → UT-009）
   1.2 AuthModeService テスト（GAP-06 → UT-010）
   1.3 chatSlice テスト（GAP-01/03 → UT-001〜003）
   1.4 llmSlice テスト（GAP-05/DRIFT-4 → UT-004〜006）
   1.5 authModeSlice テスト（DRIFT-1/P5 → UT-007〜008）
   1.6 systemPromptTemplateSlice テスト（UT-011）
   1.7 P48 セレクタテスト（UT-012）

2. Integration Tests（IPC End-to-End）
   2.1 AI_CHAT ハンドラ（IT-001〜005）
   2.2 llm:check-health / AI_CHECK_CONNECTION 廃止（IT-006〜009）
   2.3 authMode 系（IT-010〜011）
   2.4 auth-key 系（IT-012〜013）
   2.5 api-key 系（IT-014〜015）
   2.6 systemPrompt 系（IT-016）
   2.7 llm:set-selected-config（IT-017）

3. Component Tests（React UI 検証）
   3.1 ChatView テスト（CT-001〜003）
   3.2 LLMSelectorPanel テスト（CT-004〜005）
   3.3 SettingsView テスト（CT-006〜008）
   3.4 AuthModeSelector テスト（CT-009）
   3.5 SystemPromptPanel テスト（CT-010）
```

---

## 5. モック戦略

### 5.1 IPC モック

```typescript
// IPC チャンネルモック（vi.mock を使用）
vi.mock("@/preload/api", () => ({
  safeInvoke: vi.fn(),
  safeOn: vi.fn(),
}));

// 各テストで期待値をセット
mockSafeInvoke.mockImplementation(async (channel, args) => {
  if (channel === IPC_CHANNELS.AI_CHAT) {
    return {
      success: true,
      data: { message: "response", conversationId: "c1" },
    };
  }
});
```

### 5.2 Store モック

```typescript
// P31 対策: 個別セレクタを使用したモック
vi.mock("@/renderer/store", () => ({
  useSelectedProviderId: vi.fn().mockReturnValue("openai"),
  useSelectedModelId: vi.fn().mockReturnValue("gpt-4o"),
  useAuthMode: vi.fn().mockReturnValue("subscription"),
  useCurrentTemplate: vi.fn().mockReturnValue(null),
}));
```

### 5.3 Service モック

```typescript
// LLMAdapterFactory モック（GAP-05 clearInstance 確認用）
vi.mock("@/main/services/LLMAdapterFactory", () => ({
  LLMAdapterFactory: {
    getAdapter: vi.fn(),
    clearInstance: vi.fn(), // GAP-05: 呼び出し確認用
  },
}));

// SecureStorage モック（GAP-06 source 確認用）
vi.mock("@/main/services/SecureStorage", () => ({
  SecureStorage: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn().mockResolvedValue({ exists: true, source: "saved" }),
  },
}));
```

### 5.4 タイマーモック（GAP-07 デバウンス確認用）

```typescript
// P13 対策: advanceTimersByTime を使用
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("デバウンス300ms後に1回だけIPCを呼び出す", async () => {
  // 連続入力
  fireInput("a");
  fireInput("ab");
  fireInput("abc");

  // P13 対策: runAllTimers は使用しない
  await vi.advanceTimersByTimeAsync(300);

  expect(mockSafeInvoke).toHaveBeenCalledTimes(1);
});
```

### 5.5 P39 対策（happy-dom 環境）

```typescript
// P39 対策: happy-dom 環境では userEvent 禁止、fireEvent を使用
import { fireEvent } from "@testing-library/react";

// 非同期ハンドラ
await act(async () => {
  fireEvent.click(sendButton);
});
```

### 5.6 P40 対策（テスト実行ディレクトリ依存）

```bash
# P40 対策: テストは必ず対象パッケージのディレクトリから実行する
# NG: プロジェクトルートから実行 → vitest.config.ts の environment 設定が読み込まれない
pnpm vitest run apps/desktop/src/...  # NG

# OK: apps/desktop ディレクトリから実行
pnpm --filter @repo/desktop exec vitest run src/__tests__/chatSlice.test.ts
# または
cd apps/desktop && pnpm vitest run src/__tests__/chatSlice.test.ts
```

---

## 6. TDD Red 状態確認

Phase 4 終了時点では、以下の全テストが **RED（失敗）** 状態であることを確認する。
実装（Phase 5）前にテストが GREEN になっている場合は、既存実装との重複または誤ったモック設定の可能性がある。

### 6.1 Red 状態確認手順

```bash
# Phase 4 完了後の Red 状態確認
pnpm --filter @repo/desktop exec vitest run src/__tests__/

# 期待結果: 全テストが FAIL（実装がまだ存在しないため）
# ただし、テストコード自体の構文エラーがないことを確認する
```

### 6.2 Red 状態必須のテストケース

| テストケース ID | 対象                    | Red になる理由                               |
| --------------- | ----------------------- | -------------------------------------------- |
| UT-001〜003     | chatSlice               | providerId/modelId 必須ロジック未実装        |
| UT-005          | llmSlice                | AI_CHECK_CONNECTION 廃止未実装               |
| UT-009          | LLMConfigProvider       | DEFAULT_CONFIG fallback 廃止未実装           |
| IT-002〜004     | AI_CHAT IPC             | P42 バリデーション未実装                     |
| IT-009          | AI_CHECK_CONNECTION廃止 | ハンドラ削除未実施                           |
| IT-012, IT-012b | auth-key:exists         | source フィールド追加未実装                  |
| CT-001          | ChatView                | selectedProviderId=null での disabled 未実装 |
| CT-006〜008     | SettingsView            | capability 表示ロジック未実装                |

### 6.3 既存テストが Green の場合の対処

既存実装により Green になっているケースは、実装変更によって **Red に戻ることを確認** してから Phase 5 を開始する。
