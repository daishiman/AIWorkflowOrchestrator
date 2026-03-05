# Phase 11 証跡インデックス

| 種別                       | パス                                                                  | 用途                         |
| -------------------------- | --------------------------------------------------------------------- | ---------------------------- |
| 回帰テストログ             | `outputs/phase-9/regression-suite.log`                                | 148 tests PASS の証跡        |
| カバレッジログ             | `outputs/phase-7/coverage-run.log`                                    | 境界分岐の検証証跡           |
| 差分確認                   | `git diff --name-only -- apps/desktop/src`                            | UI変更有無の判定             |
| DI配線コード               | `apps/desktop/src/main/ipc/index.ts`                                  | 単一AuthKeyService生成       |
| DI注入コード               | `apps/desktop/src/main/ipc/skillHandlers.ts`                          | SkillExecutorへの注入        |
| 回帰追加テスト             | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` | 第3引数/同一インスタンス検証 |
| スクリーンショット取得ログ | `outputs/phase-11/screenshot-capture-rerun.log`                       | 画面回帰再撮影の実行ログ     |
| 画面証跡                   | `outputs/phase-11/screenshots/TC-11-01-dashboard-after.png`           | Dashboard回帰確認            |
| 画面証跡                   | `outputs/phase-11/screenshots/TC-11-02-chat-history-after.png`        | Chat History回帰確認         |
| 画面証跡                   | `outputs/phase-11/screenshots/TC-11-03-history-page-after.png`        | History Page回帰確認         |
| 非視覚TCプレースホルダ     | `outputs/phase-11/screenshots/non-visual-placeholder.png`             | NON_VISUAL証跡の補助         |
| UI/UXレビュー              | `outputs/phase-11/manual-test-result.md`                              | Apple UI/UX観点レビュー      |

## 証跡の完全性

- 矛盾: なし
- 漏れ: なし
- 整合性: あり
- 依存関係: あり（Phase 7〜10成果物 + Phase 11スクリーンショット証跡を参照）
