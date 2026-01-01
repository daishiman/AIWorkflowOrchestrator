---
name: log-rotation-strategies
description: |
  Node.jsアプリケーションのログローテーション戦略を専門とするスキル。
  PM2、logrotate、Winston等を活用した効率的なログ管理を設計します。

  Anchors:
  • 『Site Reliability Engineering』（Google） / 適用: ログ管理 / 目的: 運用効率化

  Trigger:
  ログローテーション設定時、ログ管理戦略時、ディスク容量最適化時に使用
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Log Rotation Strategies

## 概要

Node.jsアプリケーションのログローテーション戦略を専門とするスキル。PM2、logrotate、Winston等を活用した効率的なログ管理を設計・実装します。

本スキルは、ディスク容量の効率的な管理、ログファイルのサイズ・時間ベースローテーション、集約ログシステムの構築を支援します。詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

ログローテーション戦略の実装は、以下の4つのTaskで段階的に進めます。
各Taskは独立した作業窓として実行され、メインコンテキストに試行錯誤を持ち込みません。

### Phase 1: 要件分析

**Task**: `agents/analyze-requirements.md`

**目的**: アプリケーションのログ生成パターンを定量的に分析し、適切な戦略策定の基礎データを収集する

**入力**:

- アプリケーション情報（アプリ名、ログ出力先、使用ライブラリ）
- ビジネス要件（法的要件、コンプライアンス要件、運用ポリシー）

**出力**: 要件分析レポート（ログ生成量、ディスク使用状況、保持要件、推奨事項）

**参照リソース**:

- `references/Level1_basics.md` - 基本概念とログローテーションの必要性
- `references/Level2_intermediate.md` - 実測方法と分析観点
- `scripts/analyze-log-usage.mjs` - ログ使用量分析スクリプト

### Phase 2: 戦略設計

**Task**: `agents/design-strategy.md`

**目的**: 要件分析結果に基づき、最適なローテーション方式を選択し、具体的なパラメータを決定する

**入力**: 要件分析レポート（Phase 1の出力）

**出力**: ログローテーション戦略設計書（方式選択、パラメータ設定、ログ集約判断、実装手順）

**参照リソース**:

- `references/rotation-patterns.md` - サイズベース・時間ベース・ハイブリッド方式の選択基準
- `references/log-aggregation.md` - ログ集約システムの選定基準（ELK/Datadog/CloudWatch/Loki）
- `references/Level3_advanced.md` - 複雑な戦略とトレードオフ分析

### Phase 3: 実装

**Task**: `agents/implement-rotation.md`

**目的**: 戦略設計書に基づき、ログローテーション設定を実装し、動作確認を行う

**入力**: ログローテーション戦略設計書（Phase 2の出力）

**出力**: 実装完了レポート（設定ファイルパス、適用パラメータ、検証結果、変更内容）

**参照リソース**:

- `references/pm2-logrotate-guide.md` - PM2ログローテーション設定ガイド
- `assets/winston-rotation.template.ts` - Winston DailyRotateFile設定テンプレート
- `references/Level2_intermediate.md` - 実装パターンとベストプラクティス

### Phase 4: 検証

**Task**: `agents/validate-setup.md`

**目的**: 実装されたローテーション設定を総合的に検証し、本番運用可否を判断する

**入力**: 実装完了レポート（Phase 3の出力）

**出力**: 検証完了レポート（動作検証、エッジケーステスト、問題特定、改善提案、監視設定推奨）

**参照リソース**:

- `scripts/analyze-log-usage.mjs` - ログ使用量分析・検証
- `references/Level3_advanced.md` - 高度な検証観点とエッジケース
- `references/Level4_expert.md` - 大規模システムにおける検証項目

## ベストプラクティス

### すべきこと

- ログ戦略を立案する際、アプリケーションのログ生成量を事前に分析する
- サイズベース・時間ベース・ハイブリッド方式の選択基準を確認する
- PM2ログ設定では ecosystem.config.js に `pm2-logrotate` を統合する
- ログ圧縮設定（compress: true）でディスク使用量を削減する
- ログ集約（ELK/Datadog/CloudWatch/Loki）の導入を検討する
- 定期的にログディレクトリのサイズを監視・分析する

### 避けるべきこと

- ログローテーション設定なしで無制限にログを出力し続けない
- ローテーション世代数を指定せず、ディスク容量を圧迫しない
- ログレベルやフォーマットを標準化せずに複数のアプリケーションを運用しない
- 重要なログを圧縮・削除してしまう前に、集約システムへの送信を確認しない
- Winston や logrotate の設定を適切に検証せずに本番環境へデプロイしない

## Task仕様ナビ

| Task                   | 説明                                         | 参照リソース                        | 実装パターン                                  |
| ---------------------- | -------------------------------------------- | ----------------------------------- | --------------------------------------------- |
| **基本設定**           | PM2 + logrotate の基本設定                   | `Level1_basics.md`                  | ecosystem.config.js の `env` 設定             |
| **ローテーション戦略** | サイズベース・時間ベース・ハイブリッドの選択 | `rotation-patterns.md`              | `max_size`, `max_days`, `compress` パラメータ |
| **Winston統合**        | Winston DailyRotateFile の実装               | `Level2_intermediate.md`            | TypeScript テンプレート参照                   |
| **ログ集約**           | ELK/Datadog/CloudWatch/Loki への統合         | `log-aggregation.md`                | サービス選定基準と実装例                      |
| **ディスク最適化**     | ログ世代管理と圧縮戦略                       | `Level3_advanced.md`                | 圧縮率分析と保持期間設計                      |
| **監視・分析**         | ログ使用量の分析と最適化                     | スクリプト（analyze-log-usage.mjs） | ディレクトリサイズ・世代数・圧縮率            |

## リソース参照

### Learning Resources

| レベル              | リソース                            | 説明                                                           |
| ------------------- | ----------------------------------- | -------------------------------------------------------------- |
| **Level 1（基礎）** | `references/Level1_basics.md`       | ログローテーションの基本概念、PM2 + logrotate の基本設定       |
| **Level 2（実務）** | `references/Level2_intermediate.md` | Winston DailyRotateFile、本番環境での実装パターン              |
| **Level 3（応用）** | `references/Level3_advanced.md`     | ディスク最適化、複雑なローテーション戦略、パフォーマンス最適化 |
| **Level 4（専門）** | `references/Level4_expert.md`       | 大規模分散システムでのログ管理、高度なトラブルシューティング   |

### Domain-Specific Guides

| リソース                            | 説明                                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `references/pm2-logrotate-guide.md` | PM2ログローテーション設定、max_size/retain/compress、ecosystem.config.js統合 |
| `references/rotation-patterns.md`   | サイズベース・時間ベース・ハイブリッド方式の選択基準と実装パターン           |
| `references/log-aggregation.md`     | ログ集約オプション（ELK/Datadog/CloudWatch/Loki）、サービス選定基準          |
| `references/legacy-skill.md`        | 旧SKILL.mdの全文（履歴管理用）                                               |

### Implementation Templates

| テンプレート                          | 説明                                                  |
| ------------------------------------- | ----------------------------------------------------- |
| `assets/winston-rotation.template.ts` | Winston DailyRotateFile設定テンプレート（TypeScript） |

### Scripts & Tools

| スクリプト                      | 説明                                                 | 使用例                              |
| ------------------------------- | ---------------------------------------------------- | ----------------------------------- |
| `scripts/analyze-log-usage.mjs` | ログ使用量分析（ディレクトリサイズ、世代数、圧縮率） | `node analyze-log-usage.mjs --help` |
| `scripts/log_usage.mjs`         | 使用記録・自動評価スクリプト                         | `node log_usage.mjs --help`         |
| `scripts/validate-skill.mjs`    | スキル構造検証スクリプト                             | `node validate-skill.mjs --help`    |

## 変更履歴

| Version | Date       | Changes                                                                                        |
| ------- | ---------- | ---------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                    |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様への準拠、YAML frontmatter更新、Task仕様ナビ追加、リソース参照を統合テーブル化 |
