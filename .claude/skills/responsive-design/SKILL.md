---
name: responsive-design
description: |
  レスポンシブWebデザインのベストプラクティスを提供する専門スキル。モバイルファースト、フルードグリッド、メディアクエリ、ブレークポイント設計を支援。

  Anchors:
  • 『Responsive Web Design』(Ethan Marcotte) / 適用: フルードグリッド・メディアクエリ設計 / 目的: デバイス横断的なUI設計の基礎
  • 『Mobile First』(Luke Wroblewski) / 適用: モバイルファースト設計手法 / 目的: 制約駆動設計とプログレッシブエンハンスメント

  Trigger:
  レスポンシブデザイン実装時、ブレークポイント設計時、モバイルファースト設計時、フルードグリッド実装時、メディアクエリ最適化時、クロスデバイスUI設計時に使用
  breakpoint, media query, mobile first, fluid grid, viewport, responsive layout, adaptive design, flexible images

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---

# Responsive Design

## 概要

レスポンシブWebデザインのベストプラクティスを提供する専門スキル。

モバイルファースト、フルードグリッド、メディアクエリ、ブレークポイント設計、画像最適化、タイポグラフィのスケーリング、タッチターゲット設計などの包括的な知識を提供します。

詳細な手順や背景は `references/Level1_basics.md` から `references/Level4_expert.md` を参照してください。

## ワークフロー

### Phase 1: コンテキスト分析

**目的**: デザイン要件とデバイス要件を整理する

**アクション**:

1. `references/Level1_basics.md` でレスポンシブデザインの基礎を確認
2. 対象デバイス、ビューポート範囲、コンテンツ優先度を明確化
3. 必要な references/scripts/templates を特定

**Task**: `agents/analyze-context.md` を参照

### Phase 2: デザイン実装

**目的**: レスポンシブデザインを実装する

**アクション**:

1. モバイルファーストアプローチでベースラインを作成
2. ブレークポイント設計とメディアクエリ実装
3. フルードグリッド、柔軟な画像、スケーラブルタイポグラフィを実装

**Task**: `agents/implement-design.md` を参照

### Phase 3: 検証と記録

**目的**: 実装の検証と記録の保存

**アクション**:

1. 各ブレークポイントでの動作確認
2. パフォーマンス、アクセシビリティ、ユーザビリティを検証
3. `scripts/log_usage.mjs` を実行して記録を残す

**Task**: `agents/validate-design.md` を参照

## Task仕様ナビ

| 種類                     | 説明                                             | リソース                            | テンプレート                            |
| :----------------------- | :----------------------------------------------- | :---------------------------------- | :-------------------------------------- |
| **基礎知識**             | レスポンシブデザインの基本概念と原則             | `references/Level1_basics.md`       | -                                       |
| **実装ガイド**           | ブレークポイント設計とメディアクエリ実装         | `references/Level2_intermediate.md` | `assets/breakpoint-template.css`        |
| **応用手法**             | 高度なレスポンシブパターンとパフォーマンス最適化 | `references/Level3_advanced.md`     | -                                       |
| **専門知識**             | レスポンシブアーキテクチャとデザインシステム統合 | `references/Level4_expert.md`       | -                                       |
| **ブレークポイント設計** | 標準的なブレークポイントとカスタマイズ指針       | `references/breakpoint-strategy.md` | `assets/breakpoint-template.css`        |
| **フルードグリッド**     | CSS Grid/Flexboxによるフルードレイアウト         | `references/fluid-grid-patterns.md` | `assets/grid-template.css`              |
| **画像最適化**           | レスポンシブ画像とsrcset/picture要素             | `references/responsive-images.md`   | `assets/responsive-image-template.html` |
| **タイポグラフィ**       | スケーラブルタイポグラフィとクランプ関数         | `references/typography-scaling.md`  | `assets/typography-template.css`        |

## ベストプラクティス

### すべきこと

- **モバイルファースト**: 最小ビューポートから設計し、プログレッシブエンハンスメントを適用する
- **フルードグリッド**: 固定幅ではなく相対単位（%、fr、vw等）を使用する
- **柔軟な画像**: `max-width: 100%` とsrcset/picture要素で画像を最適化する
- **意味的なブレークポイント**: デザインの自然な折り返し点でブレークポイントを設定する
- **タッチターゲット**: 最小44×44pxのタッチ可能領域を確保する
- **パフォーマンス**: メディアクエリで不要なリソースの読み込みを回避する
- **アクセシビリティ**: ズーム、テキストサイズ変更、キーボードナビゲーションをサポートする
- **コンテンツ優先**: デバイスではなくコンテンツの振る舞いに基づいてブレークポイントを設定する

### 避けるべきこと

- デバイス固有のブレークポイント（例: iPhone X専用）に依存する
- 固定幅レイアウトを多用する
- 高解像度画像を全デバイスに配信する（パフォーマンス悪化）
- `user-scalable=no` でズームを無効化する
- ブレークポイントで完全に異なるHTMLを生成する
- メディアクエリを過度に細分化する（保守性低下）
- コンテンツの優先順位を無視してレイアウトを最適化する
- モバイルでのホバー状態に依存する
- 横幅のみを考慮し高さを無視する

## リソース参照

### 📚 学習リソース

| レベル            | 説明                   | ファイル                            |
| :---------------- | :--------------------- | :---------------------------------- |
| **レベル1: 基礎** | 基本的な概念と用語     | `references/Level1_basics.md`       |
| **レベル2: 実務** | 実装に必要な知識       | `references/Level2_intermediate.md` |
| **レベル3: 応用** | 応用的な手法と最適化   | `references/Level3_advanced.md`     |
| **レベル4: 専門** | エキスパート向けの考察 | `references/Level4_expert.md`       |

### 🔧 スクリプトツール

```bash
# スキル構造の検証
node .claude/skills/responsive-design/scripts/validate-skill.mjs

# 使用記録と自動評価
node .claude/skills/responsive-design/scripts/log_usage.mjs --help
```

### 📋 テンプレート

- `assets/breakpoint-template.css` - ブレークポイント設計テンプレート
- `assets/grid-template.css` - フルードグリッドテンプレート
- `assets/responsive-image-template.html` - レスポンシブ画像テンプレート
- `assets/typography-template.css` - スケーラブルタイポグラフィテンプレート

### 📖 参考書籍

- 『Responsive Web Design』（Ethan Marcotte著）
  - フルードグリッドの原則
  - メディアクエリの効果的な使い方
  - 柔軟な画像とメディア

- 『Mobile First』（Luke Wroblewski著）
  - モバイルファースト設計の原則
  - 制約駆動設計
  - プログレッシブエンハンスメント

## 変更履歴

| Version | Date       | Changes                                    |
| ------- | ---------- | ------------------------------------------ |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に基づく初期バージョン作成 |
