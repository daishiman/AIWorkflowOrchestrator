# Phase 11: 手動テスト

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 11             |
| 機能名     | TASK-RALLY-004 |
| 前提Phase  | Phase 10       |
| 後続Phase  | Phase 12       |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                         | 実行形態 |
| ---------- | ---------------------------- | -------- |
| SubAgent-A | IDE での deprecated 警告確認 | **直列** |

## 手動テスト手順

### IDE 警告確認（VSCode）

1. VSCode で `apps/desktop/src/renderer/components/skill-creator/ConversationalInterview.tsx` を開く
2. `selectedValues` フィールドを参照している箇所にカーソルを合わせる
3. ホバー時に "deprecated" の取り消し線表示または警告メッセージが出ることを確認する

### 手動確認コマンド

```bash
# selectedValues を参照している箇所を確認
grep -rn "selectedValues" apps/ packages/ --include="*.ts" --include="*.tsx" | \
  grep -v "node_modules" | grep -v ".test." | grep -v "skillCreator.ts"
```

## 確認項目

| 項目 | 手順                                      | 期待結果                                     |
| ---- | ----------------------------------------- | -------------------------------------------- |
| MT-1 | VSCode で selectedValues 参照箇所をホバー | deprecated 警告（取り消し線）が表示される    |
| MT-2 | selectedOptionIds 参照箇所をホバー        | 警告なし（canonical であることが確認できる） |

## 完了条件

- [ ] MT-1 が確認済み（IDE での deprecated 警告表示）
- [ ] MT-2 が確認済み（selectedOptionIds に警告なし）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 12: ドキュメント
