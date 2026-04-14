# Phase 12: スキルフィードバックレポート

## ワークフロー改善点

| 観点           | 発見                                                  | 改善提案                                                                   |
| -------------- | ----------------------------------------------------- | -------------------------------------------------------------------------- |
| Phase 4 テスト | 視覚バッジの影響で button 名が変わる前提を置きやすい  | 「visual label と accessible name は別に管理する」ことを設計段階で明示する |
| Phase 5 実装   | `aria-label` を付ける場所を誤ると button 名まで変わる | `aria-labelledby` / `aria-describedby` の使い分けをテンプレート化する      |
| Phase 11       | スクリーンショットの保存先を曖昧にすると証跡が散る    | workflow-local の `outputs/phase-11/screenshots/` を固定する               |

## 技術的教訓

1. button の accessible name を変えたくない場合は、ラベル本体を `aria-labelledby` で固定する。
2. バッジは `aria-label` を持たせても、button とは別の補助情報として扱える。
3. 見た目のラベルと意味のラベルを分けると、テストは exact match で安定する。

## スキル改善提案

| 提案                       | 内容                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| task-specification-creator | 「visual label が accessible name を変えてよいか」を Phase 2 で確認するチェックを追加する      |
| task-specification-creator | スクリーンショット保存先と証跡ファイル名を Phase 11 の必須項目に入れる                         |
| aiworkflow-requirements    | UI の current contract を記録するとき、button 名と補助ラベルを分けて書くテンプレートを追加する |

## 参考メモ

- 今回の実装では `Slack` という button 名を保ちつつ、補助情報として `主ツール` バッジを出した
- `screen.getByRole("button", { name: "Slack" })` のような exact match がそのまま使える
