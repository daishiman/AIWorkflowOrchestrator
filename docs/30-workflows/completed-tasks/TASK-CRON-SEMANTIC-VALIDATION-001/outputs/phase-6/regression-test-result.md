# 回帰テスト結果

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 6                                 |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 実行日   | 2026-04-12                        |

---

## 回帰テスト結果サマリ

**55 passed / 55（回帰なし）**

---

## 既存テスト（SCV-01〜12）回帰確認

| テスト                                   | 結果     |
| ---------------------------------------- | -------- |
| SCV-01: 5フィールドの有効なcron式はnull  | ✅ Green |
| SCV-02: 空文字はエラーメッセージを返す   | ✅ Green |
| SCV-03: 4フィールドはエラー              | ✅ Green |
| SCV-04: 6フィールドはエラー              | ✅ Green |
| SCV-10: 前後の空白はtrimして判定         | ✅ Green |
| SCV-11: semantic validation なし（月次） | ✅ Green |
| ワイルドカードのみは有効                 | ✅ Green |
| 複雑なステップ値も構文的に有効           | ✅ Green |

SCV-11 のテスト名（`"semantic validationは行わない"`）は機能的に変わったが、
`"0 9 1 * *"` 自体は依然として正常通過するため Green のまま。

補足: SCV-11 の文言は Phase 12 で `weekday 指定時は意味論チェックをスキップする` に更新済み。

---

## UIコンポーネントのエラー表示テスト

ScheduleDialog / ConversationRoundStep の UI テストは `@testing-library/react` の設定確認が必要なため、
**Phase 11（手動テスト）で確認する**。

確認事項:

- `validateCronExpression("0 9 31 2 *")` → `"指定した日付は存在しません（例: 2月31日）"` が UI に表示される
- `validateCronExpression("0 9 * * *")` → エラーメッセージが表示されない
