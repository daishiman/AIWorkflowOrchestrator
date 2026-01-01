---
name: react-hooks-advanced
description: |
  React Hooksの高度な使用パターンと最適化技術を専門とするスキル。ダン・アブラモフの思想に基づき、予測可能で効率的な状態管理を実現します。

  Anchors:
  • 『React公式Documentation』（Meta） / 適用: Hooks設計 / 目的: パフォーマンス最適化

  Trigger:
  React Hooks高度化時、カスタムフック設計時、状態管理最適化時、パフォーマンス改善時に使用。useEffect依存配列設計、メモ化戦略検討、複雑な状態ロジック実装時に自動呼び出し。
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---

# React Hooks Advanced

## 概要

React Hooksの高度な使用パターンと最適化技術を専門とするスキル。ダン・アブラモフの思想に基づき、予測可能で効率的な状態管理を実現します。

このスキルは、React開発者が複雑な状態管理、パフォーマンス最適化、カスタムフック設計を行う際に活用されます。useEffect の依存配列完全性原則、メモ化戦略の測定駆動的な適用、useReducer による複雑な状態ロジックの実装などを対象としています。

## ワークフロー

### Phase 1: 要件の整理と現状分析

**目的**: タスクの要件を明確にし、現在のコード状況を分析する

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 対象となるHooksパターン（useEffect, useCallback, useMemo, useReducer など）を特定
3. 現在のコード実装を確認し、アンチパターンの有無をチェック

### Phase 2: スキル適用と実装

**目的**: スキルの指針に従って具体的な実装を進める

**アクション**:

1. 対応するレベルのリソース（Level 1-4）を参照しながら実装を実施
2. テンプレート（`assets/custom-hook-template.md` など）を活用して一貫性を確保
3. 依存配列、メモ化戦略などの重要な判断点をコメントとして記録

### Phase 3: 検証と最適化

**目的**: 成果物の品質確認と記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造と依存配列の完全性を確認
2. `scripts/analyze-hooks-usage.mjs` でHooks使用状況を分析
3. `scripts/log_usage.mjs` を実行して実装記録を保存

## Task仕様ナビ

| Task                    | 対象Hooks                        | リソース                       | テンプレート              |
| ----------------------- | -------------------------------- | ------------------------------ | ------------------------- |
| useEffectの依存配列設計 | useEffect                        | `dependency-array-patterns.md` | なし                      |
| メモ化戦略の検討・実装  | useCallback, useMemo, React.memo | `memoization-strategies.md`    | なし                      |
| カスタムフック開発      | 複数（useState等の組み合わせ）   | `Level2_intermediate.md`       | `custom-hook-template.md` |
| 複雑な状態管理          | useReducer                       | `use-reducer-patterns.md`      | `use-reducer-template.md` |
| Hooks選択ガイダンス     | 全般                             | `hooks-selection-guide.md`     | なし                      |
| 要求仕様確認            | 全般                             | `requirements-index.md`        | なし                      |

## ベストプラクティス

### すべきこと

- React Hooksの最適な使い分けを判断する際、このスキルを活用する
- useEffectの依存配列は ESLint ルール(`react-hooks/exhaustive-deps`)に準拠する
- パフォーマンス最適化は測定駆動的に行い、実際の問題がある場合のみメモ化を適用する
- 複雑な状態ロジックには useReducer を活用する
- カスタムフック開発時にはテンプレートを参考に一貫性を保つ
- 依存配列の完全性原則を理解し、古いクロージャ問題を回避する

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける
- 無差別なメモ化（性能測定なしでの過度な最適化）
- 依存配列から意図的に値を除外する（ESLint ルール無視）
- useCallback や useMemo の過度な使用（メモ化自体が性能コストになる可能性）
- useEffect 内での無限ループ発生（依存配列の不完全性）

## リソース参照

### Levelsリソース

- `references/Level1_basics.md` - React Hooks の基礎と基本パターン
- `references/Level2_intermediate.md` - 実務的なHooks活用パターン
- `references/Level3_advanced.md` - 高度なパターンと最適化テクニック
- `references/Level4_expert.md` - 専門的な設計思想と複雑なシナリオ対応

### トピック別リソース

- `references/dependency-array-patterns.md` - 依存配列の完全性原則、ESLint準拠、無限ループと古いクロージャ問題の解決法
- `references/hooks-selection-guide.md` - 状況に応じた最適なHooks選択ガイド
- `references/memoization-strategies.md` - useCallback/useMemo/React.memo の測定駆動最適化と効果的パターン
- `references/use-reducer-patterns.md` - useReducer による複雑な状態管理パターン
- `references/requirements-index.md` - 要求仕様の索引（docs/00-requirements と同期）
- `references/legacy-skill.md` - 旧SKILL.md の全文（参考用）

### アセット（テンプレート）

- `assets/custom-hook-template.md` - カスタムフック開発用テンプレート
- `assets/use-reducer-template.md` - useReducer パターン用テンプレート

### スクリプト

- `scripts/analyze-hooks-usage.mjs` - React Hooks使用状況分析ツール
- `scripts/validate-skill.mjs` - スキル構造と依存配列完全性の検証
- `scripts/log_usage.mjs` - 使用記録・自動評価スクリプト

## 変更履歴

| Version | Date       | Changes                                                                    |
| ------- | ---------- | -------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md 仕様対応: frontmatter更新、Task仕様ナビ追加、リソース参照整理 |
