# Phase 2: 設計

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 2                            |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |
| 機能名     | llm-purpose-wire             |
| 前提Phase  | Phase 1                      |
| 後続Phase  | Phase 3                      |
| 作成日     | 2026-04-16                   |
| ステータス | pending                      |

## 目的

LLM 呼び出し方式を比較・評価し、採用方式を決定する。
`SkillCreatorService.ts` の `runCreateWorkflow` への変更設計、
`ILLMClient` のインジェクション設計、エラーハンドリング設計を確定する。

## 実行タスク

- LLM 呼び出し方式の比較: 直接呼び出し vs エージェント経由の評価
- 採用方式の決定: 理由を明示して1つに絞り込む
- `SkillCreatorService` への `ILLMClient` インジェクション設計
- `runCreateWorkflow` の変更設計（before/after）
- エラーハンドリング設計（loadAgent 失敗 / LLM 失敗 の2パス）
- テスト戦略の概要策定
- 検証マトリクスの定義

## 参照資料

| 資料名                      | パス                                                                         | 用途                     |
| --------------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| Phase 1 成果物              | `outputs/phase-1/requirements-definition.md`                                 | 要件・AC参照             |
| Phase 1 受け入れ基準        | `outputs/phase-1/acceptance-criteria.md`                                     | AC-1〜AC-6 の確認        |
| SkillCreatorService.ts      | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 変更対象ファイル確認     |
| ILLMClient インターフェース | `packages/shared/src/services/llm/types.ts`                                  | LLM API シグネチャ確認   |
| ResourceLoader.ts           | `apps/desktop/src/main/services/skill/ResourceLoader.ts`                     | loadAgent の戻り値型確認 |
| SkillCreatorService.test.ts | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 既存モック構造確認       |

## 実行手順

### 1. LLM 呼び出し方式の比較

#### Option A: `ILLMClient.complete()` 直接呼び出し

エージェント定義文字列を `systemPrompt` に渡し、スキル入力文字列を `prompt` に渡して直接 LLM を呼び出す。

```typescript
// Option A の実装イメージ
const extractPurposeAgent =
  await this.resourceLoader.loadAgent("extract-purpose");
const result = await this.llmClient.complete(skillInput, {
  systemPrompt: extractPurposeAgent,
});
if (result.success) {
  structurePlan.purpose = result.data;
}
```

| 評価軸           | 評価                                                                |
| ---------------- | ------------------------------------------------------------------- |
| 実装シンプルさ   | `ILLMClient.complete()` のみ使用。既存インターフェースで完結        |
| テスト容易性     | `ILLMClient` をモック化するだけで検証可能                           |
| 依存関係         | `packages/shared/src/services/llm/types.ts` の既存 I/F を使用       |
| エージェント抽象 | エージェント定義は systemPrompt として渡すだけで SDK 依存なし       |
| 拡張性           | 将来エージェント SDK に移行する際は本メソッドを差し替えるだけでよい |

#### Option B: エージェント SDK 経由（`@anthropic-ai/claude-agent-sdk`）

Claude Agent SDK の `query()` API を使ってエージェントとして実行する。

```typescript
// Option B の実装イメージ（概念）
const agent = await agentSdk.loadAgent("extract-purpose");
const purpose = await agent.query(skillInput);
structurePlan.purpose = purpose;
```

| 評価軸           | 評価                                                                            |
| ---------------- | ------------------------------------------------------------------------------- |
| 実装シンプルさ   | SDK 導入・設定が必要で、本タスクのスコープを超える可能性がある                  |
| テスト容易性     | SDK のモック設計が複雑になる                                                    |
| 依存関係         | `@anthropic-ai/claude-agent-sdk` の追加依存が必要                               |
| エージェント抽象 | SDK が提供するエージェントライフサイクル管理の恩恵を受けられる                  |
| 拡張性           | エージェント管理が SDK に集約されるが、現時点ではオーバーエンジニアリングになる |

### 2. 採用方式の決定

**採用: Option A（`ILLMClient.complete()` 直接呼び出し）**

**理由**:

1. **実装の最小性**: `ILLMClient` インターフェースは既存プロジェクトに存在し、追加依存なしで実装可能
2. **テスト容易性**: `ILLMClient` の `complete()` をモック化するだけで purpose フィールドの検証が可能
3. **スコープ適合**: 本タスクの目的は「purpose フィールドに LLM 結果を格納すること」であり、SDK 導入は別タスクのスコープ
4. **後方互換性**: `runCreateWorkflow` の戻り値型・`createSkill` のフロー変更が最小限
5. **設計ドキュメントへの明記**: Option A 採用を Phase 2 設計書（本ドキュメント）に明記する

> この採用方式の決定が AC-3（LLM 呼び出し方式の設計ドキュメントへの明記）を充足する。

### 3. `ILLMClient` インターフェースの確認

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

**ポイント**:

- `complete(prompt, options)` は `Result<string, Error>` を返す（`result.success` で成否を判定）
- `systemPrompt` オプションにエージェント定義文字列を渡せる
- `Result` 型は `packages/shared/src/types/rag/result.ts` で定義

### 4. `SkillCreatorService` への `ILLMClient` インジェクション設計

#### 4-1. コンストラクタ変更設計

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
  private readonly llmClient: ILLMClient; // オプショナル注入でも default client を使う

  constructor(
    skillsDir?: string,
    workflowsDir?: string,
    llmClient?: ILLMClient, // 追加（省略可）
  ) {
    // ...
    this.llmClient = llmClient ?? createDefaultSkillCreatorLLMClient();
  }
}
```

**設計方針**:

- `llmClient` は省略可能（未注入時は default client を生成し、選択済み LLM 設定で実行する）
- 既存のコンストラクタ呼び出し（引数なし）はそのまま動作する
- テスト時はモックした `ILLMClient` を注入する

#### 4-2. `runCreateWorkflow` の変更設計

```typescript
// 変更前
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
      purpose: extractPurposeAgent,  // ← 問題箇所: raw 文字列
      features: [],
      agents: [extractPurposeAgent, planStructureAgent],
    };

    return structurePlan;
  } catch {
    return null;
  }
}

// 変更後
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null> {
  let extractPurposeAgent: string;
  let planStructureAgent: string;

  try {
    extractPurposeAgent = await this.resourceLoader.loadAgent("extract-purpose");
    planStructureAgent = await this.resourceLoader.loadAgent("plan-structure");
  } catch (err) {
    // AC-4: loadAgent 失敗時はフォールバック（null 返却）
    return null;
  }

  // AC-1: extract-purpose エージェント定義を LLM に渡して purpose を推論
  let purpose: string = options.description;
  try {
    const skillInput = `${options.name}: ${options.description}`;
    const result = await this.llmClient.complete(skillInput, {
      systemPrompt: extractPurposeAgent,
    });
    if (result.success) {
      // AC-2: LLM の推論結果を purpose に格納
      const normalizedPurpose = normalizePurpose(result.data);
      if (normalizedPurpose !== null) {
        purpose = normalizedPurpose;
      }
    }
  } catch {
    // AC-5: LLM 例外時は description を維持
  }

  const structurePlan: StructurePlanJson = {
    skillName: options.name,
    description: options.description,
    purpose,  // AC-2: LLM 推論結果（空文字は description にフォールバック）
    features: [],
    agents: [extractPurposeAgent, planStructureAgent],
  };

  return structurePlan;
}
```

### 5. エラーハンドリング設計

| エラーシナリオ                 | 現状の挙動          | 変更後の挙動                                                        | 対応 AC  |
| ------------------------------ | ------------------- | ------------------------------------------------------------------- | -------- |
| `loadAgent` 失敗               | `catch` → null 返却 | `try/catch` を分離し、null 返却（フォールバック継続）               | AC-4     |
| LLM 呼び出し失敗（結果エラー） | 未実装              | `result.success === false` → `options.description` をフォールバック | AC-5     |
| LLM 呼び出し例外               | 未実装              | `catch` → `options.description` をフォールバック                    | AC-5     |
| `llmClient` 未注入             | 未実装              | default client を生成し、選択済み LLM 設定で実行                    | 後方互換 |

**エラーハンドリングの原則**:

- `loadAgent` 失敗は `runCreateWorkflow` 全体の失敗として null を返す（既存挙動を維持）
- LLM 失敗は purpose のフォールバックとして処理し、`StructurePlanJson` は返す（createSkill フローを中断しない）
- `llmClient` 未注入時は default client を生成し、テスト時はモック注入で差し替える

### 6. テスト戦略の概要

| テストカテゴリ                   | 対象                                                  | 検証内容                                                        |
| -------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| happy path                       | `runCreateWorkflow` + `llmClient.complete()`          | purpose が LLM の戻り値になること                               |
| loadAgent 失敗                   | `resourceLoader.loadAgent` が throw                   | null が返ること                                                 |
| LLM 失敗（result.success=false） | `llmClient.complete()` が `{ success: false }` を返す | フォールバック（description）が purpose になること              |
| LLM 例外                         | `llmClient.complete()` が throw                       | フォールバック（description）が purpose になること              |
| llmClient 未注入                 | `llmClient` なしでコンストラクタを呼ぶ                | default client で実行され、description フォールバックになること |

### 7. 検証マトリクス

| テスト対象                         | テストコマンド                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| SkillCreatorService ユニットテスト | `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts` |
| 型チェック（desktop）              | `pnpm --filter @repo/desktop typecheck`                                                                     |
| lint（desktop）                    | `pnpm --filter @repo/desktop lint`                                                                          |

## 統合テスト連携【必須】

| 判定項目             | 基準    | 結果    |
| -------------------- | ------- | ------- |
| ユニットテストLine   | 80%+    | pending |
| ユニットテストBranch | 60%+    | pending |
| 型チェック           | PASS    | pending |
| lint                 | 0 error | pending |

## 多角的チェック観点

| 観点               | チェック内容                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| 後方互換性         | `llmClient` 省略時に既存の `createSkill()` フローが壊れないか                                    |
| 型一貫性           | `ILLMClient` の `Result<string, Error>` 型と `purpose: string` の代入が型安全か                  |
| フォールバック挙動 | LLM 失敗時に `createSkill()` フロー全体が中断しないことを確認                                    |
| 依存タスク整合     | `TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001` が後続で purpose を参照する際の契約が一致しているか |

## 成果物

| 成果物 | パス                        | 説明                                                     |
| ------ | --------------------------- | -------------------------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | LLM 方式比較・採用決定・変更設計・エラーハンドリング設計 |

## 完了条件

- [ ] LLM 呼び出し方式（Option A/B）の比較評価が完了
- [ ] 採用方式（Option A: 直接呼び出し）の決定理由が明示されている
- [ ] `ILLMClient.complete()` シグネチャの確認が完了
- [ ] `SkillCreatorService` コンストラクタへの `llmClient` インジェクション設計が確定
- [ ] `runCreateWorkflow` の変更前後のコードが確定（before/after）
- [ ] エラーハンドリング設計（4シナリオ）が確定
- [ ] テスト戦略の概要が定義済み
- [ ] 検証マトリクスが定義済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. LLM 呼び出し方式比較（Option A/B）
2. 採用方式決定（Option A）と理由明示
3. `ILLMClient` インターフェース確認
4. コンストラクタ変更設計
5. `runCreateWorkflow` 変更設計（before/after）
6. エラーハンドリング設計（4シナリオ）
7. テスト戦略概要策定
8. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 3: 設計レビュー
