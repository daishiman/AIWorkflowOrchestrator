# LLM UI/IPC/Adapter 受け入れ基準

## 文書情報

| 項目     | 内容                        |
| -------- | --------------------------- |
| タスクID | TASK-LLM-UI-IPC-ADAPTER-001 |
| 関連文書 | requirements-definition.md  |
| 作成日   | 2026-01-09                  |
| 形式     | Given-When-Then (GWT)       |

---

## UIコンポーネント受け入れ基準

### AC-UI-001: ProviderSelector - プロバイダー一覧表示

```gherkin
Feature: プロバイダー選択
  As a ユーザー
  I want to LLMプロバイダーを選択したい
  So that 好みのLLMサービスを利用できる

  Scenario: 利用可能なプロバイダー一覧の表示
    Given llmSliceにプロバイダー一覧が読み込まれている
    And 少なくとも1つのプロバイダーのAPIキーが設定されている
    When ProviderSelectorコンポーネントがレンダリングされる
    Then 全プロバイダーがドロップダウンに表示される
    And APIキー設定済みのプロバイダーは有効状態で表示される
    And APIキー未設定のプロバイダーは無効（グレーアウト）で表示される

  Scenario: プロバイダーの選択
    Given ProviderSelectorが表示されている
    And OpenAIのAPIキーが設定されている
    When ユーザーがOpenAIを選択する
    Then llmSlice.selectedProviderIdが"openai"に更新される
    And ModelSelectorにOpenAIのモデル一覧が表示される
    And 選択されたプロバイダー名がセレクターに表示される

  Scenario: 無効なプロバイダーの選択防止
    Given ProviderSelectorが表示されている
    And AnthropicのAPIキーが未設定（isAvailable: false）
    When ユーザーがAnthropicを選択しようとする
    Then 選択は受け付けられない
    And selectedProviderIdは変更されない
```

### AC-UI-002: ModelSelector - モデル選択

```gherkin
Feature: モデル選択
  As a ユーザー
  I want to 使用するモデルを選択したい
  So that 目的に応じたモデルを利用できる

  Scenario: プロバイダー選択後のモデル一覧表示
    Given selectedProviderIdが"openai"に設定されている
    When ModelSelectorがレンダリングされる
    Then OpenAIの全モデル（GPT-4o, GPT-4, GPT-3.5-turbo等）が表示される
    And デフォルトモデル（isDefault: true）が選択状態で表示される

  Scenario: モデルの選択
    Given ModelSelectorにOpenAIのモデル一覧が表示されている
    And GPT-4oがデフォルト選択されている
    When ユーザーがGPT-4を選択する
    Then llmSlice.selectedModelIdが"gpt-4"に更新される
    And 選択されたモデル名がセレクターに表示される

  Scenario: プロバイダー変更時のモデルリセット
    Given selectedProviderIdが"openai"でGPT-4が選択されている
    When ユーザーがプロバイダーをAnthropicに変更する
    Then selectedModelIdがAnthropicのデフォルトモデルに自動更新される
    And ModelSelectorにAnthropicのモデル一覧が表示される
```

### AC-UI-003: HealthIndicator - 接続状態表示

```gherkin
Feature: 接続状態表示
  As a ユーザー
  I want to プロバイダーの接続状態を確認したい
  So that 利用可能かどうかを判断できる

  Scenario: 正常接続時の表示
    Given OpenAIのヘルスチェックが成功している
    And healthStatus["openai"].statusが"connected"
    When HealthIndicatorがレンダリングされる
    Then 緑色のインジケーター（✓または●）が表示される
    And ツールチップに"Connected"と表示される

  Scenario: エラー時の表示
    Given AnthropicのAPIキーが無効
    And healthStatus["anthropic"].statusが"error"
    When HealthIndicatorがレンダリングされる
    Then 赤色のインジケーター（✗または●）が表示される
    And ツールチップにエラーメッセージが表示される

  Scenario: 接続確認中の表示
    Given ヘルスチェックが実行中
    When HealthIndicatorがレンダリングされる
    Then ローディングスピナーが表示される
    And ツールチップに"Checking..."と表示される

  Scenario: 手動更新
    Given HealthIndicatorが表示されている
    When ユーザーが更新ボタンをクリックする
    Then llmSlice.checkHealth()が呼び出される
    And インジケーターがローディング状態になる
    And 完了後に最新の状態が反映される
```

### AC-UI-004: LLMSelectorPanel - 統合パネル

```gherkin
Feature: LLM選択パネル
  As a ユーザー
  I want to 1つのパネルでプロバイダー/モデル/状態を確認したい
  So that 効率的にLLMを選択できる

  Scenario: パネルの初期表示
    Given チャット画面が表示されている
    When LLMSelectorPanelがマウントされる
    Then ProviderSelectorが表示される
    And ModelSelectorが表示される
    And HealthIndicatorが表示される
    And llmSlice.fetchProviders()が呼び出される

  Scenario: ローディング状態
    Given llmSlice.isLoadingがtrue
    When LLMSelectorPanelがレンダリングされる
    Then パネル全体にローディングオーバーレイが表示される
    And セレクターは操作不可状態になる

  Scenario: エラー状態
    Given llmSlice.errorがnullでない
    When LLMSelectorPanelがレンダリングされる
    Then エラーメッセージが表示される
    And "リトライ"ボタンが表示される（エラーがretryable: trueの場合）
```

---

## IPCハンドラー受け入れ基準

### AC-IPC-001: llm:get-providers ハンドラー

```gherkin
Feature: プロバイダー一覧取得IPC
  As a Renderer Process
  I want to プロバイダー一覧を取得したい
  So that UIに表示できる

  Scenario: 正常取得
    Given Main Processが起動している
    And プロバイダー設定が存在する
    When "llm:get-providers"チャンネルでinvokeする
    Then LLMProvider[]が返却される
    And 各プロバイダーのisAvailableが正しく設定されている
    And 各プロバイダーのmodelsが1つ以上含まれている

  Scenario: APIキー設定状況の反映
    Given OpenAIのAPIキーがSecure Storageに保存されている
    And AnthropicのAPIキーが未設定
    When "llm:get-providers"チャンネルでinvokeする
    Then OpenAIのisAvailableがtrue
    And AnthropicのisAvailableがfalse

  Scenario: IPC通信エラー
    Given Main Processが応答しない
    When "llm:get-providers"チャンネルでinvokeする
    Then Promiseがrejectされる
    And エラーメッセージが含まれる
```

### AC-IPC-002: llm:check-health ハンドラー

```gherkin
Feature: ヘルスチェックIPC
  As a Renderer Process
  I want to プロバイダーの接続状態を確認したい
  So that 利用可能性を判断できる

  Scenario: 正常接続確認
    Given OpenAIのAPIキーが有効
    When "llm:check-health"チャンネルでproviderId="openai"を送信する
    Then HealthCheckResultが返却される
    And statusが"connected"
    And latencyが計測されている（0以上の数値）
    And checkedAtが現在時刻付近

  Scenario: APIキー無効時
    Given AnthropicのAPIキーが無効
    When "llm:check-health"チャンネルでproviderId="anthropic"を送信する
    Then HealthCheckResultが返却される
    And statusが"error"
    And errorMessageに"API_KEY_INVALID"が含まれる

  Scenario: ネットワークエラー時
    Given ネットワーク接続がない
    When "llm:check-health"チャンネルでinvokeする
    Then HealthCheckResultが返却される
    And statusが"error"
    And errorMessageに"NETWORK_ERROR"が含まれる
```

### AC-IPC-003: llm:send-chat ハンドラー

```gherkin
Feature: チャット送信IPC
  As a Renderer Process
  I want to チャットメッセージを送信したい
  So that LLMからレスポンスを受け取れる

  Scenario: 正常チャット送信
    Given OpenAIのAPIキーが有効
    And selectedModelIdが"gpt-4o"
    When "llm:send-chat"チャンネルで有効なLLMChatRequestを送信する
    Then LLMChatResponseが返却される
    And successがtrue
    And data.contentにレスポンステキストが含まれる

  Scenario: バリデーションエラー
    Given 無効なLLMChatRequest（messagesが空）
    When "llm:send-chat"チャンネルでinvokeする
    Then LLMChatResponseが返却される
    And successがfalse
    And error.codeが"UNKNOWN"（バリデーションエラー）

  Scenario: レート制限
    Given OpenAI APIがレート制限を返す
    When "llm:send-chat"チャンネルでinvokeする
    Then LLMChatResponseが返却される
    And successがfalse
    And error.codeが"RATE_LIMIT"
    And error.retryableがtrue
    And error.retryAfterMsが設定されている
```

### AC-IPC-004: llm:stream-chat ハンドラー

```gherkin
Feature: ストリーミングチャットIPC
  As a Renderer Process
  I want to チャットレスポンスをストリーミングで受信したい
  So that リアルタイムで応答を表示できる

  Scenario: ストリーミング開始
    Given OpenAIのAPIキーが有効
    And stream: trueのLLMChatRequest
    When "llm:stream-chat"チャンネルでinvokeする
    Then ストリームイベントが順次発火する
    And 各チャンクにdeltaコンテンツが含まれる

  Scenario: ストリーム完了
    Given ストリーミングが進行中
    When 全チャンクの受信が完了する
    Then 完了イベントが発火する
    And 完全なレスポンスが構築される

  Scenario: ストリーム中断
    Given ストリーミングが進行中
    When ネットワークエラーが発生する
    Then エラーイベントが発火する
    And 部分的なレスポンスは保持される
```

---

## LLMアダプター受け入れ基準

### AC-ADAPTER-001: OpenAIAdapter

```gherkin
Feature: OpenAIアダプター
  As a Main Process
  I want to OpenAI APIを呼び出したい
  So that GPTモデルを利用できる

  Scenario: チャット完了リクエスト
    Given 有効なOpenAI APIキー
    And modelId="gpt-4o"
    When sendChat()を呼び出す
    Then OpenAI Chat Completions APIが呼び出される
    And レスポンスがLLMChatResponseに変換される

  Scenario: ストリーミングリクエスト
    Given 有効なOpenAI APIキー
    And stream=true
    When streamChat()を呼び出す
    Then Server-Sent Eventsでレスポンスを受信
    And 各チャンクがyieldされる

  Scenario: ヘルスチェック
    Given 有効なOpenAI APIキー
    When healthCheck()を呼び出す
    Then /v1/modelsエンドポイントにリクエスト
    And レイテンシを計測してHealthCheckResultを返却

  Scenario: エラーマッピング
    Given OpenAI APIが401エラーを返す
    When sendChat()を呼び出す
    Then LLMErrorに変換される
    And codeが"API_KEY_INVALID"
```

### AC-ADAPTER-002: AnthropicAdapter

```gherkin
Feature: Anthropicアダプター
  As a Main Process
  I want to Anthropic APIを呼び出したい
  So that Claudeモデルを利用できる

  Scenario: メッセージリクエスト
    Given 有効なAnthropic APIキー
    And modelId="claude-3-5-sonnet"
    When sendChat()を呼び出す
    Then Anthropic Messages APIが呼び出される
    And レスポンスがLLMChatResponseに変換される

  Scenario: システムプロンプト処理
    Given systemPromptが設定されている
    When sendChat()を呼び出す
    Then Anthropic形式のsystemパラメータに変換される
```

### AC-ADAPTER-003: GoogleAdapter

```gherkin
Feature: Googleアダプター
  As a Main Process
  I want to Google AI APIを呼び出したい
  So that Geminiモデルを利用できる

  Scenario: コンテンツ生成リクエスト
    Given 有効なGoogle AI APIキー
    And modelId="gemini-pro"
    When sendChat()を呼び出す
    Then Gemini generateContent APIが呼び出される
    And レスポンスがLLMChatResponseに変換される
```

### AC-ADAPTER-004: xAIAdapter

```gherkin
Feature: xAIアダプター
  As a Main Process
  I want to xAI APIを呼び出したい
  So that Grokモデルを利用できる

  Scenario: チャットリクエスト
    Given 有効なxAI APIキー
    And modelId="grok-1"
    When sendChat()を呼び出す
    Then xAI Chat APIが呼び出される
    And レスポンスがLLMChatResponseに変換される
```

### AC-ADAPTER-005: LLMAdapterFactory

```gherkin
Feature: アダプターファクトリー
  As a Main Process
  I want to プロバイダーIDからアダプターを取得したい
  So that 適切なアダプターを使用できる

  Scenario: アダプターの取得
    Given LLMAdapterFactoryが初期化されている
    When getAdapter("openai")を呼び出す
    Then OpenAIAdapterインスタンスが返却される

  Scenario: 全プロバイダーのアダプター取得
    Given LLMAdapterFactoryが初期化されている
    When 各プロバイダーID（openai, anthropic, google, xai）でgetAdapter()を呼び出す
    Then それぞれ対応するアダプターインスタンスが返却される

  Scenario: 未知のプロバイダー
    Given LLMAdapterFactoryが初期化されている
    When getAdapter("unknown")を呼び出す
    Then エラーがスローされる
    And "Unknown provider"メッセージが含まれる
```

---

## 統合テスト受け入れ基準

### AC-INT-001: E2Eフロー

```gherkin
Feature: エンドツーエンドフロー
  As a ユーザー
  I want to プロバイダー選択からチャット送信まで完了したい
  So that LLM切り替え機能を利用できる

  Scenario: 完全なチャットフロー
    Given アプリケーションが起動している
    And OpenAIのAPIキーが設定されている
    When LLMSelectorPanelが表示される
    And ユーザーがOpenAIを選択する
    And ユーザーがGPT-4oを選択する
    And ユーザーがメッセージを入力して送信する
    Then チャット画面にAIの応答が表示される
    And エラーが発生していない

  Scenario: プロバイダー切り替え後のチャット
    Given OpenAIでチャットが完了している
    When ユーザーがプロバイダーをAnthropicに切り替える
    And ユーザーがメッセージを送信する
    Then Anthropic APIが呼び出される
    And チャット画面にClaudeの応答が表示される
```

---

## 品質受け入れ基準

### AC-QUAL-001: テストカバレッジ

```gherkin
Feature: テストカバレッジ
  As a 開発者
  I want to 十分なテストカバレッジを確保したい
  So that コード品質を担保できる

  Scenario: カバレッジ目標達成
    Given すべてのテストが実装されている
    When pnpm test:coverage を実行する
    Then Line Coverageが80%以上
    And Branch Coverageが60%以上
    And Function Coverageが80%以上
```

### AC-QUAL-002: 型安全性

```gherkin
Feature: 型安全性
  As a 開発者
  I want to 型エラーがないことを確認したい
  So that ランタイムエラーを防げる

  Scenario: TypeScriptコンパイル成功
    Given すべての実装が完了している
    When pnpm typecheck を実行する
    Then エラーが0件
    And 警告のみ（あれば）
```

### AC-QUAL-003: Lintチェック

```gherkin
Feature: Lintチェック
  As a 開発者
  I want to コード品質基準を満たしたい
  So that 一貫したコードスタイルを維持できる

  Scenario: ESLintパス
    Given すべての実装が完了している
    When pnpm lint を実行する
    Then エラーが0件
```

---

## エッジケース

### EC-001: 空の状態

- プロバイダー一覧が空の場合、「プロバイダーがありません」メッセージを表示
- モデル一覧が空の場合、「モデルがありません」メッセージを表示

### EC-002: 同時操作

- ヘルスチェック実行中にプロバイダーを切り替えた場合、前回のチェック結果を破棄
- チャット送信中にモデルを切り替えた場合、現在のリクエストは元のモデルで完了

### EC-003: 長時間応答

- APIレスポンスが30秒以上の場合、タイムアウトエラーを返却
- タイムアウト時はretryable: true, retryAfterMs: 5000を設定

### EC-004: 大きなレスポンス

- レスポンスがコンテキスト長を超える場合、CONTEXT_LENGTH_EXCEEDEDエラーを返却
- 部分レスポンスは破棄される

---

## 検証チェックリスト

| ID             | 基準                 | 検証方法       | 結果 |
| -------------- | -------------------- | -------------- | ---- |
| AC-UI-001      | プロバイダー一覧表示 | ユニットテスト | [ ]  |
| AC-UI-002      | モデル選択           | ユニットテスト | [ ]  |
| AC-UI-003      | 接続状態表示         | ユニットテスト | [ ]  |
| AC-UI-004      | 統合パネル           | ユニットテスト | [ ]  |
| AC-IPC-001     | llm:get-providers    | 統合テスト     | [ ]  |
| AC-IPC-002     | llm:check-health     | 統合テスト     | [ ]  |
| AC-IPC-003     | llm:send-chat        | 統合テスト     | [ ]  |
| AC-IPC-004     | llm:stream-chat      | 統合テスト     | [ ]  |
| AC-ADAPTER-001 | OpenAIAdapter        | ユニットテスト | [ ]  |
| AC-ADAPTER-002 | AnthropicAdapter     | ユニットテスト | [ ]  |
| AC-ADAPTER-003 | GoogleAdapter        | ユニットテスト | [ ]  |
| AC-ADAPTER-004 | xAIAdapter           | ユニットテスト | [ ]  |
| AC-ADAPTER-005 | LLMAdapterFactory    | ユニットテスト | [ ]  |
| AC-INT-001     | E2Eフロー            | E2Eテスト      | [ ]  |
| AC-QUAL-001    | テストカバレッジ80%+ | CI/CD          | [ ]  |
| AC-QUAL-002    | 型エラー0件          | CI/CD          | [ ]  |
| AC-QUAL-003    | Lintエラー0件        | CI/CD          | [ ]  |
