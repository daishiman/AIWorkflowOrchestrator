# Phase 12 成果物: スキルフィードバックレポート

## 改善観点

| 分類            | 内容                                                               | 重要度 |
| --------------- | ------------------------------------------------------------------ | ------ |
| 実測ゲート      | Phase 11/12 が実ファイル未確認のまま completed になりやすい        | 高     |
| NON_VISUAL 運用 | placeholder 画像を置く運用が「画像を生成しない」仕様と衝突しやすい | 中     |
| フル検証コスト  | desktop package 全体 typecheck が重く、close-out で再確認しづらい  | 低     |

## 推奨改善

1. Phase 11 完了前に `grep describe.skip` と targeted vitest を必須ゲートにする。
2. NON_VISUAL では `screenshots/README.md` のみを残し、画像プレースホルダを禁止する。
3. Phase 12 テンプレートに「成果物より先に実ファイルを確認する」手順を追記する。
