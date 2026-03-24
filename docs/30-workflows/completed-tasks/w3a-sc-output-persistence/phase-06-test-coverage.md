# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 6                             |
| 機能名   | w3a-sc-output-persistence     |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |
| 更新日   | 2026-03-23                    |

## 目的

Phase 4 で作成したテストのカバレッジ不足箇所（ディスク容量不足・不正ファイル名・パストラバーサル防止）に対してテストを追加し、SkillFileWriter の全メソッドと execute() の永続化パスを網羅する。

## 実行タスク

1. **パストラバーサル防止テスト（Phase 4 スケルトンの拡充）**
   - `../malicious` でエラーが返ることをテストする
   - `/absolute/path` でエラーが返ることをテストする
   - `a/b`（サブディレクトリ）でエラーが返ることをテストする
   - `  `（空白のみ）でエラーが返ることをテストする（P42 対策）
   - `./relative` でエラーが返ることをテストする
2. **ディスク容量不足時のエラーハンドリングテスト**
   - Node.js の `fs.writeFile` を `vi.spyOn()` でモック化し、ENOSPC エラーをスローさせる
   - `persist()` が `Result.err()` を返し、ロールバック処理が実行されることをテストする
3. **不正ファイル名テスト**
   - 不正なエージェント名（空文字列、スペースのみ）でエラーが返ることをテストする
   - 不正なスクリプト名（`.js` 等の拡張子なし）が設計要件に沿っているかを確認するテストを追加する
   - `validateFileName()` のパストラバーサルパターンテスト: `../secret.md` でエラーが返ることをテストする
   - `validateFileName()` のパストラバーサルパターンテスト: `/absolute/file.md` でエラーが返ることをテストする
4. **ロールバックテスト**
   - SKILL.md 書き込み後に agents/ 書き込みが失敗した場合、作成済みファイルが削除されることをテストする
5. **execute() の永続化パステスト**
   - execute() がストリーム完了後に persist() を呼び出すことをスパイでテストする
   - persist() が失敗した場合、execute() がエラーを返すことをテストする

## 参照資料

- `docs/30-workflows/w3a-sc-output-persistence/phase-04-test-creation.md`
- `docs/30-workflows/w3a-sc-output-persistence/phase-05-implementation.md`
- `apps/desktop/src/main/services/skill/__tests__/SkillFileWriter.test.ts`（既存テスト）

## 成果物

- `apps/desktop/src/main/services/skill/__tests__/SkillFileWriter.test.ts`（拡充）
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.execute.test.ts`（persist() 統合テスト、必要に応じて）

## 完了条件

- [ ] パストラバーサル防止テストが5パターン以上追加されている
- [ ] ディスク容量不足（ENOSPC）時のロールバックテストが追加されている
- [ ] 不正ファイル名のバリデーションテストが追加されている
- [ ] ロールバック動作（部分ファイル削除）のテストが追加されている
- [ ] execute() の persist() 呼び出しテストが追加されている
- [ ] 全テストが Green 状態である
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携（Phase 1〜11は必須）

Phase 6 で追加したテストが、以下の統合テスト観点を網羅していることを確認する。

| 観点                              | テスト内容                                                  | 期待結果                          |
| --------------------------------- | ----------------------------------------------------------- | --------------------------------- |
| パストラバーサル防止（5パターン） | `../malicious`, `/absolute/path`, `a/b`, `  `, `./relative` | 全て `Result.err()` を返す        |
| ロールバック                      | SKILL.md 成功 → agents/ 失敗 → 全ファイル削除               | 部分ファイルが残存しない          |
| execute() → persist() 呼び出し    | ストリーム完了後に persist() が1回呼ばれる                  | スパイで呼び出しを確認            |
| ENOSPC エラー                     | `fs.writeFile` が ENOSPC をスロー                           | `Result.err()` + ロールバック実行 |

### カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

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

Phase 7: カバレッジ確認
