# Phase 5: 実装

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 5                             |
| 機能名   | w3a-sc-output-persistence     |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |
| 更新日   | 2026-03-23                    |

## 目的

Phase 2 設計・Phase 4 テストに基づき、SkillFileWriter を新規作成し、SkillGeneratedContent 型を追加し、RuntimeSkillCreatorFacade.execute() を改修してファイル永続化フローを統合する。

## 実行タスク

1. **SkillGeneratedContent 型定義**
   - `packages/shared/src/types/skillCreator.ts` に以下を追加する:

   ```typescript
   interface SkillGeneratedContent {
     skillMd: string;
     agents: Array<{ name: string; content: string }>;
     scripts: Array<{ name: string; content: string }>;
     references: Array<{ name: string; content: string }>;
   }
   ```

   - P32 判定: Preload 層ではこの型を直接使用しない（Main Process 内で完結）ため、`apps/desktop/src/preload/types.ts` への追加は不要（設計レビュー Phase 3 確認済み）

2. **SkillFileWriter 新規作成**
   - `apps/desktop/src/main/services/skill/SkillFileWriter.ts` を作成する
   - `validateSkillName()`: P42 準拠3段バリデーション + パストラバーサル防止（`path.resolve()` でサニタイズ後 basePath プレフィックス確認）
   - `checkExistingSkill()`: 同名スキルが存在する場合はエラー返却
   - `writeFiles()`: SKILL.md → agents/ → scripts/ → references/ の順でファイルを書き込む（途中失敗時は方式 A: ファイル逆順削除 + 空ディレクトリ除去でロールバック）
   - `persist()`: validateSkillName → checkExistingSkill → mkdirSync → writeFiles の順で実行する
3. **RuntimeSkillCreatorFacade.execute() 改修**
   - 3a. SkillExecutor.execute() の戻り値（SkillExecutionResponse）を調査し、LLM 生成コンテンツの取得方法を確認する
   - 3b. SkillExecutionResponse → SkillGeneratedContent へのマッピングロジックを実装する（Phase 1 output 1.5 節参照）
     - SkillExecutor が構造化データを返す場合: フィールド直接マッピング
     - SkillExecutor がテキストのみ返す場合: パース処理を追加
   - 3c. execute() の完了後に SkillFileWriter.persist() を呼び出す処理を追加する
   - 3d. execute() 完了前の部分書き込みを防止する（一括書き込み方式を維持する）
   - 3e. 書き込みエラーは RuntimeSkillCreatorExecuteResult の error フィールドにエラーメッセージを設定して返す
4. **DI 配線**
   - SkillFileWriter を RuntimeSkillCreatorFacadeDeps に追加して DI する（`skillFileWriter?: SkillFileWriter`）
   - 既存のファクトリを更新する

## 参照資料

- `docs/30-workflows/w3a-sc-output-persistence/phase-02-design-output.md`（設計書 - クラス設計・DI配線・ロールバック方式A の詳細）
- `docs/30-workflows/w3a-sc-output-persistence/phase-04-test-creation.md`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `packages/shared/src/types/skillCreator.ts`
- `.claude/rules/06-known-pitfalls.md`（P32, P34, P42）

## 成果物

- `apps/desktop/src/main/services/skill/SkillFileWriter.ts`（新規作成）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（execute() 改修）
- `packages/shared/src/types/skillCreator.ts`（SkillGeneratedContent 型追加）

## 完了条件

- [ ] SkillGeneratedContent 型が shared と desktop の両方で利用可能である（P32 対策）
- [ ] SkillFileWriter.persist() が実装されている
- [ ] validateSkillName() が P42 準拠3段バリデーション + パストラバーサル防止を実装している
- [ ] 既存ファイル上書きガードが実装されている
- [ ] ロールバック処理（途中失敗時の部分ファイル削除）が実装されている
- [ ] RuntimeSkillCreatorFacade.execute() が SkillFileWriter を呼び出している
- [ ] Phase 4 で作成した全テストが Green になっている
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携（Phase 1〜11は必須）

本Phaseは実装フェーズであり、プロダクションコードを新規作成・改修する。Phase 4 で作成したテストが全て Green になることを確認し、カバレッジを計測する。

| 判定項目               | 基準 | 結果       |
| ---------------------- | ---- | ---------- |
| ユニットテストLine     | 80%+ | {{RESULT}} |
| ユニットテストBranch   | 60%+ | {{RESULT}} |
| ユニットテストFunction | 80%+ | {{RESULT}} |

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
2. SkillGeneratedContent 型定義
3. SkillFileWriter 新規作成
4. RuntimeSkillCreatorFacade.execute() 改修
5. DI 配線
6. 統合テスト連携の実施（カバレッジ計測）
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 6: テスト拡充
