# 受け入れ基準定義書

## メタ情報

| 項目     | 内容              |
| -------- | ----------------- |
| タスクID | TASK-2A           |
| フェーズ | Phase 1: 要件定義 |
| 作成日   | 2026-01-24        |
| 機能名   | SkillScanner 実装 |

---

## 1. 受け入れ基準一覧

| 基準ID | 基準                                                          | 検証方法          | 優先度 |
| ------ | ------------------------------------------------------------- | ----------------- | ------ |
| AC-001 | SkillScanner.scanAll() が SkillMetadata[] を返す              | ユニットテスト    | 必須   |
| AC-002 | ~/.aiworkflow/skills/ のスキルが readonly: false で取得される | ユニットテスト    | 必須   |
| AC-003 | ~/.claude/skills/ のスキルが readonly: true で取得される      | ユニットテスト    | 必須   |
| AC-004 | 6種類のサブディレクトリが正しくスキャンされる                 | ユニットテスト    | 必須   |
| AC-005 | SKILL.md の YAML Frontmatter が正しくパースされる             | ユニットテスト    | 必須   |
| AC-006 | 存在しないディレクトリの場合は空配列が返される                | ユニットテスト    | 必須   |
| AC-007 | テストカバレッジが Line 80%以上、Branch 60%以上               | Vitest カバレッジ | 必須   |

---

## 2. 受け入れ基準詳細

### AC-001: scanAll() の戻り値検証

**Given（前提）**:

- `~/.aiworkflow/skills/` に少なくとも1つの有効なスキルが存在する
- `~/.claude/skills/` に少なくとも1つの有効なスキルが存在する

**When（操作）**:

- `SkillScanner.scanAll()` を呼び出す

**Then（期待結果）**:

- 戻り値が `SkillMetadata[]` 型である
- 配列の各要素が以下のプロパティを持つ:
  - `name: string` - スキル名
  - `description: string` - スキル説明
  - `path: string` - スキルディレクトリパス
  - `updatedAt: Date` - 更新日時
  - `agents: SkillSubResource[]` - agents 配下
  - `references: SkillSubResource[]` - references 配下
  - `scripts: SkillSubResource[]` - scripts 配下
  - `assets: SkillSubResource[]` - assets 配下
  - `schemas: SkillSubResource[]` - schemas 配下
  - `indexes: SkillSubResource[]` - indexes 配下
  - `otherFiles: SkillOtherFile[]` - その他ファイル

---

### AC-002: aiworkflow スキルの readonly フラグ

**Given（前提）**:

- `~/.aiworkflow/skills/test-skill/` に有効な SKILL.md が存在する

**When（操作）**:

- `SkillScanner.scanAll()` を呼び出す

**Then（期待結果）**:

- 該当スキルの `readonly` プロパティが `false` である

---

### AC-003: Claude CLI スキルの readonly フラグ

**Given（前提）**:

- `~/.claude/skills/test-skill/` に有効な SKILL.md が存在する

**When（操作）**:

- `SkillScanner.scanAll()` を呼び出す

**Then（期待結果）**:

- 該当スキルの `readonly` プロパティが `true` である

---

### AC-004: サブディレクトリスキャン

**Given（前提）**:

- スキルディレクトリに以下の構造が存在する:
  ```
  skill-name/
  ├── SKILL.md
  ├── agents/
  │   └── task-1.md
  ├── references/
  │   └── guide.md
  ├── scripts/
  │   └── helper.sh
  ├── assets/
  │   └── template.html
  ├── schemas/
  │   └── config.json
  └── indexes/
      └── keywords.yaml
  ```

**When（操作）**:

- `SkillScanner.scanAll()` を呼び出す

**Then（期待結果）**:

- `agents` 配列に `task-1.md` の情報が含まれる
- `references` 配列に `guide.md` の情報が含まれる
- `scripts` 配列に `helper.sh` の情報が含まれる
- `assets` 配列に `template.html` の情報が含まれる
- `schemas` 配列に `config.json` の情報が含まれる
- `indexes` 配列に `keywords.yaml` の情報が含まれる
- 各リソースには `filename`, `relativePath`, `size` が設定される
- Markdown ファイルには `description` が設定される

---

### AC-005: Frontmatter パース

**Given（前提）**:

- 以下の SKILL.md が存在する:
  ```yaml
  ---
  name: test-skill
  description: |
    テストスキルの説明
  allowed-tools:
    - Read
    - Write
  ---
  # テストスキル
  本文
  ```

**When（操作）**:

- `SkillScanner.scanAll()` を呼び出す

**Then（期待結果）**:

- `name` が `"test-skill"` である
- `description` が `"テストスキルの説明\n"` を含む
- `allowedTools` が `["Read", "Write"]` である

---

### AC-006: 存在しないディレクトリの処理

**Given（前提）**:

- スキルディレクトリに `agents/` が存在しない

**When（操作）**:

- `SkillScanner.scanAll()` を呼び出す

**Then（期待結果）**:

- `agents` 配列が空配列 `[]` である
- エラーが発生しない

---

### AC-007: テストカバレッジ

**測定対象**:

- `apps/desktop/src/main/services/skill/SkillScanner.ts`

**基準値**:

| 指標               | 目標値 |
| ------------------ | ------ |
| Line Coverage      | 80%+   |
| Branch Coverage    | 60%+   |
| Function Coverage  | 80%+   |
| Statement Coverage | 80%+   |

**測定方法**:

```bash
pnpm --filter @repo/desktop vitest run --coverage
```

---

## 3. エッジケース

以下のエッジケースもテストで検証する:

| ケースID | ケース                            | 期待動作                 |
| -------- | --------------------------------- | ------------------------ |
| EC-001   | SKILL.md が存在しないディレクトリ | スキップ                 |
| EC-002   | 空の SKILL.md                     | スキップ                 |
| EC-003   | 不正な YAML Frontmatter           | スキップしてログ出力     |
| EC-004   | name フィールドがない             | スキップ（null 返却）    |
| EC-005   | 非常に大きな description          | 最大200文字で切り詰め    |
| EC-006   | ネストしたサブディレクトリ        | 直下ファイルのみスキャン |
| EC-007   | バイナリファイル                  | description 抽出スキップ |
| EC-008   | 読み取り権限なしファイル          | スキップしてログ出力     |

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
