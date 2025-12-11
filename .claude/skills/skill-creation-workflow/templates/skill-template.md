---
name: [skill-name]
description: |
  [Brief 1-2 line description in Japanese]

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/[skill-name]/resources/[resource-name].md`: [具体的説明30-80文字]
  - `.claude/skills/[skill-name]/templates/[template-name].md`: [具体的説明30-80文字]
  - `.claude/skills/[skill-name]/scripts/[script-name].mjs`: [具体的説明30-80文字]

  使用タイミング:
  - [具体的なシチュエーション1]
  - [具体的なシチュエーション2]
  - [具体的なシチュエーション3]

  Use proactively when [English activation condition].
tools:
  - Read
  - Write
  - Grep
  - Bash
tags: [tag1, tag2, tag3]
version: 1.0.0
---

# [Skill Name]

## 概要

[スキルの目的、スコープ、対象ユーザーの詳細説明]

**主要な価値**:

- [価値1]
- [価値2]
- [価値3]

**対象ユーザー**:

- [ユーザー1]
- [ユーザー2]

## リソース構造

```
[skill-name]/
├── SKILL.md                           # 本ファイル
├── resources/
│   ├── [resource-1].md               # [説明]
│   └── [resource-2].md               # [説明]
├── templates/
│   └── [template-1].md               # [説明]
└── scripts/
    └── [script-1].mjs                # [説明]
```

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/[skill-name]/resources/[resource-name].md
```

### スクリプト実行

```bash
node .claude/skills/[skill-name]/scripts/[script-name].mjs [args]
```

## いつ使うか

### シナリオ1: [シナリオ名]

**状況**: [状況説明]
**適用条件**:

- [ ] [条件1]
- [ ] [条件2]
      **期待される成果**: [成果]

### シナリオ2: [シナリオ名]

**状況**: [状況説明]
**適用条件**:

- [ ] [条件1]
- [ ] [条件2]
      **期待される成果**: [成果]

## 核心概念

### 概念1: [概念名]

**定義**: [定義]

**実践例**:

```
[コード例またはシナリオ]
```

### 概念2: [概念名]

**定義**: [定義]

**実践例**:

```
[コード例またはシナリオ]
```

## ベストプラクティス

### すべきこと

1. **[プラクティス1]**: [説明]
2. **[プラクティス2]**: [説明]

### 避けるべきこと

1. **[アンチパターン1]**: [説明]
2. **[アンチパターン2]**: [説明]

## トラブルシューティング

### 問題1: [問題名]

**症状**: [説明]
**原因**: [理由]
**解決策**: [修正方法]

## 関連スキル

- **[skill-name-1]** (`.claude/skills/[skill-name-1]/SKILL.md`): [簡潔な説明]
- **[skill-name-2]** (`.claude/skills/[skill-name-2]/SKILL.md`): [簡潔な説明]

## 参考文献

- **[書籍/ドキュメント名]**: [説明]

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | YYYY-MM-DD | 初版作成 |
