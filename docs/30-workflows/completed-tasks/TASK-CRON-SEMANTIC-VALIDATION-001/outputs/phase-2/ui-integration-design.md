# UI統合設計

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 2                                 |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 作成日   | 2026-04-12                        |

---

## UI影響範囲

### ScheduleDialog

- **ファイル**: `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleDialog.tsx`
- **変更の必要性**: なし
- **理由**: `validateCronExpression` の戻り値（`string | null`）を既存のエラー表示ロジックで処理しているため、新しいエラーメッセージ文字列をそのまま表示できる

### ConversationRoundStep

- **ファイル**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
- **変更の必要性**: なし
- **理由**: `validateSkillWizardScheduleConfig` 経由で `validateCronExpression` を参照しているため、同様に自動追従する

---

## エラー伝播フロー

```
validateCronExpression("0 9 31 2 *")
  → "指定した日付は存在しません（例: 2月31日）"（string）
    |
    v
ScheduleDialog の cronExpression エラー表示
  → テキストフィールド下部に日本語メッセージを表示（既存ロジック）

validateSkillWizardScheduleConfig({ cronExpression: "0 9 31 2 *", ... })
  → { cronExpression: "指定した日付は存在しません（例: 2月31日）" }
    |
    v
ConversationRoundStep の cronExpression エラー表示
  → 既存のバリデーション結果表示ロジックで表示（既存ロジック）
```

---

## AC-5 対応確認

AC-5「UIにエラーメッセージが表示される」は UI コンポーネントを変更せずに達成できる。
これは `validateCronExpression` の戻り値が `string | null` のままであり、
既存の UI 消費コードがこの戻り値を文字列として扱っているためである。
