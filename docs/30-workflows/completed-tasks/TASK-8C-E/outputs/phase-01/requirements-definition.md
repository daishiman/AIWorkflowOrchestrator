# Phase 1: 要件定義書 - TASK-8C-E E2Eテストフィクスチャ

## 1. フィクスチャ要件一覧

### 1.1 必要なフィクスチャ

| フィクスチャ名 | 種別       | 目的                                                   | 配置先                                                          |
| -------------- | ---------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| test-skill     | 有効スキル | SKILL.md + agents/ + references/ を持つ完全なスキル    | `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/`    |
| another-skill  | 有効スキル | SKILL.md のみの最小構成スキル                          | `apps/desktop/src/__tests__/__fixtures__/skills/another-skill/` |
| invalid-skill  | 無効スキル | SKILL.md が存在せず、SkillScanner がスキップするケース | `apps/desktop/src/__tests__/__fixtures__/skills/invalid-skill/` |

### 1.2 各フィクスチャの詳細要件

#### test-skill（完全構成スキル）

| ファイル               | 必須 | 内容                                                       |
| ---------------------- | ---- | ---------------------------------------------------------- |
| SKILL.md               | Yes  | YAML Frontmatter（name, description, allowed-tools）+ body |
| agents/test-agent.md   | Yes  | サブエージェント定義（`# Test Agent` 見出し）              |
| references/test-ref.md | Yes  | 参照資料（`# Test Reference` 見出し）                      |

**YAML Frontmatter 要件**:

- `name`: `test-skill`
- `description`: `E2Eテスト用のスキル`
- `allowed-tools`: `[Read, Write, Edit, Bash]`

**body 要件**:

- `# Test Skill` 見出し
- スキル説明テキスト
- 機能リスト
- 使用例

#### another-skill（最小構成スキル）

| ファイル | 必須 | 内容                                                       |
| -------- | ---- | ---------------------------------------------------------- |
| SKILL.md | Yes  | YAML Frontmatter（name, description, allowed-tools）+ body |

**YAML Frontmatter 要件**:

- `name`: `another-skill`
- `description`: `別のテスト用スキル`
- `allowed-tools`: `[Read, Glob]`

**body 要件**:

- `# Another Skill` 見出し
- スキル説明テキスト

#### invalid-skill（無効スキル）

| ファイル  | 必須 | 内容                                              |
| --------- | ---- | ------------------------------------------------- |
| README.md | Yes  | テスト目的の説明（SKILL.md は意図的に存在しない） |

---

## 2. SkillScanner 整合性確認

### 2.1 SkillScanner パース仕様

| 仕様項目                     | 内容                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------- |
| YAML Frontmatter 正規表現    | `/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/`                               |
| 必須フィールド               | `name`（存在しない場合スキップ）                                              |
| オプションフィールド         | `description`（デフォルト: `""`）, `allowed-tools`（デフォルト: `undefined`） |
| スキャン対象サブディレクトリ | `agents/`, `references/`, `scripts/`, `assets/`, `schemas/`, `indexes/`       |
| 説明抽出ロジック             | 最初の `#` 見出し行 → 最初の非見出し段落（100文字制限）                       |
| スキップ条件                 | SKILL.md 不在、name フィールド不在、YAML パースエラー、隠しディレクトリ       |

### 2.2 整合性チェック結果

| チェック項目                                                         | 結果 |
| -------------------------------------------------------------------- | ---- |
| test-skill/SKILL.md に `name` フィールドが存在する                   | OK   |
| test-skill/SKILL.md に `description` フィールドが存在する            | OK   |
| test-skill/SKILL.md に `allowed-tools` フィールドが存在する          | OK   |
| test-skill/agents/test-agent.md に `# Test Agent` 見出しがある       | OK   |
| test-skill/references/test-ref.md に `# Test Reference` 見出しがある | OK   |
| another-skill/SKILL.md に必須フィールドが存在する                    | OK   |
| invalid-skill/ に SKILL.md が存在しない                              | OK   |
| YAML Frontmatter が正規表現でパース可能な形式                        | OK   |

### 2.3 既存ユニットテストフィクスチャとの差異

| 観点      | ユニットテストフィクスチャ                                     | E2Eフィクスチャ（本タスク）                       |
| --------- | -------------------------------------------------------------- | ------------------------------------------------- |
| 配置先    | `apps/desktop/src/main/services/skill/__tests__/__fixtures__/` | `apps/desktop/src/__tests__/__fixtures__/skills/` |
| 目的      | SkillScanner ユニットテスト専用                                | E2Eテスト（TASK-8C-B/C/D）共通利用                |
| スキル数  | 4種（valid, minimal, malformed, invalid）                      | 3種（test-skill, another-skill, invalid-skill）   |
| 命名規則  | 汎用名（valid-skill, minimal-skill）                           | テスト識別名（test-skill, another-skill）         |
| malformed | あり（YAML構文エラー）                                         | なし（E2Eではスコープ外）                         |

---

## 3. E2Eテスト利用要件

### 3.1 TASK-8C-B（スキル選択E2E）

- test-skill と another-skill が選択リストに表示されること
- invalid-skill がリストに表示されないこと
- name, description が表示に使用される

### 3.2 TASK-8C-C（インポート実行E2E）

- test-skill がインポート対象として選択可能
- agents/test-agent.md と references/test-ref.md がインポート対象に含まれる

### 3.3 TASK-8C-D（パーミッションE2E）

- test-skill の allowed-tools（Read, Write, Edit, Bash）がパーミッション検証に使用される
- パーミッション許可/拒否のテストシナリオに対応

---

## 完了ステータス

- [x] タスク1: フィクスチャ要件の整理 - 完了
- [x] タスク2: SkillScanner との整合性確認 - 完了
