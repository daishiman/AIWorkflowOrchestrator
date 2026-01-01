---
name: input-validation-security
description: |
  Comprehensive input validation and sanitization for web applications. Prevents XSS, SQL injection, command injection, path traversal, and other input-based attacks through type-safe validation, allowlist filtering, and context-aware encoding.

  Anchors:
  • OWASP Top 10 / 適用: All input validation decisions / 目的: Industry-standard security baseline
  • CWE-20 (Improper Input Validation) / 適用: Validation strategy design / 目的: Common weakness patterns prevention
  • OWASP ASVS 5.1 (Input Validation) / 適用: Validation requirement specification / 目的: Security verification standard compliance

  Trigger:
  Use when implementing user input handling, form validation, API request validation, file upload processing, database query construction, command execution with user input, URL parameter processing, or any data from untrusted sources.
  input validation, sanitization, XSS prevention, SQL injection, command injection, CSRF protection, file upload security, type safety, allowlist validation, encoding
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Grep
  - Glob
tags:
  - security
  - validation
  - sanitization
  - owasp
  - injection-prevention
dependencies:
  - .claude/skills/type-safety-patterns
  - .claude/skills/security-configuration-review
---

# Input Validation Security

## Overview

This skill provides a systematic approach to input validation and sanitization across web applications, preventing injection attacks and data corruption through defense-in-depth strategies.

Key capabilities:

- Type-safe validation with TypeScript/Zod
- Context-aware output encoding
- Allowlist-based filtering
- File upload security
- SQL injection prevention
- XSS mitigation
- Command injection defense

## Workflow

### Phase 1: Analysis & Planning

**Objective**: Identify all input vectors and associated risks

**Actions**:

1. Invoke Task: `agents/analyze-inputs.md` - Map all user input sources
2. Review: `references/Level1_basics.md` - Understand input validation fundamentals
3. Assess risk level for each input vector

**Outputs**: Input inventory with risk classifications

### Phase 2: Validation Strategy Design

**Objective**: Design type-safe validation layers

**Actions**:

1. Invoke Task: `agents/design-validation.md` - Create validation schema
2. Reference: `references/Level2_intermediate.md` - Validation patterns
3. Select appropriate validation libraries (Zod, Yup, Joi)
4. Define allowlists for constrained inputs

**Outputs**: Validation schema specifications

### Phase 3: Implementation

**Objective**: Implement defense-in-depth validation

**Actions**:

1. Invoke Task: `agents/implement-validation.md` - Code validation logic
2. Reference: `references/Level3_advanced.md` - Advanced techniques
3. Use templates: `assets/validation-schema-template.ts`
4. Implement context-specific encoders

**Outputs**: Production validation code

### Phase 4: Security Testing

**Objective**: Verify protection against known attacks

**Actions**:

1. Run: `scripts/validate-inputs.mjs` - Automated input validation testing
2. Invoke Task: `agents/security-test.md` - Penetration testing
3. Reference: `references/Level4_expert.md` - Advanced attack vectors
4. Document findings

**Outputs**: Security test report

### Phase 5: Documentation & Monitoring

**Objective**: Record decisions and establish monitoring

**Actions**:

1. Run: `scripts/log_usage.mjs --result success --phase complete`
2. Document validation rules in API documentation
3. Set up input validation monitoring alerts

**Outputs**: Updated documentation and monitoring configuration

## Task Specifications

Task仕様は `agents/` 配下で定義されています。各Taskは独立した作業窓として実行され、メインコンテキストを汚染しません。

| Task File                        | When to Use              | Inputs                          | Outputs                                     |
| -------------------------------- | ------------------------ | ------------------------------- | ------------------------------------------- |
| `agents/analyze-inputs.md`       | Phase 1: Input discovery | Application codebase            | Input inventory with risk levels            |
| `agents/design-validation.md`    | Phase 2: Schema design   | Input inventory, business rules | Validation schemas, allowlists              |
| `agents/implement-validation.md` | Phase 3: Coding          | Validation schemas              | Production validation code                  |
| `agents/security-test.md`        | Phase 4: Verification    | Implemented validation          | Security test results, vulnerability report |

各Taskの詳細な仕様（役割・入力検証ルール・出力テンプレート・参照書籍の適用方法）は、実行直前に当該ファイルを参照してください。

## Best Practices

### すべきこと

- **Validate at boundaries**: すべての外部入力を信頼境界で検証
- **Fail secure**: 検証失敗時はデフォルトで拒否
- **Use allowlists**: ブロックリストではなくallowlistで許可パターンを定義
- **Validate types first**: 型検証を最初に実行し、後続処理で型安全性を保証
- **Encode for context**: 出力コンテキスト（HTML, SQL, Shell, URL）に応じたエンコーディング
- **Limit input length**: DoS防止のため入力サイズを制限
- **Log validation failures**: 攻撃検知のため検証失敗をログ記録

### 避けるべきこと

- **Client-side only validation**: クライアント側検証だけに依存しない
- **Blacklist filtering**: ブロックリスト方式は回避される可能性が高い
- **String concatenation**: SQLやコマンドで文字列連結を使用しない
- **Trusting referer/origin**: これらのヘッダーは偽装可能
- **Inadequate encoding**: 部分的なエンコーディングは不十分
- **Complex regex**: ReDoS攻撃を防ぐため複雑な正規表現を避ける
- **Validation after use**: 検証は使用前に必ず実施

## Resources

### References (段階的知識)

知識は必要時にのみ読み込む。基礎から段階的に参照：

- `references/Level1_basics.md` - 入力検証の基礎概念、OWASP Top 10の基本
- `references/Level2_intermediate.md` - 実装パターン、ライブラリ選定、型安全性
- `references/Level3_advanced.md` - 高度な攻撃手法と防御、コンテキスト別エンコーディング
- `references/Level4_expert.md` - エッジケース、ゼロデイ対策、アーキテクチャ設計

### Specialized References

特定の攻撃ベクターに対する詳細ガイド：

- `references/xss-prevention.md` - XSS防止の完全ガイド（DOM, Reflected, Stored）
- `references/sql-injection-prevention.md` - SQLインジェクション防止（パラメータ化、ORMベストプラクティス）
- `references/command-injection-prevention.md` - コマンドインジェクション防止（execFile, allowlist）
- `references/file-upload-security.md` - ファイルアップロードの安全な処理
- `references/path-traversal-prevention.md` - パストラバーサル攻撃の防止
- `references/csrf-protection.md` - CSRF トークン実装ガイド

## Scripts

決定論的処理はスクリプトで確実に実行：

- `scripts/validate-inputs.mjs` - 入力検証テストの自動実行
  - Usage: `node scripts/validate-inputs.mjs --target <file> --vectors <attack-vectors.json>`
  - 期待出力: テスト結果レポート（JSON形式）
  - 失敗時: エラー詳細とスタックトレース

- `scripts/scan-vulnerabilities.mjs` - コードベースの脆弱性スキャン
  - Usage: `node scripts/scan-vulnerabilities.mjs --path <source-dir>`
  - 期待出力: 脆弱性レポート（SARIF形式）
  - 失敗時: スキャンエラーと該当箇所

- `scripts/log_usage.mjs` - 使用記録とメトリクス更新
  - Usage: `node scripts/log_usage.mjs --result <success|failure> --phase <phase-name> [--notes <feedback>]`
  - 期待出力: LOGS.md, EVALS.json 更新確認
  - 失敗時: ログ記録失敗の詳細

## Assets

出力素材（実装時にコピー・カスタマイズ）：

- `assets/validation-schema-template.ts` - Zod検証スキーマのテンプレート
- `assets/sanitization-utils.ts` - 汎用サニタイゼーション関数
- `assets/input-validator.ts` - TypeScript入力バリデータークラス
- `assets/encoding-helpers.ts` - コンテキスト別エンコーディングヘルパー
- `assets/file-upload-validator.ts` - ファイルアップロード検証ロジック

## Line Count

SKILL.md: ~250 lines (under 500 limit)

## Changelog

| Version | Date       | Changes                                               |
| ------- | ---------- | ----------------------------------------------------- |
| 1.0.0   | 2025-12-31 | Initial creation following 18-skills.md specification |
