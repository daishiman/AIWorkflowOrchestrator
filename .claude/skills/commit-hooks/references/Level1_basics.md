# レベル1: 基礎

## 概要

commit hooks の基本概念と導入判断を整理する。
SKILL.md と本レベルの内容で最低限の運用を完結させる。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象リポジトリの目的を把握している

## 詳細ガイド

### 使用タイミング

- commit hooks の導入や見直しを検討する段階

### 必要な知識

- 対象領域: pre-commit/commit-msg/pre-push の役割
- 主要概念: Husky導入、lint-stagedの対象制御、品質ゲート
- 実務指針: 目的と実行条件を先に定義する

### 判断基準

- 避けるべき判断: 目的が未定義のままフックを追加する

### 成果物の最小要件

- 要件整理メモが作成されている
- 主要テンプレート: `assets/hook-requirements-template.md`

### 主要リソース

- `SKILL.md`: 基本方針とワークフロー
- `references/husky-configuration.md`: Husky導入の前提

### 主要テンプレート

- `assets/hook-requirements-template.md`: 要件整理
- `assets/pre-commit-basic.sh`: 参照のみ

## 実践手順

1. 目的と対象フックを整理する
2. 要件テンプレートで制約をまとめる
3. 基本方針を要件メモに反映する

## チェックリスト

- [ ] 対象フックが明記されている
- [ ] 目的と制約が整理されている
- [ ] テンプレートが埋まっている
