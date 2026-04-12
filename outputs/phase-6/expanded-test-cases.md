# Phase 6: 拡張テストケース

## 追加した inferSmartDefaults エッジケース

| テストケース               | 期待結果                     | ファイル                   |
| -------------------------- | ---------------------------- | -------------------------- |
| purpose='SLACK'（大文字）  | tool='slack'（大小文字不問） | SkillCreateWizard.test.tsx |
| purpose='github'（小文字） | tool='github'                | SkillCreateWizard.test.tsx |
| purpose='Notion'           | tool='notion'                | SkillCreateWizard.test.tsx |
| purpose='定期'             | timing='scheduled'           | SkillCreateWizard.test.tsx |
| purpose='リアルタイム'     | timing='realtime'            | SkillCreateWizard.test.tsx |
| category='data-analysis'   | format='structured'          | SkillCreateWizard.test.tsx |
| purpose=''                 | 全フィールド null            | SkillCreateWizard.test.tsx |
| 推論0件                    | inferenceLog が空配列        | SkillCreateWizard.test.tsx |

## STEPS 配列回帰テスト

| テストケース                                          | 期待結果 |
| ----------------------------------------------------- | -------- |
| STEPS === ["スキル情報入力","詳細設定","生成","完了"] | ✅       |
| STEPS.length === 4                                    | ✅       |

## TASK-SC-07 テストの skip 処理

`SkillCreateWizard.llm-generation.test.tsx` の describe ブロックを `describe.skip` に変更。

- 理由: W2-seq-03a でラジオボタン UI・planSkill/executePlan フローを削除
- 新フロー（createSkill ベース）は `SkillCreateWizard.test.tsx` でカバー済み
- TODO コメントを追加（W2-seq-03a 参照）
