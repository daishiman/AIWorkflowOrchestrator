# Level 2: Intermediate

## 概要

Git Hooksの基本概念、ライフサイクル、実装パターンを提供するスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Git Hooks フック種類リファレンス / クライアント側フック / pre-commit / Git Hooks 実装パターン集 / パターン1: Prettier + ESLint統合 / パターン2: TypeScript型チェック
- 実務指針: Git Hooks を実装する時 / コミット前のコード品質チェックを自動化したい時 / プッシュ前のテスト実行を強制したい時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/hook-types-reference.md`: フック種類の詳細リファレンス（把握する知識: Git Hooks フック種類リファレンス / クライアント側フック / pre-commit）
- `resources/implementation-patterns.md`: 10種類の実装パターン（Prettier+ESLint、型チェック、テスト、Conventional Commits検証等）（把握する知識: Git Hooks 実装パターン集 / パターン1: Prettier + ESLint統合 / パターン2: TypeScript型チェック）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Git Hooks 概念 / 核心概念 / 1. イベント駆動自動化）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-git-hooks.mjs`: Git Hooks設定と動作検証スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/pre-commit-template.sh`: pre-commitテンプレート
- `templates/pre-push-template.sh`: pre-pushテンプレート

### 成果物要件
- テンプレートの構成・必須項目を反映する

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた
