# 高度なUI/UXパターン（インデックス）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

このドキュメントは高度なUI/UX実装パターンのインデックスファイルです。
詳細は各参照ドキュメントを参照してください。

## ドキュメント一覧

| ドキュメント | 内容 | 行数 |
|--------------|------|------|
| [Portal実装パターン](./ui-ux-portal-patterns.md) | React Portal、Stacking Context、WAI-ARIA Menu Pattern | 約170行 |
| [ナビゲーションUI設計](./ui-ux-navigation.md) | ChatViewヘッダー、アイコンボタン、アクセシビリティ | 約120行 |
| [システムプロンプト設定UI](./ui-ux-system-prompt.md) | SystemPromptPanel、テンプレート管理、状態管理 | 約230行 |
| [LLM選択機能](./ui-ux-llm-selector.md) | LLMSelector、プロバイダー/モデル切り替え | 約180行 |

## トピック別参照

### Portal・オーバーレイ
- [Portal実装パターン](./ui-ux-portal-patterns.md) - Stacking Context問題の解決

### ナビゲーション・ルーティング
- [ナビゲーションUI設計](./ui-ux-navigation.md) - ChatViewナビゲーション

### 入力・設定UI
- [システムプロンプト設定UI](./ui-ux-system-prompt.md) - テキストエリア、テンプレート管理
- [LLM選択機能](./ui-ux-llm-selector.md) - ドロップダウン選択

### アクセシビリティ
- [Portal実装パターン](./ui-ux-portal-patterns.md#wai-aria-menu-pattern実装) - WAI-ARIA Menu Pattern
- [ナビゲーションUI設計](./ui-ux-navigation.md#アクセシビリティ対応事例) - キーボードナビゲーション
- [システムプロンプト設定UI](./ui-ux-system-prompt.md#アクセシビリティ対応) - スクリーンリーダー対応

---

## 関連ドキュメント

- [UI/UXパネル設計](./ui-ux-panels.md)
- [UI/UX基本設計](./ui-ux-design.md)
