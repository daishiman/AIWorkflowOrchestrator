# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 7                                      |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |
| 更新日   | 2026-03-24                             |

## 目的

Phase 5 実装・Phase 6 テスト拡充後のカバレッジを計測し、SkillBlueprint 関連の型定義・バリデーション・Graceful degradation パスが基準を充足していることを確認する。未達の場合は Phase 6 へ戻りテストを追加する。

## 実行タスク

### Task 1: カバレッジ計測実行

1. **RuntimeSkillCreatorFacade のカバレッジ計測**

   ```bash
   # P40 準拠: apps/desktop ディレクトリから実行すること
   cd apps/desktop && pnpm vitest run --coverage src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts
   ```

   - `RuntimeSkillCreatorFacade.ts` の対象関数: `parsePlanResponse()`, `isValidPlanResponse()`, `generateFilesFromAgentsAndScripts()`, `isValidPlannedFileEntry()`, `plan()`
   - Line Coverage、Branch Coverage、Function Coverage の値を記録する

2. **shared パッケージのカバレッジ計測**

   ```bash
   cd packages/shared && pnpm vitest run --coverage src/types/__tests__/skillCreator.type.test.ts
   ```

   - `CATEGORY_TEMPLATES` 定数の参照テストのカバレッジを確認する

### Task 2: 基準確認

以下の基準を充足しているか判定する:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### Task 3: 分岐網羅確認

1. **isValidPlanResponse() の新フィールドバリデーション分岐**
   - `category` が有効値（5種類）の場合に `true` を返すパスが通過しているか
   - `category` が無効文字列の場合に `false` を返すパスが通過しているか
   - `category` が存在するが `string` でない場合に `false` を返すパスが通過しているか
   - `category` が存在しない場合にスキップするパスが通過しているか
   - `customizations` が存在するが `object` でない場合に `false` を返すパスが通過しているか
   - `files` が存在するが `Array` でない場合に `false` を返すパスが通過しているか
   - `files` 内の不正エントリで `false` を返すパスが通過しているか
   - `reasoning` が存在するが `string` でない場合に `false` を返すパスが通過しているか

2. **parsePlanResponse() の Graceful degradation 分岐**
   - `category` 未返却時に `"standard"` デフォルト値が適用されるパスが通過しているか
   - `customizations` 未返却時に `{}` デフォルト値が適用されるパスが通過しているか
   - `files` 未返却時に `generateFilesFromAgentsAndScripts()` が呼ばれるパスが通過しているか
   - `reasoning` 未返却時に `""` デフォルト値が適用されるパスが通過しているか

3. **generateFilesFromAgentsAndScripts() のロジック**
   - agents=0 件、scripts=0 件の空配列パスが通過しているか
   - agents のみ、scripts のみ、両方存在の各パスが通過しているか

4. **isValidPlannedFileEntry() のバリデーション分岐**
   - `path` が空文字列、トリム空文字列の場合に `false` を返すパスが通過しているか（P42 準拠）
   - `purpose` が空文字列、トリム空文字列の場合に `false` を返すパスが通過しているか（P42 準拠）

### Task 4: v8 カバレッジプロバイダの注意点（P41 対策）

- インライン arrow function（特に `isValidPlannedFileEntry` がコールバックとして使用される箇所）がカウントされているか確認する
- カバレッジが低い場合は、コールバック関数の明示的な呼び出しテストを追加する

### Task 5: 未達時の対処

- 未達分岐を特定し、Phase 6 へ戻りテストを追加する
- 追加後に再計測し、基準充足を確認する

## 参照資料

- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/phase-06-test-coverage.md`（Phase 6: テスト拡充）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（実装コード: isValidPlanResponse, parsePlanResponse, generateFilesFromAgentsAndScripts, isValidPlannedFileEntry）
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`（テストコード）
- `packages/shared/src/types/skillCreator.ts`（型定義 + CATEGORY_TEMPLATES 定数）
- `packages/shared/src/types/__tests__/skillCreator.type.test.ts`（shared テストコード）
- `.claude/rules/02-code-quality.md`（カバレッジ基準）
- `.claude/rules/06-known-pitfalls.md`（P41: v8 カバレッジプロバイダのインライン関数カウント、P42: .trim() 3段バリデーション）

## 成果物

- カバレッジレポート（コンソール出力）
- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/outputs/phase-07-coverage-output.md`（基準充足の記録）

## 完了条件

- [ ] `RuntimeSkillCreatorFacade.ts` の Line Coverage >= 80% を達成した
- [ ] `RuntimeSkillCreatorFacade.ts` の Branch Coverage >= 60% を達成した
- [ ] `RuntimeSkillCreatorFacade.ts` の Function Coverage >= 80% を達成した
- [ ] `isValidPlanResponse()` の新フィールドバリデーション全分岐が網羅されている
- [ ] `parsePlanResponse()` の Graceful degradation 全分岐が網羅されている
- [ ] `generateFilesFromAgentsAndScripts()` の全パスが網羅されている
- [ ] `isValidPlannedFileEntry()` の P42 準拠バリデーション全分岐が網羅されている
- [ ] P41 対策: インライン arrow function のカウント漏れがないことを確認した
- [ ] 未達の場合は Phase 6 へ戻りテストを追加した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 統合テスト連携（Phase 1-11 は必須）

Phase 7 で計測したカバレッジ結果と結合テスト結果を以下のテーブルで確認する。

### カバレッジ基準テーブル

| 指標              | 最低基準 | 推奨基準 | 実測値         | 判定 |
| ----------------- | -------- | -------- | -------------- | ---- |
| Line Coverage     | 80%      | 90%      | （計測後記入） | -    |
| Branch Coverage   | 60%      | 70%      | （計測後記入） | -    |
| Function Coverage | 80%      | 90%      | （計測後記入） | -    |

### 結合テスト結果テーブル

| テスト対象                                     | テスト数 | PASS | FAIL | 備考           |
| ---------------------------------------------- | -------- | ---- | ---- | -------------- |
| RuntimeSkillCreatorFacade.plan.test.ts         | -        | -    | -    | （計測後記入） |
| RuntimeSkillCreatorFacade.test.ts              | -        | -    | -    | （計測後記入） |
| skillCreator.type.test.ts（shared パッケージ） | -        | -    | -    | （計測後記入） |

## 多角的チェック観点（AI が判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                                                     | 仕様参照先                           |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------------------ |
| セキュリティ       | 非適用（カバレッジ計測のみ）                                                 | -                                    |
| アーキテクチャ     | 非適用（カバレッジ計測のみ）                                                 | -                                    |
| エラーハンドリング | **適用**: Graceful degradation 全分岐のカバレッジ確認                        | Phase 2 設計書 Task 5                |
| UI/UX              | 非適用                                                                       | -                                    |
| データ整合性       | **適用**: isValidPlannedFileEntry の P42 準拠 .trim() バリデーション網羅確認 | `.claude/rules/06-known-pitfalls.md` |
| パフォーマンス     | 非適用                                                                       | -                                    |
| アクセシビリティ   | 非適用                                                                       | -                                    |

## サブタスク管理

Phase 実行開始時に、TaskCreate ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. カバレッジ計測実行（Task 1）
3. 基準確認（Task 2）
4. 分岐網羅確認（Task 3）
5. P41 対策確認（Task 4）
6. 未達時の対処（Task 5、該当する場合のみ）
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## テスト実行コマンド

```bash
# P40 準拠: apps/desktop ディレクトリから実行すること

# カバレッジ計測（RuntimeSkillCreatorFacade）
cd apps/desktop && pnpm vitest run --coverage src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts

# カバレッジ計測（shared パッケージ）
cd packages/shared && pnpm vitest run --coverage src/types/__tests__/skillCreator.type.test.ts

# 全テスト（関連ファイル全体）
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/
```

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次の Phase

Phase 8: リファクタリング
