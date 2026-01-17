---
name: structured-output
description: |
  構造化出力を設計・生成・検証するためのスキル。JSON/YAML/CSV/Markdownなどの機械可読な出力を、用途と受け手に合わせて最小の仕様で定義し、一貫性と再利用性を確保する。

  Anchors:
  • JSON Schema / 適用: 出力スキーマ定義 / 目的: 型・必須項目の明確化
  • RFC 8259 (JSON) / 適用: JSON構文 / 目的: 互換性の担保
  • RFC 4180 (CSV) / 適用: CSV出力 / 目的: 区切りとエスケープの標準化

  Trigger:
  Use when designing or validating structured outputs, schema-driven responses, or machine-readable reports.
  structured output, JSON schema, CSV, YAML, markdown table, response format
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Structured Output

## 概要

機械処理に耐える構造化出力を、要件整理→スキーマ設計→出力検証の流れで整備するスキル。用途に合わせて最小限の仕様を確定し、変更に強い出力設計を実現する。

詳細は `references/Level1_basics.md` から順に参照し、必要に応じて段階的に読み込む。

## ワークフロー

### Phase 1: 出力要件の整理

**目的**: 出力の利用者、用途、粒度、必須項目を明確化する。

**アクション**:

1. 出力利用者と利用シナリオを特定する。
2. 形式（JSON/YAML/CSV/Markdown）を選定する。
3. 必須/任意項目、欠損時の扱いを定義する。

### Phase 2: スキーマ設計とテンプレート整備

**目的**: スキーマと出力テンプレートを整合させる。

**アクション**:

1. フィールド名・型・制約を定義する。
2. テンプレートとサンプル出力を作成する。
3. 互換性と拡張ルールを明記する。

### Phase 3: 出力検証

**目的**: 出力がスキーマに準拠していることを検証する。

**アクション**:

1. `scripts/validate-structured-output.mjs` を実行する。
2. 欠損・型不整合・余計なキーを修正する。
3. エラー時の復旧手順を記録する。

## Task仕様ナビ

| Phase | Task             | 目的                             | 入力         | 出力                  |
| ----- | ---------------- | -------------------------------- | ------------ | --------------------- |
| 1     | 出力要件整理     | 利用者・用途・必須項目を確定     | ユーザー要求 | 要件メモ              |
| 2     | 出力スキーマ設計 | フィールド定義とテンプレート作成 | 要件メモ     | スキーマ/テンプレート |
| 3     | 出力検証         | スキーマ準拠の確認               | 出力ファイル | 検証レポート          |

## ベストプラクティス

### すべきこと

- フィールド名は一貫した命名規則で統一する。
- 未確定情報は null で明示し、空文字で曖昧にしない。
- 形式選定の理由を仕様書に残す。
- 出力サンプルを必ず用意する。

### 避けるべきこと

- 余計な自然文や注釈を混ぜない。
- 破壊的変更を無計画に行わない。
- スキーマとテンプレートの不一致を放置しない。

## リソース/スクリプト参照

### references/

- `references/Level1_basics.md`: 基礎指針
- `references/Level2_intermediate.md`: 実務パターン
- `references/Level3_advanced.md`: 高度な設計指針
- `references/Level4_expert.md`: 専門領域の注意点
- `references/format-selection.md`: 形式選定ガイド
- `references/field-specification.md`: フィールド仕様の整理
- `references/error-recovery.md`: エラー復旧手順

### assets/

- `assets/structured-output-schema.json`: スキーマ雛形
- `assets/structured-output-template.json`: JSON出力テンプレート
- `assets/markdown-table-template.md`: Markdown表テンプレート

### scripts/

- `scripts/validate-structured-output.mjs`: スキーマ準拠検証

## 変更履歴

| Version | Date       | Changes                               |
| ------- | ---------- | ------------------------------------- |
| 2.0.0   | 2026-01-02 | 18-skills.md 仕様に準拠した構造へ更新 |
