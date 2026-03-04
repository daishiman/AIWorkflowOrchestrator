# TASK-054 task-specification-creator 準拠マトリクス

## 対象

- .claude/skills/task-specification-creator/SKILL.md
- .claude/skills/task-specification-creator/references/create-workflow.md
- .claude/skills/task-specification-creator/references/quality-standards.md

## 準拠確認

| 要件                      | 反映内容                                                                  | 判定 |
| ------------------------- | ------------------------------------------------------------------------- | ---- |
| 13 Phase仕様書            | phase-1 から phase-13 を作成                                              | 適合 |
| index.md                  | workflow index を生成                                                     | 適合 |
| artifacts.json            | 初期化済み                                                                | 適合 |
| 必須セクション            | メタ情報/目的/実行タスク/参照資料/実行手順/成果物/完了条件/次Phase        | 適合 |
| 統合テスト連携            | Phase 1 から Phase 11 に記載                                              | 適合 |
| 多角的チェック観点        | 8観点（セキュリティ/UI/アーキテクチャ/API/データ/エラー/性能/a11y）を記載 | 適合 |
| Electron層別観点          | Renderer/Main/IPC/Preload/Storage を記載                                  | 適合 |
| Phase 3/10 レビューゲート | 判定基準を記載                                                            | 適合 |
| Phase 4/5/8 TDD検証       | TDD状態とコマンドを記載                                                   | 適合 |
| Phase 9 品質ゲート        | 品質チェック項目を記載                                                    | 適合 |
| Phase 12 Task 1-5         | 必須タスク詳細を記載                                                      | 適合 |
| PR作成注意                | ユーザー明示許可が必要と記載                                              | 適合 |
| SubAgent分割              | Atent Team分担を全Phaseに記載                                             | 適合 |

## 検証コマンド

- node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components
- node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components --output docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/verification-report.md
