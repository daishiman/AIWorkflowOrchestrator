# システムプロンプトのLLM API統合 - タスク実行仕様書

## ユーザーからの元の指示

```
システムプロンプトがIPCで正しく送信されるようになったが、
実際のLLM APIへの統合はまだ完了していない。
aiHandlers.tsでモックレスポンスを返している箇所を、
実際のLLM API呼び出しに置き換える。
```

## メタ情報

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| タスクID     | TASK-CHAT-SYSPROMPT-LLM-001     |
| Worktreeパス | `.worktrees/task-{{timestamp}}` |
| ブランチ名   | `task-{{timestamp}}`            |
| タスク名     | システムプロンプトのLLM API統合 |
| 分類         | 機能完成                        |
| 対象機能     | チャット - LLM API連携          |
| 優先度       | 高                              |
| 見積もり規模 | 小規模                          |
| ステータス   | 未実施                          |
| 作成日       | 2025-12-26                      |

---

## タスク概要

### 目的

システムプロンプトを含むチャットメッセージを実際のLLM APIに送信し、AIからの応答を受け取る機能を完成させる。

### 背景

**現在の実装**:

- `apps/desktop/src/main/ipc/aiHandlers.ts` でsystemPromptをIPCで受信
- TODOコメントで将来のLLM API統合を明示
- モックレスポンスを返している（`"System prompt received: ..."`）

**問題点**:

- 実際のAI応答が返らない
- システムプロンプトが機能として動作しない
- ユーザーが期待する機能が未完成

**参照 (最終レビューレポート M-001)**:

> 現状: aiHandlers.ts でモックレスポンスを返す
> 影響: システムプロンプトはIPCで正しく送信されているが、LLM APIへの実際の送信は未実装
> 対応: Phase 8（手動テスト）後、LLM API統合フェーズで対応

### 最終ゴール

- システムプロンプトが実際のLLM APIに送信される
- LLMからの応答がチャットUIに表示される
- 複数のLLMプロバイダー（OpenAI, Anthropic, Google, xAI）に対応
- システムプロンプトの内容に応じてAIの振る舞いが変わることを確認

### 成果物一覧

| 種別         | 成果物                            | 配置先                                             |
| ------------ | --------------------------------- | -------------------------------------------------- |
| 環境         | Git Worktree環境                  | `.worktrees/task-{{timestamp}}`                    |
| 実装         | LLM API Client実装                | `apps/desktop/src/main/services/llmClient.ts`      |
| 実装         | aiHandlers更新（LLM API呼び出し） | `apps/desktop/src/main/ipc/aiHandlers.ts`          |
| 実装         | システムプロンプトメッセージ構築  | `apps/desktop/src/main/utils/buildMessages.ts`     |
| テスト       | LLM Client単体テスト              | `apps/desktop/src/main/services/llmClient.test.ts` |
| テスト       | aiHandlers統合テスト              | `apps/desktop/src/main/ipc/aiHandlers.test.ts`     |
| ドキュメント | 要件ドキュメント                  | `docs/30-workflows/system-prompt-llm-api/`         |
| ドキュメント | 設計ドキュメント                  | `docs/30-workflows/system-prompt-llm-api/`         |
| PR           | GitHub Pull Request               | GitHub UI                                          |

---

## 参照ファイル

本仕様書のコマンド選定は以下を参照：

- `docs/00-requirements/master_system_design.md` - システム要件
- `docs/00-requirements/03-technology-stack.md` - AIプロバイダー仕様
- `docs/30-workflows/chat-system-prompt/task-step07-final-review.md` - M-001指摘事項
- `.claude/commands/ai/command_list.md` - /ai:コマンド定義

---

## タスク分解サマリー

| ID     | フェーズ | サブタスク名                 | 責務                                            | 依存     |
| ------ | -------- | ---------------------------- | ----------------------------------------------- | -------- |
| T--1-1 | Phase -1 | Git Worktree環境作成・初期化 | Git Worktree環境の作成と初期化                  | なし     |
| T-00-1 | Phase 0  | 機能要件定義                 | LLM API統合の要件を明文化                       | T--1-1   |
| T-01-1 | Phase 1  | LLM Client設計               | AIプロバイダー抽象化、メッセージ構築設計        | T-00-1   |
| T-02-1 | Phase 2  | 設計レビュー                 | 要件・設計の妥当性検証                          | T-01-1   |
| T-03-1 | Phase 3  | LLM Clientテスト作成         | API呼び出しのテスト作成                         | T-02-1   |
| T-04-1 | Phase 4  | LLM Client実装               | Vercel AI SDK連携実装                           | T-03-1   |
| T-04-2 | Phase 4  | aiHandlers更新               | モックレスポンス → LLM Client呼び出しに切り替え | T-03-1   |
| T-05-1 | Phase 5  | コードリファクタリング       | コード品質の改善                                | T-04-1~2 |
| T-06-1 | Phase 6  | 品質保証                     | テスト実行・品質チェック                        | T-05-1   |
| T-07-1 | Phase 7  | 最終レビュー                 | 全体的な品質・整合性検証                        | T-06-1   |
| T-08-1 | Phase 8  | 手動テスト検証               | 実際のLLM API呼び出しの手動確認                 | T-07-1   |
| T-09-1 | Phase 9  | ドキュメント更新             | アーキテクチャドキュメント等の更新              | T-08-1   |
| T-10-1 | Phase 10 | コミット作成                 | 差分確認・コミット作成                          | T-09-1   |
| T-10-2 | Phase 10 | PR作成                       | PR作成・CI確認                                  | T-10-1   |

**総サブタスク数**: 14個

---

## 設計概要

### メッセージ構築

```typescript
// apps/desktop/src/main/utils/buildMessages.ts
export function buildMessages(
  userMessage: string,
  systemPrompt?: string,
): Array<{ role: string; content: string }> {
  const messages = [];

  if (systemPrompt && systemPrompt.trim()) {
    messages.push({
      role: "system",
      content: systemPrompt.trim(),
    });
  }

  messages.push({
    role: "user",
    content: userMessage,
  });

  return messages;
}
```

### LLM Client インターフェース

```typescript
// apps/desktop/src/main/services/llmClient.ts
export interface LLMClientOptions {
  provider: "openai" | "anthropic" | "google" | "xai";
  apiKey: string;
  model?: string;
}

export async function callLLM(
  messages: Array<{ role: string; content: string }>,
  options: LLMClientOptions,
): Promise<string> {
  // Vercel AI SDK を使用した実装
  // provider ごとの適切なクライアント選択
  // ストリーミング対応（将来拡張）
}
```

---

## 技術スタック

| カテゴリ     | 技術                              |
| ------------ | --------------------------------- |
| AI SDK       | Vercel AI SDK                     |
| プロバイダー | OpenAI, Anthropic, Google AI, xAI |
| テスト       | Vitest, Mock API                  |
| 型安全性     | TypeScript                        |

---

## リスクと対策

| リスク               | 影響度 | 対策                               |
| -------------------- | ------ | ---------------------------------- |
| APIキーが未設定      | 高     | エラーハンドリング、ユーザーに通知 |
| APIレート制限        | 中     | リトライ戦略、エラーメッセージ     |
| ストリーミング未対応 | 低     | 将来拡張として記録                 |
| プロバイダー間の差異 | 中     | 抽象化層で吸収                     |

---

## 完了条件チェックリスト

### 機能要件

- [ ] システムプロンプト付きメッセージがLLM APIに送信される
- [ ] LLMからの応答がチャットUIに表示される
- [ ] 4つのプロバイダーすべてで動作する
- [ ] エラー時に適切なメッセージが表示される

### 非機能要件

- [ ] 初回トークン応答時間 < 2秒（目標）
- [ ] テストカバレッジ 80%以上
- [ ] TypeScriptエラー 0件

### 品質要件

- [ ] すべての単体テストが成功
- [ ] ESLintエラー 0件
- [ ] 手動テストで全プロバイダー動作確認

---

## 主要フェーズ詳細

### Phase 0: 要件定義

```
/ai:define-requirements

機能名: システムプロンプトのLLM API統合
目的: 実際のLLM APIにシステムプロンプトを送信し応答を取得
背景: 現在はモックレスポンスのみ
スコープ: LLM Client実装、aiHandlers更新、メッセージ構築
```

### Phase 1: 設計

```
/ai:design-service

サービス名: LLMClient
責務: Vercel AI SDK連携、プロバイダー抽象化、メッセージ送信
参考: docs/00-requirements/03-technology-stack.md
```

### Phase 3-4: テスト作成・実装

```
/ai:generate-unit-tests

対象: apps/desktop/src/main/services/llmClient.ts
範囲: API呼び出し、エラーハンドリング、プロバイダー切り替え
```

```
/ai:implement-feature

対象: apps/desktop/src/main/services/llmClient.ts
参考: task-step01-service-design.md
TDD: はい（T-03-1のテスト基準）
```

```
/ai:implement-feature

対象: apps/desktop/src/main/ipc/aiHandlers.ts
参考: task-step01-service-design.md
変更内容: モックレスポンス削除、LLM Client呼び出し追加
```

### Phase 6: 品質保証

```
/ai:quality-check

対象: システムプロンプトLLM API統合機能全体
チェック項目: テスト、型チェック、lint、ビルド
```

### Phase 8: 手動テスト

**テストケース**:

1. OpenAI GPT-4でシステムプロンプト「翻訳アシスタント」適用確認
2. Anthropic Claude 3.5でシステムプロンプト適用確認
3. Google Gemini Proでシステムプロンプト適用確認
4. xAI Grok-2でシステムプロンプト適用確認
5. システムプロンプト空欄時の動作確認
6. APIキー未設定時のエラーハンドリング確認

---

## 更新履歴

| 日付       | 版  | 変更内容 | 作成者 |
| ---------- | --- | -------- | ------ |
| 2025-12-26 | 1.0 | 初版作成 | Claude |
