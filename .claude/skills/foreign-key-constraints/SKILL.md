---
name: foreign-key-constraints
description: |
  Design foreign key constraints and referential integrity based on C.J. Date's principles. Provides strategic CASCADE operation selection, circular reference avoidance, and soft delete consistency patterns for relational databases (SQLite/Turso with Drizzle ORM).

  Anchors:
  • C.J. Date's "An Introduction to Database Systems" / 適用: FK設計・参照整合性の基本原則 / 目的: 理論的に正しいFK制約設計
  • The Pragmatic Programmer (Andrew Hunt, David Thomas) / 適用: 実装品質・保守性 / 目的: 実用的な改善指針

  Trigger:
  Use when designing foreign key relationships, selecting CASCADE behavior, detecting circular references, integrating soft delete patterns, or reviewing database schema integrity.
  Keywords: foreign key, CASCADE, ON DELETE, ON UPDATE, referential integrity, circular dependency, soft delete, Drizzle ORM, SQLite, Turso
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
tags:
  - database
  - foreign-key
  - referential-integrity
  - cascade
  - drizzle-orm
version: 2.0.0
level: 1
last_updated: 2025-12-31
---

# Foreign Key Constraints Skill

## 概要

外部キー制約と参照整合性の設計を、C.J. Dateの理論的基礎とThe Pragmatic Programmerの実用的指針に基づいて支援します。CASCADE動作の戦略的選択、循環参照の検出と解消、ソフトデリートとの整合性確保を通じて、堅牢なデータベース設計を実現します。

## ワークフロー

### Phase 1: 設計レビューと前提確認

**目的**: FK制約設計の妥当性を確認し、問題を早期発見する

**Task**: `agents/design-review.md`

**入力**:
- データベーススキーマ定義（Drizzle ORM形式）
- テーブル関係図またはER図
- ビジネス要件

**出力**:
- FK制約の妥当性評価レポート
- 発見された問題点リスト
- 推奨改善案

**実行条件**:
- 新規テーブル追加時
- 既存スキーマの見直し時
- リファクタリング前の事前評価

### Phase 2: CASCADE動作の選択

**目的**: ビジネスルールに合致した適切なCASCADE動作を選択する

**Task**: `agents/cascade-selection.md`

**入力**:
- 親子テーブルの関係性
- データライフサイクル要件
- ビジネス制約

**出力**:
- 各FK制約の推奨CASCADE設定
- 設定理由と影響範囲の説明
- 実装コード例

**実行条件**:
- FK制約追加時
- CASCADE動作の見直し時
- パフォーマンス問題の調査時

**参照**: `references/cascade-patterns.md`

### Phase 3: 循環参照の検出と解消

**目的**: 循環参照を検出し、適切な解消策を提案する

**Task**: `agents/circular-detection.md`

**入力**:
- 完全なデータベーススキーマ
- FK制約の依存関係グラフ

**出力**:
- 検出された循環参照のリスト
- 各循環の解消策（優先順位付き）
- 実装手順

**実行条件**:
- スキーマ設計の最終確認時
- デッドロック発生時の原因調査
- 複雑な関係性の追加時

### Phase 4: ソフトデリート統合

**目的**: ソフトデリート機能とFK制約の整合性を確保する

**Task**: `agents/soft-delete-integration.md`

**入力**:
- ソフトデリート対象テーブル
- FK制約定義
- 削除ポリシー

**出力**:
- ソフトデリート実装パターン
- FK制約との整合性確保策
- クエリ実装例

**実行条件**:
- ソフトデリート導入時
- 論理削除と物理削除の混在時
- データ復旧機能の実装時

## Task仕様ナビゲーション

すべてのTask仕様は `agents/` ディレクトリに配置されています：

| Task | ファイル | 適用フェーズ |
|------|---------|------------|
| FK設計レビュー | `agents/design-review.md` | Phase 1 |
| CASCADE選択 | `agents/cascade-selection.md` | Phase 2 |
| 循環参照検出 | `agents/circular-detection.md` | Phase 3 |
| ソフトデリート統合 | `agents/soft-delete-integration.md` | Phase 4 |

各Taskは実行直前に読み込まれることを前提に設計されています。

## ベストプラクティス

### すべきこと

- FK制約追加前に `agents/design-review.md` で設計妥当性を確認
- CASCADE動作は `references/cascade-patterns.md` のパターンから選択
- 循環参照は `scripts/check-fk-integrity.mjs` で定期的に検証
- ソフトデリート導入時は必ずPhase 4を実行
- 変更後は `scripts/log_usage.mjs` で実行記録を残す

### 避けるべきこと

- 理論的根拠なしにCASCADEを多用する（データ消失リスク）
- 循環参照の存在を確認せずにFK制約を追加する
- ソフトデリートとハードデリートを混在させる際の整合性確認を怠る
- パフォーマンス影響を考慮せずに深い階層のCASCADEを設定する
- FK制約の変更履歴を記録しない

## リソース参照

### 知識ベース（references/）

必要時に読み込む詳細知識：

- **Level1_basics.md**: FK制約の基本概念と最小限の実装知識
- **Level2_intermediate.md**: CASCADE動作とパフォーマンス考慮事項
- **Level3_advanced.md**: 循環参照解消と複雑な関係性の設計
- **Level4_expert.md**: ソフトデリート統合と高度な整合性保証
- **cascade-patterns.md**: 各CASCADE動作の詳細パターンと実装例
- **requirements-index.md**: プロジェクト要求仕様との対応関係

**読み込み条件**:
- Level1: 基本的なFK制約設計時（毎回）
- Level2: CASCADE動作選択時
- Level3: 循環参照検出時
- Level4: ソフトデリート統合時
- cascade-patterns: Phase 2実行時
- requirements-index: プロジェクト仕様確認時

### スクリプト（scripts/）

決定論的処理を確実に実行：

- **check-fk-integrity.mjs**: FK制約の整合性検証（循環参照検出含む）
  ```bash
  node scripts/check-fk-integrity.mjs --schema <schema-dir>
  ```

- **validate-skill.mjs**: スキル構造の妥当性検証
  ```bash
  node scripts/validate-skill.mjs
  ```

- **log_usage.mjs**: 実行記録とメトリクス更新
  ```bash
  node scripts/log_usage.mjs --result <success|failure> --phase <phase-name>
  ```

### アセット（assets/）

出力テンプレート：

- **fk-design-checklist.md**: FK設計チェックリスト
  - Phase 1完了時に使用
  - すべての確認項目を網羅

## 検証と記録

### スキル実行後の手順

1. **検証**: 成果物が各Phaseの出力要件を満たしているか確認
2. **テスト**: `scripts/check-fk-integrity.mjs` で整合性検証
3. **記録**: `scripts/log_usage.mjs` で実行結果を記録

```bash
# 検証例
node .claude/skills/foreign-key-constraints/scripts/check-fk-integrity.mjs \
  --schema ./packages/shared/src/database/schema

# 記録例
node .claude/skills/foreign-key-constraints/scripts/log_usage.mjs \
  --result success \
  --phase "Phase 2: CASCADE Selection" \
  --notes "Applied composition pattern for user-sessions relationship"
```

## メトリクスとレベルアップ

スキルのレベルは実行成功率とフィードバックに基づいて自動評価されます：

- **Level 1**: 基本的なFK制約設計（初期状態）
- **Level 2**: CASCADE動作の適切な選択（成功率80%以上）
- **Level 3**: 循環参照の検出と解消（成功率85%以上）
- **Level 4**: ソフトデリート統合の完全な理解（成功率90%以上）

詳細は `EVALS.json` と `LOGS.md` を参照。

## コマンドリファレンス

### よく使うコマンド

```bash
# Task仕様の読み込み
cat .claude/skills/foreign-key-constraints/agents/design-review.md
cat .claude/skills/foreign-key-constraints/agents/cascade-selection.md

# 参照資料の確認
cat .claude/skills/foreign-key-constraints/references/cascade-patterns.md

# FK整合性検証
node .claude/skills/foreign-key-constraints/scripts/check-fk-integrity.mjs \
  --schema ./packages/shared/src/database/schema

# 使用記録
node .claude/skills/foreign-key-constraints/scripts/log_usage.mjs \
  --result success \
  --phase "Phase 1"
```

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-12-31 | 18-skills.md specification alignment: Updated frontmatter, added Task-based workflow, improved Progressive Disclosure |
| 1.0.0 | 2025-12-24 | Initial spec alignment and required artifacts |
