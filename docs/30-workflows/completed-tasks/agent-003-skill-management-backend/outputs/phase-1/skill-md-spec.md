# SKILL.md 解析仕様書

## メタ情報

| 項目     | 内容                            |
| -------- | ------------------------------- |
| Phase    | 1                               |
| タスク   | タスク2: SKILL.md解析仕様の定義 |
| 作成日   | 2026-01-11                      |
| 参照仕様 | claude-code-skills-structure.md |

---

## 1. SKILL.md ファイル構造

SKILL.mdはYAML Frontmatterとmarkdown本文で構成される。

```markdown
---
name: skill-name
description: |
  スキルの概要説明

  Anchors:
  • アンカー名 / 適用: 適用範囲 / 目的: 目的

  Trigger:
  keyword1, keyword2, keyword3
license: MIT
allowed-tools:
  - Read
  - Write
tags:
  - tag1
  - tag2
dependencies:
  - dependency-skill
---

# スキル本文

## 概要

スキルの詳細説明...
```

---

## 2. YAML Frontmatter 解析仕様

### 2.1 必須フィールド

| フィールド    | 型     | 説明         | 解析ルール                         |
| ------------- | ------ | ------------ | ---------------------------------- |
| `name`        | string | スキル識別子 | ハイフンケース、最大64文字         |
| `description` | string | スキル説明   | 最大1024文字、Anchors・Trigger含む |

### 2.2 任意フィールド

| フィールド      | 型       | 説明           | デフォルト |
| --------------- | -------- | -------------- | ---------- |
| `license`       | string   | ライセンス     | `null`     |
| `allowed-tools` | string[] | 許可ツール     | `[]`       |
| `tags`          | string[] | 検索用タグ     | `[]`       |
| `dependencies`  | string[] | 依存スキルパス | `[]`       |

---

## 3. description フィールド解析

### 3.1 Anchors セクション

**解析対象パターン**:

```
Anchors:
• {{アンカー名}} / 適用: {{適用範囲}} / 目的: {{目的}}
```

**解析ルール**:

1. `Anchors:` キーワードを検出
2. `•` または `-` で始まる行を抽出
3. `/` で区切り、各フィールドを抽出
4. `適用:` と `目的:` プレフィックスを除去

**出力型**:

```typescript
interface Anchor {
  source: string; // アンカー名
  application: string; // 適用範囲
  purpose: string; // 目的
}
```

**解析例**:

```yaml
# 入力
description: |
  スキルの概要

  Anchors:
  • Clean Code (Robert C. Martin) / 適用: 単一責務の原則 / 目的: タスク分解の基準
  • Domain-Driven Design / 適用: ユビキタス言語 / 目的: 用語設計

# 出力
anchors:
  [
    {
      source: "Clean Code (Robert C. Martin)",
      application: "単一責務の原則",
      purpose: "タスク分解の基準",
    },
    {
      source: "Domain-Driven Design",
      application: "ユビキタス言語",
      purpose: "用語設計",
    },
  ]
```

### 3.2 Trigger セクション

**解析対象パターン**:

```
Trigger:
keyword1, keyword2, キーワード3
Use when creating task specifications...
```

**解析ルール**:

1. `Trigger:` キーワードを検出
2. 次の行からキーワードを抽出
3. カンマ区切りで分割
4. 各キーワードをtrim
5. "Use when" で始まる行も含める（英語キーワード抽出）

**出力型**:

```typescript
triggers: string[];
```

**解析例**:

```yaml
# 入力
description: |
  スキルの概要

  Trigger:
  タスク仕様書作成, タスク分解, ワークフロー設計
  Use when creating task specifications.

# 出力
triggers:
  [
    "タスク仕様書作成",
    "タスク分解",
    "ワークフロー設計",
    "creating task specifications",
  ]
```

---

## 4. Fallback 値

解析失敗時のデフォルト値を定義する。

```typescript
const defaultSkill: Partial<Skill> = {
  name: "Unknown Skill",
  description: "Description not available",
  triggers: [],
  anchors: [],
  tags: [],
  allowedTools: [],
  dependencies: [],
};
```

---

## 5. エラーハンドリング

### 5.1 エラー種別

| エラー種別     | 発生条件                    | 対応                 |
| -------------- | --------------------------- | -------------------- |
| FILE_NOT_FOUND | SKILL.mdが存在しない        | スキル一覧から除外   |
| PARSE_ERROR    | YAML解析失敗                | SkillScanErrorに追加 |
| INVALID_FORMAT | 必須フィールド欠落          | fallback値で補完     |
| ENCODING_ERROR | UTF-8以外のエンコーディング | SkillScanErrorに追加 |

### 5.2 部分的失敗の許容

```typescript
interface SkillScanResult {
  skills: Skill[]; // 正常に解析できたスキル
  errors: SkillScanError[]; // 解析失敗したスキルの情報
  scannedAt: Date;
}

interface SkillScanError {
  path: string; // 失敗したSKILL.mdのパス
  error: string; // エラーメッセージ
}
```

---

## 6. ID生成ルール

スキルIDはパスから一意に生成する。

```typescript
function generateSkillId(skillPath: string): string {
  // パスからディレクトリ名を抽出
  const dirname = path.basename(path.dirname(skillPath));
  // ハッシュ化または正規化
  return dirname; // slugとして使用
}
```

**ID要件**:

- ディレクトリ名と同一（slug）
- ハイフンケース
- 最大64文字
- 重複なし（パスが異なれば異なるID）

---

## 7. 本文解析（将来拡張）

現時点では本文の詳細解析は不要だが、以下のセクションは将来的に解析対象となる可能性がある。

| セクション      | 用途            | 優先度                |
| --------------- | --------------- | --------------------- |
| ## 概要         | description補完 | 低                    |
| ## ワークフロー | 実行フロー表示  | 低                    |
| ## Environment  | 実行環境設定    | 中（AGENT-007で対応） |
