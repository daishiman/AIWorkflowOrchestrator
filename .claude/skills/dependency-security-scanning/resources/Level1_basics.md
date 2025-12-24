# Level 1: Basics

## 概要

依存関係の脆弱性スキャンとSCA（Software Composition Analysis）のベストプラクティスを提供します。 pnpm audit、Snyk、OSSスキャンツールを使用した既知脆弱性の検出、 CVE評価、CVSS スコアリング、修正可能性の評価、推移的依存関係の分析を行います。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling dependency security scanning tasks.

### 必要な知識
- 対象領域: 依存関係の脆弱性スキャンとSCA（Software Composition Analysis）のベストプラクティスを提供します。 pnpm audit、Snyk、OSSスキャンツールを使用した既知脆弱性の検出、 CVE評価、CVSS スコアリング、修正可能性の評価、推移的依存関係の分析を行います。
- 主要概念: CVE評価ガイド / CVE (Common Vulnerabilities and Exposures) / CVSS (Common Vulnerability Scoring System) / セキュリティガイドライン / Dependency Security Scanning
- 実務指針: SKILL.md のベストプラクティスを守る

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/dependency-audit-report-template.md`

### 参照書籍
- 『Web Application Security』（Andrew Hoffman）: 脅威モデリング

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/dependency-audit-report-template.md`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している
