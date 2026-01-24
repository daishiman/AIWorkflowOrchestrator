# クラス設計書

## メタ情報

| 項目     | 内容          |
| -------- | ------------- |
| タスクID | TASK-2A       |
| フェーズ | Phase 2: 設計 |
| 作成日   | 2026-01-24    |
| 機能名   | SkillScanner  |

---

## 1. クラス概要

### 1.1 クラス名

`SkillScanner`

### 1.2 責務

- スキルディレクトリのスキャンとメタデータ取得
- SKILL.md の YAML Frontmatter パース
- サブディレクトリ内リソースの列挙
- 読み取り専用フラグの管理

### 1.3 配置場所

```
apps/desktop/src/main/services/skill/SkillScanner.ts
```

---

## 2. クラス構造

```typescript
import * as fs from "fs/promises";
import * as path from "path";
import * as yaml from "yaml";
import type {
  SkillMetadata,
  SkillSubResource,
  SkillOtherFile,
} from "@repo/shared";

/**
 * サブディレクトリ名の定数
 */
const SUB_DIRECTORIES = [
  "agents",
  "references",
  "scripts",
  "assets",
  "schemas",
  "indexes",
] as const;

type SubDirectoryName = (typeof SUB_DIRECTORIES)[number];

/**
 * SkillScanner コンストラクタオプション
 */
interface SkillScannerOptions {
  /** ~/.aiworkflow/skills/ のカスタムパス（テスト用） */
  aiworkflowSkillsDir?: string;
  /** ~/.claude/skills/ のカスタムパス（テスト用） */
  claudeSkillsDir?: string;
}

/**
 * 拡張されたスキルメタデータ（readonly フラグ付き）
 */
export interface ScannedSkillMetadata extends SkillMetadata {
  /** 読み取り専用フラグ（Claude CLI スキルの場合 true） */
  readonly: boolean;
}

/**
 * スキルスキャナー
 *
 * ~/.aiworkflow/skills/ および ~/.claude/skills/ 配下のスキルを検出し、
 * 全情報を取得するサービスクラス
 */
export class SkillScanner {
  // ========================================
  // プロパティ
  // ========================================

  /** アプリ独自スキルディレクトリ */
  private readonly aiworkflowSkillsDir: string;

  /** Claude CLI スキルディレクトリ */
  private readonly claudeSkillsDir: string;

  // ========================================
  // コンストラクタ
  // ========================================

  /**
   * SkillScanner を初期化
   * @param options - カスタムディレクトリパス（主にテスト用）
   */
  constructor(options?: SkillScannerOptions) {
    const homeDir = process.env.HOME || "";
    this.aiworkflowSkillsDir =
      options?.aiworkflowSkillsDir ||
      path.join(homeDir, ".aiworkflow", "skills");
    this.claudeSkillsDir =
      options?.claudeSkillsDir || path.join(homeDir, ".claude", "skills");
  }

  // ========================================
  // 公開メソッド
  // ========================================

  /**
   * 全スキルをスキャンして取得
   * @returns スキャンされた全スキルのメタデータ配列
   */
  async scanAll(): Promise<ScannedSkillMetadata[]>;

  // ========================================
  // プライベートメソッド
  // ========================================

  /**
   * aiworkflow スキルディレクトリの存在を保証
   */
  private async ensureAiworkflowDir(): Promise<void>;

  /**
   * 指定ディレクトリ内のスキルをスキャン
   * @param dir - スキャン対象ディレクトリ
   * @param readonly - 読み取り専用フラグ
   */
  private async scanDirectory(
    dir: string,
    readonly: boolean,
  ): Promise<ScannedSkillMetadata[]>;

  /**
   * 単一スキルをパース
   * @param skillPath - スキルディレクトリパス
   * @param skillMdPath - SKILL.md ファイルパス
   * @param readonly - 読み取り専用フラグ
   */
  private async parseSkill(
    skillPath: string,
    skillMdPath: string,
    readonly: boolean,
  ): Promise<ScannedSkillMetadata | null>;

  /**
   * サブディレクトリをスキャン
   * @param skillPath - スキルディレクトリパス
   * @param subDir - サブディレクトリ名
   */
  private async scanSubDirectory(
    skillPath: string,
    subDir: SubDirectoryName,
  ): Promise<SkillSubResource[]>;

  /**
   * その他ファイルをスキャン
   * @param skillPath - スキルディレクトリパス
   */
  private async scanOtherFiles(skillPath: string): Promise<SkillOtherFile[]>;

  /**
   * Markdown ファイルから説明を抽出
   * @param filePath - Markdown ファイルパス
   */
  private async extractDescription(filePath: string): Promise<string>;

  /**
   * YAML Frontmatter をパース
   * @param content - Markdown コンテンツ
   */
  private parseFrontmatter(content: string): {
    frontmatter: Record<string, unknown>;
    body: string;
  };
}
```

---

## 3. 依存関係

### 3.1 外部ライブラリ

| ライブラリ | 用途                    | バージョン |
| ---------- | ----------------------- | ---------- |
| yaml       | YAML Frontmatter パース | ^2.x       |

### 3.2 内部モジュール

| モジュール   | 用途                      |
| ------------ | ------------------------- |
| @repo/shared | 型定義（SkillMetadata等） |
| fs/promises  | ファイルシステム操作      |
| path         | パス操作                  |

---

## 4. 定数定義

```typescript
/**
 * スキャン対象のサブディレクトリ
 */
const SUB_DIRECTORIES = [
  "agents",
  "references",
  "scripts",
  "assets",
  "schemas",
  "indexes",
] as const;

/**
 * その他ファイルのタイプ判定マップ
 */
const OTHER_FILE_TYPES: Record<string, SkillOtherFile["type"]> = {
  "EVALS.json": "evals",
  "LOGS.md": "logs",
  "package.json": "package",
};
```

---

## 5. 型定義

### 5.1 ScannedSkillMetadata

```typescript
/**
 * スキャン結果のスキルメタデータ
 * SkillMetadata を拡張し、readonly フラグを追加
 */
export interface ScannedSkillMetadata extends SkillMetadata {
  /** 読み取り専用フラグ */
  readonly: boolean;
}
```

### 5.2 SkillScannerOptions

```typescript
/**
 * SkillScanner のコンストラクタオプション
 */
interface SkillScannerOptions {
  /** aiworkflow スキルディレクトリのカスタムパス */
  aiworkflowSkillsDir?: string;
  /** Claude CLI スキルディレクトリのカスタムパス */
  claudeSkillsDir?: string;
}
```

---

## 6. 設計原則

### 6.1 単一責任の原則（SRP）

- SkillScanner はスキャン処理のみを担当
- YAML パース、ファイル操作は内部メソッドに分離

### 6.2 開放閉鎖の原則（OCP）

- `SUB_DIRECTORIES` 配列により、新しいサブディレクトリを容易に追加可能
- ファイルタイプ判定は `OTHER_FILE_TYPES` マップで管理

### 6.3 依存性注入（DI）

- コンストラクタでディレクトリパスを注入可能
- テスト時にフィクスチャディレクトリを指定可能

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
