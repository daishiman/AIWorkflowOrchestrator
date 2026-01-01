---
name: localization-i18n
description: |
  多言語対応ドキュメントの設計・翻訳準備スキル。国際化（i18n）と地域化（l10n）のベストプラクティスを提供し、翻訳しやすい原文作成、多言語構造設計、品質保証を支援する。

  Anchors:
  • The Pragmatic Programmer / 適用: 段階的な多言語対応実装 / 目的: 既存システムへの影響を最小化
  • Everybody Writes (Ann Handley) / 適用: 翻訳準備ライティング / 目的: 明確で簡潔、翻訳しやすい原文作成
  • The Culture Map (Erin Meyer) / 適用: 文化的配慮 / 目的: 地域特性を考慮したローカライゼーション戦略

  Trigger:
  Use when designing multilingual documentation structure, preparing content for translation, implementing i18n frameworks, or validating localization quality. Keywords: localization, i18n, l10n, translation-ready, multilingual, culture-specific, placeholder design.
---

# Localization & i18n スキル

## 概要

多言語対応ドキュメントの設計・翻訳準備スキル。国際化（i18n）と地域化（l10n）のベストプラクティスを提供し、計画から実装、品質保証まで段階的なワークフローで支援する。

---

## ワークフロー

### Phase 1: Planning（計画策定）

**目的**: ローカライゼーションプロジェクトの全体計画を策定

**Task**: `agents/planning.md`

**入力**:

- プロジェクト要件（対象製品/サービス、ビジネス目標）
- 既存ドキュメント/UI文字列

**出力**:

- ローカライゼーション戦略計画書
  - 対象言語・地域の優先順位
  - 文化的配慮事項
  - リソース計画とタイムライン

**実行タイミング**: プロジェクト開始時、対象市場が定義された段階

**参照リソース**:

- `references/Level1_basics.md`: 基本概念と用語
- `references/translation-ready-writing.md`: 文化依存表現リスト（§避けるべきパターン）

---

### Phase 2: Content Preparation（コンテンツ準備）

**目的**: 翻訳に適した原文コンテンツを作成または既存コンテンツをリファクタリング

**Task**: `agents/content-preparation.md`

**入力**:

- ローカライゼーション戦略計画書（Phase 1の成果物）
- 既存コンテンツまたは新規コンテンツ草稿

**出力**:

- 翻訳準備済みコンテンツ
- 統一用語集
- プレースホルダー定義
- 翻訳者向けコンテキストシート

**実行タイミング**: Planning完了後、技術実装の前

**スクリプト**:

```bash
# i18n対応度の自動チェック
node scripts/check-translation-ready.mjs <file-path>
```

**参照リソース**:

- `references/translation-ready-writing.md`: 翻訳しやすい文章の原則（全セクション）
- `references/Level2_intermediate.md`: リソース運用ガイド

---

### Phase 3: Implementation（技術実装）

**目的**: i18nフレームワークを実装し、多言語対応構造を構築

**Task**: `agents/implementation.md`

**入力**:

- 翻訳準備済みコンテンツ（Phase 2の成果物）
- プロジェクトコードベース

**出力**:

- i18n実装コード
  - i18n設定ファイル
  - 言語別リソースファイル
  - 実装コード変更履歴
- 実装ドキュメント

**実行タイミング**: Content Preparation完了後、リリース前

**参照リソース**:

- `assets/multilingual-doc-template.md`: 多言語ファイル構造テンプレート
- `references/Level3_advanced.md`: 高度なi18n実装パターン

---

### Phase 4: Quality Assurance（品質保証）

**目的**: 実装されたローカライゼーション機能の品質を多層的に検証

**Task**: `agents/quality-assurance.md`

**入力**:

- i18n実装コード（Phase 3の成果物）
- ローカライゼーション戦略計画書（Phase 1の成果物）

**出力**:

- 品質評価レポート
  - 自動チェック結果
  - 翻訳品質評価
  - 視覚的品質評価
  - 文化的適合性評価
- 品質改善アクションアイテム

**実行タイミング**: Implementation完了後、リリース判定前

**スクリプト**:

```bash
# 品質チェック再実行
node scripts/check-translation-ready.mjs <file-path>

# 実行記録の保存
node scripts/log_usage.mjs --result success --phase "quality-assurance"
```

**参照リソース**:

- `references/translation-ready-writing.md`: 品質チェック項目（§品質チェック項目）
- `references/Level4_expert.md`: 専門的な品質基準

---

## Task仕様ナビゲーション

各Taskの詳細な仕様は `agents/` ディレクトリに配置されています。

| Task                | ファイル                        | 役割                           | 専門家参照                |
| ------------------- | ------------------------------- | ------------------------------ | ------------------------- |
| Planning            | `agents/planning.md`            | 戦略計画策定、文化的配慮       | Lindy Greer（組織文化）   |
| Content Preparation | `agents/content-preparation.md` | 翻訳準備ライティング、用語管理 | Ann Handley（コンテンツ） |
| Implementation      | `agents/implementation.md`      | i18n技術実装、TDD              | Kent Beck（開発方法論）   |
| Quality Assurance   | `agents/quality-assurance.md`   | 多層的品質検証                 | Lisa Crispin（品質保証）  |

**Task実行の流れ**:

1. 各Taskは前のTaskの成果物を入力として受け取る
2. Taskの仕様書（agents/\*.md）には役割、入力、出力、制約が明記されている
3. 実行直前に該当Taskの仕様書を読み込む（Progressive Disclosure）

---

## ベストプラクティス

### すべきこと

- **計画段階で文化的配慮を明確化**: 対象地域の文化的特性を事前に調査し、文化依存表現のリストを作成する
- **用語の一貫性を保つ**: 用語集を作成し、プロジェクト全体で統一した用語を使用する
- **名前付きプレースホルダーを使用**: `{user_name}` のように変数名を明示し、翻訳者にコンテキストを提供する
- **段階的に実装**: 1モジュール/1ファイルずつi18n化し、各ステップでテストを実行する
- **自動チェックを活用**: `scripts/check-translation-ready.mjs` で継続的に品質を検証する

### 避けるべきこと

- **文化依存表現の使用**: 慣用句、地域特有の例示を避け、グローバルに通じる表現を使用する
- **番号のみのプレースホルダー**: `{0}` ではなく `{user_name}` のように意味のある名前を付ける
- **一度にすべてをi18n化**: 段階的なアプローチを取り、各ステップで動作を確認する
- **翻訳者へのコンテキスト不足**: 用語集、プレースホルダー説明、スタイルガイドを必ず提供する
- **品質チェックをスキップ**: 実装後は必ずQuality Assuranceフェーズで多層的に検証する

---

## リソース参照

### references/ ディレクトリ

| ファイル                       | 内容                           | 読み込みタイミング |
| ------------------------------ | ------------------------------ | ------------------ |
| `Level1_basics.md`             | 基本概念、用語、前提条件       | スキル初回使用時   |
| `Level2_intermediate.md`       | リソース運用、スクリプト活用   | Phase 2以降        |
| `Level3_advanced.md`           | 高度な実装パターン             | Phase 3実装時      |
| `Level4_expert.md`             | 専門的な品質基準               | Phase 4検証時      |
| `translation-ready-writing.md` | 翻訳準備ライティング詳細ガイド | Phase 2で必読      |
| `legacy-skill.md`              | 旧SKILL.mdの全文（参考資料）   | 必要時のみ         |

**読み込みルール**:

- 基本的には必要なPhaseで該当するLevelを読み込む
- `translation-ready-writing.md` はPhase 2とPhase 4で参照頻度が高い
- 詳細な知識が必要な場合のみ該当referencesを読み込む（毎回読まない）

---

## スクリプト参照

### scripts/ ディレクトリ

#### check-translation-ready.mjs

**用途**: i18n対応度の自動チェック

**実行例**:

```bash
node scripts/check-translation-ready.mjs <file-path>
```

**チェック項目**:

- 文化依存表現の検出（慣用句、地域特有の例示）
- プレースホルダーの検証（名前付き、コンテキスト情報）
- 文構造チェック（1文の長さ、能動態）
- 用語一貫性の確認

**使用タイミング**: Phase 2（Content Preparation）とPhase 4（Quality Assurance）

---

#### log_usage.mjs

**用途**: 使用記録と自動評価

**実行例**:

```bash
node scripts/log_usage.mjs \
  --result success \
  --phase "quality-assurance" \
  --notes "すべてのチェックをパス"
```

**引数**:

- `--result`: `success` または `failure`（必須）
- `--phase`: 実行したフェーズ名（任意）
- `--agent`: 実行したエージェント名（任意）
- `--notes`: 追加のフィードバックメモ（任意）

**使用タイミング**: 各Phase完了時（特にPhase 4完了後は必須）

---

#### validate-skill.mjs

**用途**: スキル構造の検証

**実行例**:

```bash
node scripts/validate-skill.mjs
```

**検証項目**:

- SKILL.md の構造
- agents/ ディレクトリの存在とTask仕様
- references/ のリンク整合性
- scripts/ の実行可能性

**使用タイミング**: スキル更新後の検証

---

## アセット参照

### assets/ ディレクトリ

#### multilingual-doc-template.md

**用途**: 多言語ドキュメント構造テンプレート

**内容**:

- 言語別ディレクトリ構造
- 共通リソースの配置
- i18nファイルフォーマット例

**使用タイミング**: Phase 3（Implementation）でファイル構造を設計する際

---

## 関連スキル

このスキルは以下のスキルと組み合わせて使用できます：

- `api-documentation-best-practices`: API仕様の多言語対応
- `markdown-advanced-syntax`: 多言語Markdownドキュメントの構造設計
- `error-message-design`: エラーメッセージの多言語対応（`references/i18n-error-handling.md` 参照）

---

## 変更履歴

| Version | Date       | Changes                                                                           |
| ------- | ---------- | --------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md 仕様に準拠: agents/追加、frontmatter更新、Progressive Disclosure適用 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                       |
