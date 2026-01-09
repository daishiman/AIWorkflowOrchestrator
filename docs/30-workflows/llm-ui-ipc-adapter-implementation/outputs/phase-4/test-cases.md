# Phase 4: テストケース一覧

## 文書情報

| 項目     | 内容                        |
| -------- | --------------------------- |
| タスクID | TASK-LLM-UI-IPC-ADAPTER-001 |
| Phase    | 4                           |
| 作成日   | 2026-01-09                  |

---

## 1. UIコンポーネントテストケース

### 1.1 ProviderSelector

| ID     | テストケース                 | 入力                              | 期待結果                                 | AC        |
| ------ | ---------------------------- | --------------------------------- | ---------------------------------------- | --------- |
| UI-001 | プロバイダー一覧表示         | providers: [OpenAI, Anthropic]    | ドロップダウンに2プロバイダー表示        | AC-UI-001 |
| UI-002 | 有効プロバイダーのみ選択可能 | OpenAI(available), Anthropic(not) | OpenAIのみ選択可能、Anthropicはdisabled  | AC-UI-001 |
| UI-003 | プロバイダー選択イベント発火 | ユーザーがOpenAI選択              | onSelect("openai")が呼び出される         | AC-UI-001 |
| UI-004 | 選択状態の表示               | selectedProviderId: "openai"      | OpenAIが選択状態で表示                   | AC-UI-001 |
| UI-005 | 空の状態表示                 | providers: []                     | "プロバイダーがありません"メッセージ表示 | EC-001    |
| UI-006 | ローディング状態             | isLoading: true                   | ローディングスピナー表示、選択不可       | -         |

### 1.2 ModelSelector

| ID     | テストケース           | 入力                             | 期待結果                                      | AC        |
| ------ | ---------------------- | -------------------------------- | --------------------------------------------- | --------- |
| UI-007 | モデル一覧表示         | models: [GPT-4o, GPT-4, GPT-3.5] | ドロップダウンに3モデル表示                   | AC-UI-002 |
| UI-008 | デフォルトモデル選択   | GPT-4o(isDefault: true)          | GPT-4oが初期選択状態                          | AC-UI-002 |
| UI-009 | モデル選択イベント発火 | ユーザーがGPT-4選択              | onSelect("gpt-4")が呼び出される               | AC-UI-002 |
| UI-010 | プロバイダー未選択時   | selectedProviderId: null         | ModelSelector無効化、"先にプロバイダーを選択" | -         |
| UI-011 | 空モデル一覧           | models: []                       | "モデルがありません"メッセージ表示            | EC-001    |

### 1.3 HealthIndicator

| ID     | テストケース       | 入力                         | 期待結果                                    | AC        |
| ------ | ------------------ | ---------------------------- | ------------------------------------------- | --------- |
| UI-012 | 正常接続表示       | status: "connected"          | 緑色インジケーター、"Connected"ツールチップ | AC-UI-003 |
| UI-013 | エラー状態表示     | status: "error"              | 赤色インジケーター、エラーメッセージ表示    | AC-UI-003 |
| UI-014 | 確認中状態表示     | status: "checking"           | ローディングスピナー、"Checking..."         | AC-UI-003 |
| UI-015 | 更新ボタンクリック | ユーザーが更新ボタンクリック | onRefresh()が呼び出される                   | AC-UI-003 |
| UI-016 | 未確認状態         | healthStatus: undefined      | グレー色インジケーター、"未確認"            | -         |

### 1.4 LLMSelectorPanel

| ID     | テストケース                     | 入力                      | 期待結果                                | AC        |
| ------ | -------------------------------- | ------------------------- | --------------------------------------- | --------- |
| UI-017 | 統合パネルレンダリング           | 通常状態                  | 3コンポーネント全て表示                 | AC-UI-004 |
| UI-018 | マウント時fetchProviders呼び出し | コンポーネントマウント    | llmSlice.fetchProviders()が呼び出される | AC-UI-004 |
| UI-019 | ローディングオーバーレイ         | isLoading: true           | オーバーレイ表示、操作不可              | AC-UI-004 |
| UI-020 | エラー表示                       | error: { message: "..." } | エラーメッセージ表示                    | AC-UI-004 |
| UI-021 | リトライボタン表示               | error.retryable: true     | "リトライ"ボタン表示                    | AC-UI-004 |

---

## 2. IPCハンドラーテストケース

### 2.1 llm:get-providers

| ID      | テストケース             | 入力                              | 期待結果                                 | AC         |
| ------- | ------------------------ | --------------------------------- | ---------------------------------------- | ---------- |
| IPC-001 | プロバイダー一覧取得成功 | -                                 | LLMProvider[]返却、isAvailable正確       | AC-IPC-001 |
| IPC-002 | APIキー設定状況反映      | OpenAI: 設定済、Anthropic: 未設定 | OpenAI.isAvailable=true, Anthropic=false | AC-IPC-001 |
| IPC-003 | ハンドラー未登録時       | ハンドラー未登録                  | エラー返却                               | AC-IPC-001 |

### 2.2 llm:check-health

| ID      | テストケース         | 入力                  | 期待結果                          | AC         |
| ------- | -------------------- | --------------------- | --------------------------------- | ---------- |
| IPC-004 | 正常ヘルスチェック   | providerId: "openai"  | status: "connected", latency > 0  | AC-IPC-002 |
| IPC-005 | APIキー無効時        | 無効なAPIキー         | status: "error", errorMessage含む | AC-IPC-002 |
| IPC-006 | ネットワークエラー時 | ネットワーク切断      | status: "error", NETWORK_ERROR    | AC-IPC-002 |
| IPC-007 | 無効なproviderId     | providerId: "invalid" | エラー返却                        | -          |

### 2.3 llm:send-chat

| ID      | テストケース         | 入力                 | 期待結果                                | AC         |
| ------- | -------------------- | -------------------- | --------------------------------------- | ---------- |
| IPC-008 | 正常チャット送信     | 有効なLLMChatRequest | success: true, data.content含む         | AC-IPC-003 |
| IPC-009 | バリデーションエラー | messages: []         | success: false, error.code="UNKNOWN"    | AC-IPC-003 |
| IPC-010 | レート制限           | APIがレート制限返却  | success: false, error.code="RATE_LIMIT" | AC-IPC-003 |
| IPC-011 | タイムアウト         | 30秒以上応答なし     | success: false, error.code="TIMEOUT"    | EC-003     |

### 2.4 llm:stream-chat

| ID      | テストケース       | 入力                   | 期待結果                               | AC         |
| ------- | ------------------ | ---------------------- | -------------------------------------- | ---------- |
| IPC-012 | ストリーミング開始 | stream: true           | 複数のチャンクイベント発火             | AC-IPC-004 |
| IPC-013 | ストリーム完了     | 全チャンク受信完了     | 完了イベント発火                       | AC-IPC-004 |
| IPC-014 | ストリーム中断     | ネットワークエラー発生 | エラーイベント発火、部分レスポンス保持 | AC-IPC-004 |
| IPC-015 | チャンクデータ形式 | 各チャンク受信         | delta.content含む                      | AC-IPC-004 |

### 2.5 バリデーション共通

| ID      | テストケース                 | 入力                    | 期待結果                | AC  |
| ------- | ---------------------------- | ----------------------- | ----------------------- | --- |
| IPC-016 | 無効なペイロード（型エラー） | providerId: 123（数値） | Zodバリデーションエラー | -   |
| IPC-017 | 必須フィールド欠落           | messages未指定          | Zodバリデーションエラー | -   |

---

## 3. LLMアダプターテストケース

### 3.1 OpenAIAdapter

| ID      | テストケース        | 入力             | 期待結果                                  | AC             |
| ------- | ------------------- | ---------------- | ----------------------------------------- | -------------- |
| ADP-001 | sendChat正常        | 有効なリクエスト | LLMChatResponse返却                       | AC-ADAPTER-001 |
| ADP-002 | streamChat正常      | stream: true     | AsyncGenerator<StreamChunk>返却           | AC-ADAPTER-001 |
| ADP-003 | checkHealth正常     | 有効なAPIキー    | HealthCheckResult(connected)返却          | AC-ADAPTER-001 |
| ADP-004 | 401エラーマッピング | 無効なAPIキー    | LLMError(API_KEY_INVALID)                 | AC-ADAPTER-001 |
| ADP-005 | 429エラーマッピング | レート制限       | LLMError(RATE_LIMIT, retryAfterMs)        | AC-ADAPTER-001 |
| ADP-006 | 500エラーマッピング | サーバーエラー   | LLMError(PROVIDER_ERROR, retryable: true) | -              |
| ADP-007 | ネットワークエラー  | fetch失敗        | LLMError(NETWORK_ERROR)                   | -              |

### 3.2 AnthropicAdapter

| ID      | テストケース           | 入力                 | 期待結果                              | AC             |
| ------- | ---------------------- | -------------------- | ------------------------------------- | -------------- |
| ADP-008 | sendChat正常           | 有効なリクエスト     | LLMChatResponse返却                   | AC-ADAPTER-002 |
| ADP-009 | システムプロンプト変換 | systemPrompt設定あり | Anthropic形式のsystemパラメータに変換 | AC-ADAPTER-002 |
| ADP-010 | エラーマッピング       | 各種エラー           | LLMErrorに適切に変換                  | AC-ADAPTER-002 |

### 3.3 GoogleAdapter

| ID      | テストケース       | 入力             | 期待結果            | AC             |
| ------- | ------------------ | ---------------- | ------------------- | -------------- |
| ADP-011 | sendChat正常       | 有効なリクエスト | LLMChatResponse返却 | AC-ADAPTER-003 |
| ADP-012 | リクエスト形式変換 | LLMChatRequest   | Gemini形式に変換    | AC-ADAPTER-003 |

### 3.4 xAIAdapter

| ID      | テストケース | 入力             | 期待結果            | AC             |
| ------- | ------------ | ---------------- | ------------------- | -------------- |
| ADP-013 | sendChat正常 | 有効なリクエスト | LLMChatResponse返却 | AC-ADAPTER-004 |

### 3.5 LLMAdapterFactory

| ID      | テストケース            | 入力                      | 期待結果                     | AC             |
| ------- | ----------------------- | ------------------------- | ---------------------------- | -------------- |
| ADP-014 | OpenAIアダプター取得    | providerId: "openai"      | OpenAIAdapterインスタンス    | AC-ADAPTER-005 |
| ADP-015 | Anthropicアダプター取得 | providerId: "anthropic"   | AnthropicAdapterインスタンス | AC-ADAPTER-005 |
| ADP-016 | Googleアダプター取得    | providerId: "google"      | GoogleAdapterインスタンス    | AC-ADAPTER-005 |
| ADP-017 | xAIアダプター取得       | providerId: "xai"         | xAIAdapterインスタンス       | AC-ADAPTER-005 |
| ADP-018 | 未知のプロバイダー      | providerId: "unknown"     | "Unknown provider"エラー     | AC-ADAPTER-005 |
| ADP-019 | アダプターキャッシング  | 同一providerId2回呼び出し | 同一インスタンス返却         | -              |
| ADP-020 | キャッシュクリア        | clearInstance("openai")   | 次回呼び出しで新インスタンス | -              |

---

## 4. 境界値テストケース

### 4.1 メッセージ長

| ID     | テストケース     | 入力                     | 期待結果             |
| ------ | ---------------- | ------------------------ | -------------------- |
| BV-001 | 空メッセージ配列 | messages: []             | バリデーションエラー |
| BV-002 | 1メッセージ      | messages: [1件]          | 正常処理             |
| BV-003 | 最大メッセージ数 | messages: [MAX_MESSAGES] | 正常処理またはエラー |

### 4.2 コンテンツ長

| ID     | テストケース       | 入力                      | 期待結果                             |
| ------ | ------------------ | ------------------------- | ------------------------------------ |
| BV-004 | 空文字列コンテンツ | content: ""               | バリデーションエラー                 |
| BV-005 | 1文字コンテンツ    | content: "a"              | 正常処理                             |
| BV-006 | 最大トークン長     | content: MAX_TOKEN_LENGTH | 正常処理またはコンテキスト超過エラー |

### 4.3 パラメータ境界

| ID     | テストケース    | 入力             | 期待結果                   |
| ------ | --------------- | ---------------- | -------------------------- |
| BV-007 | temperature=0.0 | temperature: 0.0 | 正常処理（決定論的出力）   |
| BV-008 | temperature=2.0 | temperature: 2.0 | 正常処理（最大ランダム性） |
| BV-009 | temperature=2.1 | temperature: 2.1 | バリデーションエラー       |
| BV-010 | maxTokens=1     | maxTokens: 1     | 正常処理（最小出力）       |

---

## 5. エラーケーステストケース

### 5.1 ネットワークエラー

| ID      | テストケース     | 入力         | 期待結果      |
| ------- | ---------------- | ------------ | ------------- |
| ERR-001 | DNS解決失敗      | 無効なホスト | NETWORK_ERROR |
| ERR-002 | 接続タイムアウト | 応答なし     | TIMEOUT       |
| ERR-003 | 接続リセット     | ECONNRESET   | NETWORK_ERROR |

### 5.2 APIエラー

| ID      | テストケース              | 入力                 | 期待結果        |
| ------- | ------------------------- | -------------------- | --------------- |
| ERR-004 | 400 Bad Request           | 不正なリクエスト形式 | UNKNOWN         |
| ERR-005 | 401 Unauthorized          | 無効なAPIキー        | API_KEY_INVALID |
| ERR-006 | 403 Forbidden             | 権限なし             | API_KEY_INVALID |
| ERR-007 | 404 Not Found             | 無効なモデル         | MODEL_NOT_FOUND |
| ERR-008 | 429 Too Many Requests     | レート制限           | RATE_LIMIT      |
| ERR-009 | 500 Internal Server Error | サーバーエラー       | PROVIDER_ERROR  |
| ERR-010 | 503 Service Unavailable   | サービス停止         | PROVIDER_ERROR  |

---

## 6. テストケースサマリー

| カテゴリ         | テストケース数 | カバーするAC        |
| ---------------- | -------------- | ------------------- |
| UIコンポーネント | 21             | AC-UI-001〜004      |
| IPCハンドラー    | 17             | AC-IPC-001〜004     |
| LLMアダプター    | 20             | AC-ADAPTER-001〜005 |
| 境界値           | 10             | -                   |
| エラーケース     | 10             | -                   |
| **合計**         | **78**         | 全AC                |
