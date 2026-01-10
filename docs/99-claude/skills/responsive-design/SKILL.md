---
name: responsive-design
description: |
  レスポンシブWebデザインのベストプラクティスを提供する専門スキル。モバイルファースト、フルードグリッド、メディアクエリ、ブレークポイント設計、画像最適化、タイポグラフィのスケーリング、タッチターゲット設計を包括的にサポートする。プロジェクト固有のTailwind CSS設計システム、8pxグリッド、Electron対応を含む。

  Anchors:
  • Responsive Web Design (Ethan Marcotte) / 適用: フルードグリッド・メディアクエリ設計 / 目的: デバイス横断的なUI設計の基礎
  • Mobile First (Luke Wroblewski) / 適用: モバイルファースト設計手法 / 目的: 制約駆動設計とプログレッシブエンハンスメント
  • 16-ui-ux-guidelines.md / 適用: プロジェクト固有のデザインシステム / 目的: Tailwind CSS・Electron対応・WCAG準拠

  Trigger:
  Use when implementing responsive layouts, designing breakpoints, creating mobile-first styles, optimizing images for multiple viewports, or ensuring cross-device compatibility.
  breakpoint, media query, mobile first, fluid grid, viewport, responsive layout, adaptive design, flexible images, srcset, clamp, レスポンシブ, ブレークポイント, Tailwind

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

レスポンシブWebデザインのベストプラクティスを提供するスキル。フルードグリッド、柔軟な画像、メディアクエリの3つの技術的基盤を活用し、あらゆるデバイスで適切に機能するUIを構築する。プロジェクト固有の設計システム（Tailwind CSS、8pxグリッド、Electron対応）を統合。

## プロジェクト固有ブレークポイント

| ブレークポイント | 値     | 対象デバイス                           |
| ---------------- | ------ | -------------------------------------- |
| sm               | 640px  | 大型スマートフォン（横向き）           |
| md               | 768px  | タブレット（縦向き）                   |
| lg               | 1024px | タブレット（横向き）、小型ラップトップ |
| xl               | 1280px | デスクトップ                           |
| 2xl              | 1536px | 大型デスクトップ                       |

**Electron固有**: 最小ウィンドウ800x600px、サイドバー切替はlg(1024px)基準

**詳細**: See [references/project-design-system.md](references/project-design-system.md)

## ワークフロー

### Phase 1: コンテキスト分析

**目的**: デザイン要件とデバイス要件を整理する

**アクション**:

1. 対象デバイス、ビューポート範囲、コンテンツ優先度を明確化
2. 技術的制約とパフォーマンス目標を整理
3. 必要なテンプレートとパターンを特定

**Task**: `agents/analyze-context.md` を参照

### Phase 2: デザイン実装

**目的**: レスポンシブデザインを実装する

**アクション**:

1. モバイルファーストアプローチでベースラインを作成
2. プロジェクト固有ブレークポイント（sm/md/lg/xl/2xl）でメディアクエリ実装
3. 8pxグリッドシステム、柔軟な画像、スケーラブルタイポグラフィを実装

**Task**: `agents/implement-design.md` を参照

### Phase 3: 検証と記録

**目的**: 実装の検証と記録の保存

**アクション**:

1. 各ブレークポイントでの動作確認（375px〜1920px）
2. パフォーマンス、アクセシビリティ（WCAG 2.1 AA）、ユーザビリティを検証
3. `scripts/log_usage.mjs` を実行して記録を残す

**Task**: `agents/validate-design.md` を参照

## Task仕様ナビ

| Task             | 起動タイミング | 入力             | 出力           |
| ---------------- | -------------- | ---------------- | -------------- |
| analyze-context  | Phase 1開始時  | プロジェクト要件 | デザイン要件書 |
| implement-design | Phase 2開始時  | デザイン要件書   | 実装コード     |
| validate-design  | Phase 3開始時  | 実装コード       | 検証レポート   |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照

## ベストプラクティス

### すべきこと

| プラクティス             | 説明                                                             |
| ------------------------ | ---------------------------------------------------------------- |
| モバイルファースト       | 最小ビューポートから設計し、プログレッシブエンハンスメントを適用 |
| 8pxグリッドシステム      | spacing-2(8px)〜spacing-16(64px)でスペーシングを統一             |
| Tailwindブレークポイント | sm/md/lg/xl/2xlのプロジェクト固有値を使用                        |
| 柔軟な画像               | `max-width: 100%` とsrcset/picture要素で画像を最適化             |
| タッチターゲット         | 最小44×44pxのタッチ可能領域を確保                                |
| ダークモード対応         | light/dark/systemの3モード、セマンティックカラー使用             |
| アクセシビリティ         | WCAG 2.1 AA準拠、コントラスト比4.5:1以上、フォーカス管理         |
| prefers-reduced-motion   | アニメーション簡略化オプションを提供                             |

### 避けるべきこと

| アンチパターン                   | 問題                               |
| -------------------------------- | ---------------------------------- |
| デバイス固有のブレークポイント   | iPhone X専用等は保守性が低下       |
| 固定幅レイアウト                 | 柔軟性がなくレスポンシブに適さない |
| 8px倍数以外のスペーシング        | デザインシステムの一貫性が崩れる   |
| 高解像度画像を全デバイスに配信   | パフォーマンスが悪化               |
| `user-scalable=no`でズーム無効化 | アクセシビリティ違反               |
| ホバー状態への依存（モバイル）   | タッチデバイスで機能しない         |
| ハードコードされた色値           | ダークモード対応が困難             |

## リソース参照

### references/（プロジェクト固有設計）

| リソース                     | パス                                                                           | 内容                                                  |
| ---------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| プロジェクトデザインシステム | See [references/project-design-system.md](references/project-design-system.md) | ブレークポイント、8pxグリッド、カラー、タイポグラフィ |

### scripts/（決定論的処理）

| スクリプト      | 用途               | 使用例                                                          |
| --------------- | ------------------ | --------------------------------------------------------------- |
| `log_usage.mjs` | フィードバック記録 | `node scripts/log_usage.mjs --result success --phase "Phase 3"` |

### assets/（テンプレート）

| テンプレート                     | 用途                                 |
| -------------------------------- | ------------------------------------ |
| `breakpoint-template.css`        | プロジェクト固有ブレークポイント設計 |
| `grid-template.css`              | 8pxグリッドシステム                  |
| `responsive-image-template.html` | レスポンシブ画像テンプレート         |
| `typography-template.css`        | Tailwindタイポグラフィスケール       |

## 変更履歴

| Version | Date       | Changes                                              |
| ------- | ---------- | ---------------------------------------------------- |
| 3.0.0   | 2026-01-02 | 16-ui-ux-guidelines.md準拠・プロジェクト固有要件統合 |
| 2.1.0   | 2026-01-02 | 18-skills.md仕様完全準拠・assetsとscripts追加        |
| 2.0.0   | 2026-01-02 | 18-skills.md仕様に完全準拠・構造改善                 |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に基づく初期バージョン作成           |
