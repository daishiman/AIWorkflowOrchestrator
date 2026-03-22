# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 6                             |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |

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
4. **ロールバックテスト**
   - SKILL.md 書き込み後に agents/ 書き込みが失敗した場合、作成済みファイルが削除されることをテストする
5. **execute() の永続化パステスト**
   - execute() がストリーム完了後に persist() を呼び出すことをスパイでテストする
   - persist() が失敗した場合、execute() がエラーを返すことをテストする

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/04-phase-04-test-creation.md`
- `docs/30-workflows/skill-creator-llm-integration/04-phase-05-implementation.md`
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

## 次のPhase

Phase 7: カバレッジ確認
