# Phase 1: 要件定義

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 1                             |
| 機能名   | w3a-sc-output-persistence     |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |
| 更新日   | 2026-03-23                    |

## 目的

RuntimeSkillCreatorFacade.execute() の現行出力形式（RuntimeSkillCreatorExecuteResult）を調査し、SkillFileWriter の要件を定義する。LLM が生成したスキルコンテンツをファイルシステムに永続化するための配置先（.claude/skills/）と書き込み仕様を確定する。

## 実行タスク

1. **execute() 現行出力形式調査**
   - `RuntimeSkillCreatorFacade.ts` の execute() メソッドを読み込み、現行の戻り値型 `RuntimeSkillCreatorExecuteResult` を把握する
   - 現行の execute() は `{ executeId, skillName, success, error? }` を返し、LLM 生成コンテンツ（SKILL.md / agents / scripts / references）は戻り値に含まれない
   - SkillExecutor.execute() の内部フローを確認し、LLM 生成コンテンツの取得ポイントを特定する
2. **永続化先の確認**
   - `.claude/skills/` ディレクトリの既存構造を確認する
   - 既存スキルのディレクトリ構造を参照する（最小構造: SKILL.md / agents/ / scripts/ / references/、拡張構造: indexes/ / schemas/ / templates/ / assets/）
   - 新規スキルの配置先パスを定義する: `.claude/skills/{skillName}/`
   - 新規生成スキルの最小必須構造を決定する: SKILL.md（必須）+ agents/（任意）+ scripts/（任意）+ references/（任意）
3. **SkillFileWriter 要件定義**
   - `persist(skillName, content)` メソッドの入出力仕様を定義する
   - 既存 SkillFileManager との責務分離を明確化する
     - SkillFileManager: 既存スキルファイルの読取・ファイルツリー取得・インポート・削除
     - SkillFileWriter: LLM 生成コンテンツの新規書き込み専用
   - 既存ファイルの上書き防止要件を定義する（スキル名が既存と衝突する場合の動作）
   - アトミック書き込み要件を定義する（途中で失敗した場合のロールバック）
   - パストラバーサル防止要件を定義する（skillName に `../` が含まれる場合の拒否）
4. **SkillGeneratedContent 型要件定義**
   - execute() が内部で生成するスキルコンテンツの構造を新規型として定義する
   - RuntimeSkillCreatorExecuteResult（成功/失敗のみ）とは別の中間データ型として設計する
5. 要件定義ドキュメントを作成する

## 参照資料

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `packages/shared/src/types/skillCreator.ts`（RuntimeSkillCreatorExecuteResult / RuntimeSkillCreatorPlanResult 等）
- `.claude/skills/`（既存スキルのディレクトリ構造参照）
- `apps/desktop/src/main/services/skill/`（既存 SkillService / SkillFileManager 等の配置パターン参照）

## 成果物

- `docs/30-workflows/w3a-sc-output-persistence/phase-01-requirements-output.md`（要件定義書）

## 完了条件

- [ ] execute() の現行出力形式（RuntimeSkillCreatorExecuteResult の型・フィールド）を文書化した
- [ ] execute() が現在コンテンツを返さないことを確認し、コンテンツ取得ポイントを特定した
- [ ] 永続化先ディレクトリ構造（`.claude/skills/{skillName}/`）と最小必須構造を確認した
- [ ] SkillFileWriter.persist() の入出力仕様を定義した
- [ ] SkillFileWriter と既存 SkillFileManager の責務分離を定義した
- [ ] 既存ファイル上書き防止の要件（エラー返却 vs 上書き許可）を決定した
- [ ] アトミック書き込みの要件を定義した
- [ ] パストラバーサル防止の要件を定義した
- [ ] SkillGeneratedContent 型の全フィールドを定義した
- [ ] AC-2（.claude/skills/配下にファイル永続化）との対応を明記した
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携（Phase 1〜11は必須）

本Phaseは要件定義フェーズであり、プロダクションコードの変更は行わない。統合テストの対象コード変更なし。Phase 4以降で検証する。

| 判定項目               | 基準 | 結果                  |
| ---------------------- | ---- | --------------------- |
| ユニットテストLine     | 80%+ | N/A（コード変更なし） |
| ユニットテストBranch   | 60%+ | N/A（コード変更なし） |
| ユニットテストFunction | 80%+ | N/A（コード変更なし） |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                     | 仕様参照先                                   |
| ------------------ | -------------------------------------------- | -------------------------------------------- |
| セキュリティ       | **適用**: パストラバーサル防止・書き込み制限 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | **適用**: SkillFileWriter の DI 設計         | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | **適用**: アトミック書き込み・ロールバック   | `aiworkflow-requirements: error-handling.md` |
| UI/UX              | 非適用（バックエンド変更のみ）               | -                                            |
| データ整合性       | 非適用（DB操作なし）                         | -                                            |
| パフォーマンス     | 非適用                                       | -                                            |
| アクセシビリティ   | 非適用                                       | -                                            |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. execute() 現行出力形式調査
3. 永続化先の確認
4. SkillFileWriter 要件定義
5. SkillGeneratedContent 型要件定義
6. 要件定義ドキュメント作成
7. 統合テスト連携の実施
8. 成果物の作成・配置
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
