---
name: form-validation
description: |
  フォームバリデーション設計と実装を支援するスキル。Zod/react-hook-formを用いたクライアント・サーバー両面の検証、エラーメッセージ設計、テスト実装を提供。

  Anchors:
  • Designing Data-Intensive Applications（M. Kleppmann） / 適用: データ検証 / 目的: 堅牢な入力処理
  • The Pragmatic Programmer（Hunt, Thomas） / 適用: 設計原則 / 目的: 保守性の高い実装
  • Zod Documentation / 適用: スキーマ定義 / 目的: 型安全なバリデーション

  Trigger:
  Use when designing form validation, implementing Zod schemas, integrating react-hook-form, designing error messages, or testing validation logic.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Task
---

# フォームバリデーション

## 概要

フォームバリデーション設計と実装を支援するスキル。クライアント側（UX向上）とサーバー側（セキュリティ）の両面検証、Zod/react-hook-form統合、エラーメッセージ設計を提供。

## ワークフロー

### Phase 1: 要件分析

**目的**: バリデーション要件を明確化し、設計方針を決定

**アクション**:

1. [references/basics.md](references/basics.md) で基本概念を確認
2. フィールド定義・制約条件を整理
3. クライアント/サーバー検証の分担を決定

**Task**: [agents/requirements-analysis.md](agents/requirements-analysis.md) を参照

### Phase 2: スキーマ定義

**目的**: Zodスキーマによる型安全なバリデーション定義

**アクション**:

1. [references/patterns.md](references/patterns.md) で実装パターンを確認
2. [assets/zod-schema-template.ts](assets/zod-schema-template.ts) を参考にスキーマ作成
3. 非同期バリデーション（重複チェック等）を追加

**Task**: [agents/schema-definition.md](agents/schema-definition.md) を参照

### Phase 3: 実装

**目的**: React Hook Formとの統合・サーバー検証の実装

**アクション**:

1. [assets/react-hook-form-integration-template.tsx](assets/react-hook-form-integration-template.tsx) を参考にフォーム実装
2. [assets/server-validation-template.ts](assets/server-validation-template.ts) でサーバー検証
3. エラーメッセージ表示を実装

**Task**: [agents/validation-implementation.md](agents/validation-implementation.md) を参照

### Phase 4: テスト

**目的**: バリデーションロジックの正確性を検証

**アクション**:

1. 境界値テストを実装
2. エッジケース（空文字、null、特殊文字）をテスト
3. E2Eテストでフォームフローを検証

**Task**: [agents/testing.md](agents/testing.md) を参照

## Task仕様ナビ

| Task                                                                         | 用途           | 入力             | 出力               |
| ---------------------------------------------------------------------------- | -------------- | ---------------- | ------------------ |
| [agents/requirements-analysis.md](agents/requirements-analysis.md)           | 要件分析       | フォーム仕様     | 検証要件定義       |
| [agents/schema-definition.md](agents/schema-definition.md)                   | スキーマ定義   | 検証要件         | Zodスキーマ        |
| [agents/validation-implementation.md](agents/validation-implementation.md)   | 実装           | スキーマ         | フォームコード     |
| [agents/testing.md](agents/testing.md)                                       | テスト         | 実装コード       | テストスイート     |

## ベストプラクティス

### すべきこと

- クライアント・サーバー両方でバリデーション実装
- Zodスキーマを一元管理して検証ルールを統一
- 具体的で行動指示を含むエラーメッセージを設計
- 境界値・エッジケースをテスト
- 型安全性を維持（anyを避ける）

### 避けるべきこと

- クライアント側のみの検証（セキュリティリスク）
- 曖昧なエラーメッセージ
- 過度なリアルタイム検証（パフォーマンス低下）
- 検証ルールの重複定義

## リソース参照

### references/（詳細知識）

| リソース       | パス                                           | 内容                   |
| -------------- | ---------------------------------------------- | ---------------------- |
| 基本概念       | [references/basics.md](references/basics.md)   | バリデーション層・種類 |
| 実装パターン   | [references/patterns.md](references/patterns.md) | Zod/RHF統合・テスト    |

### assets/（テンプレート）

| テンプレート                         | 用途                       |
| ------------------------------------ | -------------------------- |
| zod-schema-template.ts               | Zodスキーマ定義            |
| react-hook-form-integration-template.tsx | RHF統合フォーム         |
| server-validation-template.ts        | サーバー側検証             |
| validation-requirements-template.md  | 要件定義テンプレート       |

### scripts/（記録）

| スクリプト    | 用途     | 使用例                                     |
| ------------- | -------- | ------------------------------------------ |
| log_usage.mjs | 利用記録 | `node scripts/log_usage.mjs --result success` |

## 変更履歴

| Version | Date       | Changes                                                  |
| ------- | ---------- | -------------------------------------------------------- |
| 2.0.0   | 2026-01-02 | 18-skills.md仕様に完全準拠。frontmatter修正、references/刷新 |
| 1.1.0   | 2025-12-31 | Trigger追加、Task仕様ナビ追加                            |
| 1.0.0   | 2025-12-24 | 初版作成                                                 |
