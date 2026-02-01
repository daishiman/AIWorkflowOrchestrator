# テストケース一覧

## ChatPanel.test.tsx

| #   | テストケース                                   | カテゴリ     | AC    |
| --- | ---------------------------------------------- | ------------ | ----- |
| 1   | SkillSelectorがヘッダー内にレンダリングされる  | レンダリング | AC-1  |
| 2   | PermissionDialogが常時マウントされている       | レンダリング | AC-7  |
| 3   | 基本構造が正しい                               | レンダリング | -     |
| 4   | isExecuting && selectedSkillName truthy → 表示 | 表示制御     | AC-3  |
| 5   | isExecuting false → 非表示                     | 表示制御     | AC-12 |
| 6   | selectedSkillName null → 非表示                | 表示制御     | -     |
| 7   | マウント時fetchSkills呼出                      | 初期化       | -     |
| 8   | エラー状態ハンドリング                         | エッジケース | AC-11 |
| 9   | 初期状態検証                                   | エッジケース | -     |
| 10  | toolbar role属性                               | a11y         | AC-13 |
| 11  | aria-label属性                                 | a11y         | AC-13 |
| 12  | refハンドラimport request                      | 統合         | AC-8  |
| 13  | コールバック動作                               | 統合         | AC-8  |
| 14  | ダイアログ状態管理                             | 統合         | AC-8  |
| 15  | ダイアログ閉じ                                 | 統合         | AC-8  |

## SkillStreamingView.test.tsx

| #     | テストケース                             | カテゴリ       | AC      |
| ----- | ---------------------------------------- | -------------- | ------- |
| 1     | running → 青バッジ "実行中..."           | StatusBadge    | AC-3    |
| 2     | permission_pending → 黄バッジ "権限確認" | StatusBadge    | AC-7    |
| 3     | completed → 緑バッジ "完了"              | StatusBadge    | AC-3    |
| 4     | cancelled → 灰バッジ "キャンセル"        | StatusBadge    | AC-10   |
| 5     | error → 赤バッジ "エラー"                | StatusBadge    | AC-11   |
| 6     | null → 非表示                            | StatusBadge    | -       |
| 7     | idle → 非表示                            | StatusBadge    | -       |
| 8-13  | StreamMessageItem各種                    | メッセージ表示 | AC-4,5  |
| 14-16 | ToolExecutionHistory                     | 履歴表示       | AC-5    |
| 17-19 | 中止ボタン                               | 実行制御       | AC-6,10 |
| 20-22 | アクセシビリティ属性                     | a11y           | AC-13   |
| 23-33 | 追加テスト                               | 拡充           | -       |
