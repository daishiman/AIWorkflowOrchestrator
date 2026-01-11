# SKILL.md フォーマット仕様

## 概要

スキル定義ファイル（SKILL.md）のフォーマット仕様です。スキルはディレクトリ単位で管理され、各ディレクトリにSKILL.mdファイルを配置することで認識されます。

## 基本構造

```markdown
---
name: スキル名
slug: skill-slug
description: スキルの説明
category: カテゴリ
license: MIT
---

## Overview

スキルの概要説明。

## Anchors

• アンカー名 / 適用: 適用対象 / 目的: 目的説明

## Trigger

トリガーキーワード1, トリガーキーワード2, ...
```

## フロントマター

YAMLフロントマターでスキルのメタデータを定義します。

### 必須フィールド

| フィールド  | 型     | 説明                     |
| ----------- | ------ | ------------------------ |
| name        | string | スキルの表示名           |
| slug        | string | 一意識別子（kebab-case） |
| description | string | スキルの説明             |

### オプションフィールド

| フィールド   | 型       | 説明             |
| ------------ | -------- | ---------------- |
| category     | string   | カテゴリ         |
| license      | string   | ライセンス       |
| tags         | string[] | タグ             |
| model        | string   | 使用モデル指定   |
| allowedTools | string[] | 許可されたツール |

### 例

```yaml
---
name: Code Review Assistant
slug: code-review-assistant
description: コードレビューを支援するスキル
category: Development
license: MIT
tags:
  - code-review
  - quality
---
```

## Anchors セクション

知識のアンカー（参照すべき原則・書籍・概念）を定義します。

### 形式

```
• アンカー名 / 適用: 適用対象 / 目的: 目的説明
```

または

```
- アンカー名 / 適用: 適用対象 / 目的: 目的説明
```

### 各フィールド

| フィールド | 説明                           |
| ---------- | ------------------------------ |
| アンカー名 | 参照する原則・書籍・概念の名前 |
| 適用       | どのような場面で適用するか     |
| 目的       | 何を達成するために使用するか   |

### 例

```markdown
## Anchors

• Clean Code / 適用: コード品質 / 目的: 保守性向上
• SOLID原則 / 適用: 設計パターン / 目的: 拡張性確保
• TDD / 適用: テスト駆動開発 / 目的: 品質保証
```

### パース結果

```typescript
[
  { name: "Clean Code", application: "コード品質", purpose: "保守性向上" },
  { name: "SOLID原則", application: "設計パターン", purpose: "拡張性確保" },
  { name: "TDD", application: "テスト駆動開発", purpose: "品質保証" },
];
```

## Trigger セクション

スキルを呼び出すトリガーキーワードを定義します。

### 形式

カンマ区切りまたは改行区切りのキーワードリスト。

### 例

```markdown
## Trigger

コードレビュー, レビュー, review, code review
```

または

```markdown
## Trigger

コードレビュー
レビュー
review
code review
```

### パース結果

```typescript
["コードレビュー", "レビュー", "review", "code review"];
```

## 完全な例

```markdown
---
name: Code Review Assistant
slug: code-review-assistant
description: コードレビューを支援するスキル。コード品質の向上とベストプラクティスの適用を支援します。
category: Development
license: MIT
---

## Overview

このスキルはコードレビューを支援します。Clean Code原則やSOLID原則に基づいたフィードバックを提供し、コード品質の向上を支援します。

## Anchors

• Clean Code (Robert C. Martin) / 適用: コード品質 / 目的: 保守性向上
• SOLID原則 / 適用: 設計パターン / 目的: 拡張性確保
• Effective TypeScript / 適用: TypeScript / 目的: 型安全性確保

## Trigger

コードレビュー, レビュー, review, code review, PR確認
```

## ディレクトリ構造

```
skills/
├── code-review-assistant/
│   └── SKILL.md
├── test-automation/
│   └── SKILL.md
└── documentation-helper/
    └── SKILL.md
```

## 注意事項

1. **ファイル名**: 必ず `SKILL.md` （大文字）である必要があります
2. **エンコーディング**: UTF-8を使用してください
3. **フロントマター**: 必ず `---` で囲む必要があります
4. **スラッグ**: kebab-caseで一意である必要があります
