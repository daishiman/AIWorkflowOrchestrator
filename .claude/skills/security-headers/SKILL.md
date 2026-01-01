---
name: security-headers
description: |
  HTTPセキュリティヘッダー設定の専門スキル。
  CSP、HSTS、X-Frame-Optionsなどの設定を提供します。

  Anchors:
  • 『Web Application Security』（Andrew Hoffman） / 適用: セキュリティ / 目的: 防御強化

  Trigger:
  セキュリティヘッダー設定時、CSP実装時、HTTPセキュリティ強化時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# セキュリティヘッダー

## 概要

Webアプリケーションのセキュリティヘッダー設定パターンを体系的に学習・実装するためのスキルです。Content Security Policy（CSP）、CSRF対策、XSS防止などのHTTPセキュリティヘッダーの設定方法と、Next.js環境での標準的な実装パターンを提供します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要なリソース、スクリプト、テンプレートを特定
3. プロジェクトのセキュリティ要件を整理

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. セキュリティヘッダーの設定内容を決定
3. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す

## Task仕様ナビ

| Task         | 説明                                         | リソース                                        | 対応フェーズ |
| ------------ | -------------------------------------------- | ----------------------------------------------- | ------------ |
| CSP設定      | Content Security Policy（CSP）の設定と実装   | `references/csp-configuration.md`                | Phase 2      |
| CSRF対策     | Cross-Site Request Forgery対策の実装         | `references/csrf-prevention.md`                  | Phase 2      |
| XSS防止      | Cross-Site Scripting防止のベストプラクティス | `references/Level2_intermediate.md`              | Phase 2      |
| Next.js設定  | Next.js環境でのセキュリティヘッダー実装      | `assets/nextjs-security-headers-template.js` | Phase 2      |
| ヘッダー検証 | セキュリティヘッダー設定の検証と監査         | `scripts/validate-security-headers.mjs`         | Phase 3      |
| 要件仕様確認 | セキュリティ要件仕様の確認と索引             | `references/requirements-index.md`               | Phase 1      |

## ベストプラクティス

### すべきこと

- `references/Level1_basics.md` を参照し、セキュリティヘッダーの基本概念を理解する
- `references/Level2_intermediate.md` を参照し、実務的な設定手順を整理する
- プロジェクトの特性に応じた適切なセキュリティヘッダーを選択する
- テンプレートを参考に、段階的にヘッダーを実装する
- 設定後は必ず検証スクリプトで動作確認を行う
- セキュリティアップデートを定期的に確認し、新しい脅威に対応する

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける
- 不適切なCSPルールでアプリケーション機能を制限しないようにする
- セキュリティヘッダーを無闇に厳しく設定し過ぎて、正常な機能を破損させない
- レガシーブラウザとの互換性を無視して最新仕様のみに対応しない
- 設定内容を記録や検証なしに本番環境にデプロイしない

## リソース参照

### リソースファイル

| ファイル                           | 説明                                                 |
| ---------------------------------- | ---------------------------------------------------- |
| `references/Level1_basics.md`       | レベル1の基礎ガイド - セキュリティヘッダーの基本概念 |
| `references/Level2_intermediate.md` | レベル2の実務ガイド - 実装手順とベストプラクティス   |
| `references/Level3_advanced.md`     | レベル3の応用ガイド - 高度な設定と最適化             |
| `references/Level4_expert.md`       | レベル4の専門ガイド - エキスパート向けの深掘り学習   |
| `references/csp-configuration.md`   | Content Security Policyの詳細設定ガイド              |
| `references/csrf-prevention.md`     | CSRF対策の実装ガイド                                 |
| `references/requirements-index.md`  | 要求仕様の索引（docs/00-requirements と同期）        |
| `references/legacy-skill.md`        | 旧SKILL.mdの全文（参考用）                           |

### スクリプトファイル

| スクリプト                              | 用途                           |
| --------------------------------------- | ------------------------------ |
| `scripts/validate-skill.mjs`            | スキル構造の検証と品質チェック |
| `scripts/validate-security-headers.mjs` | セキュリティヘッダー設定の検証 |
| `scripts/log_usage.mjs`                 | 使用記録と自動評価             |

### テンプレートファイル

| テンプレート                                    | 説明                                                |
| ----------------------------------------------- | --------------------------------------------------- |
| `assets/nextjs-security-headers-template.js` | Next.js環境でのセキュリティヘッダー実装テンプレート |

### コマンドリファレンス

リソース読み取り:

```bash
cat .claude/skills/security-headers/references/Level1_basics.md
cat .claude/skills/security-headers/references/Level2_intermediate.md
cat .claude/skills/security-headers/references/Level3_advanced.md
cat .claude/skills/security-headers/references/Level4_expert.md
cat .claude/skills/security-headers/references/csp-configuration.md
cat .claude/skills/security-headers/references/csrf-prevention.md
cat .claude/skills/security-headers/references/legacy-skill.md
```

スクリプト実行:

```bash
node .claude/skills/security-headers/scripts/validate-skill.mjs
node .claude/skills/security-headers/scripts/validate-security-headers.mjs
node .claude/skills/security-headers/scripts/log_usage.mjs
```

テンプレート参照:

```bash
cat .claude/skills/security-headers/assets/nextjs-security-headers-template.js
```

## 変更履歴

| Version | Date       | Changes                                                                                                          |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                      |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に基づいた完全な構造更新（日本語化、Trigger/Anchor追加、Task仕様ナビ追加、リソース参照の整理化） |
