---
name: tailwind-css-patterns
description: |
  Tailwind CSS のユーティリティ設計とパターン化を支援するスキル。レイアウト・状態・レスポンシブ対応を整理し、再利用可能なUIパターンを構築する。

  Anchors:
  • Tailwind CSS Documentation / 適用: ユーティリティ設計 / 目的: 公式ベストプラクティス準拠
  • Responsive Web Design / 適用: ブレークポイント設計 / 目的: モバイルファーストの整理
  • Class Variance Authority (CVA) / 適用: バリアント設計 / 目的: 状態と組み合わせの整理

  Trigger:
  Use when designing Tailwind UI patterns, reducing utility bloat, or standardizing responsive and state styles.
  tailwind css, utility classes, responsive design, component patterns, class variance
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Tailwind CSS Patterns

## 概要

Tailwind CSS のクラス設計とパターン化を整理し、再利用可能なUIライブラリを構築するスキル。クラス肥大化を抑え、レスポンシブと状態表現を体系化する。

詳細は `references/Level1_basics.md` から段階的に参照する。

## ワークフロー

### Phase 1: コンテキスト整理

**目的**: UIの目的と制約を整理する。

**アクション**:

1. 画面種別と利用シーンを整理する。
2. レイアウトと状態表現の要件を確認する。
3. 使用するブレークポイント方針を決定する。

### Phase 2: パターン設計

**目的**: パターンライブラリを設計する。

**アクション**:

1. `assets/pattern-library.md` からパターンを選定する。
2. `assets/component-variants-template.tsx` を基にバリアントを定義する。
3. 再利用ルールと命名規則を定める。

### Phase 3: 検証

**目的**: クラス肥大化と一貫性を検証する。

**アクション**:

1. `scripts/analyze-tailwind.mjs` で利用状況を分析する。
2. `scripts/check-utility-bloat.mjs` でクラス長を検査する。
3. 改善点をパターンに反映する。

## Task仕様ナビ

| Phase | Task | 目的 | 入力 | 出力 |
| --- | --- | --- | --- | --- |
| 1 | コンテキスト整理 | 画面目的と制約を整理 | ユーザー要求 | コンテキストメモ |
| 2 | パターン設計 | パターンとバリアントを設計 | コンテキストメモ | パターン設計書 |
| 3 | パターン検証 | クラス肥大化と一貫性確認 | UI実装 | 検証レポート |

## ベストプラクティス

### すべきこと

- 同一用途のUIは同じパターンを使い回す。
- レスポンシブはモバイルファーストで設計する。
- 状態表現はバリアントで整理する。
- 長すぎるクラスはコンポーネント化を検討する。

### 避けるべきこと

- クラスのコピペによるばらつきを放置しない。
- ブレークポイントの乱用を避ける。
- 任意値の多用を常態化させない。

## リソース/スクリプト参照

### references/

- `references/Level1_basics.md`: 基礎指針
- `references/Level2_intermediate.md`: 実務パターン
- `references/Level3_advanced.md`: 高度な設計指針
- `references/Level4_expert.md`: 専門領域の注意点
- `references/layout-patterns.md`: レイアウトパターン
- `references/responsive-strategy.md`: ブレークポイント設計
- `references/responsive-patterns.md`: レスポンシブ実装例
- `references/component-states.md`: 状態設計
- `references/cva-guide.md`: バリアント設計
- `references/dark-mode-guide.md`: ダークモード設計

### assets/

- `assets/pattern-library.md`: パターンライブラリ
- `assets/component-skeletons.md`: コンポーネント骨組み
- `assets/component-variants-template.tsx`: バリアントテンプレート
- `assets/tailwind-config-template.js`: 設定テンプレート

### scripts/

- `scripts/analyze-tailwind.mjs`: Tailwind 使用状況分析
- `scripts/check-utility-bloat.mjs`: クラス肥大化検査

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 2.0.0 | 2026-01-02 | 18-skills.md 仕様に準拠した構造へ更新 |
