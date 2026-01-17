---
name: accessibility-wcag
description: |
  WCAG準拠のアクセシビリティ設計を整理し、インクルーシブなUI実装と検証を支援するスキル。
  要件整理、実装方針、監査手順を一貫して整理する。

  Anchors:
  • WCAG 2.1 Guidelines / 適用: アクセシビリティ基準 / 目的: 準拠確認
  • WAI-ARIA Authoring Practices / 適用: ウィジェット実装 / 目的: ARIA実装指針
  • Inclusive Design Patterns (Heydon Pickering) / 適用: 実装パターン / 目的: ベストプラクティス

  Trigger:
  Use when implementing accessibility, ensuring WCAG compliance, or designing ARIA and screen reader support.
  accessibility, WCAG, ARIA, screen reader, inclusive design
---

# accessibility-wcag

## 概要

WCAG準拠のアクセシビリティ設計を整理し、インクルーシブなUI実装と検証を支援する。

## ワークフロー

### Phase 1: 要件整理

**目的**: 目標レベルと対象範囲を明確化する。

**アクション**:

1. 対象UIとユーザー層を整理する。
2. WCAGレベル（A/AA/AAA）を確認する。
3. 参照ガイドとテンプレートを確認する。

**Task**: `agents/analyze-accessibility-requirements.md` を参照

### Phase 2: 実装設計

**目的**: アクセシビリティ実装方針を具体化する。

**アクション**:

1. セマンティクスとARIAの方針を整理する。
2. キーボード操作とフォーカス管理を設計する。
3. テンプレートで表現を統一する。

**Task**: `agents/design-accessibility-solution.md` を参照

### Phase 3: 検証と記録

**目的**: 監査結果を検証し、記録を残す。

**アクション**:

1. 監査スクリプトで自動検証を行う。
2. チェックリストで手動検証を行う。
3. ログと評価情報を更新する。

**Task**: `agents/validate-accessibility.md` を参照

## Task仕様ナビ

| Task                               | 起動タイミング | 入力         | 出力                   |
| ---------------------------------- | -------------- | ------------ | ---------------------- |
| analyze-accessibility-requirements | Phase 1開始時  | 対象/目標    | 要件整理メモ、範囲一覧 |
| design-accessibility-solution      | Phase 2開始時  | 要件整理メモ | 実装方針、対応項目     |
| validate-accessibility             | Phase 3開始時  | 実装方針     | 検証レポート、改善方針 |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

## ベストプラクティス

### すべきこと

| 推奨事項                 | 理由                       |
| ------------------------ | -------------------------- |
| WCAG目標を明確にする     | 合格基準が明確になるため   |
| キーボード操作を保証する | 全ユーザーが操作できるため |
| 検証と記録を実施する     | 改善が継続できるため       |

### 避けるべきこと

| 禁止事項             | 問題点           |
| -------------------- | ---------------- |
| 色だけで情報を伝える | 判別不能になる   |
| 見出し構造を飛ばす   | 読み上げが崩れる |
| 記録を残さない       | 改善が続かない   |

## リソース参照

### scripts/（決定論的処理）

| スクリプト                   | 機能                         |
| ---------------------------- | ---------------------------- |
| `scripts/a11y-audit.mjs`     | アクセシビリティ監査         |
| `scripts/log_usage.mjs`      | 使用記録と評価メトリクス更新 |
| `scripts/validate-skill.mjs` | スキル構造の検証             |

### references/（詳細知識）

| リソース     | パス                                                                   | 読込条件           |
| ------------ | ---------------------------------------------------------------------- | ------------------ |
| レベル1 基礎 | [references/Level1_basics.md](references/Level1_basics.md)             | 初回整理時         |
| レベル2 実務 | [references/Level2_intermediate.md](references/Level2_intermediate.md) | 実務適用時         |
| レベル3 応用 | [references/Level3_advanced.md](references/Level3_advanced.md)         | 複雑UI時           |
| レベル4 専門 | [references/Level4_expert.md](references/Level4_expert.md)             | 改善ループ時       |
| ARIAパターン | [references/aria-patterns.md](references/aria-patterns.md)             | ウィジェット実装時 |
| WCAGチェック | [references/wcag-checklist.md](references/wcag-checklist.md)           | 準拠確認時         |
| テストガイド | [references/testing-guide.md](references/testing-guide.md)             | 検証実施時         |
| 要求仕様索引 | [references/requirements-index.md](references/requirements-index.md)   | 要件参照時         |
| 旧スキル     | [references/legacy-skill.md](references/legacy-skill.md)               | 互換確認時         |

### assets/（テンプレート・素材）

| アセット                              | 用途                       |
| ------------------------------------- | -------------------------- |
| `assets/accessible-form-template.tsx` | アクセシブルフォーム実装例 |

### 運用ファイル

| ファイル       | 目的                       |
| -------------- | -------------------------- |
| `EVALS.json`   | レベル評価・メトリクス管理 |
| `LOGS.md`      | 実行ログの蓄積             |
| `CHANGELOG.md` | 改善履歴の記録             |
