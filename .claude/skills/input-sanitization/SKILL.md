---
name: .claude/skills/input-sanitization/SKILL.md
description: |
  ユーザー入力のサニタイズとセキュリティ対策を専門とするスキル。
  XSS、SQLインジェクション、コマンドインジェクションなどの攻撃を防止し、
  安全なデータ処理を実現します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/command-injection-prevention.md`: execFileによるシェルコマンド実行と許可リスト検証パターン
  - `resources/file-upload-security.md`: MIMEタイプ検証、パストラバーサル対策、サイズ制限実装
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/sql-injection-prevention.md`: パラメータ化クエリとORMによるSQLインジェクション防止
  - `resources/xss-prevention.md`: HTMLエスケープ、CSP、DOMベースXSS対策の実装パターン
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/scan-vulnerabilities.mjs`: コードベースのXSS/SQLインジェクション脆弱性スキャン
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/sanitization-utils.ts`: 入力検証とサニタイズユーティリティ関数テンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling input sanitization tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# Input Sanitization

## 概要

ユーザー入力のサニタイズとセキュリティ対策を専門とするスキル。
XSS、SQLインジェクション、コマンドインジェクションなどの攻撃を防止し、
安全なデータ処理を実現します。

詳細な手順や背景は `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を確認
2. 必要な resources/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す


## ベストプラクティス

### すべきこと
- ユーザー入力を処理するAPIエンドポイント設計時
- HTMLコンテンツを動的に生成する際
- データベースクエリを構築する際
- ファイルアップロード機能を実装する際

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/input-sanitization/resources/Level1_basics.md
cat .claude/skills/input-sanitization/resources/Level2_intermediate.md
cat .claude/skills/input-sanitization/resources/Level3_advanced.md
cat .claude/skills/input-sanitization/resources/Level4_expert.md
cat .claude/skills/input-sanitization/resources/command-injection-prevention.md
cat .claude/skills/input-sanitization/resources/file-upload-security.md
cat .claude/skills/input-sanitization/resources/legacy-skill.md
cat .claude/skills/input-sanitization/resources/sql-injection-prevention.md
cat .claude/skills/input-sanitization/resources/xss-prevention.md
```

### スクリプト実行
```bash
node .claude/skills/input-sanitization/scripts/log_usage.mjs --help
node .claude/skills/input-sanitization/scripts/scan-vulnerabilities.mjs --help
node .claude/skills/input-sanitization/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/input-sanitization/templates/sanitization-utils.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
