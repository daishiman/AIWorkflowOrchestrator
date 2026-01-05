---
name: claude-code-hooks
description: |
  Claude Code の hooks 設計・実装・検証を支援し、セッション/ツール連携の自動化と品質ゲートを安全に構築するスキル。
  イベント（SessionStart/PreToolUse/PostToolUse/Stop）の選定、スクリプト設計、検証フローを整理する。

  Anchors:
  • Claude Code Documentation / 適用: Hook events and configuration / 目的: 正しいイベント選定
  • Continuous Delivery (Jez Humble) / 適用: 自動化と検証 / 目的: 品質ゲート設計
  • The Pragmatic Programmer (Hunt/Thomas) / 適用: 自動化と安全性 / 目的: 安全なフック運用

  Trigger:
  Use when configuring Claude Code hooks, designing pre/post tool automation, writing hook scripts, or validating hook-driven workflows.
  claude code hooks, pretooluse, posttooluse, sessionstart, stop, hook scripts, automation
---
# claude-code-hooks

## 概要

Claude Code の hooks を設計・実装・検証し、開発フローの自動化と品質ゲートを安全に構築する。

## ワークフロー

### Phase 1: 要件整理

**目的**: フックの目的とイベント選定を明確にする。

**アクション**:

1. 対象タスクの目的と禁止事項を整理する。
2. 発火イベント（SessionStart/PreToolUse/PostToolUse/Stop）を選定する。
3. 監視対象の品質指標とログ方針を定義する。

**Task**: `agents/analyze-hook-requirements.md` を参照

### Phase 2: 設計と実装

**目的**: フック構成とスクリプトの仕様を固める。

**アクション**:

1. フック構成（対象イベント、条件、実行順）を設計する。
2. スクリプトの責務と入出力を定義する。
3. 既存テンプレートを使って安全な実装方針を決める。

**Task**: `agents/design-hook-configuration.md` を参照

### Phase 3: 検証と記録

**目的**: フック動作と品質ゲートを検証し記録する。

**アクション**:

1. 検証スクリプトで構成と品質指標を確認する。
2. エラーと警告の原因を記録し、改善点を整理する。
3. 使用ログと評価情報を更新する。

**Task**: `agents/validate-hook-integration.md` を参照

## Task仕様ナビ

| Task | 起動タイミング | 入力 | 出力 |
| --- | --- | --- | --- |
| analyze-hook-requirements | Phase 1開始時 | 目的/制約/対象イベント | 要件整理メモ、イベント選定表 |
| design-hook-configuration | Phase 2開始時 | 要件整理メモ | フック構成案、スクリプト設計案 |
| validate-hook-integration | Phase 3開始時 | フック構成案 | 検証レポート、ログ更新内容 |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

## ベストプラクティス

### すべきこと

| 推奨事項 | 理由 |
| --- | --- |
| 目的と禁止事項を先に定義する | 予期しない副作用を避けるため |
| 参照資料は段階的に読み込む | トークンと時間を節約するため |
| 検証スクリプトを先に実行する | 早期に失敗を検出するため |

### 避けるべきこと

| 禁止事項 | 問題点 |
| --- | --- |
| すべてのイベントに一律でフックを付与する | 実行コストと誤動作が増える |
| ログ方針を決めずに実行する | 調査や改善が困難になる |
| 検証抜きで運用に入る | 品質ゲートが形骸化する |

## リソース参照

### scripts/（決定論的処理）

| スクリプト | 機能 |
| --- | --- |
| `scripts/log_usage.mjs` | 使用記録と評価メトリクス更新 |
| `scripts/validate-claude-quality.mjs` | 品質指標の検証 |
| `scripts/validate-skill.mjs` | スキル構造の検証 |

### references/（詳細知識）

| リソース | パス | 読込条件 |
| --- | --- | --- |
| レベル1 基礎 | [references/Level1_basics.md](references/Level1_basics.md) | 初回整理時 |
| レベル2 実務 | [references/Level2_intermediate.md](references/Level2_intermediate.md) | 実装前の整理時 |
| レベル3 応用 | [references/Level3_advanced.md](references/Level3_advanced.md) | 情報量が多い時 |
| レベル4 専門 | [references/Level4_expert.md](references/Level4_expert.md) | 改善ループ時 |
| ガイドライン | [references/claude-code-guidelines.md](references/claude-code-guidelines.md) | 設計判断時 |
| 品質指標 | [references/quality-metrics.md](references/quality-metrics.md) | 品質ゲート設計時 |
| 旧スキル | [references/legacy-skill.md](references/legacy-skill.md) | 互換確認時 |
| イベント一覧 | [references/hook-event-matrix.md](references/hook-event-matrix.md) | イベント選定時 |

### assets/（テンプレート・素材）

| アセット | 用途 |
| --- | --- |
| `assets/claude-commit-template.sh` | コミット前検証テンプレート |
| `assets/claude-quality-template.sh` | 品質ゲートテンプレート |

### 運用ファイル

| ファイル | 目的 |
| --- | --- |
| `EVALS.json` | レベル評価・メトリクス管理 |
| `LOGS.md` | 実行ログの蓄積 |
| `CHANGELOG.md` | 改善履歴の記録 |
