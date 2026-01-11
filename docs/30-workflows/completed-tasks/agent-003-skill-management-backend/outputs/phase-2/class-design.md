# クラス設計書

## メタ情報

| 項目   | 内容                                    |
| ------ | --------------------------------------- |
| Phase  | 2                                       |
| タスク | タスク2: クラス設計                     |
| 作成日 | 2026-01-11                              |
| 配置先 | `apps/desktop/src/main/services/skill/` |

---

## 1. クラス図

```
┌─────────────────────────────────────────────────────────────────┐
│                        SkillService                              │
│  (Facade)                                                        │
├─────────────────────────────────────────────────────────────────┤
│ - cache: Map<string, Skill>                                      │
│ - lastScanTime: Date | null                                      │
├─────────────────────────────────────────────────────────────────┤
│ + scanAvailableSkills(forceRefresh): Promise<SkillScanResult>    │
│ + getImportedSkills(): Promise<Skill[]>                          │
│ + importSkills(skillIds): Promise<ImportResult>                  │
│ + removeSkill(skillId): Promise<RemoveResult>                    │
│ + getSkillById(id): Promise<Skill | null>                        │
│ + clearCache(): void                                             │
└─────────────────────────────────────────────────────────────────┘
         │                    │                       │
         ▼                    ▼                       ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐
│  SkillScanner   │  │  SkillParser    │  │ SkillImportManager  │
├─────────────────┤  ├─────────────────┤  ├─────────────────────┤
│ - basePath      │  │                 │  │ - store             │
├─────────────────┤  ├─────────────────┤  ├─────────────────────┤
│ + scanDirectory │  │ + parse         │  │ + importSkills      │
│ + setBasePath   │  │ - parseAnchors  │  │ + removeSkill       │
│ + getBasePath   │  │ - parseTriggers │  │ + getImportedIds    │
│ - validatePath  │  │ - generateId    │  │ - persist           │
└─────────────────┘  └─────────────────┘  └─────────────────────┘
         │
         ▼
┌─────────────────┐
│    FileSystem   │
│  (Node.js fs)   │
└─────────────────┘
```

---

## 2. SkillScanner クラス

### 2.1 責務

- `.claude/skills/`配下のディレクトリをスキャン
- SKILL.mdが存在するディレクトリのみを返却
- パストラバーサル攻撃を防止

### 2.2 インターフェース

```typescript
// apps/desktop/src/main/services/skill/SkillScanner.ts

import * as path from "path";
import * as fs from "fs/promises";

export class SkillScanner {
  private basePath: string;

  /**
   * コンストラクタ
   * @param basePath スキルを検索するベースディレクトリ
   */
  constructor(basePath: string) {
    this.basePath = path.resolve(basePath);
  }

  /**
   * スキルディレクトリをスキャンし、SKILL.mdが存在するパスを返す
   * @returns SKILL.mdへの絶対パスの配列
   */
  async scanDirectory(): Promise<string[]> {
    const skillPaths: string[] = [];
    const entries = await fs.readdir(this.basePath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith(".")) continue; // 隠しディレクトリを除外

      const skillMdPath = path.join(this.basePath, entry.name, "SKILL.md");
      this.validatePath(skillMdPath);

      try {
        await fs.access(skillMdPath);
        skillPaths.push(skillMdPath);
      } catch {
        // SKILL.mdが存在しない場合はスキップ
      }
    }

    return skillPaths;
  }

  /**
   * ベースパスを変更する
   * @param newPath 新しいベースパス
   */
  setBasePath(newPath: string): void {
    this.basePath = path.resolve(newPath);
  }

  /**
   * 現在のベースパスを取得する
   */
  getBasePath(): string {
    return this.basePath;
  }

  /**
   * パスがベースパス配下にあることを検証
   * @throws パストラバーサル攻撃を検知した場合
   */
  private validatePath(targetPath: string): void {
    const resolved = path.resolve(targetPath);
    if (!resolved.startsWith(this.basePath)) {
      throw new Error(`Path traversal detected: ${targetPath}`);
    }
  }
}
```

---

## 3. SkillParser クラス

### 3.1 責務

- SKILL.mdファイルを読み込み・解析
- YAML Frontmatterを解析
- description内のAnchors・Triggersを抽出
- 一意なIDを生成

### 3.2 インターフェース

```typescript
// apps/desktop/src/main/services/skill/SkillParser.ts

import * as fs from "fs/promises";
import * as path from "path";
import { createHash } from "crypto";
import matter from "gray-matter";
import type {
  Skill,
  Anchor,
  EnvironmentConfig,
} from "@repo/shared/types/agent";

export class SkillParser {
  /**
   * SKILL.mdを解析してSkillオブジェクトを返す
   * @param skillMdPath SKILL.mdへの絶対パス
   */
  async parse(skillMdPath: string): Promise<Skill> {
    const content = await fs.readFile(skillMdPath, "utf-8");
    const stat = await fs.stat(skillMdPath);
    const { data: frontmatter, content: body } = matter(content);

    const description = frontmatter.description || "";
    const slug = path.basename(path.dirname(skillMdPath));

    return {
      id: this.generateId(skillMdPath),
      name: frontmatter.name || slug,
      slug,
      description,
      path: skillMdPath,
      triggers: this.parseTriggers(description),
      anchors: this.parseAnchors(description),
      category: this.inferCategory(frontmatter.tags),
      environment: this.parseEnvironment(body),
      license: frontmatter.license,
      allowedTools: frontmatter["allowed-tools"],
      tags: frontmatter.tags,
      dependencies: frontmatter.dependencies,
      lastModified: stat.mtime,
    };
  }

  /**
   * descriptionからAnchorsを抽出
   * 形式: • {source} / 適用: {application} / 目的: {purpose}
   */
  private parseAnchors(description: string): Anchor[] {
    const anchors: Anchor[] = [];
    const anchorsMatch = description.match(
      /Anchors:\s*([\s\S]*?)(?=\n\n|Trigger:|$)/i,
    );

    if (!anchorsMatch) return anchors;

    const anchorsSection = anchorsMatch[1];
    const lines = anchorsSection.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      // • または - で始まる行を解析
      const match = line.match(
        /^[•\-]\s*(.+?)\s*\/\s*適用:\s*(.+?)\s*\/\s*目的:\s*(.+)$/,
      );
      if (match) {
        anchors.push({
          source: match[1].trim(),
          application: match[2].trim(),
          purpose: match[3].trim(),
        });
      }
    }

    return anchors;
  }

  /**
   * descriptionからTriggersを抽出
   * 形式: カンマ区切りのキーワード
   */
  private parseTriggers(description: string): string[] {
    const triggers: string[] = [];
    const triggerMatch = description.match(/Trigger:\s*([\s\S]*?)(?=\n\n|$)/i);

    if (!triggerMatch) return triggers;

    const triggerSection = triggerMatch[1];
    const lines = triggerSection.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      // "Use when"で始まる行は英語キーワードとして扱う
      if (line.toLowerCase().startsWith("use when")) {
        const keywords = line.replace(/^use when\s+/i, "").trim();
        triggers.push(keywords);
      } else {
        // カンマ区切りのキーワード
        const keywords = line
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);
        triggers.push(...keywords);
      }
    }

    return triggers;
  }

  /**
   * Environment設定を解析（将来拡張）
   */
  private parseEnvironment(content: string): EnvironmentConfig | undefined {
    // 将来実装
    return undefined;
  }

  /**
   * tagsからカテゴリを推論
   */
  private inferCategory(tags?: string[]): string | undefined {
    if (!tags || tags.length === 0) return undefined;
    return tags[0]; // 最初のタグをカテゴリとして使用
  }

  /**
   * パスからIDを生成（SHA-256の先頭16文字）
   */
  private generateId(skillPath: string): string {
    const hash = createHash("sha256").update(skillPath).digest("hex");
    return hash.substring(0, 16);
  }
}
```

---

## 4. SkillImportManager クラス

### 4.1 責務

- インポート済みスキルIDの管理
- electron-storeによる永続化
- インポート・削除操作

### 4.2 インターフェース

```typescript
// apps/desktop/src/main/services/skill/SkillImportManager.ts

import Store from "electron-store";
import type { ImportResult, RemoveResult } from "@repo/shared/types/agent";

interface SkillImportStore {
  importedSkillIds: string[];
  skillBasePath: string;
}

export class SkillImportManager {
  private store: Store<SkillImportStore>;
  private importedIds: Set<string>;

  constructor(store: Store<SkillImportStore>) {
    this.store = store;
    this.importedIds = new Set(store.get("importedSkillIds", []));
  }

  /**
   * スキルをインポート
   * @param skillIds インポートするスキルIDの配列
   */
  async importSkills(skillIds: string[]): Promise<ImportResult> {
    const errors: string[] = [];
    let importedCount = 0;

    for (const skillId of skillIds) {
      if (this.importedIds.has(skillId)) {
        // 既にインポート済み
        continue;
      }

      try {
        this.importedIds.add(skillId);
        importedCount++;
      } catch (e) {
        errors.push(`Failed to import ${skillId}: ${e}`);
      }
    }

    this.persist();

    return {
      success: errors.length === 0,
      importedCount,
      errors,
    };
  }

  /**
   * スキルを削除
   * @param skillId 削除するスキルID
   */
  async removeSkill(skillId: string): Promise<RemoveResult> {
    const existed = this.importedIds.has(skillId);

    if (existed) {
      this.importedIds.delete(skillId);
      this.persist();
    }

    return {
      success: true,
      removed: existed,
    };
  }

  /**
   * インポート済みスキルIDを取得
   */
  getImportedSkillIds(): string[] {
    return Array.from(this.importedIds);
  }

  /**
   * スキルがインポート済みかを確認
   */
  isImported(skillId: string): boolean {
    return this.importedIds.has(skillId);
  }

  /**
   * インポート状態を永続化
   */
  private persist(): void {
    this.store.set("importedSkillIds", Array.from(this.importedIds));
  }
}
```

---

## 5. SkillService クラス

### 5.1 責務

- SkillScanner, SkillParser, SkillImportManagerの統合（Facade）
- キャッシュ管理
- IPCハンドラーからの呼び出しに対応

### 5.2 インターフェース

```typescript
// apps/desktop/src/main/services/skill/SkillService.ts

import type {
  Skill,
  SkillScanResult,
  SkillScanError,
  ImportResult,
  RemoveResult,
} from "@repo/shared/types/agent";
import { SkillScanner } from "./SkillScanner";
import { SkillParser } from "./SkillParser";
import { SkillImportManager } from "./SkillImportManager";

export class SkillService {
  private cache: Map<string, Skill> = new Map();
  private lastScanTime: Date | null = null;

  constructor(
    private scanner: SkillScanner,
    private parser: SkillParser,
    private importManager: SkillImportManager,
  ) {}

  /**
   * 利用可能な全スキルを取得
   * @param forceRefresh キャッシュを無視して再スキャン
   */
  async scanAvailableSkills(forceRefresh = false): Promise<SkillScanResult> {
    if (!forceRefresh && this.cache.size > 0) {
      return {
        skills: Array.from(this.cache.values()),
        errors: [],
        scannedAt: this.lastScanTime!,
      };
    }

    const skills: Skill[] = [];
    const errors: SkillScanError[] = [];

    const skillPaths = await this.scanner.scanDirectory();

    for (const skillPath of skillPaths) {
      try {
        const skill = await this.parser.parse(skillPath);
        skills.push(skill);
        this.cache.set(skill.id, skill);
      } catch (e) {
        errors.push({
          path: skillPath,
          error: e instanceof Error ? e.message : String(e),
          code: "PARSE_ERROR",
        });
      }
    }

    this.lastScanTime = new Date();

    return {
      skills,
      errors,
      scannedAt: this.lastScanTime,
    };
  }

  /**
   * インポート済みスキルを取得
   */
  async getImportedSkills(): Promise<Skill[]> {
    // キャッシュが空の場合はスキャン
    if (this.cache.size === 0) {
      await this.scanAvailableSkills();
    }

    const importedIds = this.importManager.getImportedSkillIds();
    return importedIds
      .map((id) => this.cache.get(id))
      .filter((skill): skill is Skill => skill !== undefined);
  }

  /**
   * スキルをインポート
   */
  async importSkills(skillIds: string[]): Promise<ImportResult> {
    return this.importManager.importSkills(skillIds);
  }

  /**
   * スキルを削除
   */
  async removeSkill(skillId: string): Promise<RemoveResult> {
    return this.importManager.removeSkill(skillId);
  }

  /**
   * スキル詳細を取得
   */
  async getSkillById(id: string): Promise<Skill | null> {
    // キャッシュから取得
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    // キャッシュにない場合はスキャン
    await this.scanAvailableSkills();
    return this.cache.get(id) || null;
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache.clear();
    this.lastScanTime = null;
  }
}
```

---

## 6. モジュールエクスポート

```typescript
// apps/desktop/src/main/services/skill/index.ts

export { SkillScanner } from "./SkillScanner";
export { SkillParser } from "./SkillParser";
export { SkillImportManager } from "./SkillImportManager";
export { SkillService } from "./SkillService";
```

---

## 7. ディレクトリ構造

```
apps/desktop/src/main/services/skill/
├── SkillScanner.ts           # ディレクトリスキャン
├── SkillParser.ts            # SKILL.md解析
├── SkillImportManager.ts     # インポート管理・永続化
├── SkillService.ts           # 統合サービス（Facade）
├── index.ts                  # モジュールエクスポート
└── __tests__/
    ├── SkillScanner.test.ts
    ├── SkillParser.test.ts
    ├── SkillImportManager.test.ts
    ├── SkillService.test.ts
    └── integration.test.ts
```
