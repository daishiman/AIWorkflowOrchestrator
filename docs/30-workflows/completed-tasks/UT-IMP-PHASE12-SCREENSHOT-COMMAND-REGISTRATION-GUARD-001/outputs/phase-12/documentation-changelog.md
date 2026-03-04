# Phase 12 ドキュメント更新履歴

| 日時 (JST)       | 対象ファイル                                    | 変更内容                                              | 検証値                  |
| ---------------- | ----------------------------------------------- | ----------------------------------------------------- | ----------------------- |
| 2026-03-04 21:18 | `apps/desktop/package.json`                     | screenshot scripts 追加                               | run一覧で検出           |
| 2026-03-04 21:18 | workflow02 `phase-11/manual-test-result.md`     | 実行コマンドを run記法へ更新                          | 新表記確認              |
| 2026-03-04 21:18 | workflow02 `phase-12/spec-update-summary.md`    | 実行コマンドを run記法へ更新                          | 新表記確認              |
| 2026-03-04 21:19 | workflow02 `phase-11/screenshots/*`             | screenshot再取得                                      | TC-01..04 更新          |
| 2026-03-04 21:22 | workflow02 `outputs/verification-report.md`     | verify結果再生成                                      | PASS（13/13）           |
| 2026-03-04 21:24 | `task-workflow.md`                              | 完了追補を追加                                        | change log追記          |
| 2026-03-04 21:25 | `lessons-learned.md`                            | 教訓追補を追加                                        | change log追記          |
| 2026-03-04 21:25 | `indexes/topic-map.md`, `indexes/keywords.json` | aiworkflow index再生成                                | script成功              |
| 2026-03-04 22:10 | workflow02 `phase-11/screenshots/*`             | screenshot再取得（Port 5174競合時フォールバック含む） | TC-01..04 更新          |
| 2026-03-04 22:11 | UT workflow `outputs/phase-11/screenshots/*`    | 監査用証跡を正規配置し手動テスト証跡表を更新          | coverage validator PASS |
