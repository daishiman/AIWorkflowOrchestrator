# Phase 8: リファクタリング — console → electron-log 移行

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 8                                   |
| タスクID | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| 機能名   | console → electron-log 移行         |
| 作成日   | 2026-02-14                          |

## 目的

TDD の Refactor フェーズとして、移行済みコードの品質を改善する。重複やパターンの不統一を整理する。

## 実行タスク

### Task 1: ログメッセージフォーマットの統一

全ファイルで以下の統一フォーマットを確認:

```
log.{level}("[ClassName] メッセージ", ...追加データ);
```

確認ポイント:

- プレフィックスが `[ClassName]` 形式で統一されているか
- エラーオブジェクトの渡し方が統一されているか（`error` を最後の引数に）
- メッセージが英語で統一されているか

### Task 2: SkillImportManager.ts の debug プロパティ整理

`log.debug` への移行により、`debug` プロパティの条件分岐が不要になった場合:

- `debug` プロパティの削除を検討
- コンストラクタ引数の `debug` オプション削除を検討
- テストの `debug` 関連アサーションの更新

**注意**: `debug` プロパティが外部から参照されている場合は削除しない（破壊的変更を避ける）。

### Task 3: logWarning メソッドの整理（SkillScanner.ts）

`logWarning` メソッドが `console.warn` をラップしていた場合:

- `log.warn` を直接使用するように簡素化できるか確認
- メソッド自体が不要になる場合は削除を検討

### Task 4: import 文の整理

- 未使用の import がないことを確認
- import 順序が ESLint ルールに従っていることを確認

## 参照資料

| 資料               | パス                      |
| ------------------ | ------------------------- |
| Phase 5 実装       | phase-5-implementation.md |
| Phase 7 カバレッジ | phase-7-coverage-check.md |

## 統合テスト連携【必須】

| 統合ポイント   | 内容                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| 対象モジュール | SkillScanner / PermissionStore / SkillImportManager / SkillAnalyzer                                      |
| テスト連携     | `apps/desktop/src/main/services/skill/__tests__/` のユニット・統合テストで移行結果を検証                 |
| 未解決項目     | `SkillExecutor.ts` の console 4箇所は未タスク `TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION` で追跡 |

## 成果物

| 成果物                           | パス                                       | 種別   |
| -------------------------------- | ------------------------------------------ | ------ |
| リファクタリング済みソースコード | apps/desktop/src/main/services/skill/\*.ts | コード |

## 完了条件

- [ ] ログメッセージフォーマットが統一されている
- [ ] debugプロパティの整理を完了（または不要と判断した理由を記録）
- [ ] logWarningメソッドの整理を完了（または不要と判断した理由を記録）
- [ ] 未使用importがない
- [ ] 全テストが PASS

## 次Phase

→ Phase 9: 品質保証
