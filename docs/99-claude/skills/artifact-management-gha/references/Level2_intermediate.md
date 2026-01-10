# Level 2: Intermediate

## 概要

アーティファクトの設計・実装を行うための実務パターンを整理する。

## 運用ガイド

### 参照の優先順位

1. `references/upload-artifact.md` と `references/download-artifact.md` で仕様を確認
2. `assets/artifact-workflow.yaml` の該当例を選択
3. `references/retention-optimization.md` で保持期間を調整

### 成果物要件

- アーティファクト名・パス・保持期間が明記されている
- ダウンロードの順序と依存が整理されている

## 実践手順

1. 成果物の範囲と命名規則を決める
2. upload/download の手順をワークフローに追加する
3. 例外処理（if-no-files-found）を設定する

## チェックリスト

- [ ] 設定値が明文化されている
- [ ] 依存順が明確になっている
- [ ] 例外時の挙動が確認されている
