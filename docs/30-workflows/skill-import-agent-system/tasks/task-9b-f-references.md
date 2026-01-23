---
id: TASK-9B-F
tier: 2
title: skill-creator 参照資料作成
phase: 9
depends_on: [TASK-9B-A]
parallel_with: [TASK-9B-B, TASK-9B-C]
blocks: [TASK-9B-G]
status: pending
priority: medium
estimated_complexity: small
tags: [backend, skill, documentation]
---

# skill-creator 参照資料作成

## 概要

skill-creator で使用する参照資料を作成する。

## 出力

- `~/.claude/skills/skill-creator/references/task-template.md`
- `~/.claude/skills/skill-creator/references/skill-structure.md`
- `~/.claude/skills/skill-creator/references/api-patterns.md`

## 実装詳細

### task-template.md

````markdown
# タスク仕様書テンプレート

## YAML Frontmatter

```yaml
---
id: TASK-{PHASE}-{ID}
tier: 1 | 2 | 3
title: タスクタイトル
phase: { number }
depends_on: []
parallel_with: []
blocks: []
status: pending
priority: low | medium | high | critical
estimated_complexity: small | medium | large | xlarge
tags: []
---
```
````

## 本文構造

1. **概要**: タスクの目的と範囲
2. **入力**: 必要な前提条件・依存物
3. **出力**: 成果物の一覧
4. **実装詳細**: 具体的な実装手順
5. **ファイル**: 作成/修正するファイル一覧
6. **完了条件**: 検証可能なチェックリスト
7. **テスト要件**: 必要なテストケース

````

### skill-structure.md

```markdown
# スキル構造ガイド

## ディレクトリ構造

````

skill-name/
├── SKILL.md # スキル定義（必須）
├── agents/ # サブエージェント
│ └── agent-name.md
├── references/ # 参照資料
│ └── reference.md
├── scripts/ # ユーティリティスクリプト
│ └── script.sh
├── assets/ # 静的アセット
├── schemas/ # JSONスキーマ
└── indexes/ # インデックス

````

## SKILL.md フォーマット

```yaml
---
name: skill-name
description: スキルの説明
allowed-tools:
  - Read
  - Write
  - Edit
---
````

````

### api-patterns.md

```markdown
# API連携パターン集

## REST API パターン

```typescript
// GET リクエスト
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${apiKey}` },
});

// POST リクエスト
const response = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify(data),
});
````

## エラーハンドリング

```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return await response.json();
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Request was aborted");
  }
  throw error;
}
```

```

## ファイル

| 操作 | パス                                                          |
| ---- | ------------------------------------------------------------- |
| 作成 | `~/.claude/skills/skill-creator/references/task-template.md`  |
| 作成 | `~/.claude/skills/skill-creator/references/skill-structure.md` |
| 作成 | `~/.claude/skills/skill-creator/references/api-patterns.md`    |

## 完了条件

- [ ] タスクテンプレートが作成されている
- [ ] スキル構造ガイドが作成されている
- [ ] API連携パターンが作成されている
```
