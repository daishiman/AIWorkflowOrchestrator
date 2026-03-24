# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 10                                     |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |
| 更新日   | 2026-03-24                             |

## 目的

多角的な品質・整合性検証を行い、plan() の出力型 RuntimeSkillCreatorPlanResult が SkillBlueprint 互換に正しく移行されていることを確認する。正本（index.md）との整合性、後方互換性、Pitfall 準拠、テスト品質、コード品質、設計品質の 6 観点でレビューし、PASS / MINOR / MAJOR / CRITICAL の判定を行う。

## 実行タスク

### Task 1: 正本整合性の検証

1. **SkillBlueprint 定義の検証**
   - `packages/shared/src/types/skillCreator.ts` の `SkillBlueprint` インターフェースが正本 index.md の定義と完全一致していることを確認する
   - フィールド名、型、JSDoc コメントの一致を検証する

2. **SkillCategory の値セット検証**
   - `SkillCategory` の 5 値（`simple`, `standard`, `complex`, `automation`, `integration`）が正本 index.md L268-273 と一致していることを確認する

3. **CATEGORY_TEMPLATES の構造検証**
   - 各カテゴリのテンプレートディレクトリ構成が正本と一致していることを確認する
   - `simple` が空配列、`integration` が最大構成であることを確認する

4. **RuntimeSkillCreatorPlanResult の継承構造検証**
   - `extends SkillBlueprint` で正しく継承され、`skillName` と `description` が SkillBlueprint から継承されていることを確認する
   - `planId`, `skillSpec`, `estimatedSteps`, `agents`, `scripts`, `triggers`, `anchors` が RuntimeSkillCreatorPlanResult 固有フィールドとして定義されていることを確認する

### Task 2: 後方互換性の検証

1. **既存フィールドの保持確認**
   - `RuntimeSkillCreatorPlanResult` の既存フィールド（`planId`, `skillSpec`, `estimatedSteps`, `skillName`, `description`, `agents`, `scripts`, `triggers`, `anchors`）が全て保持されていることを確認する
   - 既存フィールドの型が変更されていないことを確認する

2. **RuntimeSkillCreatorPlanResponse（IPC 型）への影響確認**
   - `RuntimeSkillCreatorPlanResponse` 型が変更されていないことを確認する
   - Preload 側の型定義に影響がないことを確認する

3. **Renderer 側の既存コードへの影響確認**
   - `RuntimeSkillCreatorPlanResult` を使用する Renderer 側コードが破壊されていないことを確認する

   ```bash
   grep -rn "RuntimeSkillCreatorPlanResult\|\.planId\|\.skillSpec\|\.estimatedSteps\|\.agents\|\.scripts\|\.triggers\|\.anchors" apps/desktop/src/renderer/
   ```

4. **LLM レスポンスの後方互換確認**
   - 新フィールド（`category`, `customizations`, `files`, `reasoning`）を返却しない旧 LLM レスポンスが Graceful degradation により正常に処理されることをテストで確認する

### Task 3: Pitfall 準拠の検証

1. **P23 準拠: API 二重定義の型管理**
   - `SkillBlueprint` 関連型が `packages/shared` で一元管理され、二重定義が存在しないことを確認する

   ```bash
   grep -rn "interface SkillBlueprint" apps/ packages/
   ```

2. **P32 準拠: 型定義の二箇所同時更新**
   - `packages/shared/src/types/skillCreator.ts` と `apps/desktop/src/preload/types.ts` で型が整合していることを確認する
   - `RuntimeSkillCreatorPlanResult` の `extends SkillBlueprint` が両方で正しく解決されることを確認する

3. **P42 準拠: 3 段バリデーション**
   - `isValidPlannedFileEntry()` の `path` と `purpose` に `.trim() === ""` チェックが含まれていることを確認する

   ```bash
   grep -A5 "isValidPlannedFileEntry" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts | grep "trim"
   ```

4. **P44/P45 準拠: IPC インターフェース整合**
   - IPC ハンドラの引数型と Preload 側の呼び出し形式が一致していることを確認する
   - 引数名のセマンティクスが実際の値と一致していることを確認する

5. **P49 準拠: type predicate 内の as キャスト**
   - `isValidPlanResponse()`, `isValidPlannedFileEntry()`, `isValidCategory()` 内で `as` キャストが使用されていないことを確認する

   ```bash
   grep -n " as " apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
   ```

6. **P60 準拠: IPC レスポンス形式の一致**
   - テストのアサーションが実際の IPC レスポンス形式（`{ success: boolean, data?: T, error?: { code, message } }`）と一致していることを確認する

### Task 4: テスト品質の検証

1. **全テスト PASS 確認**

   ```bash
   cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/
   cd packages/shared && pnpm vitest run
   ```

2. **カバレッジ基準充足確認**
   - Phase 7 のカバレッジ記録を参照し、基準を充足していることを確認する
   - Line Coverage >= 80%
   - Branch Coverage >= 60%
   - Function Coverage >= 80%

3. **テストケースの網羅性確認**
   - 正常系テスト（全新フィールド指定）が存在することを確認する
   - Graceful degradation テスト（新フィールド一部/全部欠落）が存在することを確認する
   - バリデーション失敗テスト（不正値）が存在することを確認する
   - `CATEGORY_TEMPLATES` の全 5 カテゴリに対するテストが存在することを確認する

### Task 5: コード品質の検証

1. **any 型の不使用確認**

   ```bash
   grep -n ": any\|as any\|<any>" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts packages/shared/src/types/skillCreator.ts
   ```

2. **@ts-ignore / @ts-expect-error の不使用確認**

   ```bash
   grep -n "@ts-ignore\|@ts-expect-error" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts packages/shared/src/types/skillCreator.ts
   ```

3. **不要インポートの不使用確認**
   - ESLint の no-unused-imports ルールで確認済みであることを Phase 9 結果から参照する

4. **non-null assertion の不使用確認（P52 対策）**

   ```bash
   grep -n '!\.' apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
   ```

### Task 6: 設計品質の検証

1. **SRP（単一責務原則）の検証**
   - `SkillBlueprint` が「スキルの構造情報」のみを表現し、ビジネスロジックを含まないことを確認する
   - `CATEGORY_TEMPLATES` が「カテゴリごとのベース構造」のみを定義し、ファイル生成ロジックを含まないことを確認する

2. **DIP（依存性逆転原則）の検証**
   - `SkillBlueprint` がインターフェース型として定義され、具象実装に依存していないことを確認する
   - `parsePlanResponse()` が `SkillBlueprint` インターフェースのみに依存し、具象型に依存していないことを確認する

3. **後方互換設計の検証**
   - `estimatedSteps` に `@deprecated` JSDoc が付与されていることを確認する
   - `agents` と `scripts` が「後方互換のため別途保持」と JSDoc に記載されていることを確認する

### Task 7: 判定と MINOR 指摘の未タスク化

1. **判定の記録**
   - PASS / MINOR / MAJOR / CRITICAL のいずれかを判定する
   - 判定理由を明記する

2. **MINOR 指摘がある場合**
   - 未タスク仕様書に変換する（省略不可）
   - `docs/30-workflows/unassigned-task/` に指示書を作成する
   - `task-workflow.md` 残課題テーブルに登録する
   - 関連仕様書に参照リンクを追加する

## 判定基準

| 判定     | 条件                                                  | 対応                                           |
| -------- | ----------------------------------------------------- | ---------------------------------------------- |
| PASS     | 全検証項目合格                                        | Phase 11 へ                                    |
| MINOR    | 機能には影響しないが改善推奨の指摘がある              | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 後方互換性、型安全性、バリデーション網羅に問題がある  | 影響範囲に応じて Phase 1-5 へ戻る              |
| CRITICAL | SkillBlueprint 定義が正本と乖離、既存機能が破壊される | Phase 1 へ戻り要件再確認                       |

## 参照資料

- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/outputs/phase-09-quality-output.md`（Phase 9 品質検証結果）
- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/outputs/phase-07-coverage-output.md`（Phase 7 カバレッジ記録）
- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/phase-03-design-review.md`（Phase 3 設計レビュー）
- `packages/shared/src/types/skillCreator.ts`（型定義）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（実装コード）
- `apps/desktop/src/main/services/runtime/planPromptConstants.ts`（LLM プロンプト定数）
- `apps/desktop/src/preload/types.ts`（Preload 型定義）
- `.claude/rules/06-known-pitfalls.md`（P23, P32, P42, P44, P45, P49, P52, P60）

## 成果物

- `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/outputs/phase-10-review-output.md`（最終レビュー結果）
  - 判定: PASS / MINOR / MAJOR / CRITICAL
  - 正本整合性確認結果
  - 後方互換性確認結果
  - Pitfall 準拠確認結果
  - 指摘事項リスト（MINOR は未タスク化必須）

## 完了条件

- [ ] 正本（index.md）との SkillBlueprint 定義の完全一致を確認した
- [ ] SkillCategory の 5 値が正本と一致していることを確認した
- [ ] CATEGORY_TEMPLATES の構造が正本と一致していることを確認した
- [ ] RuntimeSkillCreatorPlanResult の `extends SkillBlueprint` 継承構造を確認した
- [ ] 既存フィールドが全て保持され、型が変更されていないことを確認した
- [ ] RuntimeSkillCreatorPlanResponse（IPC 型）に影響がないことを確認した
- [ ] 旧 LLM レスポンスが Graceful degradation により正常処理されることを確認した
- [ ] P23 準拠: SkillBlueprint 関連型の二重定義がないことを確認した
- [ ] P32 準拠: shared/preload 型の整合を確認した
- [ ] P42 準拠: isValidPlannedFileEntry の 3 段バリデーションを確認した
- [ ] P44/P45 準拠: IPC インターフェースの整合を確認した
- [ ] P49 準拠: type predicate 内の `as` キャスト不使用を確認した
- [ ] P60 準拠: テストアサーションと IPC レスポンス形式の一致を確認した
- [ ] 全テスト PASS、カバレッジ基準充足を確認した
- [ ] `any` 型、`@ts-ignore`、不要インポートがないことを確認した
- [ ] non-null assertion の残存がないことを確認した（P52 対策）
- [ ] SRP・DIP の設計品質を確認した
- [ ] 判定（PASS / MINOR / MAJOR / CRITICAL）を記録した
- [ ] MINOR 指摘がある場合は未タスク化した（省略不可）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 統合テスト連携（Phase 1-11 は必須）

最終レビューとして、全テスト結果・カバレッジ・整合性確認を行う。

| 確認項目                                      | 結果     | 判定 |
| --------------------------------------------- | -------- | ---- |
| 全テスト PASS (desktop)                       | （記入） | -    |
| 全テスト PASS (shared)                        | （記入） | -    |
| Line Coverage >= 80%                          | （記入） | -    |
| Branch Coverage >= 60%                        | （記入） | -    |
| Function Coverage >= 80%                      | （記入） | -    |
| 正本との SkillBlueprint 定義一致              | （記入） | -    |
| 後方互換性（既存フィールド保持）              | （記入） | -    |
| Graceful degradation（旧 LLM レスポンス対応） | （記入） | -    |
| P32 shared/preload 型整合                     | （記入） | -    |
| P42 3 段バリデーション                        | （記入） | -    |
| P49 type predicate 内 as 不使用               | （記入） | -    |

## 多角的チェック観点（AI が判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                                                             | 仕様参照先                              |
| ------------------ | ------------------------------------------------------------------------------------ | --------------------------------------- |
| セキュリティ       | **適用**: バリデーション関数がインジェクション攻撃に対する防御となっていることを確認 | `.claude/rules/04-electron-security.md` |
| アーキテクチャ     | **適用**: extends 継承構造、shared -> preload -> renderer の型伝播                   | `.claude/rules/01-architecture.md`      |
| エラーハンドリング | **適用**: Graceful degradation 全パスの動作確認                                      | Phase 2 設計書 Task 5                   |
| UI/UX              | 非適用（バックエンド型変更のみ）                                                     | -                                       |
| データ整合性       | **適用**: P23/P32/P42/P44/P45/P49/P52/P60 全準拠確認                                 | `.claude/rules/06-known-pitfalls.md`    |
| パフォーマンス     | 非適用                                                                               | -                                       |
| アクセシビリティ   | 非適用                                                                               | -                                       |

## サブタスク管理

Phase 実行開始時に、TaskCreate ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 正本整合性の検証（Task 1）
3. 後方互換性の検証（Task 2）
4. Pitfall 準拠の検証（Task 3）
5. テスト品質の検証（Task 4）
6. コード品質の検証（Task 5）
7. 設計品質の検証（Task 6）
8. 判定と MINOR 指摘の未タスク化（Task 7）
9. 成果物の作成・配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次の Phase

Phase 11: 手動テスト
