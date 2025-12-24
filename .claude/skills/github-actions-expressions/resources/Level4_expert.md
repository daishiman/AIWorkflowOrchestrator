# Level 4: Expert

## 概要

GitHub Actionsのワークフローで使用できる式構文とコンテキストオブジェクトを専門とするスキル。 ${{ }}構文、演算子、リテラル、組み込み関数、および利用可能なすべてのコンテキスト（github, env, job, steps, runner, secrets, needs, matrix, inputs）を提供します。 専門分野:

フィードバックループを回しながらスキルを改善する方法を整理します。

## 前提条件

- Level 3 の運用を完了している
- スクリプトの実行とログ更新ができる

## 詳細ガイド

### フィードバックループ
- `EVALS.json`: 評価観点の定義
- `CHANGELOG.md`: 変更履歴の記録
- `LOGS.md`: 運用ログの蓄積
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-expressions.mjs`: expressionsを検証するスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### 改善に必要な知識
- 評価結果とログを照合し、改善ポイントを特定する
- 変更が必要な resources/・templates/・scripts/ を特定する

### 評価と記録
- 実行結果を LOGS.md に残し、評価観点を EVALS.json に反映する

## 実践手順

1. 運用ログを確認し、改善対象を洗い出す
2. 必要な変更を resources/・templates/・scripts/ に反映する
3. スクリプトで検証し、変更内容を記録する
4. CHANGELOG.md に更新内容を記載し、EVALS.json を調整する

## チェックリスト

- [ ] フィードバックループの各要素が更新されている
- [ ] スクリプトで検証を実施した
- [ ] 変更内容を CHANGELOG.md に記録した
