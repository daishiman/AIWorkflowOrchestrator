# Phase 6: 拡充テストケース書

## タスクID: TASK-SW-FIX-FEEDBACK-001

## 追加テストケース一覧

| TC番号           | ファイル              | 内容                                                        | 結果  |
| ---------------- | --------------------- | ----------------------------------------------------------- | ----- |
| TC-FEEDBACK-009  | CompleteStep.test.tsx | skillPath="" は成功UIを表示（null のみガード対象）          | GREEN |
| TC-FEEDBACK-011  | CompleteStep.test.tsx | onRetry未定義でも skillPath=null でクラッシュしない         | GREEN |
| TC-FEEDBACK-011b | CompleteStep.test.tsx | skillPath=null エラーUI に data-testid="complete-step" あり | GREEN |
| TC-FEEDBACK-011c | CompleteStep.test.tsx | skillPath=null で onRetry クリックで呼ばれる                | GREEN |
| TC-FEEDBACK-013  | CompleteStep.test.tsx | 回帰: skillPath 正常値時の既存コンテンツ維持                | GREEN |
| TC-FEEDBACK-004b | CompleteStep.test.tsx | skillPath=null の場合アクションカードが非表示               | GREEN |

## 仕様確認事項

- `skillPath === ""` は null と区別する（空文字は実際に到達しない経路）
- `onRetry` は省略可能（undefined でもクラッシュしない）
- エラーUI でも `data-testid="complete-step"` は必ず付与する
