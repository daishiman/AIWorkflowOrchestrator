# Phase 2 成果物: 設計書

## タスクID: TASK-SC-LLM-PURPOSE-WIRE-001

---

## 1. LLM 呼び出し方式の比較・採用決定

### 比較表

| 評価軸         | Option A: ILLMClient.complete() 直接呼び出し           | Option B: エージェント SDK 経由                                  |
| -------------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
| 実装シンプルさ | 既存 I/F のみ使用。追加依存なし                        | SDK 導入・設定が必要でスコープ超過                               |
| テスト容易性   | `ILLMClient` をモック化するだけで検証可能              | SDK のモック設計が複雑                                           |
| 依存関係       | `packages/shared/src/services/llm/types.ts` の既存 I/F | `@anthropic-ai/claude-agent-sdk` の追加依存が必要                |
| 後方互換       | 最小変更で済む                                         | DI 設計全体の変更が必要になる可能性                              |
| 拡張性         | 将来 SDK 移行時はメソッド差し替えのみでよい            | エージェントライフサイクル管理は現時点でオーバーエンジニアリング |

### **採用: Option A（`ILLMClient.complete()` 直接呼び出し）**

採用理由:

1. 実装最小性: `ILLMClient` インターフェースは既存プロジェクトに存在し、追加依存なし
2. テスト容易性: `complete()` をモック化するだけで purpose 検証が可能
3. スコープ適合: 本タスクの目的は「purpose フィールドに LLM 結果を格納すること」
4. 後方互換性: コンストラクタ・戻り値型の変更が最小限

> この決定が **AC-3** を充足する（設計ドキュメントへの明記）

---

## 2. ILLMClient インターフェース確認

```typescript
// packages/shared/src/services/llm/types.ts
export interface LLMCompletionOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface ILLMClient {
  complete(
    prompt: string,
    options?: LLMCompletionOptions,
  ): Promise<Result<string, Error>>;
}
```

- `complete(prompt, options)` は `Result<string, Error>` を返す
- `result.success === true` で成功、`result.data` に結果文字列
- `systemPrompt` にエージェント定義文字列を渡す

---

## 3. コンストラクタ変更設計

```typescript
// 変更前
export class SkillCreatorService {
  private readonly skillsDir: string;
  private readonly workflowsDir: string;
  private readonly skillCreatorPath: string;
  private readonly scriptExecutor: ScriptExecutor;
  private readonly resourceLoader: ResourceLoader;

  constructor(skillsDir?: string, workflowsDir?: string) {
    // ...
  }
}

// 変更後
export class SkillCreatorService {
  private readonly skillsDir: string;
  private readonly workflowsDir: string;
  private readonly skillCreatorPath: string;
  private readonly scriptExecutor: ScriptExecutor;
  private readonly resourceLoader: ResourceLoader;
  private readonly llmClient: ILLMClient | null; // 追加

  constructor(
    skillsDir?: string,
    workflowsDir?: string,
    llmClient?: ILLMClient, // 追加（省略可）
  ) {
    // ...
    this.llmClient = llmClient ?? null;
  }
}
```

---

## 4. runCreateWorkflow 変更設計（Before/After）

### Before（問題あり）

```typescript
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null> {
  try {
    const extractPurposeAgent =
      await this.resourceLoader.loadAgent("extract-purpose");
    const planStructureAgent =
      await this.resourceLoader.loadAgent("plan-structure");

    const structurePlan: StructurePlanJson = {
      skillName: options.name,
      description: options.description,
      purpose: extractPurposeAgent, // ← raw 文字列
      features: [],
      agents: [extractPurposeAgent, planStructureAgent],
    };
    return structurePlan;
  } catch {
    return null;
  }
}
```

### After（AC-1〜AC-5 充足）

```typescript
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null> {
  // AC-4: loadAgent 失敗は独立した try/catch で null を返す
  let extractPurposeAgent: string;
  let planStructureAgent: string;
  try {
    extractPurposeAgent = await this.resourceLoader.loadAgent("extract-purpose");
    planStructureAgent = await this.resourceLoader.loadAgent("plan-structure");
  } catch {
    return null;
  }

  // AC-1: extract-purpose エージェント定義を LLM に渡して purpose を推論
  // AC-5: LLM 失敗時は options.description をフォールバック
  let purpose: string = options.description;
  try {
    const skillInput = `${options.name}: ${options.description}`;
    const result = await this.llmClient.complete(skillInput, {
      systemPrompt: extractPurposeAgent,
    });
    if (result.success) {
      // AC-2: LLM 推論結果を purpose に格納
      const normalizedPurpose = normalizePurpose(result.data);
      if (normalizedPurpose !== null) {
        purpose = normalizedPurpose;
      }
    }
  } catch {
    // LLM 例外時も purpose = options.description のまま
  }

  const structurePlan: StructurePlanJson = {
    skillName: options.name,
    description: options.description,
    purpose,
    features: [],
    agents: [extractPurposeAgent, planStructureAgent],
  };
  return structurePlan;
}
```

---

## 5. エラーハンドリング設計（4 シナリオ）

| エラーシナリオ                           | 挙動                                                        | 対応 AC  |
| ---------------------------------------- | ----------------------------------------------------------- | -------- |
| `loadAgent` 失敗                         | 独立 try/catch → null 返却                                  | AC-4     |
| LLM result.success === false             | `options.description` をフォールバックとして purpose に使用 | AC-5     |
| LLM 呼び出し例外                         | catch → `options.description` フォールバック                | AC-5     |
| default client（selected config 未選択） | `options.description` フォールバック（後方互換）            | 後方互換 |

---

## 6. テスト戦略の概要

| テストカテゴリ                           | 対象                                        | 検証内容                                   |
| ---------------------------------------- | ------------------------------------------- | ------------------------------------------ |
| happy path                               | `createSkill(mode:"create")` + LLM mock     | purpose が LLM の戻り値になること          |
| loadAgent 失敗                           | `loadAgent` が throw                        | `createSkill` が例外なく完了すること       |
| LLM 失敗（result.success=false）         | `complete()` が `{ success: false }` を返す | フォールバック（description）が purpose に |
| LLM 例外                                 | `complete()` が throw                       | フォールバック（description）が purpose に |
| default client（selected config 未選択） | コンストラクタ第3引数なし                   | default client で create が正常完了        |

---

## 7. 検証マトリクス

| テスト対象                         | コマンド                                                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| SkillCreatorService ユニットテスト | `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts` |
| 型チェック（desktop）              | `pnpm --filter @repo/desktop typecheck`                                                                     |
| lint（desktop）                    | `pnpm --filter @repo/desktop lint`                                                                          |
