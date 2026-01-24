# 機能要件定義書

## メタ情報

| 項目     | 内容              |
| -------- | ----------------- |
| タスクID | TASK-2A           |
| フェーズ | Phase 1: 要件定義 |
| 作成日   | 2026-01-24        |
| 機能名   | SkillScanner 実装 |

---

## 1. 機能要件一覧

| 機能ID | 機能名                   | 優先度 | 説明                                                               |
| ------ | ------------------------ | ------ | ------------------------------------------------------------------ |
| FR-001 | 全スキルスキャン         | 必須   | scanAll() で両ディレクトリの全スキルを取得                         |
| FR-002 | 単一スキルパース         | 必須   | SKILL.md の YAML Frontmatter をパースしメタデータ取得              |
| FR-003 | サブディレクトリスキャン | 必須   | agents/, references/, scripts/, assets/, schemas/, indexes/ を走査 |
| FR-004 | その他ファイル検出       | 必須   | EVALS.json, LOGS.md, package.json 等を検出                         |
| FR-005 | 説明抽出                 | 必須   | Markdown ファイルから最初の見出しまたは段落を説明として抽出        |
| FR-006 | ディレクトリ自動作成     | 必須   | ~/.aiworkflow/skills/ が存在しない場合は作成                       |
| FR-007 | 読み取り専用フラグ       | 必須   | ~/.claude/skills/ のスキルには readonly: true を設定               |

---

## 2. 機能詳細

### FR-001: 全スキルスキャン

**概要**: 2つのスキルディレクトリから全スキルの完全なメタデータを取得する

**入力**:

- なし（ディレクトリパスはコンストラクタで設定）

**出力**:

- `SkillMetadata[]`（読み取り専用フラグ付き）

**処理フロー**:

1. `~/.aiworkflow/skills/` ディレクトリが存在しない場合は作成
2. `~/.aiworkflow/skills/` 配下のディレクトリを走査（readonly: false）
3. `~/.claude/skills/` 配下のディレクトリを走査（readonly: true）
4. 各スキルディレクトリで SKILL.md を検出
5. SKILL.md が存在するディレクトリのみをスキルとして認識
6. 全スキルのメタデータを配列で返却

**エラーハンドリング**:

- 不正なスキルディレクトリはスキップしてログ出力
- ディレクトリ読み取りエラーは空配列を返却

---

### FR-002: 単一スキルパース

**概要**: SKILL.md の YAML Frontmatter をパースしてメタデータを構築する

**入力**:

- `skillPath: string` - スキルディレクトリのパス
- `skillMdPath: string` - SKILL.md のパス

**出力**:

- `SkillMetadata | null`

**処理フロー**:

1. SKILL.md ファイルを読み込み
2. YAML Frontmatter を抽出（`---` で囲まれた部分）
3. YAML をパースして以下のフィールドを取得:
   - `name`: スキル名（必須）
   - `description`: スキル説明
   - `allowed-tools`: 許可ツール配列
4. name が存在しない場合は null を返却
5. ファイルの更新日時を取得（updatedAt）
6. サブディレクトリとその他ファイルをスキャン

**Frontmatter パース仕様**:

```yaml
---
name: skill-name
description: |
  スキルの説明文
allowed-tools:
  - Read
  - Write
  - Bash
---
```

---

### FR-003: サブディレクトリスキャン

**概要**: スキル配下の6種類のサブディレクトリを走査する

**対象ディレクトリ**:

| ディレクトリ | 説明                   | 期待されるファイル |
| ------------ | ---------------------- | ------------------ |
| agents/      | Task仕様書             | \*.md              |
| references/  | 参照資料               | _.md, _.txt        |
| scripts/     | 実行可能スクリプト     | _.sh, _.mjs, \*.py |
| assets/      | 出力テンプレート、素材 | 各種ファイル       |
| schemas/     | JSONスキーマ定義       | \*.json            |
| indexes/     | キーワードインデックス | _.json, _.yaml     |

**出力**:

- `SkillSubResource[]`（各ディレクトリごと）

**処理フロー**:

1. 対象ディレクトリの存在確認
2. ディレクトリが存在しない場合は空配列を返却
3. ディレクトリ内のファイルを列挙
4. 各ファイルについて:
   - ファイル名取得
   - 相対パス計算
   - ファイルサイズ取得
   - Markdown の場合は説明を抽出（FR-005）

---

### FR-004: その他ファイル検出

**概要**: スキルディレクトリ直下の特殊ファイルを検出する

**対象ファイル**:

| ファイル名   | タイプ  | 説明                   |
| ------------ | ------- | ---------------------- |
| EVALS.json   | evals   | 評価データ             |
| LOGS.md      | logs    | ログ記録               |
| package.json | package | Node.js パッケージ定義 |
| その他       | other   | 上記以外のファイル     |

**出力**:

- `SkillOtherFile[]`

**処理フロー**:

1. スキルディレクトリ直下のファイルを列挙
2. SKILL.md は除外
3. 各ファイルについて:
   - ファイル名からタイプを判定
   - ファイルサイズを取得

---

### FR-005: 説明抽出

**概要**: Markdown ファイルから説明テキストを抽出する

**入力**:

- `filePath: string` - Markdown ファイルのパス

**出力**:

- `string` - 抽出された説明（最大100文字）

**抽出ルール**:

1. 最初の `# ` で始まる見出しがあればその内容を返却
2. 見出しがなければ最初の非空行を返却（最大100文字）
3. 抽出できない場合は空文字を返却

**例**:

```markdown
# タスク仕様書

このファイルは...
```

→ 「タスク仕様書」を返却

---

### FR-006: ディレクトリ自動作成

**概要**: アプリ独自スキルディレクトリが存在しない場合に自動作成する

**対象ディレクトリ**:

- `~/.aiworkflow/skills/`

**処理フロー**:

1. scanAll() 実行時にディレクトリ存在確認
2. 存在しない場合は `mkdir -p` 相当の処理で作成
3. 作成後は通常のスキャンを継続

**注意**:

- `~/.claude/skills/` は自動作成しない（Claude CLI の管理領域）

---

### FR-007: 読み取り専用フラグ

**概要**: Claude CLI スキルに読み取り専用フラグを設定する

**フラグ設定ルール**:

| ディレクトリ          | readonly フラグ |
| --------------------- | --------------- |
| ~/.aiworkflow/skills/ | false           |
| ~/.claude/skills/     | true            |

**実装方法**:

- SkillMetadata 型に `readonly?: boolean` を追加（TASK-1-1 で定義済みの場合はそれを使用）
- スキャン時にソースディレクトリに応じてフラグを設定

---

## 3. インターフェース定義

### 3.1 SkillScanner クラス

```typescript
class SkillScanner {
  constructor(options?: { aiworkflowDir?: string; claudeDir?: string });

  /**
   * 全スキルをスキャンして取得
   */
  scanAll(): Promise<SkillMetadata[]>;

  /**
   * 単一スキルをパース（内部メソッド）
   */
  private parseSkill(
    skillPath: string,
    skillMdPath: string,
  ): Promise<SkillMetadata | null>;

  /**
   * サブディレクトリをスキャン（内部メソッド）
   */
  private scanSubDirectory(
    skillPath: string,
    subDir: string,
  ): Promise<SkillSubResource[]>;

  /**
   * その他ファイルをスキャン（内部メソッド）
   */
  private scanOtherFiles(skillPath: string): Promise<SkillOtherFile[]>;

  /**
   * Markdown から説明を抽出（内部メソッド）
   */
  private extractDescription(filePath: string): Promise<string>;

  /**
   * YAML Frontmatter をパース（内部メソッド）
   */
  private parseFrontmatter(content: string): {
    frontmatter: Record<string, unknown>;
    body: string;
  };
}
```

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
