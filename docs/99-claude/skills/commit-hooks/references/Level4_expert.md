# レベル4: 専門

## 概要

フィードバックループを運用し、commit hooks を継続的に改善する。
品質ゲートの効果を測定し、運用ルールを更新する。

## 前提条件

- レベル3 の運用を完了している
- ログと評価ファイルを更新できる

## 詳細ガイド

### フィードバックループ

- `EVALS.json`: 評価観点の定義
- `CHANGELOG.md`: 改善履歴の記録
- `LOGS.md`: 実行ログの蓄積
- `scripts/log_usage.mjs`: 使用記録

### 改善に必要な知識

- `references/requirements-index.md`: 全体要件との整合確認
- `references/performance-optimization.md`: ボトルネック改善

### 評価と記録

- 検証結果を LOGS.md に残す
- 改善内容を CHANGELOG.md に追記する

## 実践手順

1. 実行ログを分析して課題を整理する
2. 改善対象を references/・assets/・scripts/ に反映する
3. スクリプトで再検証し、記録を更新する

## チェックリスト

- [ ] 改善内容が CHANGELOG.md に記録されている
- [ ] LOGS.md と EVALS.json が更新されている
- [ ] 要件との整合が確認できている
