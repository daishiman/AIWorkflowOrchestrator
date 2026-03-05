# Phase 4 検証コマンド表

## 1. 実行順（SubAgent-TEST-CMD）

| 順序 | コマンド                                                                                                    | 対応TC             | 期待値           |
| ---- | ----------------------------------------------------------------------------------------------------------- | ------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------- |
| 1    | `rg -n "^### Task 1:                                                                                        | ^### Task 2:       | ^### Task 3:     | ^### Task 4:                                                                                                               | ^### Task 5:   | ^### Task 5B:                                                                                                          | ^### Task 5C:                                                                                                                                                                                                                                       | ^### Task 5D:                 | ^### Task 6:" docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-050-ui-00-ui-design-foundation.md` | TC-AUD-001〜009 | task-050 の監査単位行が取得できる |
| 2    | `rg -n "Apple                                                                                               | theme              | token            | micro                                                                                                                      | WCAG           | ARIA                                                                                                                   | テスト" docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md`                                                                                                                                                  | TC-AUD-102                    | Atoms反映証跡が取得できる                                                                                              |
| 3    | `rg -n "SearchBar                                                                                           | SlideInPanel       | ConfirmDialog    | WCAG                                                                                                                       | ARIA           | responsive" docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-053-ui-00-3-molecules-components.md` | TC-AUD-103                                                                                                                                                                                                                                          | Molecules反映証跡が取得できる |
| 4    | `rg -n "CardGrid                                                                                            | MasterDetailLayout | SearchFilterList | WCAG                                                                                                                       | レスポンシブ   | テスト" docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-054-ui-00-4-organisms-components.md`     | TC-AUD-104                                                                                                                                                                                                                                          | Organisms反映証跡が取得できる |
| 5    | `rg -n "UX言語                                                                                              | エラー             | オフライン       | WCAG                                                                                                                       | ARIA           | theme                                                                                                                  | responsive" docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-05[789]\* docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md` | TC-AUD-201〜203               | 画面仕様の反映証跡が取得できる                                                                                         |
| 6    | `test -f docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-1-design-tokens.md && echo OK` | TC-AUD-101         | ファイル実在確認 |
| 7    | `rg -n "`path:line`                                                                                         | 反映済み           | 要追記           | 対象外" docs/30-workflows/completed-tasks/task-055-ui-00-foundation-reflection-audit/outputs/phase-5/reflection-matrix.md` | TC-AUD-302/303 | 記法・語彙の統一確認                                                                                                   |

## 2. 目視確認項目

1. `00-1-design-tokens.md` の「正本」導線が自己循環していないか。
2. 5D語彙変換（ダッシュボード→ホーム等）が複数仕様で整合しているか。
3. error/offlineの仕様が最低1箇所以上で具体化されているか。
4. a11y（WCAG/ARIA/keyboard）が完了条件に記載されているか。

## 3. 実行ログ記録規約

- `command_log` 列に実行コマンドをそのまま記録。
- 取得時刻はJSTで記録。
- 出力行番号は `path:line` に正規化。

## 4. Task 100% 実行確認

- [x] 検証コマンドを実行順で定義
- [x] ケースIDへコマンドを紐付け
- [x] 目視確認項目を定義
