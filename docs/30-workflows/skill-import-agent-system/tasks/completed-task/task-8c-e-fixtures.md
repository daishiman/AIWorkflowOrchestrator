---
id: TASK-8C-E
tier: 1
title: E2Eテストフィクスチャ作成
phase: 8
depends_on: [TASK-2A]
parallel_with: [TASK-8C-A]
blocks: [TASK-8C-B, TASK-8C-C, TASK-8C-D]
status: completed
priority: high
estimated_complexity: small
tags: [test, fixtures]
---

# E2Eテストフィクスチャ作成

## 概要

E2Eテスト用のスキルフィクスチャを作成する。

## 入力

- TASK-2A: SkillScanner（スキル構造の理解）

## 出力

- テスト用スキルディレクトリ構造

## 実装詳細

### ディレクトリ構造

```
apps/desktop/src/__tests__/__fixtures__/skills/
├── test-skill/
│   ├── SKILL.md
│   ├── agents/
│   │   └── test-agent.md
│   └── references/
│       └── test-ref.md
├── another-skill/
│   └── SKILL.md
└── invalid-skill/
    └── README.md  (SKILL.md がない無効なスキル)
```

### test-skill/SKILL.md

```markdown
---
name: test-skill
description: E2Eテスト用のスキル
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Test Skill

テスト用のスキルです。

## 機能

- ファイルの読み書き
- コマンド実行

## 使用例

\`\`\`
/test-skill ファイルを作成
\`\`\`
```

### test-skill/agents/test-agent.md

```markdown
# Test Agent

テスト用サブエージェント。

## 役割

テスト実行時のモック処理。

## 入力

- テストプロンプト

## 出力

- テスト結果
```

### test-skill/references/test-ref.md

```markdown
# Test Reference

テスト用参照資料。

## 概要

E2Eテストで使用する参照情報。

## 詳細

テスト環境の設定と検証方法。
```

### another-skill/SKILL.md

```markdown
---
name: another-skill
description: 別のテスト用スキル
allowed-tools:
  - Read
  - Glob
---

# Another Skill

もう一つのテスト用スキル。
```

## ファイル

| 操作 | パス                                                                               |
| ---- | ---------------------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/SKILL.md`               |
| 作成 | `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/agents/test-agent.md`   |
| 作成 | `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/references/test-ref.md` |
| 作成 | `apps/desktop/src/__tests__/__fixtures__/skills/another-skill/SKILL.md`            |
| 作成 | `apps/desktop/src/__tests__/__fixtures__/skills/invalid-skill/README.md`           |

## 完了条件

- [x] test-skill フィクスチャが作成されている
- [x] another-skill フィクスチャが作成されている
- [x] invalid-skill（無効なスキル）フィクスチャが作成されている
- [x] SkillScanner がフィクスチャを正しくパースできる
