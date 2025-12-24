---
name: .claude/skills/command-placement-priority/SKILL.md
description: |
  コマンドの配置場所と優先順位を専門とするスキル。
  プロジェクトコマンド、ユーザーコマンド、MCPプロンプトの違い、
  優先順位解決、名前空間の活用を提供します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 手順設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/migration-guide.md`: ユーザー→プロジェクト移行とプロジェクト→ユーザーカスタマイズ手順
  - `resources/namespace-strategies.md`: フラット/階層構造と機能別/ツール別/ワークフロー別名前空間設計
  - `resources/placement-options.md`: プロジェクト/ユーザー/MCPプロンプトの3つの配置場所の選択基準
  - `resources/priority-resolution.md`: 同名コマンドが複数存在する場合の実行優先順位（プロジェクト→ユーザー→MCP）
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-placement.mjs`: コマンド配置の適切性検証と優先順位競合・名前空間重複の検出スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/project-command-template.md`: チーム共有コマンド作成のテンプレート（.claude/commands/）
  - `templates/user-command-template.md`: 個人用コマンド作成のテンプレート（~/.claude/commands/）
  
  Use proactively when handling command placement priority tasks.
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

# Command Placement & Priority

## 概要

コマンドの配置場所と優先順位を専門とするスキル。
プロジェクトコマンド、ユーザーコマンド、MCPプロンプトの違い、
優先順位解決、名前空間の活用を提供します。

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
- コマンドをどこに配置するか決定する時
- 同名コマンドの優先順位を理解したい時
- 名前空間を活用したい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/command-placement-priority/resources/Level1_basics.md
cat .claude/skills/command-placement-priority/resources/Level2_intermediate.md
cat .claude/skills/command-placement-priority/resources/Level3_advanced.md
cat .claude/skills/command-placement-priority/resources/Level4_expert.md
cat .claude/skills/command-placement-priority/resources/legacy-skill.md
cat .claude/skills/command-placement-priority/resources/migration-guide.md
cat .claude/skills/command-placement-priority/resources/namespace-strategies.md
cat .claude/skills/command-placement-priority/resources/placement-options.md
cat .claude/skills/command-placement-priority/resources/priority-resolution.md
```

### スクリプト実行
```bash
node .claude/skills/command-placement-priority/scripts/log_usage.mjs --help
node .claude/skills/command-placement-priority/scripts/validate-placement.mjs --help
node .claude/skills/command-placement-priority/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/command-placement-priority/templates/project-command-template.md
cat .claude/skills/command-placement-priority/templates/user-command-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
