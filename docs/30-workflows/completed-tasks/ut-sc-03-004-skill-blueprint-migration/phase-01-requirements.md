# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 1                                      |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |
| 更新日   | 2026-03-24                             |

## 目的

plan() の出力型 `RuntimeSkillCreatorPlanResult`（flat 構造）を、正本 index.md で定義された `SkillBlueprint` 型（category + customizations + files + reasoning）と互換にするための要件を定義する。後続タスク w3a（SkillFileWriter）が SkillBlueprint を前提に設計されているため、本タスクはブロッカー解消を主目的とする。

## 実行タスク

1. **現行 RuntimeSkillCreatorPlanResult の調査**
   - `packages/shared/src/types/skillCreator.ts` L327-337 の現行定義を把握する
   - 現行フィールド: `planId`, `skillSpec`, `estimatedSteps`, `skillName`, `description`, `agents[]`, `scripts[]`, `triggers[]`, `anchors[]`
   - `RuntimeSkillCreatorFacade.plan()` の戻り値生成部分（L154-164）を確認する
   - `parsePlanResponse()` のパースロジック（L400-410）を確認する
   - LLM レスポンススキーマ（`planPromptConstants.ts` の `PLAN_RESPONSE_SCHEMA_INSTRUCTION`）を確認する

2. **正本 SkillBlueprint 型の要件抽出**
   - 正本: `docs/30-workflows/skill-creator-llm-integration/index.md` L297-311
   - SkillBlueprint のフィールド:
     - `skillName: string`
     - `description: string`
     - `category: SkillCategory` (`simple` | `standard` | `complex` | `automation` | `integration`)
     - `customizations: { additionalDirectories?, additionalFiles?, excludedDefaults? }`
     - `files: PlannedFile[]` (`{ path, purpose }`)
     - `reasoning: string`
   - `SkillCategory` 型と `CATEGORY_TEMPLATES` 定数（L268-294）の要件を確認する

3. **型ギャップ分析**
   - RuntimeSkillCreatorPlanResult → SkillBlueprint 間のフィールドマッピング:
     | RuntimeSkillCreatorPlanResult | SkillBlueprint | 対応 |
     | ----------------------------- | ----------------------- | ---- |
     | `skillName` | `skillName` | 直接対応 |
     | `description` | `description` | 直接対応 |
     | `agents[]` | `files[]` (agents/) | 変換必要 |
     | `scripts[]` | `files[]` (scripts/) | 変換必要 |
     | `triggers[]` | ─ | SkillBlueprint に不在 |
     | `anchors[]` | ─ | SkillBlueprint に不在 |
     | `planId` | ─ | メタ情報（保持） |
     | `skillSpec` | ─ | メタ情報（保持） |
     | `estimatedSteps` | ─ | files.length で代替可能 |
     | ─ | `category` | **新規追加必須** |
     | ─ | `customizations` | **新規追加必須** |
     | ─ | `files[]` | **新規追加必須** |
     | ─ | `reasoning` | **新規追加必須** |

4. **影響範囲調査**
   - 型変更の影響を受けるファイル:
     - `packages/shared/src/types/skillCreator.ts`（型定義の追加・変更）
     - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（plan() 戻り値変更）
     - `apps/desktop/src/main/services/runtime/planPromptConstants.ts`（LLM レスポンススキーマ拡張）
     - `apps/desktop/src/preload/skill-creator-api.ts`（IPC 戻り値型変更）
     - `apps/desktop/src/preload/types.ts`（Preload 型定義の同期）
     - 既存テストファイル
   - P23（API二重定義の型管理複雑性）、P32（型定義の二箇所同時更新必須）に注意

5. **後方互換性要件**
   - `RuntimeSkillCreatorPlanResponse` union 型への影響を確認する
   - Renderer 側が `RuntimeSkillCreatorPlanResult` のフィールドを直接参照している箇所を特定する
   - terminal_handoff 経路への影響がないことを確認する

6. **w3a（SkillFileWriter）との型契約確認**
   - 現行 SkillFileWriter.persist() の入力型: `SkillGeneratedContent`
   - 正本 index.md の SkillFileWriter.create() の入力型: `(skillName, blueprint: SkillBlueprint, contents: Map<string, string>)`
   - SkillBlueprint が plan → execute → persist のパイプラインでどう流れるかを確定する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/index.md`（正本: SkillBlueprint 型定義 L297-311）
- `packages/shared/src/types/skillCreator.ts`（現行型定義）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（plan() 実装）
- `apps/desktop/src/main/services/runtime/planPromptConstants.ts`（LLM プロンプト定数）
- `docs/30-workflows/unassigned-task/UT-SC-03-004.md`（指示書）
- `.claude/rules/06-known-pitfalls.md`（P23, P32, P42, P44, P45）

## 成果物

- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/outputs/phase-01-requirements-output.md`（要件定義書）

## 完了条件

- [ ] RuntimeSkillCreatorPlanResult の全フィールドとその用途を文書化した
- [ ] SkillBlueprint 型の全フィールドと正本定義を文書化した
- [ ] 両型のフィールドマッピング（直接対応/変換必要/新規追加）を確定した
- [ ] 影響範囲（変更が必要な全ファイル）を特定した
- [ ] 後方互換性要件（RuntimeSkillCreatorPlanResponse / Renderer 参照箇所）を確認した
- [ ] w3a SkillFileWriter との型契約を確定した
- [ ] triggers / anchors フィールドの扱い（SkillBlueprint に含めるか、別途保持するか）を決定した
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携（Phase 1〜11は必須）

本Phaseは要件定義フェーズであり、プロダクションコードの変更は行わない。

| 判定項目               | 基準 | 結果                  |
| ---------------------- | ---- | --------------------- |
| ユニットテストLine     | 80%+ | N/A（コード変更なし） |
| ユニットテストBranch   | 60%+ | N/A（コード変更なし） |
| ユニットテストFunction | 80%+ | N/A（コード変更なし） |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                               | 仕様参照先                                   |
| ------------------ | ------------------------------------------------------ | -------------------------------------------- |
| セキュリティ       | 非適用（型変更のみ、IPC 入力バリデーションは既存維持） | -                                            |
| アーキテクチャ     | **適用**: 型設計・レイヤー間契約                       | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | 非適用（型変更のみ）                                   | -                                            |
| UI/UX              | 非適用                                                 | -                                            |
| データ整合性       | **適用**: 型定義の二箇所同時更新（P32）                | `.claude/rules/06-known-pitfalls.md`         |
| パフォーマンス     | 非適用                                                 | -                                            |
| アクセシビリティ   | 非適用                                                 | -                                            |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 現行 RuntimeSkillCreatorPlanResult 調査
3. 正本 SkillBlueprint 型要件抽出
4. 型ギャップ分析
5. 影響範囲調査
6. 後方互換性要件確認
7. w3a 型契約確認
8. 要件定義ドキュメント作成
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 2: 設計
