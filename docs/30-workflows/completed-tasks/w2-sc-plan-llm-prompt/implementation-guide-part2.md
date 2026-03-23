# 実装ガイド Part 2: 開発者向け実装詳細

## TASK-SC-03-PLAN-LLM-PROMPT

## 1. アーキテクチャ

```
RuntimeSkillCreatorFacade
  |
  +-- plan(skillSpec, authMode, apiKey)
        |
        +-- RuntimePolicyResolver.resolveDecision()
        |     |
        |     +-- "terminal_handoff" --> TerminalHandoffBuilder (変更なし)
        |     +-- "integrated_api"  --> LLM 呼び出し (本タスク)
        |
        +-- [integrated_api path]
              |
              +-- Graceful degradation check (llmAdapter/resourceLoader 未注入?)
              +-- ResourceLoader.loadAgent() x 3
              +-- buildPlanSystemPrompt(agentSpecs)
              +-- ILLMAdapter.sendChat(request)
              +-- parsePlanResponse(response.content)
              +-- return RuntimeSkillCreatorPlanResult
```

## 2. buildPlanSystemPrompt()

agent 仕様書3ファイルを区切り文字付きで連結し、末尾に JSON スキーマ指示を付加する。

```typescript
export function buildPlanSystemPrompt(
  agentSpecs: Array<{ name: string; content: string }>,
): string;
```

**連結フォーマット**:

```
=== AGENT: discover-problem ===
{discover-problem.md の全文}
=== END AGENT: discover-problem ===

=== AGENT: design-workflow ===
{design-workflow.md の全文}
=== END AGENT: design-workflow ===

=== AGENT: plan-structure ===
{plan-structure.md の全文}
=== END AGENT: plan-structure ===

=== RESPONSE FORMAT ===
{JSON スキーマ指示}
=== END RESPONSE FORMAT ===
```

## 3. parsePlanResponse()

LLM レスポンスの JSON テキストをパースし、型ガードで検証する。

```typescript
export function parsePlanResponse(responseText: string): LLMPlanResponse;
```

**型ガードロジック (P49 準拠)**:

- `in` 演算子でプロパティ存在を実行時検証
- `typeof` で型チェック
- `Array.isArray()` で配列チェック
- `as` キャストは使用しない

**バリデーションルール**:

- `skillName`: string, 非空, トリム後も非空
- `description`: string, 非空
- `agents`: 配列, 1件以上, 各要素に name(string) + role(string)
- `scripts`: 配列, 各要素に name(string) + purpose(string)
- `triggers`: string[]
- `anchors`: string[]

## 4. DI 配線

```typescript
// RuntimeSkillCreatorFacadeDeps に追加
llmAdapter?: ILLMAdapter;       // P61: インターフェース型
resourceLoader?: ResourceLoader; // オプション注入

// ipc/index.ts での配線
const runtimeSkillCreatorService = new RuntimeSkillCreatorFacade({
  skillExecutor,
  authKeyService,
  llmAdapter,        // LLMAdapterFactory.getAdapter("anthropic")
  resourceLoader,    // new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH)
});
```

## 5. 定数 (planPromptConstants.ts)

| 定数名              | 値                                                        | 用途                   |
| ------------------- | --------------------------------------------------------- | ---------------------- |
| AGENT_NAMES         | ["discover-problem", "design-workflow", "plan-structure"] | 読み込む agent 名      |
| DEFAULT_MODEL_ID    | "claude-sonnet-4-20250514"                                | LLM モデル             |
| DEFAULT_MAX_TOKENS  | 4096                                                      | 最大出力トークン       |
| DEFAULT_TEMPERATURE | 0.3                                                       | 低め（構造化出力向け） |

## 6. 変更ファイル一覧

| ファイル                       | 変更内容                                   |
| ------------------------------ | ------------------------------------------ |
| `RuntimeSkillCreatorFacade.ts` | DI 追加、plan() LLM 呼び出し、ヘルパー関数 |
| `planPromptConstants.ts`       | 新規（定数・スキーマ指示）                 |
| `skillCreator.ts`              | RuntimeSkillCreatorPlanResult 型拡充       |
| `creatorHandlers.ts`           | 型互換性修正                               |

## 7. エラーハンドリング

plan() の integrated_api パスで発生しうるエラーと対処:

| エラー種別           | 発生条件                  | コード               | 動作                                 |
| -------------------- | ------------------------- | -------------------- | ------------------------------------ |
| 入力バリデーション   | skillSpec が空/トリム空   | VALIDATION_ERROR     | エラーを返す                         |
| リソース読み込み失敗 | agent 仕様書ファイル不在  | RESOURCE_LOAD_ERROR  | エラーを返す（LLM 呼び出しスキップ） |
| LLM API エラー       | API タイムアウト/認証失敗 | LLM_API_ERROR        | エラーを返す                         |
| JSON パース失敗      | LLM が非 JSON を返却      | LLM_PARSE_ERROR      | エラーを返す                         |
| バリデーション失敗   | 必須フィールド欠如        | LLM_VALIDATION_ERROR | エラーを返す                         |
| Graceful degradation | llmAdapter 未注入         | -                    | スタブレスポンスを返す               |
