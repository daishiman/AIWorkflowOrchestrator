# テストフィクスチャ一覧

## メタ情報

| 項目     | 内容                |
| -------- | ------------------- |
| タスクID | TASK-2A             |
| フェーズ | Phase 4: テスト作成 |
| 作成日   | 2026-01-24          |
| 機能名   | SkillScanner        |

---

## 1. フィクスチャ配置場所

```
apps/desktop/src/main/services/skill/__tests__/__fixtures__/
```

---

## 2. 作成したフィクスチャ一覧

### 2.1 valid-skill/ - 完全な有効スキル

| ファイル            | 内容                             |
| ------------------- | -------------------------------- |
| SKILL.md            | 有効なYAML Frontmatter付きスキル |
| agents/task-1.md    | エージェントファイル             |
| references/guide.md | リファレンスファイル             |

**valid-skill/SKILL.md の内容**:

```yaml
---
name: valid-skill
description: テスト用の有効なスキル
allowed-tools:
  - Read
  - Write
  - Edit
---
# Valid Skill

This is a valid skill for testing.
```

**用途**:

- scanAll() で正しくスキルが取得されることを確認
- parseSkill() でFrontmatterが正しくパースされることを確認
- scanSubDirectory() でサブディレクトリがスキャンされることを確認

---

### 2.2 invalid-skill/ - SKILL.mdなし

| ファイル  | 内容                           |
| --------- | ------------------------------ |
| README.md | SKILL.mdを持たないディレクトリ |

**用途**:

- SKILL.mdがないディレクトリがスキップされることを確認

---

### 2.3 malformed-skill/ - 不正なYAML

| ファイル | 内容                 |
| -------- | -------------------- |
| SKILL.md | 構文エラーのあるYAML |

**malformed-skill/SKILL.md の内容**:

```yaml
---
name: malformed-skill
description: This YAML has a syntax error
allowed-tools: [Read, Write
---

# Malformed Skill
```

**用途**:

- 不正なYAMLを持つスキルがスキップされることを確認

---

### 2.4 minimal-skill/ - 最小構成

| ファイル | 内容                             |
| -------- | -------------------------------- |
| SKILL.md | サブディレクトリなしの最小スキル |

**minimal-skill/SKILL.md の内容**:

```yaml
---
name: minimal-skill
description: Minimal skill with no subdirectories
---
# Minimal Skill
```

**用途**:

- サブディレクトリがないスキルで空配列が返されることを確認

---

## 3. ディレクトリ構造

```
__fixtures__/
├── valid-skill/
│   ├── SKILL.md
│   ├── agents/
│   │   └── task-1.md
│   └── references/
│       └── guide.md
├── invalid-skill/
│   └── README.md
├── malformed-skill/
│   └── SKILL.md
└── minimal-skill/
    └── SKILL.md
```

---

## 4. テストカバレッジ対応

| フィクスチャ    | カバーするテストケース                         |
| --------------- | ---------------------------------------------- |
| valid-skill     | scanAll, parseSkill, scanSubDirectory, extract |
| invalid-skill   | scanAll（スキップ確認）                        |
| malformed-skill | parseSkill（YAMLエラー処理）                   |
| minimal-skill   | scanSubDirectory（空配列確認）                 |

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
