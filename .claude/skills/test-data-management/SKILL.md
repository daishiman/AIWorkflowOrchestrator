---
name: test-data-management
description: |
  テストデータの設計・生成・隔離・クリーンアップを体系化するスキル。
  E2E/統合/単体テストの再現性を高め、データ依存による不安定化を防ぐ。

  Anchors:
  • Test-Driven Development: By Example / 適用: テストデータ設計 / 目的: 再現性と最小実装
  • Growing Object-Oriented Software, Guided by Tests / 適用: フィクスチャ設計 / 目的: 依存性の分離

  Trigger:
  Use when planning or implementing test data setup, seeding, isolation, or cleanup.
  test data, fixture, seeding, teardown
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Test Data Management

## 概要

テストに必要なデータを再現性高く用意し、テスト間の干渉を防ぐための実務スキル。フィクスチャ設計、シーディング戦略、データ分離、クリーンアップの判断を一貫した手順で支援する。

---

## ワークフロー

### Phase 1: 要件とデータ境界の整理

**目的**: テスト対象のデータ要件と分離境界を明確にする

**アクション**:

1. テスト目的と対象ドメインを整理する
2. 必要なエンティティと依存関係を洗い出す
3. データ分離と再利用の境界を決める
4. 制約と禁止事項（本番データ禁止など）を明文化する

**Task**: `agents/data-requirement-mapping.md` を参照

### Phase 2: フィクスチャ/シーディング設計

**目的**: 再現性と運用性を両立したデータ投入方式を設計する

**アクション**:

1. フィクスチャ方針と生成方式を選択する
2. シーディングの順序と依存を定義する
3. 生成テンプレートと自動生成スクリプトを整備する
4. 失敗時のロールバック手順を決める

**Task**: `agents/fixture-strategy-design.md` を参照

### Phase 3: 検証とクリーンアップ

**目的**: データの再現性とクリーンアップの確実性を検証する

**アクション**:

1. 生成データの一意性と妥当性を確認する
2. テスト実行後のクリーンアップ結果を検証する
3. 再実行時の状態再現性を評価する
4. 実行記録を残す

**Task**: `agents/cleanup-validation.md` を参照

---

## Task仕様ナビ

| Task | 起動タイミング | 入力 | 出力 |
| --- | --- | --- | --- |
| data-requirement-mapping | Phase 1 開始時 | テスト目的/対象 | テストデータ要件定義 |
| fixture-strategy-design | Phase 2 開始時 | 要件定義/制約 | フィクスチャ設計書 |
| cleanup-validation | Phase 3 開始時 | 生成データ/実行結果 | クリーンアップ検証レポート |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

---

## ベストプラクティス

### すべきこと

| 推奨事項 | 理由 |
| --- | --- |
| テスト目的とデータ境界を最初に定義する | 生成範囲の過不足を防ぐため |
| 一意性の担保方法を固定する | 並列実行時の衝突を避けるため |
| シーディング順序を明記する | 依存関係の破綻を防ぐため |
| クリーンアップを自動化する | 再現性と安定運用のため |

### 避けるべきこと

| 禁止事項 | 問題点 |
| --- | --- |
| 本番データを直接使用する | セキュリティと再現性のリスク |
| グローバル共有データに依存する | テストの独立性が崩れる |
| クリーンアップ確認を省略する | 後続テストの汚染につながる |

---

## リソース参照

### scripts/（決定論的処理）

| スクリプト | 機能 |
| --- | --- |
| `scripts/generate-test-data.mjs` | テストデータを生成する |
| `scripts/validate-skill.mjs` | スキル構造と必須成果物を検証する |
| `scripts/log_usage.mjs` | 実行記録を保存する |

### references/（詳細知識）

| リソース | パス | 読込条件 |
| --- | --- | --- |
| 基礎概念 | [references/Level1_basics.md](references/Level1_basics.md) | Phase 1 で参照 |
| 実務パターン | [references/Level2_intermediate.md](references/Level2_intermediate.md) | Phase 2 で参照 |
| 応用戦略 | [references/Level3_advanced.md](references/Level3_advanced.md) | 高度化時に参照 |
| エキスパート | [references/Level4_expert.md](references/Level4_expert.md) | 大規模対応時に参照 |
| クリーンアップ | [references/cleanup-patterns.md](references/cleanup-patterns.md) | Phase 3 で参照 |
| データ分離 | [references/data-isolation-techniques.md](references/data-isolation-techniques.md) | Phase 1 で参照 |
| シーディング | [references/seeding-strategies.md](references/seeding-strategies.md) | Phase 2 で参照 |

### assets/（テンプレート・素材）

| アセット | 用途 |
| --- | --- |
| `assets/fixture-template.ts` | フィクスチャ実装の雛形 |

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 3.0.0 | 2026-01-02 | スキル構造を刷新し、Task仕様と検証フローを再設計 |
| 2.0.0 | 2025-12-31 | 18-skills.md仕様への準拠、Task仕様ナビ整備 |
| 1.0.0 | 2025-12-24 | 初期バージョン |
