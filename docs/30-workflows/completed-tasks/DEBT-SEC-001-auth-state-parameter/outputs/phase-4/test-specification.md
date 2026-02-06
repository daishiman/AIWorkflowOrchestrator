# Phase 4: テスト仕様書

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 4                                 |
| 機能名 | DEBT-SEC-001-auth-state-parameter |
| 作成日 | 2026-02-06                        |
| 状態   | 完了                              |

## テストケース一覧

| テストID | シナリオ                     | 入力                                          | 期待結果                         | 対応FR |
| -------- | ---------------------------- | --------------------------------------------- | -------------------------------- | ------ |
| ST-01    | State生成のユニーク性        | generate('google')を2回連続実行               | 2つの異なるstate文字列が返される | FR-01  |
| ST-02    | 正しいstateの検証成功        | generate→validate（同じstate, provider）      | trueが返される                   | FR-03  |
| ST-03    | 不正なstateの検証失敗        | validate('nonexistent_state', 'google')       | falseが返される                  | FR-04  |
| ST-04    | プロバイダー不一致の検証失敗 | generate('google')→validate(state, 'github')  | falseが返される                  | FR-07  |
| ST-05    | 期限切れstateの検証失敗      | generate後、10分経過→validate                 | falseが返される                  | FR-05  |
| ST-06    | ワンタイムユース             | generate→validate（成功）→validate（同state） | 2回目はfalseが返される           | FR-06  |
| ST-07    | クリーンアップ               | generate→10分経過→cleanup                     | 期限切れエントリが削除される     | NFR-05 |

## テストファイル

- パス: `apps/desktop/src/main/infrastructure/stateManager.test.ts`
- 7テストケース作成済み

## TDD Red状態確認

- [x] テストが失敗することを確認（stateManager.tsが未作成のためインポートエラー）
- テスト実行結果: `Test Files 1 failed (1)` - モジュール未発見エラー

## 完了確認

- [x] 受け入れ基準ごとにユニットテストがある（7テストケース）
- [x] すべてのテストが失敗状態（Red）
- [x] セキュリティテスト（ワンタイム、期限切れ、プロバイダー不一致）が含まれている
- [x] 時間依存テストにvi.useFakeTimers()を使用している
- [x] 境界値テストが含まれている
- [x] カバレッジ目標が設定されている（行カバレッジ80%以上）
- [x] 本Phase内の全タスクを100%実行完了
