# Phase 5: 実装

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 5                            |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |
| 機能名     | llm-purpose-wire             |
| 前提Phase  | Phase 4                      |
| 後続Phase  | Phase 6                      |
| 作成日     | 2026-04-16                   |
| ステータス | pending                      |

## 目的

`SkillCreatorService.ts` の `runCreateWorkflow` に LLM 呼び出し処理を追加し、
`StructurePlanJson.purpose` に LLM の推論結果を格納する（TDD の Red → Green 移行）。
コンストラクタへの `ILLMClient` インジェクション、エラーハンドリング2段構成を実装する。

## 実行タスク

- 既存テスト回帰確認（baseline 確認）
- `ILLMClient` インポートの追加
- コンストラクタへの `llmClient` フィールド追加
- `runCreateWorkflow` の `try/catch` 2段構成への変更
- `this.llmClient.complete()` 呼び出し追加
- `structurePlan.purpose` への LLM 結果代入
- Green 確認: テストが全て PASS することを確認
- 型チェック・lint 確認

## 参照資料

| 資料名                      | パス                                                                         | 用途               |
| --------------------------- | ---------------------------------------------------------------------------- | ------------------ |
| Phase 4 テスト仕様書        | `outputs/phase-4/`                                                           | テストケース参照   |
| SkillCreatorService.ts      | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 変更対象ファイル   |
| ILLMClient インターフェース | `packages/shared/src/services/llm/types.ts`                                  | 型インポート確認   |
| SkillCreatorService.test.ts | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | Green 確認用テスト |

## 実行手順

### 0. 既存テスト回帰確認（baseline 確認）【必須】

```bash
# 変更前の既存テストを実行して baseline 確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillCreatorService.test.ts
# 期待: 既存テストが全て PASS すること（追加 TC-01〜TC-08 は FAIL）
```

### 1. `ILLMClient` インポート追加

**変更対象**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

```typescript
// 追加するインポート（既存 import ブロックに追記）
import type { ILLMClient } from "@repo/shared/services/llm/types";
```

> `packages/shared/src/services/llm/types.ts` のパスに合わせ、
> `@repo/shared` のエイリアスが利用可能であることを事前に確認すること。
> 利用不可の場合は相対パスで指定する。

```bash
# @repo/shared のエイリアス設定確認
grep -n "shared" apps/desktop/tsconfig.json
grep -n "\"@repo/shared\"" apps/desktop/package.json
```

### 2. コンストラクタへの `llmClient` フィールド追加

```typescript
// 変更前
export class SkillCreatorService {
  private readonly skillsDir: string;
  private readonly workflowsDir: string;
  private readonly skillCreatorPath: string;
  private readonly scriptExecutor: ScriptExecutor;
  private readonly resourceLoader: ResourceLoader;

  constructor(skillsDir?: string, workflowsDir?: string) {
    this.skillsDir = skillsDir || DEFAULT_SKILLS_DIR;
    this.workflowsDir = workflowsDir || DEFAULT_WORKFLOWS_DIR;
    this.skillCreatorPath = DEFAULT_SKILL_CREATOR_PATH;
    this.scriptExecutor = new ScriptExecutor(this.skillCreatorPath);
    this.resourceLoader = new ResourceLoader(this.skillCreatorPath);
  }
}

// 変更後
export class SkillCreatorService {
  private readonly skillsDir: string;
  private readonly workflowsDir: string;
  private readonly skillCreatorPath: string;
  private readonly scriptExecutor: ScriptExecutor;
  private readonly resourceLoader: ResourceLoader;
  private readonly llmClient: ILLMClient; // default client を含めて常に初期化

  constructor(
    skillsDir?: string,
    workflowsDir?: string,
    llmClient?: ILLMClient, // 追加（省略可）
  ) {
    this.skillsDir = skillsDir || DEFAULT_SKILLS_DIR;
    this.workflowsDir = workflowsDir || DEFAULT_WORKFLOWS_DIR;
    this.skillCreatorPath = DEFAULT_SKILL_CREATOR_PATH;
    this.scriptExecutor = new ScriptExecutor(this.skillCreatorPath);
    this.resourceLoader = new ResourceLoader(this.skillCreatorPath);
    this.llmClient = llmClient ?? createDefaultSkillCreatorLLMClient(); // 追加
  }
}
```

### 3. `runCreateWorkflow` の変更

**変更対象**: `SkillCreatorService.ts` L630〜L653 付近

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
    // AC-3: loadAgent 失敗時はフォールバック（null 返却）
    return null;
  }
}

// 変更後
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null> {
  // AC-4: loadAgent 失敗は独立した try/catch でキャッチし null を返す
  let extractPurposeAgent: string;
  let planStructureAgent: string;
  try {
    extractPurposeAgent =
      await this.resourceLoader.loadAgent("extract-purpose");
    planStructureAgent =
      await this.resourceLoader.loadAgent("plan-structure");
  } catch {
    return null;
  }

  // AC-1: extract-purpose エージェント定義を LLM に渡して purpose を推論
  // AC-5: LLM 失敗時は options.description をフォールバックとして使用
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
    // LLM 例外時も purpose = options.description のまま（フォールバック）
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

### 4. 変更後の影響範囲確認

```bash
# 変更箇所（L630付近）のコンテキスト確認
grep -n -A 40 "private async runCreateWorkflow" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts

# SkillCreatorService のコンストラクタ呼び出し元確認（引数なし呼び出しが壊れないか）
grep -rn "new SkillCreatorService" apps/ packages/
```

### 5. Green 確認コマンド

```bash
# Phase 4 で追加したテストが PASS することを確認（Green 移行）
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillCreatorService.test.ts \
  --reporter=verbose

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

### 6. 既存テスト回帰確認（実装後）

```bash
# desktop パッケージ全体テスト実行
pnpm --filter @repo/desktop test
```

## 統合テスト連携【必須】

| 判定項目              | 基準    | 結果    |
| --------------------- | ------- | ------- |
| TC-01〜TC-08 全 PASS  | PASS    | pending |
| 既存テスト回帰なし    | 全PASS  | pending |
| 型チェック（desktop） | PASS    | pending |
| lint                  | 0 error | pending |

## 多角的チェック観点

| 観点     | 確認内容                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------- |
| 矛盾     | default client 初期化と `try/catch` のフォールバック値が設計と一致しているか                   |
| 漏れ     | `result.success === false` のケースと `result.success === true` のケース両方が実装されているか |
| 整合性   | コンストラクタ変更が既存の呼び出し元（引数なし）に影響しないか                                 |
| 依存関係 | `TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001` が接続する際の `purpose` フィールドの値が正しいか |

## 成果物

| 成果物           | パス                                                          | 説明                                 |
| ---------------- | ------------------------------------------------------------- | ------------------------------------ |
| 実装コード変更   | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | LLM 呼び出し追加・コンストラクタ変更 |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`                   | 変更内容の要約                       |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`                            | 変更対象ファイル一覧                 |

## 完了条件

- [ ] baseline 確認（既存テスト全 PASS）実施済み
- [ ] `ILLMClient` インポート追加済み
- [ ] コンストラクタに `llmClient` フィールド追加済み（省略可能）
- [ ] `runCreateWorkflow` の `loadAgent` 用 `try/catch` が分離済み
- [ ] `this.llmClient.complete()` 呼び出し追加済み
- [ ] `structurePlan.purpose` に LLM 結果（または フォールバック）が代入されている
- [ ] TC-01〜TC-08 全 PASS（Green 確認）
- [ ] 既存テストへの悪影響なし
- [ ] 型チェック（`pnpm typecheck`）が PASS
- [ ] lint がエラーなし
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. baseline 確認（既存テスト全 PASS 確認）
2. `ILLMClient` インポート追加
3. コンストラクタ変更（`llmClient` フィールド追加）
4. `runCreateWorkflow` の `try/catch` 2段構成への変更
5. `this.llmClient.complete()` 呼び出し追加と `purpose` 代入
6. Green 確認（TC-01〜TC-08 PASS）
7. 型チェック・lint 確認
8. 既存テスト回帰確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 6: テスト拡充
