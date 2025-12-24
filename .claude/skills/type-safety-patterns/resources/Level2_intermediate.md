# Level 2: Intermediate

## 概要

TypeScript厳格モードによる型安全性設計を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Discriminated Unions パターン / 基本概念 / Discriminated Union とは / ジェネリクスパターン / 基本的なジェネリクス / 関数ジェネリクス

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/discriminated-union-patterns.md`: Discriminated Union Patternsリソース（把握する知識: Discriminated Unions パターン / 基本概念 / Discriminated Union とは）
- `resources/generics-patterns.md`: Generics Patternsリソース（把握する知識: ジェネリクスパターン / 基本的なジェネリクス / 関数ジェネリクス）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: コアインターフェース仕様）
- `resources/strict-mode-guide.md`: Strict Mode Guideリソース（把握する知識: TypeScript厳格モード設定ガイド / 推奨設定 / strict: true）
- `resources/type-guard-patterns.md`: Type Guard Patternsリソース（把握する知識: 型ガードパターン / 組み込み型ガード / typeof 型ガード）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Type Safety Patterns / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/check-type-safety.mjs`: Check Type Safetyスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/type-safe-patterns.ts`: Type Safe Patternsテンプレート

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
