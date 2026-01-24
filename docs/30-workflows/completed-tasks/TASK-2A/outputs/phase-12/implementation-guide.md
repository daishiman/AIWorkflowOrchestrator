# SkillScanner 実装ガイド

## メタ情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| タスクID | TASK-2A                    |
| フェーズ | Phase 12: ドキュメント更新 |
| 作成日   | 2026-01-24                 |
| 機能名   | SkillScanner               |

---

# Part 1: 概念的説明（初学者・非技術者向け）

## SkillScanner とは

SkillScanner は、Claude Code スキルのディレクトリをスキャンし、スキルの詳細情報を取得するためのサービスクラスです。

### 主な機能

- **2つのスキルディレクトリの自動スキャン**
  - `~/.aiworkflow/skills/` - 編集可能なカスタムスキル
  - `~/.claude/skills/` - 読み取り専用の Claude CLI 標準スキル

- **SKILL.md からのメタデータ抽出**
  - スキル名、説明、許可ツールなどの情報を取得
  - YAML Frontmatter 形式をサポート

- **サブディレクトリの走査**
  - `agents/` - エージェント定義ファイル
  - `references/` - 参照ドキュメント
  - `scripts/` - スクリプトファイル
  - `assets/` - アセットファイル
  - `schemas/` - JSONスキーマ
  - `indexes/` - インデックスファイル

### 使用例

スキル一覧を取得したい場合、SkillScanner を使用することでシステムにインストールされている全スキルの情報を取得できます。

```
ユーザー → SkillScanner.scanAll() → スキル一覧（メタデータ付き）
```

### readonly フラグ

- `~/.aiworkflow/skills/` のスキル: `readonly: false`（編集可能）
- `~/.claude/skills/` のスキル: `readonly: true`（読み取り専用）

---

# Part 2: 技術的詳細（開発者向け）

## API リファレンス

### クラス: SkillScanner

ファイル: `apps/desktop/src/main/services/skill/SkillScanner.ts`

#### コンストラクタ

```typescript
new SkillScanner(options?: SkillScannerOptions)
```

**パラメータ**:

| パラメータ | 型                  | 説明                     |
| ---------- | ------------------- | ------------------------ |
| options    | SkillScannerOptions | オプション設定（省略可） |

**SkillScannerOptions**:

```typescript
interface SkillScannerOptions {
  aiworkflowSkillsDir?: string; // デフォルト: ~/.aiworkflow/skills/
  claudeSkillsDir?: string; // デフォルト: ~/.claude/skills/
}
```

#### メソッド

##### scanAll(): Promise<ScannedSkillMetadata[]>

全スキルをスキャンし、メタデータを返す。

**戻り値**: ScannedSkillMetadata の配列

**例外**: ディレクトリ作成に失敗した場合にエラーをスロー

**使用例**:

```typescript
const scanner = new SkillScanner();
const skills = await scanner.scanAll();

skills.forEach((skill) => {
  console.log(`${skill.name} (readonly: ${skill.readonly})`);
});
```

##### scanDirectory(): Promise<string[]> [Deprecated]

Legacy API。`scanAll()` を使用することを推奨。

#### 型定義

##### ScannedSkillMetadata

```typescript
interface ScannedSkillMetadata extends SkillMetadata {
  readonly: boolean; // 読み取り専用フラグ
}
```

##### SkillMetadata

```typescript
interface SkillMetadata {
  name: string; // スキル名
  description: string; // 説明
  allowedTools?: string[]; // 許可ツール
  path: string; // スキルディレクトリパス
  updatedAt: Date; // 最終更新日時
  agents: SkillSubResource[]; // agents/ 配下
  references: SkillSubResource[]; // references/ 配下
  scripts: SkillSubResource[]; // scripts/ 配下
  assets: SkillSubResource[]; // assets/ 配下
  schemas: SkillSubResource[]; // schemas/ 配下
  indexes: SkillSubResource[]; // indexes/ 配下
  otherFiles: SkillOtherFile[]; // その他ファイル
}
```

## 使用例

### 基本的な使用

```typescript
import { SkillScanner } from "@repo/desktop/src/main/services/skill";

async function listSkills() {
  const scanner = new SkillScanner();
  const skills = await scanner.scanAll();

  console.log(`Found ${skills.length} skills`);

  const editableSkills = skills.filter((s) => !s.readonly);
  const readonlySkills = skills.filter((s) => s.readonly);

  console.log(`Editable: ${editableSkills.length}`);
  console.log(`Readonly: ${readonlySkills.length}`);
}
```

### カスタムディレクトリの指定

```typescript
const scanner = new SkillScanner({
  aiworkflowSkillsDir: "/custom/path/skills",
  claudeSkillsDir: "/another/path/claude-skills",
});
```

## エラーハンドリング

- **ディレクトリが存在しない場合**: `~/.aiworkflow/skills/` は自動作成、`~/.claude/skills/` は空配列を返却
- **SKILL.md が存在しない場合**: 該当スキルをスキップ
- **Frontmatter パースエラー**: 該当スキルをスキップし、警告ログを出力
- **name フィールドがない場合**: 該当スキルをスキップ

## セキュリティ

- **パストラバーサル対策**: `..` や `/` を含むディレクトリ名は拒否
- **シンボリックリンク対策**: ベースパス外を指すシンボリックリンクは拒否
- **隠しディレクトリ**: `.` で始まるディレクトリはスキップ

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
