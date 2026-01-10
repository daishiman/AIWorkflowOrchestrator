# レベル4: 専門

## 概要

検証とフィードバックループを回し、build/push運用を継続改善する。

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

- `references/requirements-index.md`: 要件整合
- `assets/workflow-evaluation-template.md`: 検証結果の整理

### 評価と記録

- 検証結果を LOGS.md に残す
- 改善内容を CHANGELOG.md に追記する

## 実践手順

1. 検証結果を分析する
2. 改善対象を特定する
3. 再検証し記録を更新する

## チェックリスト

- [ ] 検証結果が記録されている
- [ ] 改善履歴が更新されている
- [ ] 要件整合が確認できている
