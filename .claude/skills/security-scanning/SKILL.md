---
name: security-scanning
description: |
  CI/CDパイプラインに統合するセキュリティスキャンの設計と実装を支援するスキル。
  依存関係の脆弱性検出、コンテナイメージスキャン、SBOM生成、シークレット検出を対象とする。

  Anchors:
  • OWASP Dependency-Check / 適用: 脆弱性検出とリスク評価 / 目的: 既知の脆弱性の特定
  • CIS Docker Benchmark / 適用: コンテナセキュリティ / 目的: コンテナイメージの安全性確保
  • NIST SBOM Guidelines / 適用: ソフトウェア部品表 / 目的: サプライチェーンの透明性

  Trigger:
  Use when setting up security scanning in CI/CD, detecting vulnerabilities in dependencies, scanning container images, generating SBOM, or detecting secrets in code.
  security scan, vulnerability, trivy, dependabot, npm audit, container scan, SBOM, secret detection
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# セキュリティスキャン

## 概要

CI/CDパイプラインに統合するセキュリティスキャンの設計と実装を支援するスキル。依存関係の脆弱性検出、コンテナイメージスキャン、SBOM生成、シークレット検出をカバーする。

## ワークフロー

```
analyze-requirements → implement-scanning → validate-results
```

### Phase 1: 要件分析

**目的**: スキャン対象と要件を明確化する

**Task**: `agents/analyze-requirements.md` を参照

**アクション**:

1. スキャン対象の特定（依存関係/コンテナ/SBOM/シークレット）
2. 既存のCI/CD構成を確認
3. セキュリティ要件と重大度閾値を定義

### Phase 2: スキャン実装

**目的**: セキュリティスキャンをCI/CDに統合する

**Task**: `agents/implement-scanning.md` を参照

**アクション**:

1. スキャンツールの選定と設定
2. ワークフロー/パイプラインへの統合
3. アラート通知の設定

### Phase 3: 検証と記録

**目的**: スキャン設定の動作確認と記録

**アクション**:

1. テストスキャンを実行して動作確認
2. 検出結果のフィルタリング設定を調整
3. `scripts/log_usage.mjs` で実装結果を記録

## Task仕様ナビ

| Task                 | 責務         | 入力             | 出力             |
| -------------------- | ------------ | ---------------- | ---------------- |
| analyze-requirements | 要件分析     | プロジェクト情報 | スキャン要件定義 |
| implement-scanning   | スキャン実装 | スキャン要件     | ワークフロー設定 |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

## ベストプラクティス

### すべきこと

| 推奨事項                      | 理由                           |
| ----------------------------- | ------------------------------ |
| 重大度閾値を設定する          | アラート疲れを防ぎ対応を効率化 |
| 定期スキャンを自動化する      | 新規脆弱性の早期発見           |
| PRゲートとしてスキャンを実行  | 脆弱性の混入を防止             |
| SBOM を定期的に生成・保管する | サプライチェーンの透明性確保   |
| 例外設定は有効期限を設ける    | 放置された例外を防止           |

### 避けるべきこと

| 禁止事項                         | 問題点                           |
| -------------------------------- | -------------------------------- |
| 検証なしで本番導入               | 誤検知や設定ミスの影響が大きい   |
| 全アラートを無差別に通知         | アラート疲れで重要な問題を見逃す |
| 例外設定を無期限にする           | 脆弱性が放置されるリスク         |
| シークレットをスキャン設定に埋込 | 認証情報漏洩のリスク             |

## リソース参照

### references/（詳細知識）

| リソース         | パス                                                                   | 読込条件               |
| ---------------- | ---------------------------------------------------------------------- | ---------------------- |
| 依存関係スキャン | [references/dependency-scanning.md](references/dependency-scanning.md) | 依存関係スキャン実装時 |
| コンテナスキャン | [references/container-scanning.md](references/container-scanning.md)   | コンテナスキャン実装時 |
| SBOM生成         | [references/sbom-generation.md](references/sbom-generation.md)         | SBOM生成実装時         |
| シークレット検出 | [references/secret-detection.md](references/secret-detection.md)       | シークレット検出実装時 |

### scripts/（決定論的処理）

| スクリプト                      | 機能                 |
| ------------------------------- | -------------------- |
| `scripts/log_usage.mjs`         | 使用記録と自動評価   |
| `scripts/scan-dependencies.mjs` | 依存関係スキャン実行 |

### assets/（テンプレート）

| アセット                            | 用途                       |
| ----------------------------------- | -------------------------- |
| `assets/security-scan-workflow.yml` | GitHub Actionsワークフロー |
| `assets/trivy-config.yaml`          | Trivyスキャン設定          |

## 変更履歴

| Version | Date       | Changes                                            |
| ------- | ---------- | -------------------------------------------------- |
| 3.0.0   | 2026-01-02 | 18-skills仕様完全準拠、agents/を責務ベースに再構成 |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様に基づきリファクタリング           |
| 1.0.0   | 2025-12-24 | 初版                                               |
