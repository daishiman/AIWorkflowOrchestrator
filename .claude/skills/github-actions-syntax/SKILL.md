---
name: GitHub Actions構文
description: |
  GitHub Actionsワークフローの構文、イベントトリガー、ジョブ定義、ステップ実行、パーミッション管理、環境変数設定について実装指針を提供。イベント駆動パイプラインの構築と管理を支援します。

  **Anchor**:
  - 基礎: `references/Level1_basics.md` - 基本概念とワークフロー構造
  - 実務: `references/Level2_intermediate.md` - 実装パターンと設定例
  - 応用: `references/Level3_advanced.md` - 複雑なワークフロー構成とベストプラクティス
  - 専門: `references/Level4_expert.md` - パフォーマンス最適化と高度なテクニック
  - リファレンス: `references/workflow-syntax-reference.md` - 完全構文リファレンス
  - イベント: `references/event-triggers.md` - トリガーイベント詳細ガイド
  - ジョブ: `references/jobs-and-steps.md` - ジョブとステップの構成ガイド
  - パーミッション: `references/permissions-and-env.md` - セキュリティ設定と環境変数

  **Trigger**:
  - GitHub Actionsワークフローファイルの作成・編集が必要な場合
  - ワークフロー構文エラーのトラブルシューティング
  - イベントトリガーの設定と条件分岐の実装
  - ジョブの並列実行、依存関係、マトリックス戦略の構成
  - パーミッション、環境変数、シークレット管理の設定
  - ワークフロー実行フローのデバッグと最適化

allowed-tools:
  - Glob
  - Grep
  - Read
  - Edit
  - Bash
---

# GitHub Actions構文

## 概要

GitHub Actionsワークフロー構文の完全なリファレンスガイド。ワークフローファイルの基本構造からイベントトリガー、ジョブ定義、ステップ実行、パーミッション管理、環境変数設定まで、CI/CDパイプラインの実装に必要なすべての要素をカバーしています。

このスキルは以下の要素を中心に学習を進めます：

- ワークフロー構造と基本構文
- イベントトリガーの種類と条件付けロジック
- ジョブの定義と実行制御（順序実行、並列実行、マトリックス）
- ステップの実装とアクション活用
- パーミッションとセキュリティ設定
- 環境変数とシークレット管理

詳細な内容は各リソースを参照してください。

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

## Task仕様ナビ

| タスク                             | 関連リソース           | 主要概念                                                 | 難易度 |
| ---------------------------------- | ---------------------- | -------------------------------------------------------- | ------ |
| ワークフロー基本構造の理解         | Level1_basics.md       | yaml形式、トップレベルキー、name/on/jobs                 | 初級   |
| イベントトリガーの設定             | event-triggers.md      | push/pull_request/schedule/workflow_dispatch             | 初級   |
| ジョブの定義と実行順序             | jobs-and-steps.md      | jobs、runs-on、steps、needs（依存関係）                  | 中級   |
| マトリックス戦略の実装             | Level2_intermediate.md | matrix、include/exclude、複数環境テスト                  | 中級   |
| パーミッション管理                 | permissions-and-env.md | permissions（read/write）、スコープ、GITHUB_TOKEN        | 中級   |
| 環境変数とシークレット             | permissions-and-env.md | env、secrets、github.env、コンテキスト参照               | 中級   |
| 条件付き実行ロジック               | Level2_intermediate.md | if条件、continue-on-error、failure()など                 | 中級   |
| アクション活用とカスタムアクション | Level3_advanced.md     | 公式アクション、コミュニティアクション、独自実装         | 上級   |
| ワークフロー最適化とキャッシング   | Level3_advanced.md     | キャッシュ戦略、実行時間短縮、並列化                     | 上級   |
| デバッグとトラブルシューティング   | Level3_advanced.md     | debug mode、ログ出力、run命令のトレース                  | 上級   |
| 高度なワークフローパターン         | Level4_expert.md       | 動的スケーリング、クロスプラットフォーム、動的ジョブ生成 | 専門   |
| パフォーマンス最適化               | Level4_expert.md       | キャッシュ最適化、リソース管理、実行時短縮               | 専門   |

## ベストプラクティス

### すべきこと

- ワークフローファイル（.github/workflows/\*.yml）を作成・編集する前に仕様を確認する
- イベントトリガーの適切な設定で不要な実行を防ぐ
- ジョブに適切な permissions を明示的に設定する
- シークレットは環境変数ではなく secrets を使用する
- 複雑なロジックはローカルスクリプトに記述し、アクションから呼び出す
- マトリックス戦略を活用して複数環境のテストを効率化する
- キャッシュを戦略的に使用して実行時間を短縮する

### 避けるべきこと

- シークレットをワークフロー定義やログに露出させる
- アンチパターンや注意点を確認せずに進める
- 過度に複雑なワークフロー設計で保守性を損なう
- 不必要なジョブを並列実行して実行時間を増やす
- キャッシュキーの設計が不適切でキャッシュミスが多発する
- パーミッションを最小限の原則（Principle of Least Privilege）に従わない
- 本番環境で一度もテストしていないワークフローを使用する

## リソース参照

### 学習リソース

| リソース                                 | 説明                                   | 対象者 |
| ---------------------------------------- | -------------------------------------- | ------ |
| `references/Level1_basics.md`             | ワークフロー基本概念と構造             | 初心者 |
| `references/Level2_intermediate.md`       | 実装パターンと実践例                   | 中級者 |
| `references/Level3_advanced.md`           | 複雑な構成とベストプラクティス         | 上級者 |
| `references/Level4_expert.md`             | パフォーマンス最適化と高度なテクニック | 専門家 |
| `references/workflow-syntax-reference.md` | 完全な構文リファレンス                 | 全員   |
| `references/event-triggers.md`            | イベントトリガー詳細ガイド             | 全員   |
| `references/jobs-and-steps.md`            | ジョブとステップの構成ガイド           | 全員   |
| `references/permissions-and-env.md`       | パーミッションと環境変数設定           | 全員   |

### テンプレートと検証

| テンプレート/スクリプト            | 用途                               |
| ---------------------------------- | ---------------------------------- |
| `assets/workflow-template.yaml` | ワークフロー作成の基本テンプレート |
| `scripts/validate-skill.mjs`       | スキル構造の検証                   |
| `scripts/validate-workflow.mjs`    | ワークフローYAML構文の検証         |
| `scripts/log_usage.mjs`            | スキル使用記録の自動評価           |

## 変更履歴

| Version | Date       | Changes                                                                                                          |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に基づいた全体構成の更新。YAML frontmatterをAnchor/Trigger形式に改善。Task仕様ナビテーブル追加。 |
| 1.0.0   | 2025-12-24 | 初版リリース：基本的なスキル構造とリソース参照の実装                                                             |
