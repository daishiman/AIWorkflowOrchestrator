# LLM UI/IPC/Adapter スコープ定義

## 文書情報

| 項目             | 内容                        |
| ---------------- | --------------------------- |
| タスクID         | TASK-LLM-UI-IPC-ADAPTER-001 |
| 作成日           | 2026-01-09                  |
| 関連ドキュメント | requirements-definition.md  |

---

## 1. プロジェクト概要

### 1.1 目的

`chat-multi-llm-switching` タスク（Phase 1〜10完了）で整備された基盤を活用し、チャット内でLLMプロバイダー・モデルを動的に切り替える機能の実装層（UI/IPC/Adapter）を完成させる。

### 1.2 ビジネス目標

| 目標             | 成功指標                            |
| ---------------- | ----------------------------------- |
| ユーザー体験向上 | プロバイダー/モデル選択がUIから可能 |
| 機能完成         | E2Eテストがすべて成功               |
| 保守性確保       | テストカバレッジ80%以上             |

---

## 2. スコープ範囲

### 2.1 含むもの（In Scope）

#### UIコンポーネント

| コンポーネント   | 責務                               | 配置先                                      |
| ---------------- | ---------------------------------- | ------------------------------------------- |
| ProviderSelector | プロバイダー一覧表示・選択         | `apps/desktop/src/renderer/components/llm/` |
| ModelSelector    | 選択プロバイダーのモデル一覧・選択 | `apps/desktop/src/renderer/components/llm/` |
| HealthIndicator  | プロバイダー接続状態表示           | `apps/desktop/src/renderer/components/llm/` |
| LLMSelectorPanel | 上記を統合したパネル               | `apps/desktop/src/renderer/components/llm/` |

#### IPCハンドラー

| チャンネル        | 責務                     | 配置先                                  |
| ----------------- | ------------------------ | --------------------------------------- |
| llm:get-providers | 利用可能プロバイダー取得 | `apps/desktop/src/main/handlers/llm.ts` |
| llm:check-health  | プロバイダー接続状態確認 | `apps/desktop/src/main/handlers/llm.ts` |
| llm:send-chat     | チャットリクエスト送信   | `apps/desktop/src/main/handlers/llm.ts` |
| llm:stream-chat   | ストリーミングチャット   | `apps/desktop/src/main/handlers/llm.ts` |

#### LLMアダプター

| アダプター        | 対応API                    | 配置先                                          |
| ----------------- | -------------------------- | ----------------------------------------------- |
| OpenAIAdapter     | GPT-4o, GPT-4, GPT-3.5     | `apps/desktop/src/main/adapters/llm/`           |
| AnthropicAdapter  | Claude 3.5, Claude 3       | `apps/desktop/src/main/adapters/llm/`           |
| GoogleAdapter     | Gemini Pro, Gemini Ultra   | `apps/desktop/src/main/adapters/llm/`           |
| xAIAdapter        | Grok                       | `apps/desktop/src/main/adapters/llm/`           |
| LLMAdapterFactory | アダプターのインスタンス化 | `apps/desktop/src/main/adapters/llm/factory.ts` |

#### テスト

| テスト種別     | 対象             | 配置先                                                |
| -------------- | ---------------- | ----------------------------------------------------- |
| ユニットテスト | UIコンポーネント | `apps/desktop/src/renderer/components/llm/__tests__/` |
| ユニットテスト | IPCハンドラー    | `apps/desktop/src/main/handlers/__tests__/`           |
| ユニットテスト | LLMアダプター    | `apps/desktop/src/main/adapters/llm/__tests__/`       |
| E2Eテスト      | 統合フロー       | `apps/desktop/e2e/llm-switching.spec.ts`              |

### 2.2 含まないもの（Out of Scope）

| 項目                        | 理由                       | 将来タスク候補 |
| --------------------------- | -------------------------- | -------------- |
| ローカルLLM対応（Ollama等） | 別アーキテクチャが必要     | Yes            |
| 複数LLM同時送信             | 現在の要件範囲外           | Yes            |
| LLM自動選択/コスト最適化    | 追加の設計が必要           | Yes            |
| APIキー管理UI               | 既存機能（設定画面）を使用 | No             |
| カスタムプロバイダー追加    | プラグインシステムが必要   | Yes            |
| チャット履歴の永続化        | 別タスク（既存機能で対応） | No             |
| 音声入出力                  | 別機能領域                 | Yes            |

---

## 3. 既存基盤（活用対象）

本タスクは以下の既存基盤を**変更せず活用**する。

### 3.1 Zodスキーマ

| スキーマ                | パス                                                | 用途               |
| ----------------------- | --------------------------------------------------- | ------------------ |
| LLMProviderIdSchema     | `packages/shared/src/types/llm/schemas/provider.ts` | プロバイダーID列挙 |
| LLMModelSchema          | `packages/shared/src/types/llm/schemas/provider.ts` | モデル情報         |
| LLMProviderSchema       | `packages/shared/src/types/llm/schemas/provider.ts` | プロバイダー情報   |
| LLMConfigSchema         | `packages/shared/src/types/llm/schemas/provider.ts` | API設定            |
| LLMChatRequestSchema    | `packages/shared/src/types/llm/schemas/request.ts`  | チャットリクエスト |
| LLMChatResponseSchema   | `packages/shared/src/types/llm/schemas/response.ts` | チャットレスポンス |
| HealthCheckResultSchema | `packages/shared/src/types/llm/schemas/health.ts`   | ヘルスチェック結果 |
| LLMErrorSchema          | `packages/shared/src/types/llm/schemas/error.ts`    | エラー情報         |

### 3.2 状態管理

| 資産     | パス                                                 | 用途        |
| -------- | ---------------------------------------------------- | ----------- |
| llmSlice | `apps/desktop/src/renderer/store/slices/llmSlice.ts` | LLM状態管理 |

### 3.3 IPCチャンネル定義

| 資産                    | パス                                   | 用途             |
| ----------------------- | -------------------------------------- | ---------------- |
| IPC_CHANNELS            | `apps/desktop/src/preload/channels.ts` | チャンネル名定数 |
| ALLOWED_INVOKE_CHANNELS | 同上                                   | ホワイトリスト   |

### 3.4 Preload API

| 資産        | パス                                | 用途                |
| ----------- | ----------------------------------- | ------------------- |
| electronAPI | `apps/desktop/src/preload/index.ts` | IPC APIエクスポート |

---

## 4. 制約条件

### 4.1 技術的制約

| 制約                        | 理由                                    |
| --------------------------- | --------------------------------------- |
| 既存Zodスキーマの変更禁止   | 既存テストスイート（390件）への影響回避 |
| TypeScript strictモード必須 | 型安全性の確保                          |
| Electron IPC経由の通信      | セキュリティ要件（APIキー保護）         |
| 対応プロバイダーは4社固定   | 現在の要件範囲                          |

### 4.2 品質制約

| 制約                     | 基準         |
| ------------------------ | ------------ |
| ユニットテストカバレッジ | Line 80%以上 |
| Branch Coverage          | 60%以上      |
| TypeScript型エラー       | 0件          |
| ESLintエラー             | 0件          |

### 4.3 運用制約

| 制約                          | 理由                      |
| ----------------------------- | ------------------------- |
| APIキーはユーザーが設定       | セキュリティ・利用規約    |
| 外部API呼び出しにはネット必須 | クラウドLLMサービスの性質 |

---

## 5. 依存関係

### 5.1 内部依存

```
[UI] → [llmSlice] → [Preload API] → [IPC] → [Handlers] → [Adapters] → [外部API]
```

| 依存元           | 依存先                      |
| ---------------- | --------------------------- |
| ProviderSelector | llmSlice.providers          |
| ModelSelector    | llmSlice.selectedProviderId |
| HealthIndicator  | llmSlice.healthStatus       |
| IPCハンドラー    | LLMAdapter, Zodスキーマ     |
| LLMAdapter       | 外部SDK, LLMConfigSchema    |

### 5.2 外部依存

| 依存先        | バージョン/API | 用途                 |
| ------------- | -------------- | -------------------- |
| OpenAI API    | v1             | GPTモデル呼び出し    |
| Anthropic API | 2023-06-01     | Claudeモデル呼び出し |
| Google AI API | v1             | Geminiモデル呼び出し |
| xAI API       | v1             | Grokモデル呼び出し   |

---

## 6. 成功基準

### 6.1 機能完成基準

| 基準                                        | 検証方法             |
| ------------------------------------------- | -------------------- |
| プロバイダー一覧がUIに表示される            | ユニットテスト       |
| モデル一覧が選択プロバイダーに応じて表示    | ユニットテスト       |
| プロバイダー接続状態が表示される            | ユニットテスト       |
| IPC経由でプロバイダー情報を取得できる       | 統合テスト           |
| 各LLM APIを呼び出してレスポンスを受信できる | 統合テスト（モック） |
| E2Eテストがすべて成功                       | E2Eテスト            |

### 6.2 品質基準

| 基準               | 目標値  | 検証方法        |
| ------------------ | ------- | --------------- |
| Line Coverage      | 80%以上 | Vitest coverage |
| Branch Coverage    | 60%以上 | Vitest coverage |
| Function Coverage  | 80%以上 | Vitest coverage |
| TypeScript型エラー | 0件     | tsc --noEmit    |
| ESLintエラー       | 0件     | pnpm lint       |

---

## 7. 除外事項の詳細

### 7.1 ローカルLLM対応

**理由**: ローカルLLMは異なる通信方式（ローカルHTTP、プロセス間通信）が必要であり、現在のアダプターパターンでは対応できない。

**将来対応案**:

- Ollamaアダプターの追加
- ローカルプロセス管理機能の実装

### 7.2 複数LLM同時送信

**理由**: 現在のllmSlice設計は単一のselectedProviderId/selectedModelIdを前提としている。

**将来対応案**:

- マルチチャネル状態管理の設計
- 並列リクエスト処理の実装

### 7.3 LLM自動選択/コスト最適化

**理由**: コスト計算、性能比較のための追加データとロジックが必要。

**将来対応案**:

- コストメトリクス収集機能
- 自動選択アルゴリズムの実装

---

## 8. リスクと緩和策

| リスク                     | 影響度 | 緩和策                                |
| -------------------------- | ------ | ------------------------------------- |
| LLM API仕様変更            | 中     | アダプターパターンで変更を局所化      |
| レート制限                 | 中     | リトライロジック、retryAfterMs活用    |
| ストリーミング実装の複雑さ | 高     | 段階的実装（非ストリーム→ストリーム） |
| 各社SDK非互換              | 中     | 共通インターフェースで抽象化          |

---

## 9. スコープ変更管理

### 9.1 変更要求プロセス

1. 変更要求の文書化
2. 影響範囲の評価
3. 承認/却下の判断
4. 変更履歴への記録

### 9.2 変更履歴

| 日付       | 変更内容 | 理由 | 承認者      |
| ---------- | -------- | ---- | ----------- |
| 2026-01-09 | 初版作成 | 新規 | Claude Code |

---

## 付録

### A. 用語集

| 用語        | 定義                                             |
| ----------- | ------------------------------------------------ |
| LLMProvider | LLMサービス提供者（OpenAI, Anthropic等）         |
| LLMModel    | 特定プロバイダーのモデル（GPT-4o, Claude-3.5等） |
| LLMAdapter  | プロバイダーAPIへの接続抽象化                    |
| IPC         | Electron Inter-Process Communication             |
| llmSlice    | Zustand状態管理のLLM専用スライス                 |

### B. 関連ドキュメント

| ドキュメント        | パス                                                                  |
| ------------------- | --------------------------------------------------------------------- |
| 要件定義書          | `outputs/phase-1/requirements-definition.md`                          |
| 受け入れ基準        | `outputs/phase-1/acceptance-criteria.md`                              |
| LLMインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` |
