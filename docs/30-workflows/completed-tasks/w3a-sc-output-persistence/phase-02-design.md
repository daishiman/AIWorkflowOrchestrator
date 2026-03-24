# Phase 2: 設計

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 2                             |
| 機能名   | w3a-sc-output-persistence     |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |
| 更新日   | 2026-03-23                    |

## 目的

SkillFileWriter クラスの詳細設計、SkillGeneratedContent 型定義、execute() からの呼び出しフロー（execute 完了後一括書き込み）、既存ファイル上書き防止設計を確定する。

## 実行タスク

1. **SkillFileWriter クラス設計**
   - クラス責務: `.claude/skills/{skillName}/` 配下にスキルファイルを書き込む
   - コンストラクタ: `basePath: string`（スキルのベースディレクトリ、デフォルト `.claude/skills/`）を受け取る
   - 既存 SkillFileManager との責務境界:
     - SkillFileManager: 既存スキルの読取・ファイルツリー取得・インポート・削除（読取系操作）
     - SkillFileWriter: LLM 生成コンテンツの新規書き込み（書込系操作）
   - `persist(skillName: string, content: SkillGeneratedContent, options?: { overwrite?: boolean }): Promise<{ skillPath: string; files: string[] }>` メソッドを設計する
   - 内部メソッド設計:
     - `validateSkillName(skillName: string): void`（パストラバーサル防止）
     - `checkExistingSkill(skillPath: string): Promise<void>`（上書き防止）
     - `writeFiles(skillPath: string, content: SkillGeneratedContent): Promise<string[]>`（アトミック書き込み）
2. **SkillGeneratedContent 型定義**

   ```typescript
   interface SkillGeneratedContent {
     skillMd: string;
     agents: Array<{ name: string; content: string }>;
     scripts: Array<{ name: string; content: string }>;
     references: Array<{ name: string; content: string }>;
   }
   ```

   - この型は RuntimeSkillCreatorExecuteResult（成功/失敗のみ）とは別の中間データ型
   - execute() 内部で LLM が生成したコンテンツをキャプチャし、persist() に渡すための構造体

3. **execute() からの呼び出しフロー設計**
   - execute() の処理完了後に一括書き込みを行う設計とする（RuntimeSkillCreatorFacade にはストリーミング処理がないため、非同期完了後の一括書き込みで十分）
   - execute() 内部フロー: LLM 呼び出し → コンテンツ取得 → SkillFileWriter.persist() → RuntimeSkillCreatorExecuteResult 返却
   - 書き込み失敗時は RuntimeSkillCreatorExecuteResult の error フィールドにエラーメッセージを設定して返す
4. **既存ファイル上書き防止設計**
   - 同名スキルが既に存在する場合は `{ code: "SKILL_ALREADY_EXISTS" }` エラーを返す
   - 上書きを許可するオプション（`overwrite?: boolean`）を設計する
5. **パストラバーサル防止設計**
   - skillName が `../` `./` `/` を含む場合は即座に拒否する
   - P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）を適用する
   - `path.resolve(basePath, skillName)` の結果が basePath のプレフィックスであることを検証する
6. **DI 設計**
   - RuntimeSkillCreatorFacade への SkillFileWriter 注入方法:
     - 方式 A: `RuntimeSkillCreatorFacadeDeps` に `skillFileWriter?: SkillFileWriter` を追加（推奨）
     - 方式 B: Setter Injection で後から注入（P34 対策: BrowserWindow 等の遅延依存が不要なため方式 A が適切）
7. 設計ドキュメントを作成する

## 参照資料

- `docs/30-workflows/w3a-sc-output-persistence/phase-01-requirements.md`（前 Phase 成果物）
- `.claude/rules/04-electron-security.md`（IPC セキュリティ原則 / パストラバーサル）
- `.claude/rules/06-known-pitfalls.md`（P34: DI パターン選択、P42: バリデーション）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（DI 構造: RuntimeSkillCreatorFacadeDeps）

## 成果物

- `docs/30-workflows/w3a-sc-output-persistence/phase-02-design-output.md`（設計書）
  - SkillFileWriter クラス図
  - SkillGeneratedContent 型定義（完全版）
  - execute() 呼び出しフロー図
  - パストラバーサル防止ロジック詳細
  - DI 配線設計

## 完了条件

- [ ] SkillFileWriter の全メソッドシグネチャを設計した
- [ ] SkillFileWriter と既存 SkillFileManager の責務境界を明確にした
- [ ] SkillGeneratedContent 型の全フィールドを定義した
- [ ] execute() からの呼び出しフロー（execute 完了後一括書き込み）を設計した
- [ ] 既存ファイル上書き防止ロジックを設計した
- [ ] パストラバーサル防止ロジック（P42 準拠3段バリデーション + path.resolve）を設計した
- [ ] アトミック書き込み（失敗時ロールバック）の方式を設計した
- [ ] RuntimeSkillCreatorFacadeDeps への DI 方式を決定した
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携（Phase 1〜11は必須）

本Phaseは設計フェーズであり、プロダクションコードの変更は行わない。統合テストの対象コード変更なし。Phase 4以降で検証する。

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
2. SkillFileWriter クラス設計
3. SkillGeneratedContent 型定義
4. execute() からの呼び出しフロー設計
5. 既存ファイル上書き防止設計
6. パストラバーサル防止設計
7. DI 設計
8. 設計ドキュメント作成
9. 統合テスト連携の実施
10. 成果物の作成・配置
11. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 3: 設計レビュー
