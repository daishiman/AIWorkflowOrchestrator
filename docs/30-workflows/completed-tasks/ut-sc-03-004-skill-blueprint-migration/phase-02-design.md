# Phase 2: 設計

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 2                                      |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |
| 更新日   | 2026-03-24                             |

## 目的

SkillBlueprint 型の追加、RuntimeSkillCreatorPlanResult の拡張戦略、LLM レスポンススキーマの拡張、パーサーの更新設計を確定する。段階的移行アプローチにより、既存の terminal_handoff 経路と Renderer 参照を壊さずに移行する。

## 設計方針: 段階的移行（Superset 方式）

RuntimeSkillCreatorPlanResult を SkillBlueprint のフィールドで拡張し、SkillBlueprint を独立した型として定義する。plan() は SkillBlueprint を内包した拡張型を返すことで、後方互換性を維持しつつ w3a が SkillBlueprint として消費できるようにする。

```
方式: RuntimeSkillCreatorPlanResult を SkillBlueprint & メタ情報の合成型に変更

旧: RuntimeSkillCreatorPlanResult = { planId, skillSpec, estimatedSteps, skillName, description, agents[], scripts[], triggers[], anchors[] }
新: RuntimeSkillCreatorPlanResult = SkillBlueprint & { planId, skillSpec, triggers[], anchors[] }
```

## 実行タスク

1. **SkillBlueprint 関連型の追加設計**

   `packages/shared/src/types/skillCreator.ts` に以下の型を追加する:

   ```typescript
   /** テンプレートカテゴリ（正本 index.md L268-273） */
   type SkillCategory =
     | "simple"
     | "standard"
     | "complex"
     | "automation"
     | "integration";

   /** カテゴリごとのベース構造テンプレート */
   interface CategoryTemplate {
     dirs: string[];
     desc: string;
   }

   /** 生成予定ファイル */
   interface PlannedFile {
     path: string; // "agents/analyze-pr.md"
     purpose: string; // "PR分析のLLM Task仕様書"
   }

   /** plan() の出力型（正本 index.md L297-311 準拠） */
   interface SkillBlueprint {
     skillName: string;
     description: string;
     category: SkillCategory;
     customizations: {
       additionalDirectories?: string[];
       additionalFiles?: PlannedFile[];
       excludedDefaults?: string[];
     };
     files: PlannedFile[];
     reasoning: string;
   }
   ```

2. **CATEGORY_TEMPLATES 定数の配置設計**

   `packages/shared/src/types/skillCreator.ts` の型定義に隣接して定数を定義する:

   ```typescript
   const CATEGORY_TEMPLATES: Record<SkillCategory, CategoryTemplate> = {
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

3. **RuntimeSkillCreatorPlanResult の拡張設計**

   既存フィールドを維持しつつ SkillBlueprint フィールドを追加する:

   ```typescript
   /** 拡張後の RuntimeSkillCreatorPlanResult */
   interface RuntimeSkillCreatorPlanResult extends SkillBlueprint {
     /** 計画メタ情報（SkillBlueprint に含まれない） */
     planId: string;
     skillSpec: string;
     /** @deprecated estimatedSteps は files.length で代替可能。後方互換のため残す */
     estimatedSteps: number;
     /** エージェント一覧（後方互換のため SkillBlueprint.files とは別途保持） */
     agents: Array<{ name: string; role: string }>;
     /** スクリプト一覧（後方互換のため SkillBlueprint.files とは別途保持） */
     scripts: Array<{ name: string; purpose: string }>;
     /** triggers/anchors は SkillBlueprint に不在だが plan 固有情報として保持 */
     triggers: string[];
     anchors: string[];
   }
   ```

   **設計判断**: `extends SkillBlueprint` により、w3a は `RuntimeSkillCreatorPlanResult` を `SkillBlueprint` として直接キャストなしで使用可能。

4. **LLM レスポンススキーマの拡張設計**

   `planPromptConstants.ts` の `PLAN_RESPONSE_SCHEMA_INSTRUCTION` を拡張する:

   ```json
   {
     "skillName": "string - kebab-case name",
     "description": "string - one-line description",
     "category": "string - one of: simple, standard, complex, automation, integration",
     "customizations": {
       "additionalDirectories": [
         "string[] - extra dirs beyond category template"
       ],
       "additionalFiles": [{ "path": "string", "purpose": "string" }],
       "excludedDefaults": ["string[] - template defaults to exclude"]
     },
     "files": [
       {
         "path": "string - relative path like agents/foo.md",
         "purpose": "string"
       }
     ],
     "reasoning": "string - why this category and structure",
     "agents": [{ "name": "string", "role": "string" }],
     "scripts": [{ "name": "string", "purpose": "string" }],
     "triggers": ["string"],
     "anchors": ["string"]
   }
   ```

   **ポイント**: agents/scripts は files に含まれるが、後方互換のため別途維持する。files は agents/scripts + SKILL.md + references 等の統合リスト。

5. **parsePlanResponse() の拡張設計**

   `RuntimeSkillCreatorFacade.ts` の `parsePlanResponse()` を拡張する:
   - `LLMPlanResponse` 型に `category`, `customizations`, `files`, `reasoning` を追加
   - `isValidPlanResponse()` バリデーションに新フィールドのチェックを追加:
     - `category`: `SkillCategory` の値セットに含まれるか検証
     - `customizations`: オブジェクトであること、各フィールドが任意で型チェック
     - `files`: `PlannedFile[]` 型チェック（path と purpose が非空文字列）
     - `reasoning`: 非空文字列チェック
   - **Graceful degradation**: LLM が新フィールドを返さない場合のデフォルト値:
     - `category`: `"standard"`（最も一般的）
     - `customizations`: `{}`
     - `files`: agents + scripts から自動生成
     - `reasoning`: `""`

6. **plan() メソッドの戻り値構築の更新設計**

   `RuntimeSkillCreatorFacade.ts` L154-164 の戻り値構築を更新する:

   ```typescript
   return {
     // SkillBlueprint フィールド
     skillName: parsed.skillName,
     description: parsed.description,
     category: parsed.category,
     customizations: parsed.customizations,
     files: parsed.files,
     reasoning: parsed.reasoning,
     // メタ情報
     planId,
     skillSpec,
     estimatedSteps: parsed.files.length,
     // plan 固有情報
     agents: parsed.agents,
     scripts: parsed.scripts,
     triggers: parsed.triggers,
     anchors: parsed.anchors,
   };
   ```

   **Graceful degradation（スタブ経路 L121-131）の更新**:

   ```typescript
   return {
     planId,
     skillSpec,
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
   };
   ```

7. **Preload 型の同期設計**
   - `apps/desktop/src/preload/skill-creator-api.ts`: `planSkill()` の戻り値型は `IpcResult<RuntimeSkillCreatorPlanResponse>` のため、型変更は `skillCreator.ts` の更新により自動伝播する
   - `apps/desktop/src/preload/types.ts`: `RuntimeSkillCreatorPlanResponse` の再エクスポートを確認し、必要に応じて更新する
   - P32（型定義の二箇所同時更新必須）に注意: shared 型と preload 型が乖離しないこと

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/index.md`（正本: SkillBlueprint L297-311、SkillCategory L268-294）
- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/phase-01-requirements.md`（前 Phase 成果物）
- `packages/shared/src/types/skillCreator.ts`（現行型定義 L327-337）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（plan() L90-165、parsePlanResponse() L400-471）
- `apps/desktop/src/main/services/runtime/planPromptConstants.ts`（LLM スキーマ L22-49）
- `.claude/rules/06-known-pitfalls.md`（P23, P32, P42）

## 成果物

- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/outputs/phase-02-design-output.md`（設計書）
  - SkillBlueprint 型定義（完全版）
  - RuntimeSkillCreatorPlanResult 拡張設計
  - LLM レスポンススキーマ拡張
  - parsePlanResponse() 更新ロジック
  - Preload 型同期計画

## 完了条件

- [ ] SkillBlueprint, SkillCategory, PlannedFile, CategoryTemplate の全型定義を設計した
- [ ] CATEGORY_TEMPLATES 定数の値と配置先を確定した
- [ ] RuntimeSkillCreatorPlanResult の拡張方式（extends SkillBlueprint）を設計した
- [ ] estimatedSteps の @deprecated 扱いを決定した
- [ ] triggers/anchors の SkillBlueprint 外保持方針を決定した
- [ ] LLM レスポンススキーマ（PLAN_RESPONSE_SCHEMA_INSTRUCTION）の拡張を設計した
- [ ] parsePlanResponse() の新フィールドバリデーションを設計した
- [ ] Graceful degradation（新フィールド未返却時のデフォルト値）を設計した
- [ ] plan() メソッドの戻り値構築（通常経路 + スタブ経路）を更新設計した
- [ ] Preload 型の同期計画を策定した（P32 対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携（Phase 1〜11は必須）

本Phaseは設計フェーズであり、プロダクションコードの変更は行わない。

| 判定項目               | 基準 | 結果                  |
| ---------------------- | ---- | --------------------- |
| ユニットテストLine     | 80%+ | N/A（コード変更なし） |
| ユニットテストBranch   | 60%+ | N/A（コード変更なし） |
| ユニットテストFunction | 80%+ | N/A（コード変更なし） |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                                     | 仕様参照先                                   |
| ------------------ | ------------------------------------------------------------ | -------------------------------------------- |
| セキュリティ       | 非適用（型変更のみ）                                         | -                                            |
| アーキテクチャ     | **適用**: extends による型継承設計、レイヤー間契約           | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | **適用**: Graceful degradation（LLM が新フィールド未返却時） | `aiworkflow-requirements: error-handling.md` |
| UI/UX              | 非適用                                                       | -                                            |
| データ整合性       | **適用**: P32 型定義の二箇所同時更新                         | `.claude/rules/06-known-pitfalls.md`         |
| パフォーマンス     | 非適用                                                       | -                                            |
| アクセシビリティ   | 非適用                                                       | -                                            |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. SkillBlueprint 関連型の追加設計
3. CATEGORY_TEMPLATES 定数の配置設計
4. RuntimeSkillCreatorPlanResult の拡張設計
5. LLM レスポンススキーマの拡張設計
6. parsePlanResponse() の拡張設計
7. plan() メソッドの戻り値構築の更新設計
8. Preload 型の同期設計
9. 設計ドキュメント作成
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 3: 設計レビュー
