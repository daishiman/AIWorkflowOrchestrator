# LLM UI/IPC/Adapter 要件定義書

## 文書情報

| 項目           | 内容                        |
| -------------- | --------------------------- |
| プロジェクト名 | LLM UI/IPC/Adapter 実装     |
| タスクID       | TASK-LLM-UI-IPC-ADAPTER-001 |
| 文書バージョン | 1.0.0                       |
| 作成日         | 2026-01-09                  |
| 最終更新日     | 2026-01-09                  |
| 作成者         | Claude Code                 |
| 親タスク       | TASK-CHAT-LLM-SWITCH-001    |

## 変更履歴

| バージョン | 日付       | 変更者      | 変更内容 |
| ---------- | ---------- | ----------- | -------- |
| 1.0.0      | 2026-01-09 | Claude Code | 初版作成 |

---

## 1. 概要

### 1.1 目的

`chat-multi-llm-switching` タスクで整備された基盤（Zodスキーマ、llmSlice、IPCチャンネル定義、テストスイート）を活用し、チャット内でLLMプロバイダー・モデルを動的に切り替えるための実装層（UI/IPC/Adapter）を完成させる。

### 1.2 背景

Phase 1〜10で以下の基盤が整備済み:

| 基盤                 | パス                                                 | 状態 |
| -------------------- | ---------------------------------------------------- | ---- |
| Zodスキーマ          | `packages/shared/src/types/llm/schemas/`             | 完了 |
| 状態管理（llmSlice） | `apps/desktop/src/renderer/store/slices/llmSlice.ts` | 完了 |
| IPCチャンネル定義    | `apps/desktop/src/preload/channels.ts`               | 完了 |
| Preload API定義      | `apps/desktop/src/preload/index.ts`                  | 完了 |
| テストスイート       | 390件（100%成功）                                    | 完了 |

Phase 11で以下が未実装であることが判明しブロックされた:

1. UIコンポーネント
2. IPCハンドラー
3. LLMアダプター

### 1.3 スコープ

**スコープ内**:

| カテゴリ         | 成果物                                                              |
| ---------------- | ------------------------------------------------------------------- |
| UIコンポーネント | ProviderSelector, ModelSelector, HealthIndicator, LLMSelectorPanel  |
| IPCハンドラー    | llm:get-providers, llm:check-health, llm:send-chat, llm:stream-chat |
| LLMアダプター    | OpenAIAdapter, AnthropicAdapter, GoogleAdapter, xAIAdapter          |
| ファクトリー     | LLMAdapterFactory                                                   |

**スコープ外**:

- ローカルLLM（Ollama等）対応
- 同時に複数LLMへの送信
- LLMの自動選択/コスト最適化
- APIキー管理UI（既存機能を使用）

### 1.4 用語定義

| 用語        | 定義                                                       |
| ----------- | ---------------------------------------------------------- |
| LLMProvider | LLMサービス提供者（OpenAI, Anthropic, Google, xAI）        |
| LLMModel    | 特定プロバイダーが提供するモデル（GPT-4o, Claude-3.5など） |
| LLMAdapter  | 各プロバイダーAPIへの接続を抽象化するアダプター            |
| HealthCheck | プロバイダーへの接続状態を確認する機能                     |
| IPC         | Electron Inter-Process Communication (Renderer ↔ Main)     |
| llmSlice    | Zustand状態管理のLLM専用スライス                           |

---

## 2. ステークホルダー

### 2.1 ステークホルダー一覧

| ステークホルダー   | 役割       | 関心事                              |
| ------------------ | ---------- | ----------------------------------- |
| エンドユーザー     | 機能利用者 | 簡単にLLMを切り替えてチャットしたい |
| 開発者             | 保守担当   | 型安全で保守しやすいコード          |
| プロダクトオーナー | 意思決定者 | 機能完成とユーザー体験向上          |

### 2.2 ユーザー分類

| ユーザータイプ | 説明                   | 技術レベル |
| -------------- | ---------------------- | ---------- |
| 一般ユーザー   | チャット機能を利用する | 低〜中     |
| パワーユーザー | 複数LLMを使い分ける    | 中〜高     |

---

## 3. 機能要件

### 3.1 機能要件一覧

| ID     | 要件名                   | 優先度 | ステータス |
| ------ | ------------------------ | ------ | ---------- |
| FR-001 | プロバイダー選択         | Must   | Draft      |
| FR-002 | モデル選択               | Must   | Draft      |
| FR-003 | 接続状態表示             | Must   | Draft      |
| FR-004 | チャットメッセージ送信   | Must   | Draft      |
| FR-005 | ストリーミングレスポンス | Should | Draft      |
| FR-006 | プロバイダー一覧取得     | Must   | Draft      |
| FR-007 | ヘルスチェック実行       | Must   | Draft      |
| FR-008 | エラーハンドリング       | Must   | Draft      |

### 3.2 機能要件詳細

#### FR-001: プロバイダー選択

**概要**: ユーザーが利用可能なLLMプロバイダーを選択できる

**アクター**: エンドユーザー

**前提条件**:

- 少なくとも1つのプロバイダーのAPIキーが設定されている
- llmSliceにプロバイダー一覧が読み込まれている

**トリガー**: チャット画面でプロバイダーセレクターをクリック

**基本フロー**:

1. ユーザーがProviderSelectorをクリックする
2. 利用可能なプロバイダー一覧がドロップダウンで表示される
3. ユーザーがプロバイダーを選択する
4. llmSlice.selectProvider()が呼ばれ、状態が更新される
5. 選択プロバイダーに応じたモデル一覧がModelSelectorに反映される

**代替フロー**:

- APIキー未設定: 該当プロバイダーは無効表示（isAvailable: false）

**事後条件**:

- selectedProviderIdが更新されている
- 対応するデフォルトモデルがselectedModelIdに設定される

**優先度**: Must
**ステータス**: Draft
**関連要件**: FR-002, FR-006

---

#### FR-002: モデル選択

**概要**: 選択したプロバイダーのモデル一覧から使用モデルを選択できる

**アクター**: エンドユーザー

**前提条件**:

- プロバイダーが選択されている（selectedProviderId != null）

**トリガー**: ModelSelectorをクリック

**基本フロー**:

1. ユーザーがModelSelectorをクリックする
2. 選択プロバイダーのモデル一覧が表示される
3. ユーザーがモデルを選択する
4. llmSlice.selectModel()が呼ばれ、状態が更新される

**事後条件**:

- selectedModelIdが更新されている

**優先度**: Must
**ステータス**: Draft
**関連要件**: FR-001

---

#### FR-003: 接続状態表示

**概要**: 各プロバイダーの接続状態（healthy/degraded/unhealthy）を視覚的に表示する

**アクター**: エンドユーザー

**前提条件**:

- プロバイダー一覧が読み込まれている

**トリガー**:

- 画面表示時（自動）
- 手動更新ボタンクリック

**基本フロー**:

1. HealthIndicatorコンポーネントがマウントされる
2. llmSlice.checkHealth()を呼び出す
3. healthStatusにHealthCheckResultが格納される
4. 状態に応じたアイコン/色で表示（緑: connected、黄: degraded、赤: error）

**代替フロー**:

- ヘルスチェック失敗: errorステータスとエラーメッセージを表示

**事後条件**:

- healthStatus[providerId]が更新されている

**優先度**: Must
**ステータス**: Draft
**関連要件**: FR-007

---

#### FR-004: チャットメッセージ送信

**概要**: 選択したプロバイダー/モデルにチャットメッセージを送信し、レスポンスを受信する

**アクター**: エンドユーザー

**前提条件**:

- プロバイダーとモデルが選択されている
- 該当プロバイダーのAPIキーが有効

**トリガー**: チャット送信ボタンクリック

**基本フロー**:

1. ユーザーがメッセージを入力して送信する
2. LLMChatRequestが作成される
3. IPC経由でMain Processにリクエストが送信される
4. LLMAdapterが外部APIを呼び出す
5. レスポンスがRenderer Processに返却される
6. チャット画面に応答が表示される

**代替フロー**:

- API エラー: LLMErrorをUIに表示
- タイムアウト: リトライ可能なエラーとして表示

**事後条件**:

- チャット履歴が更新されている
- エラー時はerrorステートが更新されている

**ビジネスルール**:

- リクエストはZodスキーマでバリデーションされる
- エラーはLLMErrorSchemaに準拠する

**優先度**: Must
**ステータス**: Draft
**関連要件**: FR-005, FR-008

---

#### FR-005: ストリーミングレスポンス

**概要**: チャットレスポンスをストリーミングで表示する

**アクター**: エンドユーザー

**前提条件**:

- FR-004の前提条件を満たす
- stream: true でリクエストが送信される

**トリガー**: ストリーミング有効でチャット送信

**基本フロー**:

1. stream: true のLLMChatRequestを送信する
2. IPC経由でストリーミングチャンネルに接続する
3. 受信したチャンクをリアルタイムで表示する
4. ストリーム完了時に最終状態を確定する

**代替フロー**:

- ストリーム中断: 部分応答を表示し、エラーを通知

**事後条件**:

- 完全なレスポンスがチャット履歴に格納されている

**優先度**: Should
**ステータス**: Draft
**関連要件**: FR-004

---

#### FR-006: プロバイダー一覧取得

**概要**: 利用可能なLLMプロバイダーの一覧をIPC経由で取得する

**アクター**: システム（自動）

**前提条件**:

- Electronアプリが起動している
- IPCハンドラーが登録されている

**トリガー**: アプリ起動時、llmSlice.fetchProviders()呼び出し時

**基本フロー**:

1. Renderer ProcessからllmSlice.fetchProviders()を呼び出す
2. window.electronAPI.llm.getProviders()がIPC経由でMain Processを呼び出す
3. Main Processがプロバイダー設定を読み込む
4. APIキー設定状況を確認してisAvailableを設定する
5. LLMProvider[]をRenderer Processに返却する

**代替フロー**:

- IPC通信失敗: UNKNOWNエラーを返却

**事後条件**:

- llmSlice.providersが更新されている

**優先度**: Must
**ステータス**: Draft
**関連要件**: FR-001

---

#### FR-007: ヘルスチェック実行

**概要**: 指定プロバイダーへの接続状態を確認する

**アクター**: システム/ユーザー

**前提条件**:

- プロバイダーが指定されている

**トリガー**: llmSlice.checkHealth()呼び出し

**基本フロー**:

1. Renderer Processからwindow.electronAPI.llm.checkHealth(providerId)を呼び出す
2. Main ProcessがLLMAdapterのhealthCheck()を実行する
3. APIエンドポイントに軽量リクエストを送信する
4. レイテンシを計測してHealthCheckResultを返却する

**代替フロー**:

- APIキー無効: status: "error", errorMessage: "API_KEY_INVALID"
- ネットワークエラー: status: "error", errorMessage: "NETWORK_ERROR"

**事後条件**:

- HealthCheckResultが返却される

**優先度**: Must
**ステータス**: Draft
**関連要件**: FR-003

---

#### FR-008: エラーハンドリング

**概要**: LLM操作中のエラーを適切に処理・表示する

**アクター**: システム

**前提条件**:

- LLM操作が実行されている

**トリガー**: エラー発生時

**基本フロー**:

1. エラーが発生する
2. LLMErrorSchemaに準拠したエラーオブジェクトを生成する
3. retryableフラグに応じてリトライ可否を判定する
4. llmSlice.errorに格納する
5. UIにエラーメッセージを表示する

**エラーコード一覧**:

| コード                  | 説明                 | リトライ可能 |
| ----------------------- | -------------------- | ------------ |
| API_KEY_MISSING         | APIキー未設定        | No           |
| API_KEY_INVALID         | APIキー無効          | No           |
| NETWORK_ERROR           | ネットワークエラー   | Yes          |
| TIMEOUT                 | タイムアウト         | Yes          |
| RATE_LIMIT              | レート制限超過       | Yes          |
| CONTEXT_LENGTH_EXCEEDED | コンテキスト長超過   | No           |
| CONTENT_FILTER          | コンテンツフィルター | No           |
| MODEL_NOT_FOUND         | モデル未検出         | No           |
| SERVICE_UNAVAILABLE     | サービス利用不可     | Yes          |
| UNKNOWN                 | 不明なエラー         | No           |

**優先度**: Must
**ステータス**: Draft
**関連要件**: FR-004, FR-007

---

## 4. 非機能要件

### 4.1 非機能要件一覧

| ID      | カテゴリ         | 要件名           | 優先度   |
| ------- | ---------------- | ---------------- | -------- |
| NFR-001 | パフォーマンス   | UI応答時間       | High     |
| NFR-002 | パフォーマンス   | IPC通信時間      | High     |
| NFR-003 | 信頼性           | エラーリカバリ   | High     |
| NFR-004 | セキュリティ     | APIキー保護      | Critical |
| NFR-005 | 保守性           | 型安全性         | High     |
| NFR-006 | テスト容易性     | テストカバレッジ | High     |
| NFR-007 | アクセシビリティ | キーボード操作   | Medium   |

### 4.2 パフォーマンス要件

#### NFR-001: UI応答時間

**指標**: プロバイダー/モデル選択の応答時間
**目標値**: 100ms以内
**測定方法**: ユーザー操作から状態更新完了まで
**重要度**: High

#### NFR-002: IPC通信時間

**指標**: IPC往復時間（ローカル処理のみ）
**目標値**: 50ms以内
**測定方法**: invoke〜応答受信まで
**重要度**: High

### 4.3 信頼性要件

#### NFR-003: エラーリカバリ

**指標**: リトライ可能エラーの自動リカバリ
**目標値**: 3回までの自動リトライ
**測定方法**: 成功率（リトライ後の成功を含む）
**重要度**: High

### 4.4 セキュリティ要件

#### NFR-004: APIキー保護

**指標**: APIキーの安全な保管
**目標値**:

- APIキーはRenderer Processに露出しない
- Secure Storage使用
- ログにAPIキーを出力しない
  **測定方法**: セキュリティレビュー
  **重要度**: Critical

### 4.5 保守性要件

#### NFR-005: 型安全性

**指標**: TypeScript型エラー
**目標値**: 0件
**測定方法**: tsc --noEmit
**重要度**: High

### 4.6 テスト容易性要件

#### NFR-006: テストカバレッジ

**指標**: ユニットテストカバレッジ
**目標値**:

- Line Coverage: 80%+
- Branch Coverage: 60%+
- Function Coverage: 80%+
  **測定方法**: Vitest coverage report
  **重要度**: High

### 4.7 アクセシビリティ要件

#### NFR-007: キーボード操作

**指標**: セレクター操作
**目標値**: Tab/Enter/Arrow keysで完全操作可能
**測定方法**: 手動テスト
**重要度**: Medium

---

## 5. 制約条件

### 5.1 技術的制約

- 既存のZodスキーマを使用する（変更不可）
- 既存のllmSliceインターフェースを維持する
- Electron IPC経由でMain/Renderer通信を行う
- TypeScript strictモードに準拠する

### 5.2 ビジネス制約

- 対応プロバイダーは4社（OpenAI, Anthropic, Google, xAI）に限定
- 各プロバイダーAPIの利用規約に準拠する

### 5.3 運用制約

- APIキーはユーザーが自身で取得・設定する
- 外部API呼び出しにはインターネット接続が必要

---

## 6. 前提条件

- `packages/shared` がビルド済みであること
- 既存のllmSlice/スキーマ/テストが正常動作すること
- 各プロバイダーのAPIドキュメントが利用可能であること

---

## 7. 依存関係

### 7.1 外部システム依存

| システム      | 依存内容        | リスク      |
| ------------- | --------------- | ----------- |
| OpenAI API    | チャット完了API | API仕様変更 |
| Anthropic API | メッセージAPI   | API仕様変更 |
| Google AI API | Gemini API      | API仕様変更 |
| xAI API       | Grok API        | API仕様変更 |

### 7.2 内部依存

| 依存元  | 依存先                   |
| ------- | ------------------------ |
| UI      | llmSlice, Preload API    |
| IPC     | LLMAdapter, Zodスキーマ  |
| Adapter | 外部SDK、LLMConfigSchema |

### 7.3 要件間依存

```
FR-006 → FR-001（プロバイダー一覧取得→プロバイダー選択）
FR-001 → FR-002（プロバイダー選択→モデル選択）
FR-007 → FR-003（ヘルスチェック→接続状態表示）
FR-001, FR-002 → FR-004（選択完了→チャット送信）
FR-004 → FR-005（通常送信→ストリーミング）
```

---

## 8. リスク

| ID    | リスク                 | 影響度 | 発生確率 | 対策                                  |
| ----- | ---------------------- | ------ | -------- | ------------------------------------- |
| R-001 | LLM API仕様変更        | 中     | 低       | アダプターパターンで変更を局所化      |
| R-002 | レート制限             | 中     | 中       | リトライロジック + retryAfterMs       |
| R-003 | ストリーミング実装複雑 | 高     | 中       | 段階的実装（非ストリーム→ストリーム） |
| R-004 | 各社SDK非互換          | 中     | 低       | 共通インターフェースで抽象化          |

---

## 9. 接続要件（統合テスト連携）

### 9.1 API接続

| IPCチャンネル     | 方向            | 説明                   |
| ----------------- | --------------- | ---------------------- |
| llm:get-providers | Renderer → Main | プロバイダー一覧取得   |
| llm:check-health  | Renderer → Main | ヘルスチェック実行     |
| llm:send-chat     | Renderer → Main | チャットリクエスト送信 |
| llm:stream-chat   | Renderer ↔ Main | ストリーミングチャット |

### 9.2 認証フロー

```
1. ユーザーが設定画面でAPIキーを入力
2. apiKey:save IPC経由でSecure Storageに保存
3. LLMAdapter初期化時にSecure Storageからキー取得
4. 外部API呼び出し時にAuthorizationヘッダーに設定
```

### 9.3 データフロー

```
[UI] ProviderSelector/ModelSelector
    ↓ (ユーザー操作)
[llmSlice] selectProvider/selectModel
    ↓ (状態更新)
[UI] ChatInput
    ↓ (送信)
[Preload] window.electronAPI.llm.sendChat
    ↓ (IPC)
[Main] IPCハンドラー
    ↓ (アダプター呼び出し)
[Adapter] OpenAI/Anthropic/Google/xAIAdapter
    ↓ (HTTP)
[外部API] LLMプロバイダー
    ↓ (レスポンス)
[Adapter] → [Main] → [Preload] → [llmSlice] → [UI]
```

---

## 付録

### A. 既存スキーマ参照

| スキーマ                | ファイル                                            |
| ----------------------- | --------------------------------------------------- |
| LLMProviderIdSchema     | `packages/shared/src/types/llm/schemas/provider.ts` |
| LLMModelSchema          | `packages/shared/src/types/llm/schemas/provider.ts` |
| LLMProviderSchema       | `packages/shared/src/types/llm/schemas/provider.ts` |
| LLMChatRequestSchema    | `packages/shared/src/types/llm/schemas/request.ts`  |
| HealthCheckResultSchema | `packages/shared/src/types/llm/schemas/health.ts`   |
| LLMErrorSchema          | `packages/shared/src/types/llm/schemas/error.ts`    |

### B. 成果物配置先

| 成果物               | 配置先                                          |
| -------------------- | ----------------------------------------------- |
| UIコンポーネント     | `apps/desktop/src/renderer/components/llm/`     |
| IPCハンドラー        | `apps/desktop/src/main/handlers/llm.ts`         |
| LLMアダプター        | `apps/desktop/src/main/adapters/llm/`           |
| アダプターファクトリ | `apps/desktop/src/main/adapters/llm/factory.ts` |
