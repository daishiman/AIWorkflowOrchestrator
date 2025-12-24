# Level 2: Intermediate

## 概要

Webアクセシビリティ（WCAG）ガイドラインとインクルーシブデザイン実装の専門知識

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: ARIAパターン集 / 基本原則 / ARIAの5つのルール / 非機能要件 / UI/UX ガイドライン / アクセシビリティテストガイド
- 実務指針: アクセシブルなUIコンポーネントを設計する時 / WCAG準拠を確認する時 / スクリーンリーダー対応を実装する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/aria-patterns.md`: WAI-ARIA実装パターン集（アコーディオン・モーダル・タブ・メニュー・コンボボックス等のウィジェット、ライブリージョン、フォーカス管理）（把握する知識: ARIAパターン集 / 基本原則 / ARIAの5つのルール）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 非機能要件 / UI/UX ガイドライン）
- `resources/testing-guide.md`: アクセシビリティテストガイド（把握する知識: アクセシビリティテストガイド / テストの種類 / 1. 自動テスト）
- `resources/wcag-checklist.md`: WCAGチェックリスト（把握する知識: 1. 知覚可能（Perceivable） / 1.1 代替テキスト / 1.2 時間ベースのメディア）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: .claude/skills/accessibility-wcag/SKILL.md / 目的 / 対象者）

### スクリプト運用
- `scripts/a11y-audit.mjs`: アクセシビリティ監査スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/accessible-form-template.tsx`: アクセシブルフォームテンプレート

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
