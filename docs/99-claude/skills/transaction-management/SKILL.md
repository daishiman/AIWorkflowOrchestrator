---
name: transaction-management
description: |
  データベーストランザクション管理の専門スキル。
  ACID特性、分離レベル、デッドロック回避を提供します。

  Anchors:
  • 『Designing Data-Intensive Applications』（Martin Kleppmann）/ 適用: トランザクション設計 / 目的: データ整合性

  Trigger:
  トランザクション管理、ACID特性実装、データ整合性保証設計、トランザクション分離レベル決定、ロック戦略検討、ロールバック処理実装時に使用

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---

# Transaction Management

## 概要

ACID特性（Atomicity、Consistency、Isolation、Durability）を保証するトランザクション設計と実装を専門とするスキル。データベースやマイクロサービス環境におけるトランザクション管理、分離レベルの選択、ロック戦略の決定、ロールバック処理の実装など、データ整合性を保証する包括的なアプローチを提供します。

## ワークフロー

### Phase 1: 要件分析と設計準備

**目的**: トランザクション要件を明確化し、設計の基礎を構築する

**アクション**:

1. `references/Level1_basics.md` でトランザクション基礎を確認
2. ACID特性の要件を整理（Atomicity、Consistency、Isolation、Durabilityの各要件）
3. `references/acid-properties.md` でACID実装パターンを確認
4. ビジネス要件に基づく分離レベル候補を特定
5. `assets/transaction-design-template.md` で設計テンプレートを準備

### Phase 2: トランザクション戦略の実装

**目的**: 具体的なトランザクション管理戦略を実装する

**アクション**:

1. `references/Level2_intermediate.md` でトランザクション実装パターンを参照
2. 分離レベルの選択
   - `references/isolation-levels.md` で概要を確認
   - `references/isolation-levels-detail.md` で詳細を検討
3. ロック戦略の決定
   - `references/locking-strategies.md` でロック方式を検討
4. ロールバック処理の設計
   - `references/rollback-patterns.md` でロールバック戦略を参照
5. `scripts/analyze-transaction.mjs` でトランザクション設計を検証

### Phase 3: 検証と最適化

**目的**: トランザクション設計の妥当性を検証し、パフォーマンス最適化を実施

**アクション**:

1. `references/Level3_advanced.md` でトランザクション最適化技法を確認
2. `scripts/detect-long-transactions.mjs` で長時間トランザクションを検出
3. `assets/transaction-design-checklist.md` でチェックリストを実施
4. `scripts/validate-skill.mjs` でスキル適用状況を検証
5. `scripts/log_usage.mjs` で実行記録を保存
6. `references/Level4_expert.md` で専門的知見を確認（必要に応じて）

## Task仕様（ナビゲーション）

| Task                      | 起動タイミング | 入力             | 出力               |
| ------------------------- | -------------- | ---------------- | ------------------ |
| transaction-analysis      | Phase 1開始時  | ビジネス要件     | ACID要件定義書     |
| isolation-level-selection | Phase 2開始時  | ACID要件定義書   | 分離レベル決定書   |
| locking-strategy-design   | Phase 2中盤    | 分離レベル決定書 | ロック戦略設計書   |
| rollback-implementation   | Phase 2終盤    | ロック戦略設計書 | ロールバック設計書 |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照

## リソースマトリクス

| Task                      | リソース                                                       | スクリプト                     | テンプレート                             |
| ------------------------- | -------------------------------------------------------------- | ------------------------------ | ---------------------------------------- |
| transaction-analysis      | `references/acid-properties.md`                                | `analyze-transaction.mjs`      | `assets/transaction-design-template.md`  |
| isolation-level-selection | `references/isolation-levels.md`, `isolation-levels-detail.md` | -                              | -                                        |
| locking-strategy-design   | `references/locking-strategies.md`                             | -                              | -                                        |
| rollback-implementation   | `references/rollback-patterns.md`                              | -                              | -                                        |
| 検証・最適化              | `references/Level3_advanced.md`, `Level4_expert.md`            | `detect-long-transactions.mjs` | `assets/transaction-design-checklist.md` |

## ベストプラクティス

### すべきこと

- 最初に `references/Level1_basics.md` でトランザクションの基礎を理解する
- ACID特性の各要素（Atomicity、Consistency、Isolation、Durability）をビジネス要件に照らして評価する
- `references/isolation-levels.md` と `references/isolation-levels-detail.md` の両方を参照して、分離レベルを慎重に選択する
- `references/locking-strategies.md` でロック戦略のトレードオフ（パフォーマンス vs 整合性）を理解する
- `references/rollback-patterns.md` で適切なロールバック処理を選択する
- 定期的に `scripts/detect-long-transactions.mjs` で長時間トランザクションを検出し、最適化を検討する
- `assets/transaction-design-checklist.md` でチェックリストを実施し、設計漏れを防ぐ
- 複雑なトランザクション設計には `references/Level3_advanced.md` / `references/Level4_expert.md` を参照する

### 避けるべきこと

- ビジネス要件を確認せずに分離レベルを決定する
- 最も高い分離レベル（Serializable）をデフォルトで選択する（パフォーマンス低下のリスク）
- ロック戦略のトレードオフを無視する
- 長時間トランザクションをモニタリングしない
- ロールバック処理の実装を後付けにする
- 設計チェックリストを省略する

## リソース参照

### 基礎レベルリソース

| リソース                        | 説明                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `references/Level1_basics.md`   | トランザクション管理の基礎ガイド。ACID特性、トランザクションライフサイクル、基本的なパターンを解説 |
| `references/acid-properties.md` | ACID各特性（Atomicity、Consistency、Isolation、Durability）の詳細な実装ガイド                      |

### 実装レベルリソース

| リソース                                | 説明                                                                                                 |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `references/Level2_intermediate.md`     | トランザクション実装の実務ガイド。実装パターン、分離レベルの選択基準、ロック戦略の実装               |
| `references/isolation-levels.md`        | トランザクション分離レベル（READ UNCOMMITTED、READ COMMITTED、REPEATABLE READ、SERIALIZABLE）の概要  |
| `references/isolation-levels-detail.md` | トランザクション分離レベルの詳細解説。実装の違い、パフォーマンス特性、使い分け                       |
| `references/locking-strategies.md`      | ロック戦略の詳細ガイド。排他的ロック、共有ロック、デッドロック回避、パフォーマンス最適化             |
| `references/rollback-patterns.md`       | ロールバック処理のパターン集。トランザクション失敗時の正しい対応、リトライ戦略、補償トランザクション |

### 最適化レベルリソース

| リソース                        | 説明                                                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `references/Level3_advanced.md` | トランザクション最適化の応用ガイド。マルチバージョン同時実行制御、オプティミスティック・ロック、分散トランザクション |
| `references/Level4_expert.md`   | 高度なトランザクション管理の専門ガイド。トランザクション設計パターン、複雑なシナリオ対応、業界標準                   |

### 補助リソース

| リソース                           | 説明                                          |
| ---------------------------------- | --------------------------------------------- |
| `references/legacy-skill.md`       | 旧バージョンのSKILL.md全文                    |
| `references/requirements-index.md` | 要求仕様の索引（docs/00-requirements と同期） |

### スクリプト

| スクリプト                             | 説明                                                       |
| -------------------------------------- | ---------------------------------------------------------- |
| `scripts/analyze-transaction.mjs`      | トランザクション設計の構造と妥当性を分析するスクリプト     |
| `scripts/detect-long-transactions.mjs` | 長時間実行されるトランザクションを検出し、最適化候補を提案 |
| `scripts/validate-skill.mjs`           | スキル構造の整合性とファイル存在を検証                     |
| `scripts/log_usage.mjs`                | スキル使用記録を自動評価し、改善提案を生成                 |

### テンプレート

| テンプレート                             | 説明                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| `assets/transaction-design-template.md`  | トランザクション設計の標準テンプレート。ACID要件、分離レベル、ロック戦略などを系統的に整理 |
| `assets/transaction-design-checklist.md` | トランザクション設計のチェックリスト。設計漏れを防ぎ、品質を確保                           |

## 参考資料

### 参考書籍

| 書籍                                  | 著者             | 概要                                                                                           |
| ------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| Designing Data-Intensive Applications | Martin Kleppmann | データベース設計の実践的ガイド。トランザクション、分離レベル、レプリケーションなどを詳細に解説 |

### 関連トピック

- **マイクロサービスにおけるトランザクション**: 分散トランザクション、Saga パターン、補償トランザクション
- **パフォーマンス最適化**: マルチバージョン同時実行制御、オプティミスティック・ロック、キャッシング戦略
- **エラー処理**: トランザクション失敗時の対応、リトライ戦略、ロールバック処理

## 変更履歴

| Version | Date       | Changes                                                                                             |
| ------- | ---------- | --------------------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様に準拠。YAML frontmatter、Anchor・Trigger追加、Task仕様ナビ、ベストプラクティス拡充 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                         |
