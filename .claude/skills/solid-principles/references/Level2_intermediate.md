# Level 2: Intermediate

## 概要

ロバート・C・マーティンが体系化したSOLID原則（SRP, OCP, LSP, ISP, DIP）の

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 依存性逆転の原則（DIP: Dependency Inversion Principle） / 定義 / 核心概念 / インターフェース分離の原則（ISP: Interface Segregation Principle） / リスコフの置換原則（LSP: Liskov Substitution Principle） / 開放閉鎖の原則（OCP: Open-Closed Principle）

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/dependency-inversion.md`: Dependency Inversionリソース（把握する知識: 依存性逆転の原則（DIP: Dependency Inversion Principle） / 定義 / 核心概念）
- `resources/interface-segregation.md`: Interface Segregationリソース（把握する知識: インターフェース分離の原則（ISP: Interface Segregation Principle） / 定義 / 核心概念）
- `resources/liskov-substitution.md`: Liskov Substitutionリソース（把握する知識: リスコフの置換原則（LSP: Liskov Substitution Principle） / 定義 / 核心概念）
- `resources/open-closed.md`: Open Closedリソース（把握する知識: 開放閉鎖の原則（OCP: Open-Closed Principle） / 定義 / 核心概念）
- `resources/single-responsibility.md`: Single Responsibilityリソース（把握する知識: 単一責任の原則（SRP: Single Responsibility Principle） / 定義 / 核心概念）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: SOLID Principles / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/check-solid-violations.mjs`: Check Solid Violationsスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/solid-review-checklist.md`: Solid Review Checklistテンプレート

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
