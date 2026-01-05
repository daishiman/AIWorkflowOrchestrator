---
name: input-sanitization
description: |
  ユーザー入力のサニタイズとセキュリティ対策を専門とするスキル。
  XSS、SQLインジェクション、コマンドインジェクションなどの攻撃を防止。

  Anchors:
  • OWASP Top 10 / 適用: インジェクション対策 / 目的: 主要脆弱性の予防
  • Web Application Hacker's Handbook / 適用: 入力検証 / 目的: 攻撃ベクトル理解

  Trigger:
  Use when handling user input, building database queries, processing file uploads, or generating dynamic HTML content.
  XSS, SQL injection, command injection, sanitization, validation, escape
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Input Sanitization

## 概要

ユーザー入力のサニタイズとセキュリティ対策を専門とするスキル。
XSS、SQLインジェクション、コマンドインジェクションなどの攻撃を防止し、
安全なデータ処理を実現します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 脆弱性スキャンと分析

**目的**: コードベースをスキャンし、入力サニタイズが必要な箇所を特定

**アクション**:

1. `scripts/scan-vulnerabilities.mjs` で脆弱性スキャン実行
2. XSS、SQLインジェクション、コマンドインジェクションのリスク箇所を特定
3. 優先度に基づいて対策計画を立案

**参照**: `references/Level1_basics.md`

### Phase 2: セキュリティ対策実装

**目的**: 特定した脆弱性に対する適切なサニタイズを実装

**アクション（種類別）**:

- **XSS対策**: `agents/prevent-xss.md` を参照
  - HTMLエスケープ実装、CSP設定、DOMPurify導入
- **SQLインジェクション対策**: `agents/prevent-sql-injection.md` を参照
  - パラメータ化クエリ、Drizzle ORM活用、入力検証
- **コマンドインジェクション対策**: `agents/prevent-command-injection.md` を参照
  - execFile()使用、ホワイトリスト検証
- **ファイルアップロード対策**: `agents/validate-file-upload.md` を参照
  - MIME検証、パストラバーサル防止

### Phase 3: 検証と記録

**目的**: 実装したセキュリティ対策の検証と完了記録

**アクション**:

1. `scripts/scan-vulnerabilities.mjs` で再スキャン（脆弱性ゼロ確認）
2. セキュリティレビューレポート作成
3. `scripts/log_usage.mjs` で記録

## ベストプラクティス

### すべきこと

- ユーザー入力を処理するAPIエンドポイント設計時
- HTMLコンテンツを動的に生成する際
- データベースクエリを構築する際
- ファイルアップロード機能を実装する際

### 避けるべきこと

- ユーザー入力を直接SQLクエリに連結
- innerHTMLで未検証コンテンツ挿入
- サニタイズせずにシェルコマンド実行
- クライアント側のみの検証に依存

## Task仕様ナビ

| Task                     | 起動タイミング          | 入力               | 出力                     | 参照エージェント                      |
| ------------------------ | ----------------------- | ------------------ | ------------------------ | ------------------------------------- |
| XSS対策                  | innerHTML使用箇所検出時 | 対象コンポーネント | XSS対策実装レポート      | `agents/prevent-xss.md`               |
| SQLインジェクション対策  | DB操作コード発見時      | クエリ実行コード   | SQL対策レポート          | `agents/prevent-sql-injection.md`     |
| コマンドインジェクション | child_process使用検出時 | プロセス実行コード | コマンド対策レポート     | `agents/prevent-command-injection.md` |
| ファイルアップロード検証 | アップロード機能実装時  | アップロード処理   | アップロード検証レポート | `agents/validate-file-upload.md`      |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照

## リソース参照

### references/（詳細知識）

| リソース     | パス                                       | 内容                |
| ------------ | ------------------------------------------ | ------------------- |
| 基礎知識     | references/Level1_basics.md                | サニタイズ基本概念  |
| 実務ガイド   | references/Level2_intermediate.md          | 実装パターン        |
| XSS対策      | references/xss-prevention.md               | HTMLエスケープ・CSP |
| SQL対策      | references/sql-injection-prevention.md     | パラメータ化クエリ  |
| コマンド対策 | references/command-injection-prevention.md | execFileパターン    |
| ファイル対策 | references/file-upload-security.md         | アップロード検証    |

### scripts/（決定論的処理）

| スクリプト               | 用途           | 使用例                                        |
| ------------------------ | -------------- | --------------------------------------------- |
| scan-vulnerabilities.mjs | 脆弱性スキャン | `node scripts/scan-vulnerabilities.mjs`       |
| log_usage.mjs            | 使用記録       | `node scripts/log_usage.mjs --result success` |

### assets/（テンプレート）

| テンプレート          | 用途                     |
| --------------------- | ------------------------ |
| sanitization-utils.ts | サニタイズユーティリティ |

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/input-sanitization/references/Level1_basics.md
cat .claude/skills/input-sanitization/references/Level2_intermediate.md
cat .claude/skills/input-sanitization/references/Level3_advanced.md
cat .claude/skills/input-sanitization/references/Level4_expert.md
cat .claude/skills/input-sanitization/references/command-injection-prevention.md
cat .claude/skills/input-sanitization/references/file-upload-security.md
cat .claude/skills/input-sanitization/references/legacy-skill.md
cat .claude/skills/input-sanitization/references/sql-injection-prevention.md
cat .claude/skills/input-sanitization/references/xss-prevention.md
```

### スクリプト実行

```bash
node .claude/skills/input-sanitization/scripts/log_usage.mjs --help
node .claude/skills/input-sanitization/scripts/scan-vulnerabilities.mjs --help
node .claude/skills/input-sanitization/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/input-sanitization/assets/sanitization-utils.ts
```

## 変更履歴

| Version | Date       | Changes                                        |
| ------- | ---------- | ---------------------------------------------- |
| 2.1.0   | 2026-01-02 | ワークフローをPhase別に再構成、agents/参照追加 |
| 2.0.0   | 2026-01-02 | 18-skills.md完全準拠、Task仕様ナビ追加         |
| 1.0.0   | 2025-12-24 | 初版                                           |
