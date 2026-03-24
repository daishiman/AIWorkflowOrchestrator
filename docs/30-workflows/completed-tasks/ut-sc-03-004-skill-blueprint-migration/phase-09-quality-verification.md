# Phase 9: 品質検証

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 9                                      |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |
| 更新日   | 2026-03-24                             |

## 目的

Lint・型チェック・全テスト実行を行い、SkillBlueprint 型移行に関わるコードが品質基準を満たすことを確認する。P32 準拠の shared/preload 型整合チェックと、P42 準拠の 3 段バリデーション確認を重点的に実施する。

## 実行タスク

### Task 1: ESLint 実行

1. **desktop パッケージの Lint**

   ```bash
   pnpm --filter @repo/desktop lint
   ```

   - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` を含む全エラー・警告を解消する
   - 未使用 import が残っていないことを確認する

2. **shared パッケージの Lint**

   ```bash
   pnpm --filter @repo/shared lint
   ```

   - `packages/shared/src/types/skillCreator.ts` を含む全エラー・警告を解消する

### Task 2: TypeScript 型チェック実行

1. **shared パッケージの型チェック**

   ```bash
   pnpm --filter @repo/shared typecheck
   ```

   - `SkillBlueprint`, `SkillCategory`, `PlannedFile`, `CategoryTemplate`, `CATEGORY_TEMPLATES` の型定義が正しいことを確認する
   - `strict: true` 環境で全型エラーがゼロであることを確認する

2. **desktop パッケージの型チェック**

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

   - `RuntimeSkillCreatorFacade.ts` の新フィールド関連の型が正しく解決されることを確認する
   - `any` 型・`@ts-ignore` の使用がないことを確認する

### Task 3: 全テスト実行

1. **desktop パッケージの全テスト**

   ```bash
   cd apps/desktop && pnpm vitest run
   ```

   - `RuntimeSkillCreatorFacade.plan.test.ts` を含む全テストが PASS することを確認する
   - `RuntimeSkillCreatorFacade.test.ts` のスタブ経路テストが新フィールド追加後も PASS することを確認する

2. **shared パッケージのテスト**

   ```bash
   cd packages/shared && pnpm vitest run
   ```

   - `skillCreator.type.test.ts` が PASS することを確認する

### Task 4: P32 準拠確認 - shared 型と preload 型の整合チェック

1. **型の再エクスポート確認**
   - `packages/shared/src/types/skillCreator.ts` で定義された `SkillBlueprint`, `SkillCategory`, `PlannedFile`, `CategoryTemplate` が正しくエクスポートされているか確認する

   ```bash
   grep -n "SkillBlueprint\|SkillCategory\|PlannedFile\|CategoryTemplate\|CATEGORY_TEMPLATES" packages/shared/src/types/index.ts
   ```

2. **preload 型との整合確認**
   - `apps/desktop/src/preload/types.ts` で `RuntimeSkillCreatorPlanResult` が `@repo/shared` から正しくインポートされているか確認する
   - `RuntimeSkillCreatorPlanResult` の `extends SkillBlueprint` が preload 側でも正しく型解決されるか確認する

   ```bash
   grep -n "RuntimeSkillCreatorPlanResult\|SkillBlueprint" apps/desktop/src/preload/types.ts
   ```

3. **Renderer 側の型参照確認**
   - `RuntimeSkillCreatorPlanResult` を使用する Renderer 側コードで、新フィールド（`category`, `files`, `customizations`, `reasoning`）が型として認識されるか確認する

   ```bash
   grep -rn "RuntimeSkillCreatorPlanResult" apps/desktop/src/renderer/
   ```

### Task 5: P42 準拠確認 - 3 段バリデーション

1. **isValidPlannedFileEntry() のバリデーション確認**
   - `path` フィールド: `typeof === "string"` -> `=== ""` -> `.trim() === ""` の 3 段バリデーションが実装されていることを確認する
   - `purpose` フィールド: 同様の 3 段バリデーションが実装されていることを確認する

   ```bash
   grep -n "trim" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
   ```

2. **isValidPlanResponse() 内の新フィールドバリデーション確認**
   - `category` のバリデーションで `VALID_CATEGORIES.includes()` が使用されていることを確認する
   - `reasoning` のバリデーションで `typeof === "string"` チェックが使用されていることを確認する

### Task 6: LLM レスポンススキーマとバリデーションの一致確認

1. **PLAN_RESPONSE_SCHEMA_INSTRUCTION のスキーマ確認**
   - `planPromptConstants.ts` のスキーマに `category`, `customizations`, `files`, `reasoning` が記載されていることを確認する
   - スキーマの型指定（`"string"`, `"object"`, 配列等）が `isValidPlanResponse()` のバリデーションと一致していることを確認する

2. **フィールド名の一致確認**
   - LLM スキーマのフィールド名と `LLMPlanResponse` 型のフィールド名が完全一致していることを確認する
   - LLM スキーマのルールと `isValidPlanResponse()` のバリデーションルールが矛盾していないことを確認する

## 参照資料

- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/phase-08-refactoring.md`（Phase 8: リファクタリング）
- `packages/shared/src/types/skillCreator.ts`（型定義）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（実装コード）
- `apps/desktop/src/main/services/runtime/planPromptConstants.ts`（LLM プロンプト定数）
- `apps/desktop/src/preload/types.ts`（Preload 型定義）
- CLAUDE.md（フック制御用環境変数）
- `.claude/rules/02-code-quality.md`（コーディング規約）
- `.claude/rules/06-known-pitfalls.md`（P32: 型定義の二箇所同時更新、P42: .trim() 3 段バリデーション）

## 成果物

- 品質検証結果ログ（コンソール出力）
- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/outputs/phase-09-quality-output.md`（実行結果サマリー）

## 完了条件

- [ ] `pnpm --filter @repo/shared lint` がエラー 0 で完了した
- [ ] `pnpm --filter @repo/desktop lint` がエラー 0 で完了した
- [ ] `pnpm --filter @repo/shared typecheck` がエラー 0 で完了した
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 で完了した
- [ ] `cd apps/desktop && pnpm vitest run` が全テスト PASS で完了した
- [ ] `cd packages/shared && pnpm vitest run` が全テスト PASS で完了した
- [ ] P32 準拠: shared 型と preload 型の整合を確認した
- [ ] P42 準拠: `isValidPlannedFileEntry()` の 3 段バリデーションを確認した
- [ ] LLM スキーマと `isValidPlanResponse()` のバリデーションが一致していることを確認した
- [ ] 未使用 import が存在しない
- [ ] `any` 型・`@ts-ignore` の使用がない
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 統合テスト連携（Phase 1-11 は必須）

Phase 9 の品質ゲート結果を以下のテーブルで確認する。

| 品質ゲート                      | コマンド                                | 結果           | 判定 |
| ------------------------------- | --------------------------------------- | -------------- | ---- |
| ESLint (shared)                 | `pnpm --filter @repo/shared lint`       | （実行後記入） | -    |
| ESLint (desktop)                | `pnpm --filter @repo/desktop lint`      | （実行後記入） | -    |
| TypeScript 型チェック (shared)  | `pnpm --filter @repo/shared typecheck`  | （実行後記入） | -    |
| TypeScript 型チェック (desktop) | `pnpm --filter @repo/desktop typecheck` | （実行後記入） | -    |
| 全テスト (desktop)              | `cd apps/desktop && pnpm vitest run`    | （実行後記入） | -    |
| 全テスト (shared)               | `cd packages/shared && pnpm vitest run` | （実行後記入） | -    |
| P32 型整合                      | grep による手動確認                     | （実行後記入） | -    |
| P42 3 段バリデーション          | grep による手動確認                     | （実行後記入） | -    |
| LLM スキーマ一致                | 手動確認                                | （実行後記入） | -    |

## 多角的チェック観点（AI が判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                                           | 仕様参照先                           |
| ------------------ | ------------------------------------------------------------------ | ------------------------------------ |
| セキュリティ       | 非適用（品質検証のみ、機能変更なし）                               | -                                    |
| アーキテクチャ     | **適用**: shared -> preload -> renderer の型伝播が正しいことを確認 | `.claude/rules/01-architecture.md`   |
| エラーハンドリング | **適用**: バリデーション関数の品質確認                             | `.claude/rules/02-code-quality.md`   |
| UI/UX              | 非適用                                                             | -                                    |
| データ整合性       | **適用**: P32 shared/preload 型整合、P42 3 段バリデーション        | `.claude/rules/06-known-pitfalls.md` |
| パフォーマンス     | 非適用                                                             | -                                    |
| アクセシビリティ   | 非適用                                                             | -                                    |

## サブタスク管理

Phase 実行開始時に、TaskCreate ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. ESLint 実行（Task 1）
3. TypeScript 型チェック実行（Task 2）
4. 全テスト実行（Task 3）
5. P32 準拠確認（Task 4）
6. P42 準拠確認（Task 5）
7. LLM スキーマ一致確認（Task 6）
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次の Phase

Phase 10: 最終レビュー
