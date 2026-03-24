# Phase 2: 設計

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | 2                  |
| 機能名 | w3b-sc-improve-llm |
| 作成日 | 2026-03-22         |

## 目的

improve() の LLM 呼び出しアーキテクチャを設計する。プロンプト設計（system=improve-prompt.md、user=フィードバック+現在SKILL.md内容）、改善提案 JSON Schema、承認後の適用フロー（SkillFileWriter との連携）を定義する。

## 実行タスク

1. プロンプト設計
   - system プロンプト: `.claude/skills/skill-creator/agents/improve-prompt.md` の内容を使用
   - user プロンプト: `{フィードバック内容}\n\n現在のSKILL.md:\n{SKILL.md全文}` の形式を設計
2. 改善提案 JSON Schema 設計
   ```json
   {
     "suggestions": [
       {
         "section": "string（対象セクション名）",
         "before": "string（変更前のテキスト）",
         "after": "string（変更後のテキスト）",
         "reason": "string（変更理由）"
       }
     ]
   }
   ```
3. SkillFileManager を使った SKILL.md 読み込みフロー設計
4. 承認後の適用フロー設計（SkillFileWriter / applyImprovement() インターフェース）
5. エラーハンドリング設計（スキル不存在、SKILL.md読み込み失敗、LLMパース失敗）
6. plan() との AnthropicAdapter 共通化設計

## 参照資料

| 資料名                    | パス                                                                  | 説明                                |
| ------------------------- | --------------------------------------------------------------------- | ----------------------------------- |
| Phase 1 成果物            | `docs/30-workflows/w3b-sc-improve-llm/phase-01-requirements.md`       | 要件定義書                          |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | improve() 現行スタブ実装            |
| AnthropicAdapter          | `apps/desktop/src/main/adapters/AnthropicAdapter.ts`                  | LLMアダプタ（存在確認）             |
| improve-prompt            | `.claude/skills/skill-creator/agents/improve-prompt.md`               | 改善プロンプト定義                  |
| SkillFileManager          | `apps/desktop/src/main/services/skill/SkillFileManager.ts`            | SKILL.md 読み書き                   |
| skillCreator 型定義       | `packages/shared/src/types/skillCreator.ts`                           | RuntimeSkillCreatorImproveResult 型 |

## 実行手順

### ステップ1: プロンプト設計

system プロンプト（improve-prompt.md）と user プロンプト（フィードバック + SKILL.md全文）の構成を設計する。

### ステップ2: 改善提案 JSON Schema 設計

LLM からの期待レスポンス形式を定義し、`RuntimeSkillCreatorImproveSuggestion` へのマッピングを設計する。

### ステップ3: SKILL.md 読み込みフロー設計

`SkillFileManager.readFile()` を使用したフローとエラーケースを設計する。

### ステップ4: 承認後の適用フロー設計

`applyImprovement()` のインターフェースと順次適用ロジックを設計する。

### ステップ5: エラーハンドリング設計

全エラーケースの検出方法とレスポンスを網羅する。

### ステップ6: plan() との共通化設計

`IMPROVE_PROMPT_CONSTANTS`、`IMPROVE_RESPONSE_SCHEMA_INSTRUCTION`、DI追加を設計する。

## 設計詳細

### 1. プロンプト設計

#### system プロンプト

`ResourceLoader.loadAgent("improve-prompt")` により `.claude/skills/skill-creator/agents/improve-prompt.md` を読み込む。

#### user プロンプト

```
以下のスキルに対するフィードバックに基づいて、改善提案を生成してください。

## フィードバック
{feedback}

## 現在のSKILL.md
{skillContent}
```

`{feedback}` および `{skillContent}` はランタイムで文字列置換する。

---

### 2. 改善提案 JSON Schema

LLM からの期待レスポンス（improve-prompt.md 準拠）:

```json
{
  "skillName": "string",
  "targetAgent": "agents/xxx.md",
  "analysisResults": {
    "structureScore": "1-5 の整数",
    "clarityScore": "1-5 の整数",
    "reproducibilityScore": "1-5 の整数",
    "efficiencyScore": "1-5 の整数"
  },
  "improvements": [
    {
      "section": "string（対象セクション名）",
      "issue": "string（問題の説明）",
      "pattern": "string（改善パターン名）",
      "before": "string（変更前のテキスト）",
      "after": "string（変更後のテキスト）"
    }
  ],
  "improvedContent": "string（改善後の SKILL.md 全文）"
}
```

パース後に `RuntimeSkillCreatorImproveSuggestion` へ変換する際のマッピング:

```typescript
function mapToSuggestion(
  raw: LLMImprovement,
): RuntimeSkillCreatorImproveSuggestion {
  return {
    section: raw.section,
    before: raw.before,
    after: raw.after,
    reason: `${raw.issue} (改善パターン: ${raw.pattern})`,
  };
}
```

---

### 3. SKILL.md 読み込みフロー

```
SkillFileManager.readFile(skillName, "SKILL.md")
```

| 状況                                   | 発生エラー           |
| -------------------------------------- | -------------------- |
| skillName に対応するスキルが存在しない | `SkillNotFoundError` |
| SKILL.md ファイルが存在しない          | `FileNotFoundError`  |
| パストラバーサル攻撃が検出された       | `PathTraversalError` |

---

### 4. 承認後の適用フロー設計（applyImprovement）

applyImprovement は Phase 5 の実装スコープとする。設計上の仕様:

1. 全 `suggestions` の `before`/`after` を使って SKILL.md 全文に対して文字列置換を順次適用する。
2. 適用前のバックアップは `SkillFileManager.writeFile()` が自動で行うため、呼び出し元で意識不要。
3. `before` テキストが SKILL.md に存在しない場合はスキップ（エラーにしない）。
4. `String.prototype.replace()`（最初の1箇所のみ）を使用する。`replaceAll()` は使用しない。
5. 順次適用時に先行suggestionsが後続のbeforeマッチに影響する可能性があるが、不一致はスキップとして許容する。
6. 戻り値:

```typescript
{
  applied: number;   // 適用できた suggestions 数
  skipped: number;   // before が見つからずスキップした数
  skippedDetails: Array<{ section: string; reason: string }>;  // スキップ詳細
  errors: string[];  // その他エラーが発生した場合のメッセージ一覧
}
```

---

### 5. エラーハンドリング設計

| エラーケース            | 検出方法                                                              | レスポンス                                                |
| ----------------------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| スキル不存在            | `SkillFileManager.readFile` が `SkillNotFoundError` をスロー          | `{ success: false, error: { code: "SKILL_NOT_FOUND" } }`  |
| SKILL.md 読み込み失敗   | `SkillFileManager.readFile` が `FileNotFoundError` をスロー           | `{ success: false, error: { code: "READ_ERROR" } }`       |
| feedback が空/空白のみ  | P42 準拠 3 段バリデーション（型チェック → 空文字列 → トリム空文字列） | `{ success: false, error: { code: "VALIDATION_ERROR" } }` |
| skillName が空/空白のみ | P42 準拠 3 段バリデーション（同上）                                   | `{ success: false, error: { code: "VALIDATION_ERROR" } }` |
| LLM レスポンス不正 JSON | `JSON.parse` 失敗                                                     | `{ success: false, error: { code: "PARSE_ERROR" } }`      |
| LLM 呼び出し失敗        | `sendChat` がスロー                                                   | `{ success: false, error: { code: "LLM_ERROR" } }`        |
| llmAdapter 未注入       | graceful degradation チェック                                         | スタブレスポンスを返す                                    |

---

### 6. plan() との共通化設計

#### IMPROVE_PROMPT_CONSTANTS（planPromptConstants.ts パターンに倣う）

```typescript
export const IMPROVE_PROMPT_CONSTANTS = {
  AGENT_NAME: "improve-prompt",
  RESPONSE_FORMAT_START: "=== IMPROVE RESPONSE FORMAT ===",
  RESPONSE_FORMAT_END: "=== END IMPROVE RESPONSE FORMAT ===",
  DEFAULT_MODEL_ID: "claude-sonnet-4-20250514",
  DEFAULT_MAX_TOKENS: 8192, // improve は plan より長い出力を期待
  DEFAULT_TEMPERATURE: 0.3,
} as const;
```

#### IMPROVE_RESPONSE_SCHEMA_INSTRUCTION（MINOR-2 対応）

```typescript
export const IMPROVE_RESPONSE_SCHEMA_INSTRUCTION = `${IMPROVE_PROMPT_CONSTANTS.RESPONSE_FORMAT_START}
You must respond with ONLY a valid JSON object (no markdown, no explanation).
The JSON must conform to the following schema:

{
  "skillName": "string - name of the skill being improved",
  "targetAgent": "string - path to the target agent file (e.g., 'agents/xxx.md')",
  "analysisResults": {
    "structureScore": "number 1-5",
    "clarityScore": "number 1-5",
    "reproducibilityScore": "number 1-5",
    "efficiencyScore": "number 1-5"
  },
  "improvements": [
    {
      "section": "string - target section name",
      "issue": "string - description of the problem",
      "pattern": "string - improvement pattern name",
      "before": "string - text before change",
      "after": "string - text after change"
    }
  ],
  "improvedContent": "string - full improved SKILL.md content"
}

Rules:
- All string fields must be non-empty
- improvements array may be empty if no improvements are needed
- before/after must be exact text excerpts from the SKILL.md
${IMPROVE_PROMPT_CONSTANTS.RESPONSE_FORMAT_END}`;
```

#### 共通パターン一覧

#### RuntimeSkillCreatorFacadeDeps への DI 追加（MINOR-1 対応）

```typescript
export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
  subscriptionAuthProvider?: ISubscriptionAuthProvider;
  llmAdapter?: ILLMAdapter;
  resourceLoader?: ResourceLoader;
  skillFileManager: SkillFileManager; // 追加（必須DI）
}
```

`skillFileManager` は必須 DI（non-optional）。improve() の SKILL.md 読み込みは必須処理のため、graceful degradation の対象外とする。

| 処理                        | plan()                                            | improve()                         | 共通化方針                   |
| --------------------------- | ------------------------------------------------- | --------------------------------- | ---------------------------- |
| LLM 呼び出し                | `this.llmAdapter.sendChat()`                      | `this.llmAdapter.sendChat()`      | 同一インターフェース         |
| プロンプト読み込み          | `this.resourceLoader.loadAgent()`                 | `this.resourceLoader.loadAgent()` | 同一インターフェース         |
| レスポンスパース            | `parsePlanResponse`                               | `parseImproveResponse`            | 専用パーサーを個別実装       |
| Markdown コードブロック除去 | `stripMarkdownCodeBlock`                          | `stripMarkdownCodeBlock`          | 共通ユーティリティとして共有 |
| Graceful degradation        | `if (!this.llmAdapter \|\| !this.resourceLoader)` | 同パターン                        | 共通ガード条件               |

#### ILLMAdapter.sendChat() に渡すリクエスト構造

```typescript
// LLMChatRequestInput（Zod input type）
{
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  modelId: string;
  systemPrompt?: string;
  temperature?: number;  // default 1.0
  maxTokens?: number;
  stream?: boolean;      // default false
}
```

---

### 7. LLM 呼び出しシーケンス図

```
Renderer
  → Preload(improveSkillWithFeedback)
  → IPC
  → Main Handler
    → RuntimeSkillCreatorFacade.improve(skillName, feedback, authMode, apiKey)
      → resolveDecision(authMode, apiKey)
        ┌─ [terminal_handoff]
        │   → TerminalHandoffBuilder.build()
        │   → return
        └─ [integrated_api]
            → P42 バリデーション(skillName, feedback)
            → Graceful degradation check (llmAdapter, resourceLoader)
            → SkillFileManager.readFile(skillName, "SKILL.md")
            → ResourceLoader.loadAgent("improve-prompt")
            → buildImproveUserPrompt(feedback, skillContent)
            → ILLMAdapter.sendChat({
                systemPrompt,
                messages,
                modelId,
                maxTokens,
                temperature,
              })
            → parseImproveResponse(response.content)
            → return { improveId, suggestions }
```

## 統合テスト連携

本Phaseは設計Phaseのため、統合テストの直接実施は不要。
Phase 4以降で統合テストを設計・実行する際の観点を記録する。

| 統合テスト観点                      | 内容                                                              | 備考                           |
| ----------------------------------- | ----------------------------------------------------------------- | ------------------------------ |
| LLM呼び出しシーケンス全体           | Renderer → IPC → Facade → LLMAdapter の全経路が正常に動作すること | Phase 4 でモックベーステスト   |
| SkillFileManager DI 注入            | `skillFileManager` が必須DIとしてFacadeに注入され動作すること     | Phase 5 でDI配線テスト         |
| IMPROVE_RESPONSE_SCHEMA_INSTRUCTION | JSON形式指示が system プロンプトに正しく付加されること            | Phase 4 でプロンプト構築テスト |
| applyImprovement 順次適用           | 複数suggestionsの順次適用で競合時にスキップが正しく動作すること   | Phase 6 で統合テスト           |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                              |
| ------------------ | -------- | --------------------------------------------------------------------- |
| セキュリティ       | 該当     | P42準拠バリデーション、パストラバーサル防止                           |
| アーキテクチャ     | 該当     | DI設計（SkillFileManager注入）、Facade パターン、plan()との共通化設計 |
| エラーハンドリング | 該当     | 7種エラーケース網羅、graceful degradation                             |
| IPC通信            | 該当     | skill-creator:improve-skill ハンドラのリクエスト/レスポンス型設計     |

## 成果物

| 成果物                      | パス                                                      | 説明                       |
| --------------------------- | --------------------------------------------------------- | -------------------------- |
| 設計書                      | `docs/30-workflows/w3b-sc-improve-llm/phase-02-design.md` | 本ファイル                 |
| LLM 呼び出しシーケンス図    | 本ファイル内「設計詳細」セクション7                       | テキスト形式のシーケンス図 |
| 改善提案 JSON Schema 定義   | 本ファイル内「設計詳細」セクション2                       | LLMレスポンス形式定義      |
| SkillFileWriter 連携IF設計  | 本ファイル内「設計詳細」セクション4                       | applyImprovement() 仕様    |
| エラーハンドリング設計書    | 本ファイル内「設計詳細」セクション5                       | 全エラーケースの網羅       |
| AnthropicAdapter 共通化設計 | 本ファイル内「設計詳細」セクション6                       | plan()との共通化ポイント   |

## 完了条件

- [x] プロンプト設計（system/user の両方）を完成させた
- [x] 改善提案 JSON Schema を定義した（section, before, after, reason の型・制約）
- [x] SKILL.md 読み込みフローを設計した
- [x] 承認後の適用フローを設計した（SkillFileWriter との連携）
- [x] エラーケース（スキル不存在、読み込み失敗、LLMパース失敗）を網羅した
- [x] plan() との AnthropicAdapter 共通化ポイントを特定した
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 3: 設計レビュー
