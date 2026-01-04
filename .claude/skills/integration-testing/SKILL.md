---
name: integration-testing
description: |
  統合テストの設計・実装・実行スキル。複数コンポーネント間の相互作用を検証し、エンドツーエンドのワークフローが正しく機能することを確認します。

  Anchors:
  • Growing Object-Oriented Software, Guided by Tests (Freeman) / 適用: 境界テスト設計 / 目的: 契約ベースのテスト
  • Continuous Delivery (Humble) / 適用: パイプライン統合 / 目的: 早期フィードバック
  • Testing Microservices with Mountebank (Byars) / 適用: サービス仮想化 / 目的: 分散システムテスト効率化

  Trigger:
  Use when testing component interactions, database integration, external API connections, or E2E workflows.
  integration testing, database testing, api testing, contract testing, test isolation
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# 統合テスト

## 概要

統合テスト設計・実装・実行。複数コンポーネント間の相互作用検証、DB統合、外部API連携、E2Eワークフロー確認を提供。

## ワークフロー

### Phase 1: テスト戦略策定

**Objective**: 統合テストの範囲とアプローチを明確化

**Actions**:

1. Invoke Task: `agents/strategy-architect.md`
2. Reference: `references/basics.md`
3. テスト対象のコンポーネント依存関係を洗い出す
4. 外部依存（DB、API）をリストアップ

**Outputs**: テスト戦略ドキュメント、テストスコープ定義

### Phase 2: テスト設計と実装

**Objective**: 統合テストケースを設計・実装

**Actions**:

1. Invoke Task: `agents/test-engineer.md`
2. Reference: `references/patterns.md`
3. Use template: `assets/integration-test-template.ts`
4. テストデータのセットアップとクリーンアップを実装

**Outputs**: 統合テストコード、テストデータスクリプト

### Phase 3: CI/CD統合

**Objective**: パイプラインへの統合と最適化

**Actions**:

1. Invoke Task: `agents/ci-integrator.md`
2. Reference: `references/ci-patterns.md`
3. Run: `node scripts/log_usage.mjs --result success --phase complete`

**Outputs**: CI/CD設定、パフォーマンスレポート

## Task仕様ナビ

| Task File                      | When to Use         | Inputs           | Outputs          |
| ------------------------------ | ------------------- | ---------------- | ---------------- |
| `agents/strategy-architect.md` | Phase 1: 戦略策定   | プロジェクト仕様 | テスト戦略       |
| `agents/test-engineer.md`      | Phase 2: テスト実装 | 戦略、API仕様    | テストコード     |
| `agents/ci-integrator.md`      | Phase 3: CI/CD統合  | テストコード     | パイプライン設定 |

## ベストプラクティス

### すべきこと

- 各テストを独立して実行可能に設計
- コンポーネント間の相互作用に焦点を当てる
- テストデータのセットアップ/クリーンアップを確実に
- トランザクション分離でデータ競合を防止
- 並列実行可能な設計でCI/CD時間を短縮
- 契約ベースのテストで境界を明確化

### 避けるべきこと

- 詳細ロジックを統合テストで検証（ユニットテストへ）
- 実外部サービスに依存（モック/スタブを使用）
- テスト間で状態を共有
- クリーンアップを怠る
- 曖昧なアサーションを書く

## リソース参照

### 参照資料

| Resource       | Path                                                       | Purpose                 |
| -------------- | ---------------------------------------------------------- | ----------------------- |
| 基礎知識       | See [references/basics.md](references/basics.md)           | 概念、テストピラミッド  |
| テストパターン | See [references/patterns.md](references/patterns.md)       | DB統合、API統合パターン |
| CI/CDパターン  | See [references/ci-patterns.md](references/ci-patterns.md) | パイプライン統合        |

### スクリプト

| Script          | Usage                                         | Purpose  |
| --------------- | --------------------------------------------- | -------- |
| `log_usage.mjs` | `node scripts/log_usage.mjs --result success` | 使用記録 |

### アセット

| Template                       | Purpose                |
| ------------------------------ | ---------------------- |
| `integration-test-template.ts` | 統合テストテンプレート |

## 変更履歴

| Version | Date       | Changes                      |
| ------- | ---------- | ---------------------------- |
| 1.1.0   | 2026-01-02 | 18-skills.md準拠、構造簡素化 |
| 1.0.0   | 2025-12-31 | 初版作成                     |
