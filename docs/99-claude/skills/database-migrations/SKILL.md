---
name: database-migrations
description: |
  安全で可逆的なデータベースマイグレーションを設計・運用するスキル。
  スキーマ変更計画、移行期間、ロールバックまでの実務フローを整理する。

  Anchors:
  • Refactoring Databases / 適用: 安全なスキーマ進化 / 目的: 破壊的変更の最小化
  • Drizzle Kit / 適用: マイグレーション生成 / 目的: 変更管理の自動化
  • Zero-Downtime Patterns / 適用: 本番適用 / 目的: サービス停止の回避

  Trigger:
  Use when planning schema changes, generating migrations, applying them safely, or defining rollback/transition strategies.
  database migrations, schema change, drizzle kit, rollback, zero downtime
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# database-migrations

## 概要

安全なスキーマ変更と移行期間の運用を支援し、ロールバック可能なマイグレーション計画を提供する。

## ワークフロー

### Phase 1: 要件整理

**目的**: 変更範囲・制約・移行条件を整理する。

**アクション**:

1. 変更対象と影響範囲を整理する。
2. 既存データの保全条件を確認する。
3. 移行期間の要否を判断する。

**Task**: `agents/analyze-migration-requirements.md` を参照

### Phase 2: 設計

**目的**: マイグレーション計画とロールバック方針を設計する。

**アクション**:

1. `references/schema-change-patterns.md` で変更パターンを確認する。
2. `references/migration-strategies.md` で戦略を整理する。
3. `references/transition-period-patterns.md` で移行期間を設計する。

**Task**: `agents/design-migration-architecture.md` を参照

### Phase 3: 実装

**目的**: 変更と検証を実装し、リスクを低減する。

**アクション**:

1. `references/drizzle-kit-commands.md` で生成手順を確認する。
2. `scripts/check-migration-safety.mjs` で安全性を確認する。
3. `scripts/generate-rollback.mjs` でロールバック案を用意する。

**Task**: `agents/implement-migration-plan.md` を参照

### Phase 4: 検証と運用

**目的**: 適用結果を検証し、運用記録を残す。

**アクション**:

1. `assets/migration-checklist.md` で検証する。
2. `references/rollback-procedures.md` で復旧手順を確認する。
3. `scripts/log_usage.mjs` で記録を更新する。

**Task**: `agents/validate-migration-quality.md` を参照

## Task仕様ナビ

| Task                           | 起動タイミング | 入力     | 出力                                   |
| ------------------------------ | -------------- | -------- | -------------------------------------- |
| analyze-migration-requirements | Phase 1開始時  | 変更要件 | 要件メモ、影響一覧                     |
| design-migration-architecture  | Phase 2開始時  | 要件メモ | マイグレーション計画、ロールバック方針 |
| implement-migration-plan       | Phase 3開始時  | 計画書   | 実装メモ、検証結果                     |
| validate-migration-quality     | Phase 4開始時  | 実装メモ | 検証レポート、改善提案                 |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

## ベストプラクティス

### すべきこと

| 推奨事項                   | 理由               |
| -------------------------- | ------------------ |
| 変更対象を分割する         | リスクを小さくする |
| 移行期間を設ける           | 互換性を維持する   |
| ロールバック手順を用意する | 復旧を確実にする   |
| 事前検証を自動化する       | 人為ミスを減らす   |

### 避けるべきこと

| 禁止事項         | 問題点                 |
| ---------------- | ---------------------- |
| 一括変更         | 失敗時の影響が大きい   |
| 互換性無視       | サービス停止につながる |
| ロールバック不備 | 復旧不能になる         |

## リソース参照

### scripts/（決定論的処理）

| スクリプト                           | 機能                         |
| ------------------------------------ | ---------------------------- |
| `scripts/check-migration-safety.mjs` | 安全性チェック               |
| `scripts/generate-rollback.mjs`      | ロールバック案の生成         |
| `scripts/validate-skill.mjs`         | スキル構造の検証             |
| `scripts/log_usage.mjs`              | 使用記録と評価メトリクス更新 |

### references/（詳細知識）

| リソース         | パス                                                                                 | 読込条件   |
| ---------------- | ------------------------------------------------------------------------------------ | ---------- |
| レベル1 基礎     | [references/Level1_basics.md](references/Level1_basics.md)                           | 要件整理時 |
| レベル2 実務     | [references/Level2_intermediate.md](references/Level2_intermediate.md)               | 設計時     |
| レベル3 応用     | [references/Level3_advanced.md](references/Level3_advanced.md)                       | 実装時     |
| レベル4 専門     | [references/Level4_expert.md](references/Level4_expert.md)                           | 検証時     |
| Drizzle Kit      | [references/drizzle-kit-commands.md](references/drizzle-kit-commands.md)             | 生成時     |
| 変更パターン     | [references/schema-change-patterns.md](references/schema-change-patterns.md)         | 設計時     |
| 移行戦略         | [references/migration-strategies.md](references/migration-strategies.md)             | 設計時     |
| ロールバック     | [references/rollback-procedures.md](references/rollback-procedures.md)               | 検証時     |
| ゼロダウンタイム | [references/zero-downtime-patterns.md](references/zero-downtime-patterns.md)         | 本番適用時 |
| 移行期間         | [references/transition-period-patterns.md](references/transition-period-patterns.md) | 移行設計時 |
| 要求仕様索引     | [references/requirements-index.md](references/requirements-index.md)                 | 仕様確認時 |
| 旧スキル         | [references/legacy-skill.md](references/legacy-skill.md)                             | 互換確認時 |

### assets/（テンプレート・素材）

| アセット                            | 用途                         |
| ----------------------------------- | ---------------------------- |
| `assets/migration-plan-template.md` | 計画テンプレート             |
| `assets/migration-checklist.md`     | 検証チェックリスト           |
| `assets/rollback-plan-template.md`  | ロールバック計画テンプレート |

### 運用ファイル

| ファイル       | 目的                       |
| -------------- | -------------------------- |
| `EVALS.json`   | レベル評価・メトリクス管理 |
| `LOGS.md`      | 実行ログの蓄積             |
| `CHANGELOG.md` | 改善履歴の記録             |
