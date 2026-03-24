# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 8                             |
| 機能名   | w3a-sc-output-persistence     |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |
| 更新日   | 2026-03-23                    |

## 目的

Phase 5 で実装した SkillFileWriter のコード品質を改善する。ファイル書き込みロジックの共通化・マジックストリング排除・型安全性向上を行い、テストが全て Green を維持することを確認する。

## 実行タスク

1. **ファイル書き込みロジックの共通化**
   - SKILL.md / agents / scripts / references の書き込みコードに重複がある場合、共通の `writeFile(filePath: string, content: string): Promise<void>` ヘルパー関数に抽出する
   - ディレクトリ作成ロジックを `ensureDirectory(dirPath: string): Promise<void>` として抽出する
2. **マジックストリング排除**
   - サブディレクトリ名（`agents` / `scripts` / `references`）・ファイル名（`SKILL.md`）を定数に置き換える
   - `SKILL_FILE_CONSTANTS` オブジェクトまたは定数ファイルに集約する
3. **型安全性向上**
   - `SkillGeneratedContent` の各フィールドに対して `Array.isArray()` / `typeof` ガードを実施する
   - P19 対策: `as string` 等の unsafe キャストを除去する
4. **ロールバックロジックの明確化**
   - ロールバック対象ファイルリストを明確に管理する
   - ロールバック関数 `rollback(writtenFiles: string[]): Promise<void>` を独立関数として抽出する
5. リファクタリング後に全テストが Green であることを確認する

## 参照資料

- `apps/desktop/src/main/services/skill/SkillFileWriter.ts`（実装済み）
- `docs/30-workflows/w3a-sc-output-persistence/phase-07-coverage-output.md`（Phase 7 カバレッジ基準充足の記録）
- `.claude/rules/02-code-quality.md`（TypeScript 型安全ルール）
- `.claude/rules/06-known-pitfalls.md`（P19）

## 成果物

- `apps/desktop/src/main/services/skill/SkillFileWriter.ts`（リファクタリング済み）
- `apps/desktop/src/main/services/skill/skillFileConstants.ts`（定数ファイル、必要に応じて）

## 完了条件

- [ ] ファイル書き込みロジックが共通ヘルパー関数に抽出されている
- [ ] マジックストリング（サブディレクトリ名・ファイル名）が定数に置き換えられている
- [ ] unsafe キャストが除去されている
- [ ] ロールバック関数が独立した関数として抽出されている
- [ ] リファクタリング後も全テストが Green を維持している
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携（Phase 1〜11は必須）

リファクタリング後のテスト継続成功を確認する。

| 確認項目                                          | リファクタリング前 | リファクタリング後 | 判定 |
| ------------------------------------------------- | ------------------ | ------------------ | ---- |
| SkillFileWriter.test.ts 全 PASS                   | （記入）           | （記入）           | -    |
| RuntimeSkillCreatorFacade.execute.test.ts 全 PASS | （記入）           | （記入）           | -    |
| カバレッジが Phase 7 基準を維持                   | （記入）           | （記入）           | -    |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                     | 仕様参照先                                   |
| ------------------ | -------------------------------------------- | -------------------------------------------- |
| セキュリティ       | **適用**: パストラバーサル防止・書き込み制限 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | **適用**: SkillFileWriter の DI 設計         | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | **適用**: アトミック書き込み・ロールバック   | `aiworkflow-requirements: error-handling.md` |
| UI/UX              | 非適用（バックエンド変更のみ）               | -                                            |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 9: 品質検証
