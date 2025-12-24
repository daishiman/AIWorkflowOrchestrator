---
name: .claude/skills/skill-librarian-commands/SKILL.md
description: |
  Skill Librarianエージェント専用のコマンド、スクリプト、リソース参照ガイド。
  スキル作成・管理に必要なTypeScriptスクリプトの実行方法、
  詳細リソースへのアクセスパス、テンプレート参照方法を提供します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 手順設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/command-reference.md`: 利用可能なスクリプト・コマンドの完全リファレンス（実行方法、オプション、使用例）
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/list-skills.mjs`: 全スキル一覧表示ツール（パス情報付き、Node.js実行可能）
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/resource-template.md`: リソースファイル作成用の標準テンプレート（セクション構造、ベストプラクティス）
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when [英語の発動条件].
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "手順設計"
      - "実践的改善"
---

# Skill Librarian Commands

## 概要

Skill Librarianエージェント専用のコマンド、スクリプト、リソース参照ガイド。
スキル作成・管理に必要なTypeScriptスクリプトの実行方法、
詳細リソースへのアクセスパス、テンプレート参照方法を提供します。

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
- スキル品質を検証したい時（validate-knowledge.mjs）
- トークン使用量を計算したい時（calculate-token-usage.mjs）
- ドキュメント構造を分析したい時（analyze-structure.mjs）
- 詳細知識が必要な時（SECIモデル、3層開示モデル、分割パターン等）
- テンプレートを使用してファイルを作成したい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/skill-librarian-commands/resources/Level1_basics.md
cat .claude/skills/skill-librarian-commands/resources/Level2_intermediate.md
cat .claude/skills/skill-librarian-commands/resources/Level3_advanced.md
cat .claude/skills/skill-librarian-commands/resources/Level4_expert.md
cat .claude/skills/skill-librarian-commands/resources/command-reference.md
cat .claude/skills/skill-librarian-commands/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/skill-librarian-commands/scripts/list-skills.mjs --help
node .claude/skills/skill-librarian-commands/scripts/log_usage.mjs --help
node .claude/skills/skill-librarian-commands/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/skill-librarian-commands/templates/resource-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
