---
name: test-data-management
description: |
  テストデータ管理の専門スキル。フィクスチャ設計、シーディング戦略、データ分離、クリーンアップパターンを提供します。E2Eテスト、統合テスト、セッションベーステストのテスト環境構築と再現性確保に対応。

  Anchors:
  • 『Test-Driven Development: By Example』（Kent Beck）/ 適用: テストデータ管理 / 目的: テスト効率化

  Trigger:
  テストデータ設計時、フィクスチャ作成時、テストデータ生成時に使用

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

E2Eテスト、統合テスト、セッションベーステストのためのテストデータ管理戦略。フィクスチャ、シーディング、クリーンアップパターンを活用し、テスト環境構築、データ分離、再現性の確保を実現します。

**適用シナリオ**:

- フィクスチャの設計と実装
- テスト用データのシーディング戦略
- テスト間のデータ分離と隔離
- テスト完了後のクリーンアップ
- データベース状態の初期化と復元

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件、テストデータ要件を明確にする

**アクション**:

1. `references/Level1_basics.md` で基礎概念を確認
2. テスト対象システムのデータ要件を特定
3. 必要なリソース（references/scripts/templates）を洗い出す
4. データ分離とクリーンアップの要件を定義

### Phase 2: スキル適用

**目的**: テストデータ管理戦略を実装し、具体的な作業を進める

**アクション**:

1. `references/Level2_intermediate.md` を参照し、実装パターンを確認
2. 適切なテンプレート（`assets/fixture-template.ts`）を活用
3. シーディング戦略と分離パターンを適用
4. `scripts/generate-test-data.mjs` で自動生成を実施

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. テストデータの再現性とデータ分離を検証
3. クリーンアップが正常に機能するか確認
4. `scripts/log_usage.mjs` を実行して記録を残す

## Task仕様ナビ

テストデータ管理の各パターンと対応リソース：

| Task                       | 説明                                   | リソース                             | スクリプト             | テンプレート        |
| -------------------------- | -------------------------------------- | ------------------------------------ | ---------------------- | ------------------- |
| **フィクスチャ設計**       | テストに必要な初期データセットの設計   | Level1, Level2                       | generate-test-data.mjs | fixture-template.ts |
| **シーディング戦略**       | データベースへのテストデータ投入方法   | seeding-strategies.md                | generate-test-data.mjs | fixture-template.ts |
| **データ分離技法**         | テスト間のデータ隔離と競合回避         | data-isolation-techniques.md         | generate-test-data.mjs | -                   |
| **クリーンアップパターン** | テスト完了後のデータベース状態復元     | cleanup-patterns.md                  | -                      | -                   |
| **高度な戦略**             | パフォーマンス最適化と大規模データ対応 | Level3_advanced.md, Level4_expert.md | -                      | -                   |

## ベストプラクティス

### すべきこと

- テスト開始前に要件を明確に定義し、適切なレベルのリソース（Level1-4）を参照する
- フィクスチャテンプレートを活用して、再利用可能なテストデータセットを構築
- テスト間でのデータ分離を徹底し、テストの独立性と再現性を確保
- `seeding-strategies.md` を参照して、スケーラブルなデータ投入方法を採用
- テスト終了後に必ずクリーンアップを実施し、後続テストへの影響を排除
- スキル構造と実装の整合性を検証し、`validate-skill.mjs` で確認

### 避けるべきこと

- アンチパターンや注意点を確認せずに進める
- テスト間でのグローバル状態の共有やデータ依存を放置する
- 本番データベースをテストに直結させ、データ汚染リスクを負う
- クリーンアップなしでテストを終了し、後続テストへの悪影響を招く
- スケーラビリティを考慮せず、フィクスチャで大量のハードコードされたデータを管理
- `references/Level3_advanced.md` や `Level4_expert.md` の高度なパターンを無視し、パフォーマンス課題を放置

## リソース参照

### 学習リソース（references/）

| リソース                       | 目的                                   | 対象者       |
| ------------------------------ | -------------------------------------- | ------------ |
| `Level1_basics.md`             | テストデータ管理の基礎概念と用語       | 初心者       |
| `Level2_intermediate.md`       | 実務的なテストデータ設計パターン       | 実装者       |
| `Level3_advanced.md`           | パフォーマンス最適化とスケーラビリティ | 熟練者       |
| `Level4_expert.md`             | エンタープライズレベルの戦略           | アーキテクト |
| `cleanup-patterns.md`          | クリーンアップパターンの詳細な実装方法 | 実装者       |
| `data-isolation-techniques.md` | テスト間のデータ分離実装技法           | 実装者       |
| `seeding-strategies.md`        | データシーディング戦略と最適化         | 実装者       |

### スクリプト（scripts/）

| スクリプト               | 説明                   | 実行方法                                     |
| ------------------------ | ---------------------- | -------------------------------------------- |
| `generate-test-data.mjs` | テストデータの自動生成 | `node scripts/generate-test-data.mjs --help` |
| `validate-skill.mjs`     | スキル構造の検証       | `node scripts/validate-skill.mjs --help`     |
| `log_usage.mjs`          | 使用記録と自動評価     | `node scripts/log_usage.mjs --help`          |

### テンプレート（assets/）

| テンプレート          | 説明                           | 用途                                  |
| --------------------- | ------------------------------ | ------------------------------------- |
| `fixture-template.ts` | フィクスチャの基本テンプレート | TypeScript/Vitestでのフィクスチャ設計 |

## 変更履歴

| Version | Date       | Changes                                                                                                     |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様への準拠。Anchors, Trigger, allowed-tools, Task仕様ナビを追加。リソース参照セクションを整備 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                 |
