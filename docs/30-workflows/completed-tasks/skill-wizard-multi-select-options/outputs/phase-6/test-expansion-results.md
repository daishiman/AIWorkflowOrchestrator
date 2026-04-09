# Phase 6 成果物: テスト拡充結果

## 確認日: 2026-04-09

## 追加テスト一覧

### ConversationRoundStep.test.tsx

| グループ                                 | テストID | 内容                                    |
| ---------------------------------------- | -------- | --------------------------------------- |
| フェイルパス: selectedOptions 境界ケース | FP-01    | 初期状態で「選択済み」バッジ非表示      |
| フェイルパス: selectedOptions 境界ケース | FP-06    | 「定期実行」再選択でscheduleConfig復元  |
| 回帰ガード: 単一選択ユースケース         | RG-01    | 1ボタン選択でselectedOptions 1要素      |
| 回帰ガード: 単一選択ユースケース         | RG-03    | freeText入力時selectedOptionsは空のまま |
| 回帰ガード: 単一選択ユースケース         | RG-05    | 複数選択後もページング遷移が正常動作    |
| アクセシビリティ                         | A11Y-03  | 複数選択後、両ボタンのaria-pressed=true |
| アクセシビリティ                         | A11Y-04  | 解除後aria-pressed=falseに戻る          |
| アクセシビリティ                         | A11Y-05  | 選択時「選択済み」バッジが表示される    |

## テスト実行結果

- ConversationRoundStep.test.tsx: **37 tests passed**
- ApplySummaryCard.test.tsx: **9 tests passed**
- 合計: **46 tests passed**
