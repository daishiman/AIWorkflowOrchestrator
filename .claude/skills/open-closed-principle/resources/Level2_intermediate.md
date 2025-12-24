# Level 2: Intermediate

## 概要

SOLID原則の開放閉鎖原則（OCP）を専門とするスキル。 Robert C. Martinの『アジャイルソフトウェア開発の奥義』に基づき、 拡張に開かれ、修正に閉じた設計を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 拡張メカニズム（Extension Mechanisms） / 拡張メカニズム一覧 / 1. ポリモーフィズム / OCP原則の基本（Open-Closed Principle Fundamentals） / 定義 / 原則の本質
- 実務指針: 新しいワークフロータイプの追加が必要な時 / 既存コードを修正せずに機能拡張したい時 / 拡張ポイントを設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/extension-mechanisms.md`: 拡張メカニズム（Extension Mechanisms）（把握する知識: 拡張メカニズム（Extension Mechanisms） / 拡張メカニズム一覧 / 1. ポリモーフィズム）
- `resources/ocp-fundamentals.md`: OCP原則の基本（Open-Closed Principle Fundamentals）（把握する知識: OCP原則の基本（Open-Closed Principle Fundamentals） / 定義 / 原則の本質）
- `resources/ocp-patterns.md`: OCP準拠パターン（OCP-Compliant Patterns）（把握する知識: OCP準拠パターン（OCP-Compliant Patterns） / パターン一覧 / 1. Strategy + Registry）
- `resources/refactoring-to-ocp.md`: OCPへのリファクタリング（Refactoring to OCP）（把握する知識: OCPへのリファクタリング（Refactoring to OCP） / リファクタリングの原則 / パターン1: switch文の排除）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Open-Closed Principle (OCP) / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-extensibility.mjs`: コードの拡張性分析とOCP違反検出（switch文・if-elseチェーン・型チェック・フラグパラメータ）
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/extension-point-template.md`: Strategy/Template Method/Plugin Registryによる拡張ポイント設計テンプレート

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
