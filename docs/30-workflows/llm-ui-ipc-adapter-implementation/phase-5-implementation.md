# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 5                                 |
| Phase名    | 実装（TDD: Green）                |
| 前提Phase  | Phase 4                           |
| 後続Phase  | Phase 6                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-08                        |
| 機能名     | llm-ui-ipc-adapter-implementation |

---

## 目的

テストを通すための最小限の実装を行う（Green状態）。

## 背景

Phase 4で作成したテストをすべて成功させるための実装を行う。既存の基盤（Zodスキーマ、llmSlice、IPCチャンネル定義）を活用する。

---

## 使用スキル

### スキル1: clean-code-practices

**パス**: `.claude/skills/clean-code-practices/SKILL.md`

**選定理由**: 可読性・保守性の高いコードを書くため

**Trigger条件**:

- コード実装時
- クリーンコード原則の適用

**期待される成果物**:

- クリーンな実装コード

---

### スキル2: error-handling-patterns

**パス**: `.claude/skills/error-handling-patterns/SKILL.md`

**選定理由**: LLMError型を使った適切なエラーハンドリングを実装するため

**Trigger条件**:

- エラーハンドリング実装
- 例外処理の設計

**期待される成果物**:

- エラーハンドリング実装

---

### スキル3: type-safety-patterns

**パス**: `.claude/skills/type-safety-patterns/SKILL.md`

**選定理由**: 既存Zodスキーマとの型整合性を維持するため

**Trigger条件**:

- TypeScript型安全性の確保
- 型定義の実装

**期待される成果物**:

- 型安全な実装

---

### スキル4: electron-ipc-patterns

**パス**: `.claude/skills/electron-ipc-patterns/SKILL.md`

**選定理由**: Main/Renderer間のIPC通信を安全に実装するため

**Trigger条件**:

- Electron IPC実装
- Main/Renderer通信

**期待される成果物**:

- IPCハンドラー実装

---

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装時に必ず以下のシステム仕様を確認し、仕様準拠を確保してください。

| 参照資料            | パス                                                                  | 内容                    |
| ------------------- | --------------------------------------------------------------------- | ----------------------- |
| LLMインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` | LLM型定義・スキーマ仕様 |

### Phase 2-4成果物

| 参照資料             | パス                                     | 内容             |
| -------------------- | ---------------------------------------- | ---------------- |
| UIコンポーネント設計 | `outputs/phase-2/ui-component-design.md` | Props/State設計  |
| IPCハンドラー設計    | `outputs/phase-2/ipc-handler-design.md`  | チャンネル設計   |
| LLMアダプター設計    | `outputs/phase-2/llm-adapter-design.md`  | インターフェース |
| テスト仕様書         | `outputs/phase-4/test-specification.md`  | テスト設計       |

### 既存基盤

| 参照資料          | パス                                                 | 内容         |
| ----------------- | ---------------------------------------------------- | ------------ |
| Zodスキーマ       | `packages/shared/src/types/llm/schemas/`             | 型定義       |
| llmSlice          | `apps/desktop/src/renderer/store/slices/llmSlice.ts` | 状態管理     |
| IPCチャンネル定義 | `apps/desktop/src/preload/channels.ts`               | チャンネル名 |
| Preload API       | `apps/desktop/src/preload/index.ts`                  | API定義      |

---

## 成果物

| 成果物            | パス                                                            | 内容             |
| ----------------- | --------------------------------------------------------------- | ---------------- |
| ProviderSelector  | `apps/desktop/src/renderer/components/llm/ProviderSelector.tsx` | UIコンポーネント |
| ModelSelector     | `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`    | UIコンポーネント |
| HealthIndicator   | `apps/desktop/src/renderer/components/llm/HealthIndicator.tsx`  | UIコンポーネント |
| LLMSelectorPanel  | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | 統合パネル       |
| IPCハンドラー     | `apps/desktop/src/main/handlers/llm.ts`                         | Main Process     |
| OpenAIAdapter     | `apps/desktop/src/main/adapters/llm/OpenAIAdapter.ts`           | アダプター       |
| AnthropicAdapter  | `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`        | アダプター       |
| GoogleAdapter     | `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`           | アダプター       |
| xAIAdapter        | `apps/desktop/src/main/adapters/llm/xAIAdapter.ts`              | アダプター       |
| LLMAdapterFactory | `apps/desktop/src/main/adapters/llm/factory.ts`                 | ファクトリー     |
| index.ts          | `apps/desktop/src/main/adapters/llm/index.ts`                   | エクスポート     |

---

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                          |
| ------------------ | --------------------------------------------- |
| API接続            | IPC invoke/handleによるRenderer↔Main通信      |
| エラーハンドリング | LLMError型を使ったエラー伝播                  |
| 状態同期           | llmSliceのAction dispatch→IPC→Handler→Adapter |

---

## 実装順序

依存関係に基づく実装順序:

```
1. LLMアダプター実装（依存なし）
   ├── ILLMAdapterインターフェース（型のみ）
   ├── OpenAIAdapter
   ├── AnthropicAdapter
   ├── GoogleAdapter
   ├── xAIAdapter
   └── LLMAdapterFactory

2. IPCハンドラー実装（アダプターに依存）
   ├── llm:get-providers
   ├── llm:check-health
   ├── llm:send-chat
   └── llm:stream-chat

3. UIコンポーネント実装（IPC/llmSliceに依存）
   ├── ProviderSelector
   ├── ModelSelector
   ├── HealthIndicator
   └── LLMSelectorPanel
```

---

## 完了条件

- [ ] 全UIコンポーネント（ProviderSelector, ModelSelector, HealthIndicator, LLMSelectorPanel）が実装されている
- [ ] 全IPCハンドラー（llm:get-providers, llm:check-health, llm:send-chat, llm:stream-chat）が実装されている
- [ ] 全LLMアダプター（OpenAI, Anthropic, Google, xAI）が実装されている
- [ ] LLMAdapterFactoryが実装されている
- [ ] すべてのテストが成功状態（Green）
- [ ] TypeScriptコンパイル成功
- [ ] ESLintエラーなし
- [ ] フロント/バック接続が実装されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run

# 確認項目
# - [ ] テストが成功することを確認（Green状態）

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## スキルフィードバック記録

```markdown
## Phase 5 実行記録

### 使用スキル

- clean-code-practices: {{result}}
- error-handling-patterns: {{result}}
- type-safety-patterns: {{result}}
- electron-ipc-patterns: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/llm-ui-ipc-adapter-implementation/phase-6-test-expansion.md`
