# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 2                       |
| Phase名    | 設計                    |
| 前提Phase  | Phase 1（要件定義）     |
| 後続Phase  | Phase 3（設計レビュー） |
| ステータス | 未実施                  |
| 作成日     | 2026-01-23              |
| 機能名     | system-prompt-llm-api   |

---

## 目的

Phase 1で定義した要件を実現可能な技術設計に落とし込む。LLM Clientの構造、メッセージ構築、aiHandlersとの統合方法を設計する。

## 背景

システムプロンプトをLLM APIに送信するために、以下の設計が必要:

- プロバイダー抽象化（OpenAI/Anthropic/Google/xAI）
- メッセージ構築ロジック（system/user roleの構築）
- 既存aiHandlersへの統合方法

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: LLM Client層の全体構造を設計する

**実行手順**:

1. コンポーネント図を作成
2. 依存関係を定義
3. データフローを設計
4. 既存のLLMアダプター実装を確認し、整合性を確保

**期待される成果物**:

- アーキテクチャ設計書

**参照すべき既存実装**:

- `apps/desktop/src/main/adapters/llm/` - 既存LLMアダプター
- `apps/desktop/src/main/handlers/llm.ts` - 既存IPCハンドラー

---

### タスク2: インターフェース設計

**目的**: LLM Clientの公開インターフェースを設計する

**実行手順**:

1. LLMClientOptions型を定義
2. callLLM関数シグネチャを定義
3. エラー型を定義
4. 既存型定義との整合性を確認

**期待される成果物**:

- インターフェース設計書

**参照すべき型定義**:

```typescript
// 既存型（interfaces-llm.md参照）
interface AIChatRequest {
  message: string;
  systemPrompt?: string;
  ragEnabled: boolean;
  conversationId?: string;
}

interface AIChatResponse {
  success: boolean;
  data?: {
    message: string;
    conversationId: string;
    ragSources?: string[];
  };
  error?: string;
}
```

---

### タスク3: メッセージ構築設計

**目的**: システムプロンプトを含むメッセージ配列の構築ロジックを設計する

**実行手順**:

1. buildMessages関数の設計
2. メッセージ形式の定義（role: system/user）
3. 空文字列・トリム処理の仕様定義

**期待される成果物**:

- メッセージ構築仕様書

**設計案**:

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

---

### タスク4: aiHandlers統合設計

**目的**: 既存aiHandlersへのLLM Client統合方法を設計する

**実行手順**:

1. 現在のaiHandlers.tsを分析
2. モックレスポンス箇所を特定
3. LLM Client呼び出しへの置き換え方法を設計
4. エラーハンドリングフローを設計

**期待される成果物**:

- 統合設計書

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                            | 内容                   |
| ----------------------- | ------------------------------------------------------------------------------- | ---------------------- |
| LLMインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | 型定義、アダプター仕様 |
| システムプロンプト仕様  | `.claude/skills/aiworkflow-requirements/references/interfaces-system-prompt.md` | IPC/Repository仕様     |
| 技術スタック            | `.claude/skills/aiworkflow-requirements/references/technology-core.md`          | Vercel AI SDK仕様      |

### Phase成果物

| 資料名       | パス                                         | 内容          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |

---

## 成果物

| 成果物               | パス                                     | 説明               |
| -------------------- | ---------------------------------------- | ------------------ |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md` | システム構造       |
| インターフェース設計 | `outputs/phase-2/interface-design.md`    | 型定義・API設計    |
| 統合設計書           | `outputs/phase-2/integration-design.md`  | aiHandlers統合方法 |

---

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント    | 契約定義                        |
| --------------- | ------------------------------- |
| Renderer → Main | AIChatRequest型（IPC経由）      |
| Main → LLM API  | Vercel AI SDK MessageFormat     |
| LLM API → Main  | Vercel AI SDK Response / Stream |
| Main → Renderer | AIChatResponse型（IPC経由）     |

---

## 完了条件

- [ ] アーキテクチャ設計が完了している
- [ ] インターフェース（型定義）が設計されている
- [ ] メッセージ構築ロジックが設計されている
- [ ] aiHandlers統合方法が設計されている
- [ ] 既存実装との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonが更新されている

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

Phase 3: 設計レビューゲート

完了後、以下のファイルを実行してください:

`docs/30-workflows/system-prompt-llm-api/phase-3-design-review.md`
