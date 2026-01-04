---
name: zero-trust-security
description: |
  ゼロトラストセキュリティの専門スキル。
  認証・認可、マイクロセグメンテーション、継続的検証を提供します。

  Anchors:
  - Zero Trust Networks（Evan Gilman）/ 適用: セキュリティアーキテクチャ / 目的: 信頼境界排除と継続的検証
  - NIST SP 800-207 Zero Trust Architecture / 適用: フレームワーク設計 / 目的: 標準準拠
  - MITRE ATT&CK / 適用: 脅威モデリング / 目的: 攻撃パターン対策

  Trigger:
  ゼロトラスト実装時、認証・認可設計時、アクセス制御強化時、継続的検証実装時に使用

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Zero Trust Security

## 概要

Zero Trust Security（ゼロトラスト・セキュリティ）は、「信頼しない、常に検証する」の原則に基づくセキュリティモデル。4つの専門エージェントによる包括的なセキュリティ実装を提供します。

## エージェント構成

| エージェント      | 役割             | 主な機能                                |
| ----------------- | ---------------- | --------------------------------------- |
| identity-verifier | ID検証・認証強化 | MFA設計、継続的認証、セッション管理     |
| access-controller | アクセス制御     | RBAC/ABAC設計、最小権限、JIT権限        |
| policy-enforcer   | ポリシー適用     | PDP/PEP実装、マイクロセグメンテーション |
| trust-evaluator   | 信頼性評価       | リスクベース認証、UEBA、動的信頼スコア  |

## ワークフロー

### Phase 1: 要件分析と戦略策定

**目的**: セキュリティ要件を分析し、ゼロトラスト戦略を策定

**アクション**:

1. `identity-verifier` で認証要件を分析
2. `access-controller` でアクセス制御要件を整理
3. 既存セキュリティとのギャップを特定

### Phase 2: 設計と実装

**目的**: ゼロトラスト原則に基づいたシステム設計・実装

**アクション**:

1. `identity-verifier` で認証フローを設計
2. `access-controller` でポリシーを定義
3. `policy-enforcer` でマイクロセグメンテーションを実装
4. `trust-evaluator` で継続的検証を設定

### Phase 3: 検証と運用

**目的**: 実装の検証と継続的な運用体制構築

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造検証
2. ポリシー適用のテスト
3. `scripts/log_usage.mjs` で使用記録

## Task仕様ナビ

| タスク             | 担当エージェント  | 参照リソース                                |
| ------------------ | ----------------- | ------------------------------------------- |
| MFA設計            | identity-verifier | `continuous-verification-implementation.md` |
| RBAC設計           | access-controller | `rbac-implementation.md`                    |
| JITアクセス        | access-controller | `jit-access-patterns.md`                    |
| マイクロセグメント | policy-enforcer   | `rbac-implementation.md`                    |
| リスクベース認証   | trust-evaluator   | `continuous-verification-implementation.md` |
| 継続的検証         | trust-evaluator   | `continuous-verification-implementation.md` |

## ベストプラクティス

### すべきこと

- 全てのリクエストで認証・認可を検証する
- 最小権限の原則を厳守する
- コンテキストに基づいて動的に信頼を評価する
- 全てのアクセスを監査ログに記録する
- 定期的にポリシーとアクセスパターンをレビューする

### 避けるべきこと

- 「内部ネットワークだから安全」という前提
- 一度の認証で永続的な信頼を付与
- 過剰な権限の付与
- 監査ログなしでの本番運用

## リソース参照

### エージェント

| エージェント                  | 説明                   |
| ----------------------------- | ---------------------- |
| `agents/identity-verifier.md` | ID検証・認証強化       |
| `agents/access-controller.md` | アクセス制御設計       |
| `agents/policy-enforcer.md`   | ポリシー適用・実行     |
| `agents/trust-evaluator.md`   | 信頼性評価・継続的検証 |

### リファレンス

| リソース                                               | 説明                 |
| ------------------------------------------------------ | -------------------- |
| `references/continuous-verification-implementation.md` | 継続的検証実装ガイド |
| `references/jit-access-patterns.md`                    | JITアクセスパターン  |
| `references/rbac-implementation.md`                    | RBAC実装ガイド       |

### アセット

| アセット                             | 説明                             |
| ------------------------------------ | -------------------------------- |
| `assets/access-policy-template.yaml` | アクセス制御ポリシーテンプレート |

### スクリプト

| スクリプト                   | 説明           | 使用方法                             |
| ---------------------------- | -------------- | ------------------------------------ |
| `scripts/validate-skill.mjs` | スキル構造検証 | `node scripts/validate-skill.mjs -v` |
| `scripts/log_usage.mjs`      | 使用記録       | `node scripts/log_usage.mjs`         |

## 変更履歴

| バージョン | 日付       | 変更内容                                      |
| ---------- | ---------- | --------------------------------------------- |
| 2.0.0      | 2026-01-01 | 4エージェント体制への再構成、18-skills.md準拠 |
| 1.1.0      | 2025-12-31 | Task仕様ナビテーブル追加、日本語記述統一      |
| 1.0.0      | 2025-12-24 | 初版リリース                                  |
