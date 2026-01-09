# LLM UI/IPC/Adapter 実装 - タスク指示書

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | TASK-LLM-UI-IPC-ADAPTER-001                               |
| タスク名     | LLM UI/IPC/Adapter 実装                                   |
| 分類         | 改善（既存設計の実装完了）                                |
| 対象機能     | チャット内LLMモデル切り替え                               |
| 優先度       | 高                                                        |
| 見積もり規模 | 中規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | chat-multi-llm-switching Phase 11（UIブロック）/ Phase 12 |
| 発見日       | 2026-01-08                                                |
| 親タスク     | TASK-CHAT-LLM-SWITCH-001                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`chat-multi-llm-switching` タスクでPhase 1〜10まで完了し、以下の基盤が整備された：

- **Zodスキーマ定義**: `packages/shared/src/types/llm/schemas/`
- **状態管理（llmSlice）**: `apps/desktop/src/renderer/store/slices/llmSlice.ts`
- **IPCチャンネル定義**: `apps/desktop/src/preload/channels.ts`
- **Preload API定義**: `apps/desktop/src/preload/index.ts`
- **テストスイート**: 390件（100%成功）

しかし、Phase 11で以下が未実装であることが判明しブロックされた：

1. **UIコンポーネント**: ProviderSelector, ModelSelector, HealthIndicator
2. **IPCハンドラー**: Main Processでのllm:get-providers, llm:check-health
3. **LLMアダプター**: OpenAI, Anthropic, Google, xAI API実装

### 1.2 問題点・課題

| 問題                   | 影響                                        |
| ---------------------- | ------------------------------------------- |
| UIコンポーネント未実装 | ユーザーがプロバイダー/モデルを選択できない |
| IPCハンドラー未実装    | Renderer→Main間の通信が機能しない           |
| LLMアダプター未実装    | 外部LLM APIとの連携ができない               |

### 1.3 放置した場合の影響

- llmSlice/スキーマ/テストが「死んだコード」になる
- チャット内LLMモデル切り替え機能が完成しない
- ユーザーがLLMプロバイダーを選択できない

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 1〜10で作成した基盤（スキーマ、状態管理、テスト）を活用し、実際に動作するUI/IPC/Adapterを実装する。

### 2.2 最終ゴール

1. **UIコンポーネント**: ユーザーがプロバイダーとモデルを選択できる
2. **IPCハンドラー**: Renderer↔Main間でLLM操作が通信できる
3. **LLMアダプター**: 4社（OpenAI, Anthropic, Google, xAI）のAPIを呼び出せる
4. **E2Eテスト**: 上記が統合されて動作することを検証

### 2.3 スコープ

#### 含むもの

**UIコンポーネント**

| コンポーネント   | 責務                               |
| ---------------- | ---------------------------------- |
| ProviderSelector | プロバイダー一覧表示・選択         |
| ModelSelector    | 選択プロバイダーのモデル一覧・選択 |
| HealthIndicator  | プロバイダー接続状態表示           |
| LLMSelectorPanel | 上記を統合したパネル               |

**IPCハンドラー（Main Process）**

| チャンネル        | 責務                     |
| ----------------- | ------------------------ |
| llm:get-providers | 利用可能プロバイダー取得 |
| llm:check-health  | プロバイダー接続状態確認 |
| llm:send-chat     | チャットリクエスト送信   |
| llm:stream-chat   | ストリーミングチャット   |

**LLMアダプター**

| アダプター        | 対応API                    |
| ----------------- | -------------------------- |
| OpenAIAdapter     | GPT-4, GPT-4o, GPT-3.5     |
| AnthropicAdapter  | Claude 3.5, Claude 3       |
| GoogleAdapter     | Gemini Pro, Gemini Ultra   |
| xAIAdapter        | Grok                       |
| LLMAdapterFactory | アダプターのインスタンス化 |

#### 含まないもの

- ローカルLLM（Ollama等）対応 - 将来タスク
- 同時に複数LLMへの送信 - 別タスク
- LLMの自動選択/コスト最適化 - 別タスク

### 2.4 成果物

| 成果物               | 配置先                                          |
| -------------------- | ----------------------------------------------- |
| UIコンポーネント     | `apps/desktop/src/renderer/components/llm/`     |
| IPCハンドラー        | `apps/desktop/src/main/handlers/llm.ts`         |
| LLMアダプター        | `apps/desktop/src/main/adapters/llm/`           |
| アダプターファクトリ | `apps/desktop/src/main/adapters/llm/factory.ts` |
| E2Eテスト            | `apps/desktop/e2e/llm-switching.spec.ts`        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] `packages/shared` がビルド済み
- [ ] 各プロバイダーのAPIキーが設定可能な状態
- [ ] 既存のllmSlice/スキーマ/テストが正常動作

### 3.2 依存タスク

| タスクID                 | 状態   | 依存内容                   |
| ------------------------ | ------ | -------------------------- |
| TASK-CHAT-LLM-SWITCH-001 | 部分完 | スキーマ、llmSlice、テスト |

### 3.3 必要な知識・スキル

- React/TypeScript（UIコンポーネント）
- Electron IPC（Main/Renderer通信）
- 各LLM API仕様（OpenAI, Anthropic, Google, xAI）
- Zodバリデーション
- Playwright（E2Eテスト）

### 3.4 推奨アプローチ

**実装順序**（依存関係に基づく）

```
1. LLMアダプター実装
   └─► 各プロバイダーAPI呼び出し

2. IPCハンドラー実装
   └─► LLMアダプターを呼び出すMain Process処理

3. UIコンポーネント実装
   └─► llmSlice + IPC経由でバックエンドと連携

4. E2Eテスト
   └─► 全体統合動作確認
```

---

## 4. 実行手順

### Phase構成

このタスクは13フェーズ構成（TDDフロー）で実行する。

### Phase 1: 要件定義

#### Claude Code スラッシュコマンド

```
/ai:write-spec
```

#### 目的

既存のPhase 1-12成果物を参照し、UI/IPC/Adapter固有の要件を定義。

#### 成果物

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-1/acceptance-criteria.md`

#### 完了条件

- [ ] UIコンポーネントの受け入れ基準が定義されている
- [ ] IPCハンドラーの受け入れ基準が定義されている
- [ ] LLMアダプターの受け入れ基準が定義されている

### Phase 2: 設計

#### Claude Code スラッシュコマンド

```
/ai:design-architecture
/ai:design-component
```

#### 目的

UI/IPC/Adapterの詳細設計。

#### 成果物

- `outputs/phase-2/ui-component-design.md`
- `outputs/phase-2/ipc-handler-design.md`
- `outputs/phase-2/llm-adapter-design.md`

#### 完了条件

- [ ] 各UIコンポーネントのProps/State設計がある
- [ ] IPCハンドラーのシグネチャ設計がある
- [ ] LLMアダプターのインターフェース設計がある

### Phase 3: 設計レビューゲート

#### Claude Code スラッシュコマンド

```
/ai:review-design
```

#### 完了条件

- [ ] 既存スキーマ/llmSliceとの整合性確認
- [ ] SOLID原則準拠確認
- [ ] MAJOR判定なし

### Phase 4: テスト作成

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests
/ai:generate-integration-tests
```

#### 目的

TDD: Red（失敗するテスト作成）

#### 成果物

- `apps/desktop/src/renderer/components/llm/__tests__/*.test.tsx`
- `apps/desktop/src/main/handlers/__tests__/llm.test.ts`
- `apps/desktop/src/main/adapters/llm/__tests__/*.test.ts`

#### 完了条件

- [ ] UIコンポーネントテストが失敗状態
- [ ] IPCハンドラーテストが失敗状態
- [ ] LLMアダプターテストが失敗状態

### Phase 5: 実装

#### Claude Code スラッシュコマンド

```
/ai:create-component
/ai:implement-feature
```

#### 目的

TDD: Green（テストを通す実装）

#### 成果物

- `apps/desktop/src/renderer/components/llm/ProviderSelector.tsx`
- `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`
- `apps/desktop/src/renderer/components/llm/HealthIndicator.tsx`
- `apps/desktop/src/main/handlers/llm.ts`
- `apps/desktop/src/main/adapters/llm/OpenAIAdapter.ts`
- `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`
- `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`
- `apps/desktop/src/main/adapters/llm/xAIAdapter.ts`
- `apps/desktop/src/main/adapters/llm/factory.ts`

#### 完了条件

- [ ] 全テストが成功
- [ ] TypeScriptコンパイル成功
- [ ] ESLintエラーなし

### Phase 6〜13

後続Phaseは `task-specification-creator` のPhase構成フレームワークに従う。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] プロバイダー一覧がUIに表示される
- [ ] モデル一覧が選択プロバイダーに応じて表示される
- [ ] プロバイダー接続状態が表示される
- [ ] IPC経由でプロバイダー情報を取得できる
- [ ] 各LLM APIを呼び出してレスポンスを受信できる

### 品質要件

- [ ] ユニットテストカバレッジ: Line 80%+
- [ ] 統合テストが成功
- [ ] E2Eテストが成功
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし

### ドキュメント要件

- [ ] 実装ガイドが更新されている
- [ ] APIドキュメントが作成されている

---

## 6. 検証方法

### テストケース

| テストID | カテゴリ | シナリオ                                 |
| -------- | -------- | ---------------------------------------- |
| TC-01    | UI       | プロバイダー一覧表示                     |
| TC-02    | UI       | プロバイダー選択→モデル一覧表示          |
| TC-03    | UI       | 接続状態インジケーター表示               |
| TC-04    | IPC      | llm:get-providers呼び出し→レスポンス受信 |
| TC-05    | IPC      | llm:check-health呼び出し→状態取得        |
| TC-06    | Adapter  | OpenAI APIリクエスト→レスポンス          |
| TC-07    | Adapter  | Anthropic APIリクエスト→レスポンス       |
| TC-08    | Adapter  | エラー時の適切なLLMError返却             |
| TC-09    | E2E      | プロバイダー選択→モデル選択→チャット送信 |

### 検証手順

```bash
# ユニットテスト
pnpm --filter @repo/desktop test:run -- llm

# E2Eテスト
pnpm --filter @repo/desktop test:e2e -- llm-switching

# カバレッジ確認
pnpm --filter @repo/desktop test:coverage
```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                  |
| -------------------------- | ------ | -------- | ------------------------------------- |
| LLM API仕様変更            | 中     | 低       | アダプターパターンで変更を局所化      |
| APIキー管理の複雑化        | 中     | 中       | 設定画面での統一管理UI                |
| レート制限                 | 中     | 中       | リトライロジック + retryAfterMs活用   |
| ストリーミング実装の複雑さ | 高     | 中       | 段階的実装（非ストリーム→ストリーム） |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント    | パス                                                                                    |
| --------------- | --------------------------------------------------------------------------------------- |
| 実装ガイド      | `docs/30-workflows/chat-multi-llm-switching/outputs/phase-12/implementation-guide.md`   |
| スキーマ設計    | `docs/30-workflows/chat-multi-llm-switching/outputs/phase-2/schema-design.md`           |
| 状態管理設計    | `docs/30-workflows/chat-multi-llm-switching/outputs/phase-2/state-management-design.md` |
| APIドキュメント | `docs/30-workflows/chat-multi-llm-switching/outputs/phase-2/api-specification.md`       |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                  | 内容                    |
| ------------------- | --------------------------------------------------------------------- | ----------------------- |
| LLMインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` | LLM型定義・スキーマ仕様 |

### 参考資料

| 資料                 | URL                                            |
| -------------------- | ---------------------------------------------- |
| OpenAI API Reference | https://platform.openai.com/docs/api-reference |
| Anthropic API Docs   | https://docs.anthropic.com/claude/reference    |
| Google AI Docs       | https://ai.google.dev/docs                     |
| xAI API Docs         | https://x.ai/api                               |

---

## 9. 備考

### 発見元の原文

```
chat-multi-llm-switching Phase 11（手動テスト検証）でブロック。
UIコンポーネント、IPCハンドラー、LLMアダプターが未実装のため、
ユーザー操作による動作確認ができなかった。

Phase 12の実装ガイドにて「次フェーズの実装事項」として高優先度で記載。
```

### 補足事項

- 既存のllmSlice/スキーマ/テストは100%活用する
- 新規実装ファイルは既存の型定義をインポートして使用
- E2Eテストでは実際のAPI呼び出しをモック化（APIキー不要で動作確認可能）
