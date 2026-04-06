# Phase 12 未タスク検出レポート

## 検出結果

- 未タスク件数: 5（全て LOW 優先度・次スプリント以降）

---

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスク   | TASK-UI-02 ConversationPanel 孤立解消 |
| 作成日   | 2026-04-06                            |
| フェーズ | Phase 12（ドキュメント更新）          |

---

## 検出観点と確認結果

| 観点                       | 確認方法                           | 結果                         |
| -------------------------- | ---------------------------------- | ---------------------------- |
| 廃止ファイルの git delete  | `git status` で M（変更）を確認    | stub 化のみ、delete 未実施   |
| TypeScript型定義の残存     | `preload/types.ts` grep            | `skillCreatorSession` 型残存 |
| Main側 dead code           | `SkillCreatorIpcBridge.ts` grep    | Session IPC dead code 残存   |
| 未実装 widget プロパティ   | `MultiSelectCheckbox.tsx` 確認     | `maxSelect` 未実装           |
| onError エラーコード非伝搬 | `ConversationalInterview.tsx` 確認 | 固定文字列のみ渡す           |

---

## 未タスク一覧

| #   | 内容                                                                         | 優先度 | 発見Phase | 移管推奨先                            |
| --- | ---------------------------------------------------------------------------- | ------ | --------- | ------------------------------------- |
| 1   | `MultiSelectCheckbox` の `maxSelect` プロパティ実装（W-MC-06）               | LOW    | Phase 6   | 新規タスク: TASK-UI-03 または別タスク |
| 2   | `ConversationalInterview` の `onError` にエラーコードを伝搬する（IPC-ER-03） | LOW    | Phase 6   | 新規タスク                            |
| 3   | `SkillCreatorIpcBridge.ts` の Session IPC dead code を削除                   | LOW    | Phase 8   | 新規タスク（リスク評価付き）          |
| 4   | `preload/types.ts` から `skillCreatorSession` 型定義を除去                   | LOW    | Phase 8   | #3 のタスクと同時実施推奨             |
| 5   | `skill-creator/` 廃止ファイル群を git delete（現在は `export {}` stub）      | LOW    | Phase 5   | #3/#4 のタスクと同時実施推奨          |

---

## `docs/30-workflows/unassigned-task/` への移動要否

本タスクの 5 件は全て LOW 優先度かつ機能的影響なしのため、現時点での `unassigned-task/` への移動は不要。
次スプリント計画時に上記一覧を参照してタスク起票すること。
