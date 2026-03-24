# Phase 5: 実装

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 5                                      |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |
| 更新日   | 2026-03-24                             |

## 目的

Phase 2 の設計と Phase 4 のテストに基づき、SkillBlueprint 型の追加、RuntimeSkillCreatorPlanResult の拡張（extends SkillBlueprint）、parsePlanResponse() の Graceful degradation 付きバリデーション拡張、plan() 戻り値構築の更新を実装する。TDD Green フェーズとして、Phase 4 で作成した全テストを PASS させる。

## 実行タスク

### Task 1: 型定義の追加（`packages/shared/src/types/skillCreator.ts`）

L337 付近（現行 `RuntimeSkillCreatorPlanResult` の直前）に以下の型・定数を追加する。

1. **SkillCategory 型の追加**

   ```typescript
   /**
    * テンプレートカテゴリ（正本 index.md L268-273）
    * - simple: SKILL.md のみの最小構成
    * - standard: LLM Task 仕様書 + 参照資料
    * - complex: スクリプト + バリデーション付き
    * - automation: 自動化スクリプト + テンプレート
    * - integration: 外部連携 + フル構成
    */
   export type SkillCategory =
     | "simple"
     | "standard"
     | "complex"
     | "automation"
     | "integration";
   ```

   挿入位置: L326（`// Runtime Skill Creator IPC 型定義` セクションの直前、L308 の `// ============================================` の後）

2. **CategoryTemplate インターフェースの追加**

   ```typescript
   /** カテゴリごとのベース構造テンプレート */
   export interface CategoryTemplate {
     /** テンプレートに含むディレクトリ一覧 */
     dirs: string[];
     /** カテゴリの説明 */
     desc: string;
   }
   ```

3. **PlannedFile インターフェースの追加**

   ```typescript
   /** 生成予定ファイル */
   export interface PlannedFile {
     /** ファイルパス（例: "agents/analyze-pr.md"） */
     path: string;
     /** ファイルの役割（例: "PR分析のLLM Task仕様書"） */
     purpose: string;
   }
   ```

4. **SkillBlueprint インターフェースの追加**

   ```typescript
   /**
    * plan() の出力型（正本 index.md L297-311 準拠）
    * w3a SkillFileWriter が消費する構造化されたスキル計画。
    */
   export interface SkillBlueprint {
     /** スキル名（kebab-case） */
     skillName: string;
     /** スキルの1行説明 */
     description: string;
     /** テンプレートカテゴリ */
     category: SkillCategory;
     /** カテゴリテンプレートに対するカスタマイズ */
     customizations: {
       /** テンプレートに追加するディレクトリ */
       additionalDirectories?: string[];
       /** テンプレートに追加するファイル */
       additionalFiles?: PlannedFile[];
       /** テンプレートから除外するデフォルトディレクトリ */
       excludedDefaults?: string[];
     };
     /** 全生成予定ファイル一覧 */
     files: PlannedFile[];
     /** カテゴリ・構造選択の理由 */
     reasoning: string;
   }
   ```

5. **CATEGORY_TEMPLATES 定数の追加**

   ```typescript
   /** カテゴリごとのベース構造テンプレート定数 */
   export const CATEGORY_TEMPLATES: Record<SkillCategory, CategoryTemplate> = {
     simple: { dirs: [], desc: "SKILL.md のみ" },
     standard: {
       dirs: ["agents", "references"],
       desc: "LLM Task 仕様書 + 参照資料",
     },
     complex: {
       dirs: ["agents", "scripts", "references", "schemas"],
       desc: "スクリプト + バリデーション付き",
     },
     automation: {
       dirs: ["agents", "scripts", "assets"],
       desc: "自動化スクリプト + テンプレート",
     },
     integration: {
       dirs: ["agents", "scripts", "references", "schemas", "assets"],
       desc: "外部連携 + フル構成",
     },
   };
   ```

6. **RuntimeSkillCreatorPlanResult を `extends SkillBlueprint` に変更**

   現行定義（L327-337）:

   ```typescript
   export interface RuntimeSkillCreatorPlanResult {
     planId: string;
     skillSpec: string;
     estimatedSteps: number;
     skillName: string;
     description: string;
     agents: Array<{ name: string; role: string }>;
     scripts: Array<{ name: string; purpose: string }>;
     triggers: string[];
     anchors: string[];
   }
   ```

   変更後:

   ```typescript
   /**
    * Runtime plan 結果
    * SkillBlueprint を拡張し、計画メタ情報と plan 固有情報を追加する。
    */
   export interface RuntimeSkillCreatorPlanResult extends SkillBlueprint {
     /** 計画ID */
     planId: string;
     /** 入力されたスキル仕様テキスト */
     skillSpec: string;
     /**
      * 推定ステップ数
      * @deprecated files.length で代替可能。後方互換のため残す。
      */
     estimatedSteps: number;
     /** エージェント一覧（後方互換のため SkillBlueprint.files とは別途保持） */
     agents: Array<{ name: string; role: string }>;
     /** スクリプト一覧（後方互換のため SkillBlueprint.files とは別途保持） */
     scripts: Array<{ name: string; purpose: string }>;
     /** トリガー一覧（SkillBlueprint に含まれない plan 固有情報） */
     triggers: string[];
     /** アンカー一覧（SkillBlueprint に含まれない plan 固有情報） */
     anchors: string[];
   }
   ```

   **注意**: `skillName` と `description` は SkillBlueprint から継承されるため、RuntimeSkillCreatorPlanResult からは削除する（重複定義回避）。

7. **エクスポートの確認**
   - `packages/shared/src/types/index.ts`（または該当するバレルエクスポートファイル）から `SkillBlueprint`, `SkillCategory`, `PlannedFile`, `CategoryTemplate`, `CATEGORY_TEMPLATES` をエクスポートする

### Task 2: LLM レスポンススキーマの拡張（`apps/desktop/src/main/services/runtime/planPromptConstants.ts`）

`PLAN_RESPONSE_SCHEMA_INSTRUCTION`（L22-49）を拡張する。

1. **スキーマに新フィールドを追加**

   既存の `anchors` フィールドの後に以下を追加:

   ```
   "category": "string - one of: simple, standard, complex, automation, integration",
   "customizations": {
     "additionalDirectories": ["string[] - extra dirs beyond category template (optional)"],
     "additionalFiles": [{"path": "string", "purpose": "string"}],
     "excludedDefaults": ["string[] - template defaults to exclude (optional)"]
   },
   "files": [
     {
       "path": "string - relative path like agents/foo.md or scripts/bar.js",
       "purpose": "string - what this file does"
     }
   ],
   "reasoning": "string - why this category and structure were chosen"
   ```

2. **ルール追加**

   既存の Rules セクション（L46-48）に以下を追加:

   ```
   - category must be one of: simple, standard, complex, automation, integration
   - files must include all planned files (agents, scripts, SKILL.md, references, etc.)
   - customizations is optional; omit or use empty object {} if no customizations needed
   - reasoning should explain why the chosen category fits the skill requirements
   ```

### Task 3: parsePlanResponse() の拡張（`apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`）

1. **LLMPlanResponse 型に新フィールド追加**（L371-378）

   ```typescript
   interface LLMPlanResponse {
     skillName: string;
     description: string;
     agents: Array<{ name: string; role: string }>;
     scripts: Array<{ name: string; purpose: string }>;
     triggers: string[];
     anchors: string[];
     // SkillBlueprint 新フィールド（Graceful degradation 対応のため optional）
     category?: SkillCategory;
     customizations?: SkillBlueprint["customizations"];
     files?: PlannedFile[];
     reasoning?: string;
   }
   ```

   **import 追加**: `SkillCategory`, `PlannedFile`, `SkillBlueprint` を `@repo/shared/types` からインポートする。

2. **isValidPlanResponse() に新フィールドのバリデーション追加**（L446-471）

   既存のバリデーション（L446-470）の後に、新フィールドの**条件付き**バリデーションを追加する。Graceful degradation のため、新フィールドが存在する場合のみバリデーションを行い、存在しない場合はスキップする:

   ```typescript
   // category: 存在する場合は SkillCategory の5値のいずれかであること
   const VALID_CATEGORIES = [
     "simple",
     "standard",
     "complex",
     "automation",
     "integration",
   ];
   if ("category" in value && typeof value.category === "string") {
     if (!VALID_CATEGORIES.includes(value.category)) return false;
   } else if ("category" in value) {
     // category が存在するが string でない場合は無効
     return false;
   }

   // customizations: 存在する場合はオブジェクトであること
   if ("customizations" in value) {
     if (
       value.customizations == null ||
       typeof value.customizations !== "object"
     )
       return false;
     // additionalDirectories: 存在する場合は string[]
     // additionalFiles: 存在する場合は PlannedFile[]
     // excludedDefaults: 存在する場合は string[]
   }

   // files: 存在する場合は PlannedFile[] であること
   if ("files" in value) {
     if (!Array.isArray(value.files)) return false;
     if (!value.files.every(isValidPlannedFileEntry)) return false;
   }

   // reasoning: 存在する場合は string であること
   if ("reasoning" in value && typeof value.reasoning !== "string")
     return false;
   ```

   **isValidPlannedFileEntry() ヘルパー関数の追加**:

   ```typescript
   function isValidPlannedFileEntry(entry: unknown): entry is PlannedFile {
     return (
       entry != null &&
       typeof entry === "object" &&
       "path" in entry &&
       typeof entry.path === "string" &&
       entry.path.trim() !== "" &&
       "purpose" in entry &&
       typeof entry.purpose === "string" &&
       entry.purpose.trim() !== ""
     );
   }
   ```

3. **parsePlanResponse() 内で新フィールドのデフォルト値フォールバック**（L400-410）

   `parsePlanResponse()` の return 文を更新し、新フィールドが未返却の場合にデフォルト値を適用する:

   ```typescript
   export function parsePlanResponse(responseText: string): LLMPlanResponse {
     const cleaned = stripMarkdownCodeBlock(responseText);
     const parsed: unknown = JSON.parse(cleaned);

     if (!isValidPlanResponse(parsed)) {
       throw new Error("LLM response does not match expected plan schema");
     }

     // Graceful degradation: 新フィールドのデフォルト値適用
     const result: LLMPlanResponse = {
       ...parsed,
       category: parsed.category ?? "standard",
       customizations: parsed.customizations ?? {},
       files:
         parsed.files ??
         generateFilesFromAgentsAndScripts(parsed.agents, parsed.scripts),
       reasoning: parsed.reasoning ?? "",
     };

     return result;
   }
   ```

   **generateFilesFromAgentsAndScripts() ヘルパー関数の追加**:

   ```typescript
   /** agents と scripts から PlannedFile[] を自動生成する（Graceful degradation 用） */
   function generateFilesFromAgentsAndScripts(
     agents: Array<{ name: string; role: string }>,
     scripts: Array<{ name: string; purpose: string }>,
   ): PlannedFile[] {
     const files: PlannedFile[] = [];
     for (const agent of agents) {
       files.push({ path: `agents/${agent.name}.md`, purpose: agent.role });
     }
     for (const script of scripts) {
       files.push({ path: `scripts/${script.name}`, purpose: script.purpose });
     }
     return files;
   }
   ```

4. **plan() L154-164 の戻り値構築に新フィールド追加**

   現行（L154-164）:

   ```typescript
   return {
     planId,
     skillSpec,
     estimatedSteps: parsed.agents.length + parsed.scripts.length,
     skillName: parsed.skillName,
     description: parsed.description,
     agents: parsed.agents,
     scripts: parsed.scripts,
     triggers: parsed.triggers,
     anchors: parsed.anchors,
   };
   ```

   変更後:

   ```typescript
   // 注意: parsePlanResponse() が Graceful degradation でデフォルト値を適用済み。
   // 以下の ?? 演算子は防御的フォールバック（parsePlanResponse 経由でない直接呼び出し対策）。
   return {
     // SkillBlueprint フィールド
     skillName: parsed.skillName,
     description: parsed.description,
     category: parsed.category ?? "standard",
     customizations: parsed.customizations ?? {},
     files: parsed.files ?? [],
     reasoning: parsed.reasoning ?? "",
     // メタ情報
     planId,
     skillSpec,
     estimatedSteps:
       parsed.files?.length ?? parsed.agents.length + parsed.scripts.length,
     // plan 固有情報（後方互換）
     agents: parsed.agents,
     scripts: parsed.scripts,
     triggers: parsed.triggers,
     anchors: parsed.anchors,
   };
   ```

5. **plan() L121-131 のスタブ経路に新フィールドデフォルト値追加**

   現行（L121-131）:

   ```typescript
   return {
     planId,
     skillSpec,
     estimatedSteps: 3,
     skillName: "",
     description: "",
     agents: [],
     scripts: [],
     triggers: [],
     anchors: [],
   };
   ```

   変更後:

   ```typescript
   return {
     // SkillBlueprint フィールド（デフォルト値）
     skillName: "",
     description: "",
     category: "standard",
     customizations: {},
     files: [],
     reasoning: "",
     // メタ情報
     planId,
     skillSpec,
     estimatedSteps: 3,
     // plan 固有情報
     agents: [],
     scripts: [],
     triggers: [],
     anchors: [],
   };
   ```

### Task 4: 既存テストの更新

Phase 5 の型変更により、既存テストのアサーションを更新する必要がある。

1. **`RuntimeSkillCreatorFacade.test.ts` の更新**
   - L86-96 のスタブ戻り値アサーション（`plan` describe > `"integrated_api 判定時は plan 結果を返す"`）に新フィールドのデフォルト値を追加:
     ```typescript
     expect(result).toEqual({
       planId: "plan-1710000000000",
       skillSpec: "line-1\nline-2",
       estimatedSteps: 3,
       skillName: "",
       description: "",
       category: "standard",
       customizations: {},
       files: [],
       reasoning: "",
       agents: [],
       scripts: [],
       triggers: [],
       anchors: [],
     });
     ```
   - L114-124 の `"apiKey 未指定の api-key モードでは authKeyService 経由の解決を使う"` テストも同様に更新する

2. **`RuntimeSkillCreatorFacade.plan.test.ts` の更新**
   - L325-328 のスタブ経路テスト（`"llmAdapter 未注入時はスタブレスポンスを返す"`）に新フィールドの検証を追加する

## 参照資料

- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/phase-02-design.md`（設計書）
- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/phase-04-test-creation.md`（テスト仕様）
- `packages/shared/src/types/skillCreator.ts`（現行型定義）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（実装対象）
- `apps/desktop/src/main/services/runtime/planPromptConstants.ts`（LLM プロンプト定数）
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`（既存テスト: 更新対象）
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`（既存テスト: 更新対象）
- `.claude/rules/06-known-pitfalls.md`（P23, P32, P42, P49）

## 成果物

- `packages/shared/src/types/skillCreator.ts`（更新: SkillBlueprint 関連型追加 + RuntimeSkillCreatorPlanResult 拡張）
- `apps/desktop/src/main/services/runtime/planPromptConstants.ts`（更新: PLAN_RESPONSE_SCHEMA_INSTRUCTION 拡張）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（更新: LLMPlanResponse 拡張 + isValidPlanResponse 拡張 + parsePlanResponse 拡張 + plan() 戻り値更新）
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`（更新: 既存テストアサーション修正）
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`（更新: スタブ経路テスト修正）

## 完了条件

- [ ] SkillCategory 型を `packages/shared/src/types/skillCreator.ts` に追加した
- [ ] CategoryTemplate インターフェースを追加した
- [ ] PlannedFile インターフェースを追加した
- [ ] SkillBlueprint インターフェースを追加した
- [ ] CATEGORY_TEMPLATES 定数を追加した（5カテゴリ全定義）
- [ ] RuntimeSkillCreatorPlanResult を `extends SkillBlueprint` に変更した
- [ ] `estimatedSteps` に `@deprecated` JSDoc を追加した
- [ ] `skillName` と `description` が SkillBlueprint から継承される形式になっている
- [ ] 新しい型・定数がバレルエクスポートされている
- [ ] `PLAN_RESPONSE_SCHEMA_INSTRUCTION` に `category`, `customizations`, `files`, `reasoning` フィールドを追加した
- [ ] LLM 向けルールに新フィールドの制約を追加した
- [ ] `LLMPlanResponse` 型に新フィールド（optional）を追加した
- [ ] `isValidPlanResponse()` に新フィールドの条件付きバリデーションを追加した
- [ ] `isValidPlannedFileEntry()` ヘルパー関数を追加した
- [ ] `parsePlanResponse()` で新フィールドのデフォルト値フォールバックを実装した
- [ ] `generateFilesFromAgentsAndScripts()` ヘルパー関数を追加した
- [ ] `plan()` L154-164 の戻り値構築に新フィールドを追加した
- [ ] `plan()` L121-131 のスタブ経路に新フィールドデフォルト値を追加した
- [ ] 既存テスト（`RuntimeSkillCreatorFacade.test.ts`）のアサーションを更新した
- [ ] Phase 4 で作成した全テストが PASS した（TDD Green フェーズ）
- [ ] `pnpm --filter @repo/shared build` が成功した
- [ ] `pnpm --filter @repo/desktop typecheck` が成功した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 統合テスト連携（Phase 1-11 は必須）

| 判定項目                | 基準 | 結果 |
| ----------------------- | ---- | ---- |
| ユニットテスト Line     | 80%+ | -    |
| ユニットテスト Branch   | 60%+ | -    |
| ユニットテスト Function | 80%+ | -    |

## 多角的チェック観点（AI が判断）

| 観点               | 適用判断                                                                              | 仕様参照先                           |
| ------------------ | ------------------------------------------------------------------------------------- | ------------------------------------ |
| セキュリティ       | 非適用（型変更とバリデーション追加のみ、IPC 入力バリデーションは既存維持）            | -                                    |
| アーキテクチャ     | **適用**: extends による型継承が正しく動作すること、レイヤー間型伝播の確認            | Phase 2 設計書                       |
| エラーハンドリング | **適用**: Graceful degradation 実装の正確性、isValidPlanResponse のバリデーション網羅 | Phase 2 設計書 Task 5                |
| UI/UX              | 非適用                                                                                | -                                    |
| データ整合性       | **適用**: P32 型定義の二箇所同時更新、バレルエクスポートの整合性                      | `.claude/rules/06-known-pitfalls.md` |
| パフォーマンス     | 非適用                                                                                | -                                    |
| アクセシビリティ   | 非適用                                                                                | -                                    |

## サブタスク管理

Phase 実行開始時に、TaskCreate ツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 2 設計書、Phase 4 テスト仕様）
2. 型定義の追加（Task 1: skillCreator.ts）
3. LLM レスポンススキーマの拡張（Task 2: planPromptConstants.ts）
4. parsePlanResponse() の拡張（Task 3: RuntimeSkillCreatorFacade.ts）
5. 既存テストの更新（Task 4）
6. ビルド確認（shared build + desktop typecheck）
7. 全テスト実行確認（Phase 4 テスト PASS）
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 実装順序

実装は以下の順序で行う（依存関係に基づく）:

1. **Task 1**: `packages/shared/src/types/skillCreator.ts` - 型定義追加（他の全てのタスクが依存）
2. **Task 2**: `apps/desktop/src/main/services/runtime/planPromptConstants.ts` - LLM スキーマ拡張（独立）
3. **Task 3**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` - パーサー拡張 + plan() 更新（Task 1 に依存）
4. **Task 4**: 既存テスト更新（Task 1, 3 に依存）
5. ビルド + テスト実行

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次の Phase

Phase 6: テスト拡充
