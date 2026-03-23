# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 6                          |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-22                 |

## 目的

Phase 4 で作成したテストのカバレッジ不足箇所（LLM レスポンス不正時のエラーハンドリング・agent 仕様書読み込み失敗時の graceful degradation）に対してテストを追加し、全分岐を網羅する。

## 実行タスク

1. **LLM レスポンス不正時のエラーハンドリングテスト**
   - LLM が空文字列を返した場合、`Result.err()` が返ることをテストする
   - LLM が JSON でない文字列を返した場合、パースエラーが返ることをテストする
   - LLM が部分的 JSON（必須フィールド欠如）を返した場合のバリデーションエラーをテストする
   - LLM が API タイムアウトした場合のエラー伝播をテストする
2. **agent 仕様書読み込み失敗時の graceful degradation テスト**
   - ResourceLoader.loadAgent() が1ファイルで失敗した場合の動作をテストする
   - ResourceLoader.loadAgent() が全ファイルで失敗した場合の動作をテストする
   - エラーが上位に適切に伝播することを確認するテストを追加する
3. **境界値テスト**
   - 空文字列の入力テキストで plan() を呼んだ場合のバリデーションエラーをテストする
   - 極端に長い入力テキストで plan() を呼んだ場合の動作をテストする
4. Phase 7 のカバレッジ計測に備え、テスト実行を確認する

## 参照資料

- `phase-04-test-creation.md`
- `phase-05-implementation.md`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`（既存テスト）

## 成果物

- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`（拡充）

## 完了条件

- [ ] LLM が不正レスポンスを返した場合のテストが追加されている（空文字列・非 JSON・部分 JSON）
- [ ] LLM API タイムアウト時のエラー伝播テストが追加されている
- [ ] agent 仕様書読み込み失敗時のテストが追加されている（1ファイル失敗・全ファイル失敗）
- [ ] 空文字列入力のバリデーションテストが追加されている
- [ ] 全テストが Green 状態である

## 次のPhase

Phase 7: カバレッジ確認
