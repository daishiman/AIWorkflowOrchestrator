# Phase 11: 手動テスト検証 — console → electron-log 移行

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 11                                  |
| タスクID | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| 機能名   | console → electron-log 移行         |
| 作成日   | 2026-02-14                          |

## 目的

自動テストでは検証しにくい、実際のアプリケーション動作でのログ出力を手動で確認する。

## 実行タスク

### Task 1: アプリケーション起動確認

1. `pnpm --filter @repo/desktop dev` でアプリを起動
2. 起動時にエラーが発生しないことを確認
3. electron-log のログファイルが生成されることを確認

#### ログファイルの確認場所

- macOS: `~/Library/Logs/{app-name}/main.log`
- Windows: `%USERPROFILE%\AppData\Roaming\{app-name}\logs\main.log`

### Task 2: スキル関連操作のログ確認

| 操作                           | 期待されるログ出力                          | ログレベル |
| ------------------------------ | ------------------------------------------- | ---------- |
| スキルスキャン実行             | `[SkillScanner]` プレフィックスのログ       | info/warn  |
| 存在しないスキルパスのスキャン | `[SkillScanner]` エラーログ                 | error      |
| スキルインポート               | `[SkillImportManager]` プレフィックスのログ | debug/info |
| 権限設定の変更                 | `[PermissionStore]` プレフィックスのログ    | info       |
| 権限設定のクリア               | `[PermissionStore]` 警告ログ                | warn       |

### Task 3: console 出力の残留確認

1. DevTools のコンソールを開く
2. スキル関連操作を実行
3. **console.error / console.warn / console.log がスキル関連サービスから出力されていないことを確認**

### Task 4: ログレベル制御の確認

electron-log のトランスポート設定を変更して、ログレベル制御が機能することを確認:

- `log.transports.file.level = "error"` に設定した場合、warn/info/debug がファイルに出力されないこと
- デフォルト設定（info）で、debug レベルのログがファイルに出力されないこと

## 参照資料

| 資料                  | パス                     |
| --------------------- | ------------------------ |
| Phase 10 最終レビュー | phase-10-final-review.md |

## 統合テスト連携【必須】

| 統合ポイント   | 内容                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| 対象モジュール | SkillScanner / PermissionStore / SkillImportManager / SkillAnalyzer                                      |
| テスト連携     | `apps/desktop/src/main/services/skill/__tests__/` のユニット・統合テストで移行結果を検証                 |
| 未解決項目     | `SkillExecutor.ts` の console 4箇所は未タスク `TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION` で追跡 |

## 成果物

| 成果物                 | パス                                   |
| ---------------------- | -------------------------------------- |
| 手動テスト結果レポート | outputs/phase-11/manual-test-report.md |

## 完了条件

- [ ] アプリケーションが正常に起動する
- [ ] electron-log のログファイルが生成される
- [ ] スキル関連操作のログが正しいレベルで出力される
- [ ] DevTools コンソールにスキル関連の console 出力がない
- [ ] 手動テスト結果レポートを作成した

## 次Phase

→ Phase 12: ドキュメント更新
