# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 8                                      |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |
| 更新日   | 2026-03-24                             |

## 目的

Phase 5 で実装した SkillBlueprint 型の追加・parsePlanResponse() の拡張・plan() 戻り値構築のコード品質を改善する。バリデーション関数の抽出・定数配置の適正化・型安全性向上を行い、全テストが Green を維持することを確認する。

## 実行タスク

### Task 1: 新規追加型のエクスポート整理

1. **バレルエクスポートの確認**
   - `packages/shared/src/types/index.ts` から以下がエクスポートされていることを確認する:
     - `SkillBlueprint`
     - `SkillCategory`
     - `PlannedFile`
     - `CategoryTemplate`
     - `CATEGORY_TEMPLATES`
   - エクスポート順序をアルファベット順に整理する
   - 不要な型の再エクスポートが発生していないことを確認する

### Task 2: isValidPlanResponse() 内のバリデーション関数抽出検討

1. **isValidCategory() の抽出**
   - `category` バリデーションロジックを独立関数 `isValidCategory(value: unknown): value is SkillCategory` として抽出する
   - `VALID_CATEGORIES` 定数をモジュールスコープに移動する（`CATEGORY_TEMPLATES` の `Object.keys()` から動的生成を検討する）
   - P49 準拠: `in` 演算子による実行時プロパティ検証を使用し、`as` キャストを使用しない

2. **isValidCustomizations() の抽出検討**
   - `customizations` オブジェクトのバリデーションが複雑な場合、`isValidCustomizations(value: unknown): boolean` として抽出する
   - `additionalDirectories`、`additionalFiles`、`excludedDefaults` の各サブフィールドのバリデーションが含まれる場合に抽出する
   - シンプルな場合（`typeof === "object"` チェックのみ）はインラインに留める

3. **isValidPlannedFileEntry() の配置確認**
   - `isValidPlannedFileEntry()` が `isValidPlanResponse()` と同じスコープに配置されていることを確認する
   - P49 準拠: `entry != null && typeof entry === "object" && "path" in entry` パターンで `as` キャストを使用していないことを確認する

### Task 3: generateFilesFromAgentsAndScripts() の配置適正化

1. **配置場所の判断**
   - `generateFilesFromAgentsAndScripts()` が `parsePlanResponse()` からのみ呼ばれる場合: 同ファイル内のモジュールスコープに配置（現状維持）
   - 他のメソッド（`execute()` 等）からも呼ばれる可能性がある場合: 別ファイル（`planUtils.ts` 等）への分離を検討する
   - 判断結果を記録する

2. **関数のドキュメント整備**
   - JSDoc コメントに `@param` と `@returns` を追加する
   - Graceful degradation 用途であることを明記する

### Task 4: CATEGORY_TEMPLATES 定数の配置検討

1. **現行配置の評価**
   - `packages/shared/src/types/skillCreator.ts` に型と同居している場合:
     - 型定義ファイルに実行時定数（`const`）が含まれることの是非を評価する
     - ファイルサイズが 500 行を超える場合は分離を検討する（構造検証スクリプトの警告基準）
   - **分離する場合**: `packages/shared/src/types/skillCreatorConstants.ts` に移動し、バレルエクスポートを更新する
   - **同居させる場合**: 型定義セクションと定数セクションを明確にコメントで区切る

### Task 5: 不要な型アサーション（as）の除去

1. **`as` キャスト検索**
   - `grep -n " as " apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` で全箇所を列挙する
   - `grep -n " as " packages/shared/src/types/skillCreator.ts` で全箇所を列挙する
   - Phase 5 で追加された `as` キャストがある場合は、P19 準拠で実行時検証に置換する

2. **P49 準拠確認**
   - type predicate 内で `as Record<string, unknown>` や `as any` が使用されていないことを確認する
   - `in` 演算子 + `typeof` による実行時検証に統一されていることを確認する

### Task 6: non-null assertion の確認（P52 対策）

1. **`!` 演算子検索**
   - `grep -n '!' apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts | grep -v '//'` で non-null assertion の残存を確認する
   - Phase 5 で追加された箇所に non-null assertion がある場合は、optional chaining (`?.`) + デフォルト値に置換する

### Task 7: リファクタリング後の全テスト PASS 確認

1. **全テスト実行**

   ```bash
   cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/
   ```

2. **カバレッジが Phase 7 基準を維持していることを確認**

   ```bash
   cd apps/desktop && pnpm vitest run --coverage src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts
   ```

## 参照資料

- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/outputs/phase-07-coverage-output.md`（Phase 7 カバレッジ記録）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（実装コード）
- `packages/shared/src/types/skillCreator.ts`（型定義）
- `.claude/rules/02-code-quality.md`（TypeScript 型安全ルール）
- `.claude/rules/06-known-pitfalls.md`（P19: 型キャストバイパス、P49: type predicate 内の as キャスト、P52: non-null assertion 残存）

## 成果物

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（リファクタリング済み）
- `packages/shared/src/types/skillCreator.ts`（リファクタリング済み、必要に応じて）
- `packages/shared/src/types/skillCreatorConstants.ts`（定数分離した場合のみ）

## 完了条件

- [ ] 新規追加型のバレルエクスポートが整理されている
- [ ] `isValidCategory()` バリデーション関数の抽出を検討し、判断結果を記録した
- [ ] `isValidPlannedFileEntry()` が P49 準拠であることを確認した
- [ ] `generateFilesFromAgentsAndScripts()` の配置が適正であることを確認した
- [ ] `CATEGORY_TEMPLATES` の配置が適正であることを確認した
- [ ] Phase 5 で追加された `as` キャストが全て除去されている（P19 準拠）
- [ ] P49 準拠: type predicate 内で `as` キャストが使用されていないことを確認した
- [ ] P52 対策: non-null assertion の残存がないことを確認した
- [ ] リファクタリング後も全テストが Green を維持している
- [ ] カバレッジが Phase 7 基準を維持している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 統合テスト連携（Phase 1-11 は必須）

リファクタリング後のテスト継続成功を確認する。

| 確認項目                                                  | リファクタリング前 | リファクタリング後 | 判定 |
| --------------------------------------------------------- | ------------------ | ------------------ | ---- |
| RuntimeSkillCreatorFacade.plan.test.ts 全 PASS            | （記入）           | （記入）           | -    |
| RuntimeSkillCreatorFacade.test.ts 全 PASS                 | （記入）           | （記入）           | -    |
| skillCreator.type.test.ts 全 PASS                         | （記入）           | （記入）           | -    |
| カバレッジが Phase 7 基準（Line 80%+, Branch 60%+）を維持 | （記入）           | （記入）           | -    |

## 多角的チェック観点（AI が判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                                  | 仕様参照先                           |
| ------------------ | --------------------------------------------------------- | ------------------------------------ |
| セキュリティ       | 非適用（リファクタリングのみ、機能変更なし）              | -                                    |
| アーキテクチャ     | **適用**: バリデーション関数の SRP 分離、定数配置の適正化 | `.claude/rules/01-architecture.md`   |
| エラーハンドリング | **適用**: バリデーション関数抽出時のエラーパス維持確認    | `.claude/rules/02-code-quality.md`   |
| UI/UX              | 非適用                                                    | -                                    |
| データ整合性       | **適用**: P19/P49/P52 準拠の型安全性確認                  | `.claude/rules/06-known-pitfalls.md` |
| パフォーマンス     | 非適用                                                    | -                                    |
| アクセシビリティ   | 非適用                                                    | -                                    |

## サブタスク管理

Phase 実行開始時に、TaskCreate ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. エクスポート整理（Task 1）
3. バリデーション関数抽出検討（Task 2）
4. generateFilesFromAgentsAndScripts 配置適正化（Task 3）
5. CATEGORY_TEMPLATES 配置検討（Task 4）
6. 型アサーション除去（Task 5）
7. non-null assertion 確認（Task 6）
8. 全テスト PASS 確認（Task 7）
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次の Phase

Phase 9: 品質検証
