# Level 1: Basics

## 概要

暗号化アルゴリズム、セキュアランダム値生成、鍵管理のベストプラクティスを提供します。 ブルース・シュナイアーの『Applied Cryptography』と現代の暗号学標準に基づき、 安全な暗号化実装、弱い暗号化の検出、予測可能な乱数生成の排除、

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling cryptographic practices tasks.

### 必要な知識
- 対象領域: 暗号化アルゴリズム、セキュアランダム値生成、鍵管理のベストプラクティスを提供します。 ブルース・シュナイアーの『Applied Cryptography』と現代の暗号学標準に基づき、 安全な暗号化実装、弱い暗号化の検出、予測可能な乱数生成の排除、
- 主要概念: 暗号アルゴリズム強度ガイド / ハッシュアルゴリズム比較 / 対称鍵暗号化 / CSPRNG実装ガイド / 暗号論的に安全な乱数生成器（CSPRNG）
- 実務指針: SKILL.md のベストプラクティスを守る

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/crypto-audit-checklist.md`
- 参照テンプレート: `templates/encryption-config-template.json`

### 参照書籍
- 『Web Application Security』（Andrew Hoffman）: 脅威モデリング

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/crypto-audit-checklist.md`: このレベルでは参照のみ
- `templates/encryption-config-template.json`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している
