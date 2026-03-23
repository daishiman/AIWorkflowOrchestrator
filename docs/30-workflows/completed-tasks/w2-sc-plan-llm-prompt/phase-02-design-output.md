# Phase 2: 設計 - 出力文書

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 2                          |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-23                 |

## 1. プロンプト構造設計

### 1.1 全体構造図

```
+-----------------------------------------+
| System Prompt                           |
|                                         |
| === AGENT: discover-problem =========== |
| (discover-problem.md の全文)            |
| === END AGENT ========================= |
|                                         |
| === AGENT: design-workflow ============ |
| (design-workflow.md の全文)             |
| === END AGENT ========================= |
|                                         |
| === AGENT: plan-structure ============= |
| (plan-structure.md の全文)              |
| === END AGENT ========================= |
|                                         |
| === RESPONSE FORMAT =================== |
| (JSON スキーマ定義)                     |
| === END RESPONSE FORMAT =============== |
+-----------------------------------------+

+-----------------------------------------+
| User Prompt                             |
|                                         |
| (skillSpec: 自然言語入力テキスト)       |
+-----------------------------------------+
```

### 1.2 System プロンプト連結方式

**区切り文字**: Markdown セパレータ + ラベル

```
=== AGENT: {agentName} ===
{agentContent}
=== END AGENT: {agentName} ===
```

**連結順序**:

1. `discover-problem` (問題発見 → 最も上流の思考)
2. `design-workflow` (ワークフロー設計 → 中流)
3. `plan-structure` (構造設計 → 最も具体的)

**理由**: LLM は system prompt の先頭を最も重要視する傾向がある。問題定義 → 設計 → 構造 の順序で思考を誘導する。

### 1.3 プロンプトビルダー関数シグネチャ

```typescript
/**
 * plan() 用の system prompt を構築する
 * @param agentSpecs - agent 仕様書の内容配列（name + content のペア）
 * @returns system prompt 文字列
 */
function buildPlanSystemPrompt(
  agentSpecs: Array<{ name: string; content: string }>,
): string;
```

### 1.4 JSON スキーマ指示（System Prompt 末尾に付加）

```
=== RESPONSE FORMAT ===
You must respond with ONLY a valid JSON object (no markdown, no explanation).
The JSON must conform to the following schema:

{
  "skillName": "string - kebab-case name for the skill (e.g., 'github-issue-classifier')",
  "description": "string - one-line description of what the skill does",
  "agents": [
    {
      "name": "string - agent file name without extension (e.g., 'classify-issues')",
      "role": "string - what this agent does in the workflow"
    }
  ],
  "scripts": [
    {
      "name": "string - script file name (e.g., 'validate-labels.js')",
      "purpose": "string - what this script automates"
    }
  ],
  "triggers": ["string - when/how the skill is activated (e.g., 'GitHub Issue作成時')"],
  "anchors": ["string - knowledge sources the skill depends on (e.g., 'GitHub API v4')"]
}

Rules:
- skillName must be kebab-case
- agents array must have at least 1 entry
- All string fields must be non-empty
=== END RESPONSE FORMAT ===
```

### 1.5 User プロンプト

```typescript
// skillSpec をそのまま渡す（追加のラッピングなし）
const userMessage = skillSpec;
```

## 2. レスポンス JSON スキーマ（完全版）

### 2.1 LLM レスポンス JSON スキーマ

```typescript
/** LLM から返される生の計画データ */
interface LLMPlanResponse {
  skillName: string; // kebab-case スキル名
  description: string; // スキルの1行説明
  agents: Array<{
    name: string; // agent ファイル名（拡張子なし）
    role: string; // agent の役割説明
  }>;
  scripts: Array<{
    name: string; // script ファイル名
    purpose: string; // script の目的
  }>;
  triggers: string[]; // スキル起動トリガー
  anchors: string[]; // 依存する知識ソース
}
```

### 2.2 RuntimeSkillCreatorPlanResult 拡充型

```typescript
export interface RuntimeSkillCreatorPlanResult {
  // 既存フィールド（維持）
  planId: string; // "plan-{timestamp}" 形式
  skillSpec: string; // 入力テキスト（元のまま保持）
  estimatedSteps: number; // agents.length + scripts.length で動的計算

  // 新規フィールド（LLM レスポンスから）
  skillName: string;
  description: string;
  agents: Array<{ name: string; role: string }>;
  scripts: Array<{ name: string; purpose: string }>;
  triggers: string[];
  anchors: string[];
}
```

### 2.3 型マッピング

```
LLMPlanResponse --> RuntimeSkillCreatorPlanResult
  skillName       --> skillName
  description     --> description
  agents          --> agents
  scripts         --> scripts
  triggers        --> triggers
  anchors         --> anchors
  (生成)          --> planId = "plan-{Date.now()}"
  (コピー)        --> skillSpec = 入力テキスト
  (計算)          --> estimatedSteps = agents.length + scripts.length
```

## 3. AnthropicAdapter DI 設計

### 3.1 クラス図

```
RuntimeSkillCreatorFacadeDeps (interface)
  +-- skillExecutor: SkillExecutor           [必須・既存]
  +-- authKeyService?: IAuthKeyService       [オプション・既存]
  +-- subscriptionAuthProvider?: ISubscriptionAuthProvider [オプション・既存]
  +-- llmAdapter?: ILLMAdapter               [オプション・新規]
  +-- resourceLoader?: ResourceLoader        [オプション・新規]

RuntimeSkillCreatorFacade
  +-- resolver: RuntimePolicyResolver
  +-- handoffBuilder: TerminalHandoffBuilder
  +-- skillExecutor: SkillExecutor
  +-- llmAdapter?: ILLMAdapter               [新規]
  +-- resourceLoader?: ResourceLoader        [新規]
  |
  +-- plan(skillSpec, authMode, apiKey)
  |     |
  |     +-- [terminal_handoff] --> 既存ロジック（変更なし）
  |     +-- [integrated_api]
  |           +-- llmAdapter が未注入 --> graceful degradation (stub 返却)
  |           +-- resourceLoader.loadAgent() x 3
  |           +-- buildPlanSystemPrompt(agentSpecs)
  |           +-- llmAdapter.sendChat(request)
  |           +-- parsePlanResponse(responseText)
  |           +-- return RuntimeSkillCreatorPlanResult
```

### 3.2 DI 注入方式

**パターン**: Constructor Injection（deps オブジェクト拡張）

```typescript
export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
  subscriptionAuthProvider?: ISubscriptionAuthProvider;
  llmAdapter?: ILLMAdapter; // 新規追加
  resourceLoader?: ResourceLoader; // 新規追加
}
```

**オプション注入の理由**:

- P54 対策: llmAdapter/resourceLoader が未注入でも facade が生成可能
- Graceful Degradation: LLM 未設定時はスタブレスポンスにフォールバック
- テスタビリティ: モック注入が容易

### 3.3 ファクトリ側の配線変更

```typescript
// apps/desktop/src/main/ipc/index.ts
const skillCreatorService = new SkillCreatorService();
const skillExecutor = getSkillExecutorInstance();

// 新規: LLMAdapterFactory から AnthropicAdapter を取得
const llmAdapterFactory = new LLMAdapterFactory();
const llmAdapter = llmAdapterFactory.getAdapter("anthropic");

// 新規: ResourceLoader を SkillCreatorService から取得
// または新規インスタンス化
const resourceLoader = new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH);

const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({
      skillExecutor,
      authKeyService,
      llmAdapter, // 新規
      resourceLoader, // 新規
    })
  : undefined;
```

### 3.4 LLM 呼び出しリクエスト構造

```typescript
const request: LLMChatRequestInput = {
  modelId: "claude-sonnet-4-20250514", // コスト効率の良いモデル
  systemPrompt: buildPlanSystemPrompt(agentSpecs),
  messages: [{ role: "user", content: skillSpec }],
  maxTokens: 4096, // 計画 JSON には十分
  temperature: 0.3, // 構造化出力のため低め
};

const response = await this.llmAdapter.sendChat(request);
```

**モデル選択の根拠**:

- `claude-sonnet-4-20250514`: 構造化 JSON 出力に十分な能力、コスト効率が良い
- Opus は不要（計画生成は創造性より正確性が重要）
- モデル ID は定数化し、将来的にユーザー選択可能にする余地を残す

## 4. エラーハンドリング設計

### 4.1 エラーフロー図

```
plan(skillSpec, authMode, apiKey)
  |
  +-- [入力検証] skillSpec が空文字列/トリム空文字列
  |     --> Result.err({ code: "VALIDATION_ERROR", message: "..." })
  |
  +-- [terminal_handoff 分岐] --> 既存ロジック（変更なし）
  |
  +-- [integrated_api 分岐]
        |
        +-- [llmAdapter 未注入]
        |     --> graceful degradation: スタブレスポンスを返す
        |
        +-- [ResourceLoader.loadAgent() 失敗]
        |     --> Result.err({ code: "RESOURCE_LOAD_ERROR", message: "..." })
        |     --> LLM 呼び出しは行わない
        |
        +-- [LLM sendChat() 失敗]
        |     --> Result.err({ code: "LLM_API_ERROR", message: "..." })
        |     --> API タイムアウト含む
        |
        +-- [レスポンスが JSON でない]
        |     --> Result.err({ code: "LLM_PARSE_ERROR", message: "..." })
        |
        +-- [JSON が必須フィールド欠如]
        |     --> Result.err({ code: "LLM_VALIDATION_ERROR", message: "..." })
        |
        +-- [正常完了]
              --> RuntimeSkillCreatorPlanResult
```

### 4.2 エラーカテゴリ

| エラーコード         | カテゴリ         | リトライ | 説明                           |
| -------------------- | ---------------- | -------- | ------------------------------ |
| VALIDATION_ERROR     | Validation(1000) | 不可     | 入力バリデーション失敗         |
| RESOURCE_LOAD_ERROR  | Infra(4000)      | 可能     | agent 仕様書読み込み失敗       |
| LLM_API_ERROR        | External(3000)   | 可能     | LLM API 呼び出し失敗           |
| LLM_PARSE_ERROR      | Internal(5000)   | 不可     | レスポンス JSON パース失敗     |
| LLM_VALIDATION_ERROR | Internal(5000)   | 不可     | レスポンス JSON スキーマ不適合 |

### 4.3 Graceful Degradation

**llmAdapter 未注入時**:

```typescript
if (!this.llmAdapter || !this.resourceLoader) {
  // スタブレスポンスを返す（現行動作と同等）
  return {
    planId: `plan-${Date.now()}`,
    skillSpec,
    estimatedSteps: 3,
    skillName: "",
    description: "",
    agents: [],
    scripts: [],
    triggers: [],
    anchors: [],
  };
}
```

### 4.4 ResourceLoader 失敗時

```typescript
// 3ファイル全て読み込み、1つでも失敗したらエラー
const agentNames = ["discover-problem", "design-workflow", "plan-structure"];
const agentSpecs: Array<{ name: string; content: string }> = [];

for (const name of agentNames) {
  try {
    const content = await this.resourceLoader.loadAgent(name);
    agentSpecs.push({ name, content });
  } catch (error) {
    return {
      success: false,
      error: {
        code: "RESOURCE_LOAD_ERROR",
        message: `Failed to load agent spec: ${name}`,
      },
    };
  }
}
```

## 5. terminal_handoff 経路の非破壊保証

### 5.1 変更しないコード領域

以下のコードブロックは **一切変更しない**:

1. `RuntimePolicyResolver.resolveDecision()` の全ロジック
2. `TerminalHandoffBuilder.build()` の全ロジック
3. plan() 内の `decision.type === "terminal_handoff"` 分岐の処理
4. `TerminalHandoffBundle` 型定義

### 5.2 分岐の明確な境界

```typescript
async plan(skillSpec, authMode, apiKey) {
  // === 変更なし: 入力バリデーション ===
  const decision = this.resolver.resolveDecision(authMode, apiKey);

  // === 変更なし: terminal_handoff 分岐 ===
  if (decision.type === "terminal_handoff") {
    return { type: "terminal_handoff", bundle: decision.bundle };
  }

  // === 変更対象: integrated_api 分岐のみ ===
  // ここから下が LLM 呼び出し実装
  // ...
}
```

## 6. ファイル変更一覧

| ファイル                                    | 変更種別 | 内容                                                   |
| ------------------------------------------- | -------- | ------------------------------------------------------ |
| `RuntimeSkillCreatorFacade.ts`              | 改修     | DI 追加、plan() integrated_api 分岐の LLM 呼び出し実装 |
| `packages/shared/src/types/skillCreator.ts` | 改修     | RuntimeSkillCreatorPlanResult 型拡充                   |
| `apps/desktop/src/main/ipc/index.ts`        | 改修     | DI 配線（llmAdapter, resourceLoader 追加）             |
| `RuntimeSkillCreatorFacade.plan.test.ts`    | 新規     | テストファイル                                         |

## 7. 定数定義（planPromptConstants.ts）

```typescript
export const PLAN_PROMPT_CONSTANTS = {
  AGENT_SEPARATOR_START: "=== AGENT:",
  AGENT_SEPARATOR_END: "=== END AGENT:",
  RESPONSE_FORMAT_START: "=== RESPONSE FORMAT ===",
  RESPONSE_FORMAT_END: "=== END RESPONSE FORMAT ===",
  AGENT_NAMES: [
    "discover-problem",
    "design-workflow",
    "plan-structure",
  ] as const,
  DEFAULT_MODEL_ID: "claude-sonnet-4-20250514",
  DEFAULT_MAX_TOKENS: 4096,
  DEFAULT_TEMPERATURE: 0.3,
} as const;
```
