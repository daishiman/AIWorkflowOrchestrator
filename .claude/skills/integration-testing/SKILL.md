---
name: integration-testing
description: |
  統合テストの設計・実装・実行スキル。複数のコンポーネント、サービス、システム間の相互作用を検証し、エンドツーエンドのワークフローが正しく機能することを確認します。

  📖 参考資料:
  • 『Growing Object-Oriented Software, Guided by Tests』（Steve Freeman）/ 適用: 統合テストの設計原則 / 目的: 外部システムとの境界を明確にし、契約に基づくテストを実現
  • 『Continuous Delivery』（Jez Humble）/ 適用: デプロイメントパイプラインにおける統合テスト / 目的: ビルドパイプラインで早期にフィードバックを得る
  • 『Testing Microservices with Mountebank』（Brandon Byars）/ 適用: サービス仮想化とコントラクトテスト / 目的: 分散システムの統合テストを効率化

  複数コンポーネント間の相互作用をテストしたい時、データベース統合を検証したい時、外部API連携をテストしたい時、E2Eワークフローを確認したい時に使用します。

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
tags:
  - testing
  - integration
  - quality-assurance
  - ci-cd
dependencies:
  - .claude/skills/api-mocking
---

# 統合テストスキル

## 概要

統合テスト（Integration Testing）の包括的なガイダンス。複数のコンポーネント、サービス、システム間の相互作用を検証し、エンドツーエンドのワークフローが正しく機能することを確認します。

詳細な実装手順は以下のレベル別リソースを参照してください：

- **レベル1**: 統合テストの基礎知識と用語理解
- **レベル2**: 基本的な統合テスト実装とDB統合
- **レベル3**: 分散システム、コントラクトテスト、並列実行
- **レベル4**: パフォーマンス最適化、高度なパターン

## ワークフロー

### Phase 1: テスト戦略の策定

**目的**: 統合テストの範囲、アプローチ、制約を明確化する

**アクション**:

1. `references/Level1_basics.md` で統合テストの基礎概念を確認
2. `references/test-pyramid.md` でテスト戦略全体における統合テストの位置づけを理解
3. テスト対象のコンポーネント間の依存関係を洗い出す
4. 外部依存（DB、API、ファイルシステム）をリストアップ
5. テスト環境の要件を定義（Docker、テストDB、モックサーバーなど）

**Task**: `agents/strategy-architect.md` を参照

**入力**: プロジェクト仕様、アーキテクチャ図、既存のテストコード
**出力**: テスト戦略ドキュメント、テストスコープ定義

### Phase 2: テスト設計と実装

**目的**: 統合テストケースを設計し、実装する

**アクション**:

1. `references/Level2_intermediate.md` でDB統合テストパターンを確認
2. `references/contract-testing.md` でコントラクトテストの手法を学習
3. `assets/integration-test-template.ts` を使用してテストを作成
4. テストデータのセットアップとクリーンアップを実装
5. `references/test-data-management.md` でテストデータ戦略を確認
6. トランザクション管理とテスト分離を実装

**Task**: `agents/test-engineer.md` を参照

**入力**: テスト戦略ドキュメント、API仕様、DB スキーマ
**出力**: 統合テストコード、テストデータスクリプト

### Phase 3: 実行と最適化

**目的**: テストを実行し、CI/CDパイプラインに統合する

**アクション**:

1. `scripts/run-integration-tests.sh` でローカル実行を確認
2. `references/Level3_advanced.md` で並列実行とパフォーマンス最適化を確認
3. CI/CDパイプラインにテストを統合
4. テストの実行時間を測定し、ボトルネックを特定
5. `references/Level4_expert.md` で高度な最適化手法を適用
6. `scripts/log_usage.mjs` で使用履歴を記録

**Task**: `agents/ci-integrator.md` を参照

**入力**: 統合テストコード、CI/CD設定
**出力**: CI/CDパイプライン設定、パフォーマンスレポート

## Task仕様ナビ

| タスク                       | 対象レベル | 主要リソース                             | スクリプト                     | テンプレート                     |
| ---------------------------- | ---------- | ---------------------------------------- | ------------------------------ | -------------------------------- |
| DB統合テストのセットアップ   | L1-L2      | `Level2_intermediate.md`                 | `setup-test-db.sh`             | `integration-test-template.ts`   |
| API統合テストの実装          | L2         | `contract-testing.md`                    | -                              | `api-integration-test.ts`        |
| トランザクション管理         | L2         | `test-data-management.md`                | -                              | `transaction-wrapper.ts`         |
| コンポーネント間通信のテスト | L2-L3      | `Level2_intermediate.md`                 | -                              | `integration-test-template.ts`   |
| コントラクトテストの実装     | L3         | `contract-testing.md`                    | `generate-contract-tests.mjs`  | `contract-test-template.ts`      |
| 並列実行の最適化             | L3         | `Level3_advanced.md`                     | `run-integration-tests.sh`     | -                                |
| 分散トレーシングの実装       | L3-L4      | `Level4_expert.md`                       | -                              | `distributed-tracing-setup.ts`   |
| CI/CDパイプライン統合        | L2-L3      | `Level3_advanced.md`                     | `run-integration-tests.sh`     | `github-actions-integration.yml` |
| テストデータ管理戦略の策定   | L2-L3      | `test-data-management.md`                | `seed-test-data.sh`            | -                                |
| パフォーマンス最適化         | L3-L4      | `Level3_advanced.md`, `Level4_expert.md` | `analyze-test-performance.mjs` | -                                |

## ベストプラクティス

### すべきこと ✓

- **テストの独立性**: 各テストは他のテストに影響を与えず、どの順序でも実行可能にする
- **適切なスコープ**: 統合テストは複数コンポーネント間の相互作用に焦点を当て、詳細なロジックはユニットテストに任せる
- **テストデータの管理**: テストデータのセットアップとクリーンアップを確実に行う
- **トランザクション分離**: テスト間でデータ競合が発生しないようにトランザクションを管理
- **外部依存の制御**: DBやAPIなどの外部依存は予測可能な状態で提供する
- **段階的な詳細化**: Level1から段階的により複雑なシナリオへ進める
- **契約ベースのテスト**: コンポーネント間の契約を明確にし、それに基づいてテストする
- **並列実行可能性**: テストは並列実行可能に設計し、CI/CDでの実行時間を短縮
- **レベル別ガイドの確認**: タスク複雑度に応じて適切なレベルのリソースを参照

### 避けるべきこと ✗

- **ユニットテストの代替**: 統合テストで詳細なロジックテストを行わない
- **過度な外部依存**: 実際の外部サービスに依存するテストは避け、モックやスタブを使用
- **テストの依存関係**: あるテストが別のテストの結果に依存する設計は避ける
- **共有可変状態**: テスト間で共有される可変状態を持たない
- **不十分なクリーンアップ**: テスト後のデータクリーンアップを怠らない
- **遅いテスト実行**: 最適化を怠り、CI/CDのボトルネックになるテストを作成しない
- **曖昧なアサーション**: 何を検証しているのか明確でないアサーションは避ける
- **エラーメッセージの不足**: テスト失敗時に原因が分かりにくいエラーメッセージ

## リソース参照

### ドキュメント

| リソース                             | 説明                                                 | 対象レベル |
| ------------------------------------ | ---------------------------------------------------- | ---------- |
| `references/Level1_basics.md`        | 統合テストの基礎概念、用語、テストピラミッド         | L1         |
| `references/Level2_intermediate.md`  | DB統合、API統合、基本的なテストパターン              | L2         |
| `references/Level3_advanced.md`      | コントラクトテスト、並列実行、分散システムテスト     | L3         |
| `references/Level4_expert.md`        | パフォーマンス最適化、高度なパターン、アーキテクチャ | L4         |
| `references/test-pyramid.md`         | テストピラミッドと統合テストの位置づけ               | L1-L2      |
| `references/contract-testing.md`     | コントラクトテストの原則と実装                       | L2-L3      |
| `references/test-data-management.md` | テストデータの管理戦略とベストプラクティス           | L2-L3      |

### スクリプト

```bash
# テストDB環境のセットアップ
bash .claude/skills/integration-testing/scripts/setup-test-db.sh --help

# 統合テストの実行
bash .claude/skills/integration-testing/scripts/run-integration-tests.sh --help

# テストデータのシード
bash .claude/skills/integration-testing/scripts/seed-test-data.sh --help

# テストパフォーマンス分析
node .claude/skills/integration-testing/scripts/analyze-test-performance.mjs --help

# コントラクトテスト生成
node .claude/skills/integration-testing/scripts/generate-contract-tests.mjs --help

# 使用履歴の記録と自動評価
node .claude/skills/integration-testing/scripts/log_usage.mjs --help

# スキル構造の検証
node .claude/skills/integration-testing/scripts/validate-skill.mjs --help
```

### テンプレート

```bash
# 統合テストテンプレート
cat .claude/skills/integration-testing/assets/integration-test-template.ts

# API統合テストテンプレート
cat .claude/skills/integration-testing/assets/api-integration-test.ts

# コントラクトテストテンプレート
cat .claude/skills/integration-testing/assets/contract-test-template.ts

# トランザクションラッパー
cat .claude/skills/integration-testing/assets/transaction-wrapper.ts

# GitHub Actions統合テンプレート
cat .claude/skills/integration-testing/assets/github-actions-integration.yml

# 分散トレーシングセットアップ
cat .claude/skills/integration-testing/assets/distributed-tracing-setup.ts
```

## 変更履歴

| Version | Date       | Changes                                                                            |
| ------- | ---------- | ---------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様への準拠、Anchors/Trigger追加、Task仕様ナビ統合、allowed-tools定義 |
