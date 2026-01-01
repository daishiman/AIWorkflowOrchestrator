---
name: prettier-integration
description: |
  ESLintとPrettierの統合とフォーマット自動化の専門知識を提供します。
  責務分離、競合解決、エディタ統合、保存時自動実行を設計します。

anchors:
  - prettier-eslint統合: ESLintとPrettierの役割分担と競合解決戦略
  - フォーマット自動化: 保存時自動実行とCI/CDパイプライン統合
  - エディタ連携: VS Code、IDE等での統合設定
  - ルール競合管理: stylingルール重複の検出と解決

triggers: |
  コードフォーマット設定、Prettier導入、自動整形ルール策定、
  ESLint・Prettier競合解決時に使用。

allowed-tools:
  - bash: スクリプト実行
  - node: JavaScriptスクリプト実行
  - edit: ファイル編集
  - read: ファイル読み取り

references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# Prettier統合スキル

## 概要

ESLintとPrettierの統合とフォーマット自動化の専門知識。
責務分離、競合解決、エディタ統合、保存時自動実行を設計します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## Task仕様ナビ

| Task             | 説明                                       | リソース                 | 難易度 |
| ---------------- | ------------------------------------------ | ------------------------ | ------ |
| Prettier基本導入 | Prettierのインストールと基本設定           | Level1_basics.md         | 初級   |
| ESLint競合解決   | ESLintとPrettierのルール競合を解決         | conflict-resolution.md   | 中級   |
| エディタ統合     | VS CodeやIDEでの保存時自動フォーマット設定 | editor-integration.md    | 中級   |
| 自動化戦略設計   | CI/CDパイプラインでのフォーマット自動化    | automation-strategies.md | 上級   |
| 責務分離設計     | lintとformatの責務を最適に分離             | Level2_intermediate.md   | 上級   |
| 全社標準化       | 組織全体のコード品質基準の構築             | Level3_advanced.md       | 上級   |

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す

## ベストプラクティス

### すべきこと

- ESLintとPrettierを統合する時は責務分離を明確にする
- フォーマットルールの競合を解決する時はconflict-resolution.mdを確認する
- エディタでの保存時自動フォーマットを設定する時はeditor-integration.mdを参照する
- lint/formatの責務を分離する時はLevel2_intermediate.mdのパターンに従う
- 自動フォーマット適用戦略を設計する時はautomation-strategies.mdを参考にする

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける
- ESLintのstyling rulesとPrettierルールを重複設定しない
- 手動フォーマットと自動フォーマットの混在を避ける
- CI/CDパイプラインなしで本番環境にPrettierを導入しない

## リソース参照

### レベル別ガイド

| リソース                           | 概要                               |
| ---------------------------------- | ---------------------------------- |
| `references/Level1_basics.md`       | Prettier基本概念と初期セットアップ |
| `references/Level2_intermediate.md` | ESLint統合と実務パターン           |
| `references/Level3_advanced.md`     | 大規模プロジェクト向け応用パターン |
| `references/Level4_expert.md`       | 組織全体への展開と最適化           |

### 専門ガイド

| リソース                             | 用途                             |
| ------------------------------------ | -------------------------------- |
| `references/automation-strategies.md` | CI/CDパイプライン統合戦略        |
| `references/conflict-resolution.md`   | ESLint・Prettier競合解決パターン |
| `references/editor-integration.md`    | VS Code・IDE連携設定             |
| `references/legacy-skill.md`          | 旧SKILL.mdの全文                 |

### スクリプト

| スクリプト                   | 機能                     |
| ---------------------------- | ------------------------ |
| `scripts/format-check.mjs`   | Prettierフォーマット検証 |
| `scripts/log_usage.mjs`      | 使用記録・自動評価       |
| `scripts/validate-skill.mjs` | スキル構造検証           |

### テンプレート

| テンプレート                     | 用途                         |
| -------------------------------- | ---------------------------- |
| `assets/prettierrc-base.json` | 基本Prettier設定テンプレート |
| `assets/vscode-settings.json` | VS Code設定テンプレート      |

## 変更履歴

| Version | Date       | Changes                                                                                            |
| ------- | ---------- | -------------------------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に基づいて更新：YAML frontmatter拡張、Task仕様ナビ追加、リソース参照を表形式に統一 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                        |
