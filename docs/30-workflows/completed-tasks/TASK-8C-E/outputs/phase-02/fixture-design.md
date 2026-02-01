# Phase 2: フィクスチャ設計書 - TASK-8C-E

## 1. ディレクトリ構造設計

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
    └── README.md
```

### 各ディレクトリの役割

| ディレクトリ   | 役割                             | SkillScanner の期待動作            |
| -------------- | -------------------------------- | ---------------------------------- |
| test-skill/    | 完全なスキル（サブリソース付き） | パース成功、agents/references 検出 |
| another-skill/ | 最小構成スキル（SKILL.md のみ）  | パース成功、サブリソース空配列     |
| invalid-skill/ | 無効なスキル（SKILL.md なし）    | スキップ                           |

---

## 2. SKILL.md コンテンツ設計

### 2.1 test-skill/SKILL.md

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

**パース期待値**:

| フィールド   | 期待値                              |
| ------------ | ----------------------------------- |
| name         | `test-skill`                        |
| description  | `E2Eテスト用のスキル`               |
| allowedTools | `['Read', 'Write', 'Edit', 'Bash']` |
| readonly     | `false`（aiworkflow ディレクトリ）  |

### 2.2 another-skill/SKILL.md

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

**パース期待値**:

| フィールド   | 期待値               |
| ------------ | -------------------- |
| name         | `another-skill`      |
| description  | `別のテスト用スキル` |
| allowedTools | `['Read', 'Glob']`   |
| agents       | `[]`                 |
| references   | `[]`                 |

---

## 3. サブリソースファイル設計

### 3.1 test-skill/agents/test-agent.md

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

### 3.2 test-skill/references/test-ref.md

```markdown
# Test Reference

テスト用参照資料。

## 概要

E2Eテストで使用する参照情報。

## 詳細

テスト環境の設定と検証方法。
```

### 3.3 パース期待値

| ファイル               | 期待される filename | 期待される relativePath  | 期待される description |
| ---------------------- | ------------------- | ------------------------ | ---------------------- |
| agents/test-agent.md   | `test-agent.md`     | `agents/test-agent.md`   | `Test Agent`           |
| references/test-ref.md | `test-ref.md`       | `references/test-ref.md` | `Test Reference`       |

---

## 4. 無効スキル設計

### 4.1 invalid-skill/README.md

```markdown
# Invalid Skill

このディレクトリは SKILL.md を含まないため、SkillScanner によってスキップされます。
E2Eテストで無効なスキルのハンドリングを検証するために使用します。
```

**SkillScanner 動作**:

- SKILL.md が存在しないため `parseSkill()` がエラーをキャッチ
- 警告ログを出力してスキップ
- `scanAll()` の結果に含まれない

---

## 5. SkillScanner パース結果の期待値まとめ

### scanAll() の結果（3ディレクトリスキャン時）

| スキル名      | 結果に含まれる | name            | description           | allowedTools                     | agents 数 | references 数 |
| ------------- | -------------- | --------------- | --------------------- | -------------------------------- | --------- | ------------- |
| test-skill    | Yes            | `test-skill`    | `E2Eテスト用のスキル` | `['Read','Write','Edit','Bash']` | 1         | 1             |
| another-skill | Yes            | `another-skill` | `別のテスト用スキル`  | `['Read','Glob']`                | 0         | 0             |
| invalid-skill | No             | -               | -                     | -                                | -         | -             |

---

## 完了ステータス

- [x] タスク1: ディレクトリ構造設計 - 完了
- [x] タスク2: SKILL.md コンテンツ設計 - 完了
- [x] タスク3: サブリソースファイル設計 - 完了
- [x] タスク4: 無効スキル設計 - 完了
