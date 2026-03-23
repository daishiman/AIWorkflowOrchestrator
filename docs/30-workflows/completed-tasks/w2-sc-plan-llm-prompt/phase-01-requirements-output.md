# Phase 1: 要件定義 - 出力文書

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 1                          |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-23                 |

## 1. plan() スタブ実装の現行動作

### ファイル

`apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

### シグネチャ

```typescript
async plan(
  skillSpec: string,
  authMode: AuthMode,
  apiKey: string | null,
): Promise<RuntimeSkillCreatorPlanResponse>
```

### 条件分岐

```
plan(skillSpec, authMode, apiKey)
  |
  +-- RuntimePolicyResolver.resolveDecision(authMode, apiKey)
  |     |
  |     +-- apiKey.trim() !== "" --> type: "integrated_api"
  |     +-- apiKey 空 + subscription有効 --> type: "terminal_handoff" (subscription)
  |     +-- apiKey 空 + subscription無効 --> type: "terminal_handoff" (no-auth)
  |
  +-- decision.type === "terminal_handoff"
  |     --> { type: "terminal_handoff", bundle: TerminalHandoffBundle }
  |
  +-- decision.type === "integrated_api"  [STUB - 実装待ち]
        --> { planId: "plan-${Date.now()}", skillSpec, estimatedSteps: 3 }
```

### スタブの問題点

1. LLM プロンプト呼び出しなし
2. `estimatedSteps` が常に 3（動的計算が必要）
3. `skillSpec` がそのまま返される（構造化されていない）
4. agent 仕様書を活用していない

## 2. ResourceLoader.loadAgent() のインターフェース

### ファイル

`apps/desktop/src/main/services/skill/ResourceLoader.ts`

### シグネチャ

```typescript
async loadAgent(agentName: string): Promise<string>
```

### 動作

- キャッシュ優先の遅延読み込み（Progressive Disclosure 準拠）
- 内部: `load("agents", `${agentName}.md`)` を呼び出し
- 戻り値: agent .md ファイルの内容文字列

### エラー仕様

| エラー種別       | 原因               | 伝播方式       |
| ---------------- | ------------------ | -------------- |
| ENOENT           | ファイル未検出     | Promise reject |
| EACCES           | パーミッション不足 | Promise reject |
| その他 fs エラー | 読み込み失敗       | Promise reject |

## 3. Agent 仕様書の内容と合計トークン数

### ファイル一覧

| ファイル            | 行数    | 主要責務                           |
| ------------------- | ------- | ---------------------------------- |
| discover-problem.md | 220     | 根本原因特定・問題分類・影響度評価 |
| design-workflow.md  | 157     | ワークフロー設計（Phase 2相当）    |
| plan-structure.md   | 172     | フォルダ構造設計（Phase 3相当）    |
| **合計**            | **549** | -                                  |

### トークン概算

- 549行 x 平均45文字/行 x 1.3（日本語係数） = 約 32,000 トークン
- Claude API の input_tokens 上限（200,000 tokens）に対して **16% 使用**
- **判定: 上限内に十分収まる**

### discover-problem.md の出力スキーマ

```json
{
  "problemStatement": {
    "who": "",
    "context": "",
    "problem": "",
    "impact": "",
    "rootCause": ""
  },
  "problemType": "efficiency | quality | knowledge | structure | absence",
  "rootCauseAnalysis": { "whyChain": ["..."] },
  "impactAssessment": {
    "frequency": "",
    "scope": "",
    "severity": "",
    "urgency": ""
  },
  "outcomeGoals": {
    "primaryOutcome": "",
    "successCriteria": [],
    "nonGoals": [],
    "assumptions": []
  },
  "solutionHypothesis": { "approach": "", "rationale": "", "risks": [] }
}
```

## 4. terminal_handoff 経路の現行動作

### 保護要件

- `RuntimePolicyResolver.resolveDecision()` が `terminal_handoff` を返した場合、LLM 呼び出しは一切行わない
- `TerminalHandoffBuilder.build()` で shell injection 対策済みの bundle を構築
- **変更禁止**: terminal_handoff 経路のコード・テストは一切変更しない

### TerminalHandoffBundle 構造

```typescript
{
  launcher: "claude";
  promptBundle: string;       // shell injection 対策済み
  cwd: string;
  suggestedCommand: string;
  manualRetryRule: string;
  runbook?: string;
}
```

## 5. LLM 入出力仕様

### 入力

| 項目      | 型     | 説明                               |
| --------- | ------ | ---------------------------------- |
| skillSpec | string | ユーザーが入力した自然言語テキスト |

### 出力（JSON スキーマ）

LLM に返させるべき JSON 構造:

```json
{
  "skillName": "string",
  "description": "string",
  "agents": [{ "name": "string", "role": "string" }],
  "scripts": [{ "name": "string", "purpose": "string" }],
  "triggers": ["string"],
  "anchors": ["string"]
}
```

### RuntimeSkillCreatorPlanResult 型の現状と拡充計画

**現状** (`packages/shared/src/types/skillCreator.ts`):

```typescript
export interface RuntimeSkillCreatorPlanResult {
  planId: string;
  skillSpec: string;
  estimatedSteps: number;
}
```

**拡充後**:

```typescript
export interface RuntimeSkillCreatorPlanResult {
  planId: string;
  skillSpec: string;
  estimatedSteps: number;
  // 以下を追加
  skillName: string;
  description: string;
  agents: Array<{ name: string; role: string }>;
  scripts: Array<{ name: string; purpose: string }>;
  triggers: string[];
  anchors: string[];
}
```

### AnthropicAdapter の呼び出しインターフェース

```typescript
// 入力型
interface LLMChatRequestInput {
  modelId: string;
  systemPrompt?: string;
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
}

// 呼び出し
const response = await anthropicAdapter.sendChat({
  modelId: "claude-sonnet-4-20250514",
  systemPrompt: buildPlanSystemPrompt(agentSpecs),
  messages: [{ role: "user", content: skillSpec }],
  maxTokens: 4096,
  temperature: 0.3,
});
```

## 6. 受入基準との対応

| 受入基準 | 内容                        | 対応方針                                          |
| -------- | --------------------------- | ------------------------------------------------- |
| AC-1     | 自然言語入力 → 構造計画生成 | sendChat() で agent 仕様書を system prompt に注入 |
| AC-4     | TerminalHandoff 非破壊      | integrated_api 分岐内のみ LLM 呼び出し            |

## 7. DI 設計の現状

| コンポーネント            | DI パターン           | 現状                   |
| ------------------------- | --------------------- | ---------------------- |
| RuntimeSkillCreatorFacade | Constructor Injection | skillExecutor 等を注入 |
| AnthropicAdapter          | Constructor Injection | apiKey + config を注入 |
| ResourceLoader            | -                     | 直接インスタンス化     |

**設計方針**: AnthropicAdapter を RuntimeSkillCreatorFacade のコンストラクタに DI で追加する。P61 対策としてインターフェース型（`ILLMAdapter`）を使用する。
