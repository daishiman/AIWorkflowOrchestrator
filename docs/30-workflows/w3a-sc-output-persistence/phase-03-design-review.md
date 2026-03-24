# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 3                             |
| 機能名   | w3a-sc-output-persistence     |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |
| 更新日   | 2026-03-23                    |

## 目的

Phase 2 で作成した SkillFileWriter 設計の妥当性を多角的に検証する。特にファイル書き込みのアトミック性とパストラバーサル防止が正しく設計されているかを判定する。

## 実行タスク

1. **要件適合性チェック**
   - AC-2（.claude/skills/ 配下にファイル永続化）を設計が充足できるか確認する
   - FR-2 の機能要件と設計の対応を確認する
2. **アトミック性検証**
   - execute() 完了後の一括書き込みがアトミック性を保証できるか評価する
   - 途中失敗（例: SKILL.md 書き込み後に agents/ 書き込みで失敗）時のロールバック方式を評価する
   - 部分書き込みが `.claude/skills/` に残らないことを設計で保証できるか確認する
3. **パストラバーサル防止確認**
   - `validateSkillName()` が以下のパターンを全て拒否することを設計で確認する
     - `../malicious` （親ディレクトリ参照）
     - `/absolute/path`（絶対パス）
     - `a/b` （サブディレクトリ）
     - `  ` （トリム後空文字列: P42 対策）
   - `path.resolve()` + ベースパスのプレフィックス確認を設計に含めるよう評価する
4. **型安全性確認**
   - SkillGeneratedContent 型が execute() 内部の LLM 出力と整合するか確認する
   - P32（型定義の2箇所同時更新必須）を適用し、shared と desktop の両方で型が整合するか確認する
   - RuntimeSkillCreatorExecuteResult との責務分離（成功/失敗 vs コンテンツ）が明確か確認する
5. **DI 設計確認**
   - RuntimeSkillCreatorFacadeDeps への SkillFileWriter 追加が既存の DI パターンと整合するか確認する（P34 対策）
   - SkillFileWriter と SkillFileManager の責務重複がないか確認する
6. **セキュリティ確認**
   - ファイルパーミッション（600 等）の設定要否を評価する
   - 書き込み先が `.claude/skills/` の外に出ないことを設計で保証できるか確認する
7. 判定を記録し、MINOR 指摘は未タスク化する

## 参照資料

- `docs/30-workflows/w3a-sc-output-persistence/phase-02-design.md`（前 Phase 成果物）
- `.claude/rules/04-electron-security.md`（セキュリティ原則）
- `.claude/rules/06-known-pitfalls.md`（P32, P34, P42）

## 成果物

- `docs/30-workflows/w3a-sc-output-persistence/phase-03-review-output.md`（レビュー結果）
  - 判定: PASS / MINOR / MAJOR
  - 指摘事項リスト（MINOR は未タスク化必須）

## 完了条件

- [ ] AC-2 / FR-2 との適合性を確認した
- [ ] アトミック書き込みのロールバック方式を評価した
- [ ] パストラバーサル防止パターン（4種類以上）を設計で検証した
- [ ] SkillGeneratedContent 型と execute() 内部出力の整合を確認した（P32 対策）
- [ ] RuntimeSkillCreatorFacadeDeps への DI 方式が既存パターンと整合することを確認した
- [ ] SkillFileWriter と SkillFileManager の責務重複がないことを確認した
- [ ] 書き込み先が basePath の外に出ないことを設計で保証することを確認した
- [ ] 判定（PASS / MINOR / MAJOR）を記録した
- [ ] MINOR 指摘がある場合は未タスク化した
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携（Phase 1〜11は必須）

本Phaseは設計レビューフェーズであり、プロダクションコードの変更は行わない。統合テストの対象コード変更なし。Phase 4以降で検証する。

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
2. 要件適合性チェック
3. アトミック性検証
4. パストラバーサル防止確認
5. 型安全性確認
6. DI 設計確認
7. セキュリティ確認
8. 判定の記録・MINOR指摘の未タスク化
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

Phase 4: テスト作成
