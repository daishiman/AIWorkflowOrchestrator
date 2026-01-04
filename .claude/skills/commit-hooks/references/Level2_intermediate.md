# レベル2: 実務

## 概要

Husky と lint-staged を使った実務的なフック設計を整理する。
references/・scripts/・assets/ を活用した構成を前提とする。

## 前提条件

- レベル1 の内容を理解している
- 対象リポジトリの制約を把握している

## 詳細ガイド

### 必要な知識・情報

- 主要トピック: Husky設定、lint-staged対象設計、commit-msg規約
- 実務指針: 対象ファイルを限定し、実行時間を抑える

### 判断基準と検証観点

- 回避事項: 全ファイル対象のフックを設計しない
- 検証観点: 失敗時の代替手順が定義されている

### リソース運用

- `references/husky-configuration.md`: Husky導入条件と構成
- `references/lint-staged-patterns.md`: 対象の絞り込みと例
- `references/requirements-index.md`: 全体要件との整合
- `references/legacy-skill.md`: 旧版の差分確認

### スクリプト運用

- `scripts/test-hooks.mjs`: フック動作テスト
- `scripts/validate-skill.mjs`: スキル構造検証
- `scripts/log_usage.mjs`: 実行記録

### テンプレート運用

- `assets/lint-staged-advanced.js`: lint-staged設定
- `assets/commit-msg-template.sh`: commit-msgフック
- `assets/pre-push-template.sh`: pre-pushフック

### 成果物要件

- フック構成案に目的・対象・例外が含まれている

## 実践手順

1. 要件整理メモから設計範囲を確定する
2. テンプレートを用いてフック構成案を作成する
3. スクリプトで検証し、問題点を記録する

## チェックリスト

- [ ] Huskyとlint-stagedの前提が明確
- [ ] commit-msg/pre-pushの規約が定義済み
- [ ] 検証手順が再現可能
