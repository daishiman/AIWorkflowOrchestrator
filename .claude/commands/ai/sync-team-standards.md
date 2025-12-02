---
description: |
  チームコーディング規約の同期を行うコマンド。

  チーム全体のコーディング規約、ベストプラクティスを.claude/CLAUDE.mdに統合し、
  全メンバーが最新の基準に従えるようにします。

  🤖 起動エージェント:
  - Phase 2: `.claude/agents/code-quality.md` - コーディング規約専門
  - Phase 3: `.claude/agents/skill-librarian.md` - ベストプラクティス収集専門

  📚 利用可能スキル（エージェントが参照）:
  - `.claude/skills/code-style-guides/SKILL.md` - コーディング規約、スタイルガイド
  - `.claude/skills/best-practices-curation/SKILL.md` - ベストプラクティス収集・整理
  - `.claude/skills/knowledge-management/SKILL.md` - 知識管理、ドキュメント構造化

  ⚙️ このコマンドの設定:
  - argument-hint: なし
  - allowed-tools: 規約同期用
    • Task: code-quality/skill-librarianエージェント起動用
    • Read: 既存CLAUDE.md、コードベース確認用
    • Edit: CLAUDE.md更新用
  - model: sonnet（標準的な規約同期タスク）

  📋 成果物:
  - 更新された`.claude/CLAUDE.md`

  🎯 同期対象:
  - コーディング規約
  - 命名規則
  - アーキテクチャルール
  - ベストプラクティス

  トリガーキーワード: team standards, coding standards, チーム規約, コーディング規約
argument-hint: ""
allowed-tools:
  - Task
  - Read
  - Edit
model: sonnet
---

# チーム規約同期

このコマンドは、チームコーディング規約を同期します。

## 📋 実行フロー

### Phase 1: 現在の規約確認

```bash
if [ -f ".claude/CLAUDE.md" ]; then
  echo "既存CLAUDE.md確認"
  cat .claude/CLAUDE.md
fi
```

### Phase 2: code-qualityエージェントを起動

**使用エージェント**: `.claude/agents/code-quality.md`

**依頼内容**:
```markdown
チームコーディング規約を`.claude/CLAUDE.md`に統合してください。

**要件**:
1. コーディング規約の整理
2. 命名規則の明確化
3. アーキテクチャルールの統合

**スキル参照**:
- `.claude/skills/code-style-guides/SKILL.md`
- `.claude/skills/best-practices-curation/SKILL.md`

**成果物**: 更新されたCLAUDE.md
```

### Phase 3: 完了報告

```markdown
## チーム規約同期完了

### 更新内容
- コーディング規約: 更新
- 命名規則: 明確化
- アーキテクチャルール: 統合

### Next Steps
1. チームレビュー
2. Git commit
```

## 使用例

```bash
/ai:sync-team-standards
```

## 参照

- code-quality: `.claude/agents/code-quality.md`
- skill-librarian: `.claude/agents/skill-librarian.md`
- code-style-guides: `.claude/skills/code-style-guides/SKILL.md`
