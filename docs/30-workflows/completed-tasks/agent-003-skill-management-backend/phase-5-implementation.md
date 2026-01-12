# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 5                      |
| Phase名    | 実装                   |
| 前提Phase  | Phase 4                |
| 後続Phase  | Phase 6                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-11             |
| 機能名     | スキル管理バックエンド |

---

## 目的

TDDのGreen段階として、Phase 4で作成したテストを通す最小限の実装を行う。設計に基づき、型定義・クラス・IPCハンドラーを実装する。

## 背景

テストが作成され、期待される動作が明確になった。TDDのプラクティスに従い、テストを通す最小限の実装を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 型定義の実装

**目的**: packages/sharedに共有型定義を実装する

**実行手順**:

1. 型定義ファイルを作成する:
   - `packages/shared/src/types/agent.ts`

2. Phase 2で設計した型定義を実装する:

```typescript
// packages/shared/src/types/agent.ts

export interface Anchor {
  source: string;
  application: string;
  purpose: string;
}

export interface EnvironmentConfig {
  type: "html" | "markdown" | "code";
  autoRefresh?: boolean;
  debounce?: number;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Anchor[];
  category?: string;
  environment?: EnvironmentConfig;
  license?: string;
  allowedTools?: string[];
  tags?: string[];
  dependencies?: string[];
  lastModified: Date;
}

export interface SkillScanError {
  path: string;
  error: string;
  code: "PARSE_ERROR" | "READ_ERROR" | "INVALID_FORMAT";
}

export interface SkillScanResult {
  skills: Skill[];
  errors: SkillScanError[];
  scannedAt: Date;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
}

export interface RemoveResult {
  success: boolean;
  removed: boolean;
}

export interface IPCError {
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "AUTH_ERROR" | "INTERNAL_ERROR";
  message: string;
  details?: unknown;
}
```

3. エクスポートを追加する:
   - `packages/shared/src/types/index.ts` に追加

**期待される成果物**:

- `packages/shared/src/types/agent.ts`

---

### タスク2: SkillScannerの実装

**目的**: ディレクトリスキャン機能を実装する

**実行手順**:

1. ファイルを作成する:
   - `apps/desktop/src/main/services/skill/SkillScanner.ts`

2. 実装する:

```typescript
// apps/desktop/src/main/services/skill/SkillScanner.ts
import * as fs from "fs/promises";
import * as path from "path";

export class SkillScanner {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = path.resolve(basePath);
  }

  async scanDirectory(): Promise<string[]> {
    const skillPaths: string[] = [];

    try {
      const entries = await fs.readdir(this.basePath, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith(".")) continue;

        const skillMdPath = path.join(this.basePath, entry.name, "SKILL.md");
        this.validatePath(skillMdPath);

        try {
          await fs.access(skillMdPath);
          skillPaths.push(skillMdPath);
        } catch {
          // SKILL.mdが存在しない場合はスキップ
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(`Base path does not exist: ${this.basePath}`);
      }
      throw error;
    }

    return skillPaths;
  }

  setBasePath(basePath: string): void {
    this.basePath = path.resolve(basePath);
  }

  getBasePath(): string {
    return this.basePath;
  }

  private validatePath(targetPath: string): void {
    const resolved = path.resolve(targetPath);
    if (!resolved.startsWith(this.basePath)) {
      throw new Error(`Path traversal detected: ${targetPath}`);
    }
  }
}
```

3. テストを実行して確認する:

```bash
pnpm --filter @repo/desktop test src/main/services/skill/__tests__/SkillScanner.test.ts
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/SkillScanner.ts`

---

### タスク3: SkillParserの実装

**目的**: SKILL.md解析機能を実装する

**実行手順**:

1. ファイルを作成する:
   - `apps/desktop/src/main/services/skill/SkillParser.ts`

2. 実装する:

```typescript
// apps/desktop/src/main/services/skill/SkillParser.ts
import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import * as yaml from "yaml";
import type { Skill, Anchor, EnvironmentConfig } from "@repo/shared";

interface SkillFrontmatter {
  name?: string;
  description?: string;
  license?: string;
  "allowed-tools"?: string[];
  tags?: string[];
  dependencies?: string[];
}

const DEFAULT_SKILL: Partial<Skill> = {
  name: "Unknown Skill",
  description: "Description not available",
  triggers: [],
  anchors: [],
};

export class SkillParser {
  async parse(skillMdPath: string): Promise<Skill> {
    const content = await fs.readFile(skillMdPath, "utf-8");
    const stats = await fs.stat(skillMdPath);
    const slug = path.basename(path.dirname(skillMdPath));

    const frontmatter = this.parseFrontmatter(content);
    const description = frontmatter.description || DEFAULT_SKILL.description!;

    return {
      id: this.generateId(skillMdPath),
      name: frontmatter.name || DEFAULT_SKILL.name!,
      slug,
      description,
      path: skillMdPath,
      triggers: this.parseTriggers(description),
      anchors: this.parseAnchors(description),
      category: this.inferCategory(frontmatter.tags),
      environment: this.parseEnvironment(content),
      license: frontmatter.license,
      allowedTools: frontmatter["allowed-tools"],
      tags: frontmatter.tags,
      dependencies: frontmatter.dependencies,
      lastModified: stats.mtime,
    };
  }

  private parseFrontmatter(content: string): SkillFrontmatter {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    try {
      return yaml.parse(match[1]) || {};
    } catch {
      return {};
    }
  }

  parseAnchors(description: string): Anchor[] {
    const anchors: Anchor[] = [];
    const anchorsMatch = description.match(
      /Anchors:\n([\s\S]*?)(?=\n\n|Trigger:|$)/,
    );

    if (!anchorsMatch) return anchors;

    const lines = anchorsMatch[1].split("\n");
    for (const line of lines) {
      // Format: • {{source}} / 適用: {{application}} / 目的: {{purpose}}
      const match = line.match(
        /[•\-]\s*(.+?)\s*\/\s*適用:\s*(.+?)\s*\/\s*目的:\s*(.+)/,
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

  parseTriggers(description: string): string[] {
    const triggerMatch = description.match(/Trigger:\n(.+?)(?:\n\n|$)/s);
    if (!triggerMatch) return [];

    return triggerMatch[1]
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !t.startsWith("Use when"));
  }

  private parseEnvironment(content: string): EnvironmentConfig | undefined {
    // Environmentセクションの解析（将来拡張）
    return undefined;
  }

  private inferCategory(tags?: string[]): string | undefined {
    if (!tags || tags.length === 0) return undefined;
    return tags[0];
  }

  private generateId(filePath: string): string {
    return crypto
      .createHash("sha256")
      .update(filePath)
      .digest("hex")
      .slice(0, 16);
  }
}
```

3. テストを実行して確認する:

```bash
pnpm --filter @repo/desktop test src/main/services/skill/__tests__/SkillParser.test.ts
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/SkillParser.ts`

---

### タスク4: SkillImportManagerの実装

**目的**: インポート管理機能を実装する

**実行手順**:

1. ファイルを作成する:
   - `apps/desktop/src/main/services/skill/SkillImportManager.ts`

2. 実装する:

```typescript
// apps/desktop/src/main/services/skill/SkillImportManager.ts
import type { ImportResult, RemoveResult } from "@repo/shared";
import type ElectronStore from "electron-store";

const STORE_KEY = "agent.importedSkillIds";

export class SkillImportManager {
  private importedIds: Set<string>;

  constructor(private store: ElectronStore) {
    const stored = this.store.get(STORE_KEY, []) as string[];
    this.importedIds = new Set(stored);
  }

  async importSkills(skillIds: string[]): Promise<ImportResult> {
    const errors: string[] = [];
    let importedCount = 0;

    for (const id of skillIds) {
      if (!this.importedIds.has(id)) {
        this.importedIds.add(id);
        importedCount++;
      }
    }

    this.persist();

    return {
      success: errors.length === 0,
      importedCount,
      errors,
    };
  }

  async removeSkill(skillId: string): Promise<RemoveResult> {
    const removed = this.importedIds.has(skillId);

    if (removed) {
      this.importedIds.delete(skillId);
      this.persist();
    }

    return {
      success: true,
      removed,
    };
  }

  getImportedSkillIds(): string[] {
    return Array.from(this.importedIds);
  }

  private persist(): void {
    this.store.set(STORE_KEY, Array.from(this.importedIds));
  }
}
```

3. テストを実行して確認する:

```bash
pnpm --filter @repo/desktop test src/main/services/skill/__tests__/SkillImportManager.test.ts
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/SkillImportManager.ts`

---

### タスク5: SkillServiceの実装

**目的**: 統合サービス（Facade）を実装する

**実行手順**:

1. ファイルを作成する:
   - `apps/desktop/src/main/services/skill/SkillService.ts`

2. 実装する:

```typescript
// apps/desktop/src/main/services/skill/SkillService.ts
import type {
  Skill,
  SkillScanResult,
  SkillScanError,
  ImportResult,
  RemoveResult,
} from "@repo/shared";
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
      } catch (error) {
        errors.push({
          path: skillPath,
          error: (error as Error).message,
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

  async getImportedSkills(): Promise<Skill[]> {
    const importedIds = this.importManager.getImportedSkillIds();

    if (this.cache.size === 0) {
      await this.scanAvailableSkills();
    }

    return importedIds
      .map((id) => this.cache.get(id))
      .filter((skill): skill is Skill => skill !== undefined);
  }

  async importSkills(skillIds: string[]): Promise<ImportResult> {
    return this.importManager.importSkills(skillIds);
  }

  async removeSkill(skillId: string): Promise<RemoveResult> {
    return this.importManager.removeSkill(skillId);
  }

  async getSkillById(id: string): Promise<Skill | null> {
    if (this.cache.size === 0) {
      await this.scanAvailableSkills();
    }
    return this.cache.get(id) || null;
  }

  clearCache(): void {
    this.cache.clear();
    this.lastScanTime = null;
  }
}
```

3. インデックスファイルを作成する:
   - `apps/desktop/src/main/services/skill/index.ts`

```typescript
export { SkillScanner } from "./SkillScanner";
export { SkillParser } from "./SkillParser";
export { SkillImportManager } from "./SkillImportManager";
export { SkillService } from "./SkillService";
```

4. テストを実行して確認する:

```bash
pnpm --filter @repo/desktop test src/main/services/skill/__tests__/SkillService.test.ts
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/SkillService.ts`
- `apps/desktop/src/main/services/skill/index.ts`

---

### タスク6: IPCハンドラーの実装

**目的**: agentHandlers IPCハンドラーを実装する

**実行手順**:

1. ファイルを作成する:
   - `apps/desktop/src/main/ipc/agentHandlers.ts`

2. 実装する:

```typescript
// apps/desktop/src/main/ipc/agentHandlers.ts
import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { SkillService } from "../services/skill/SkillService";

function validateIpcSender(sender: Electron.WebContents): boolean {
  if (sender.getURL().startsWith("devtools://")) {
    return false;
  }
  const window = BrowserWindow.fromWebContents(sender);
  return window !== null;
}

export function registerAgentHandlers(skillService: SkillService): void {
  ipcMain.handle(
    IPC_CHANNELS.AGENT_SCAN_AVAILABLE_SKILLS,
    async (event: IpcMainInvokeEvent, _args?: { basePath?: string }) => {
      if (!validateIpcSender(event.sender)) {
        throw { code: "AUTH_ERROR", message: "Invalid IPC sender" };
      }
      return skillService.scanAvailableSkills();
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.AGENT_GET_IMPORTED_SKILLS,
    async (event: IpcMainInvokeEvent) => {
      if (!validateIpcSender(event.sender)) {
        throw { code: "AUTH_ERROR", message: "Invalid IPC sender" };
      }
      return skillService.getImportedSkills();
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.AGENT_IMPORT_SKILLS,
    async (event: IpcMainInvokeEvent, args: { skillIds: string[] }) => {
      if (!validateIpcSender(event.sender)) {
        throw { code: "AUTH_ERROR", message: "Invalid IPC sender" };
      }
      if (!Array.isArray(args?.skillIds)) {
        throw {
          code: "VALIDATION_ERROR",
          message: "skillIds must be an array",
        };
      }
      return skillService.importSkills(args.skillIds);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.AGENT_REMOVE_SKILL,
    async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
      if (!validateIpcSender(event.sender)) {
        throw { code: "AUTH_ERROR", message: "Invalid IPC sender" };
      }
      if (typeof args?.skillId !== "string") {
        throw { code: "VALIDATION_ERROR", message: "skillId must be a string" };
      }
      return skillService.removeSkill(args.skillId);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.AGENT_GET_SKILL_DETAIL,
    async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
      if (!validateIpcSender(event.sender)) {
        throw { code: "AUTH_ERROR", message: "Invalid IPC sender" };
      }
      if (typeof args?.skillId !== "string") {
        throw { code: "VALIDATION_ERROR", message: "skillId must be a string" };
      }
      return skillService.getSkillById(args.skillId);
    },
  );
}
```

3. テストを実行して確認する:

```bash
pnpm --filter @repo/desktop test src/main/ipc/__tests__/agentHandlers.test.ts
```

**期待される成果物**:

- `apps/desktop/src/main/ipc/agentHandlers.ts`

---

### タスク7: IPCチャネル定義の更新

**目的**: preloadのチャネル定義を更新する

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` を更新する:

```typescript
// apps/desktop/src/preload/channels.ts に追加

export const IPC_CHANNELS = {
  // 既存チャネル...

  // Agent関連
  AGENT_SCAN_AVAILABLE_SKILLS: "agent:scan-available-skills",
  AGENT_GET_IMPORTED_SKILLS: "agent:get-imported-skills",
  AGENT_IMPORT_SKILLS: "agent:import-skills",
  AGENT_REMOVE_SKILL: "agent:remove-skill",
  AGENT_GET_SKILL_DETAIL: "agent:get-skill-detail",
} as const;
```

2. preload APIを更新する（必要に応じて）

**期待される成果物**:

- `apps/desktop/src/preload/channels.ts`（更新）

---

### タスク8: テスト実行確認（Green状態）

**目的**: 全テストが成功状態（Green）であることを確認する

**実行手順**:

1. 全テストを実行する:

```bash
pnpm --filter @repo/desktop test
```

2. 全テストが成功することを確認する

3. テスト成功結果を記録する:

```markdown
## テスト実行結果（Green状態）

### SkillScanner.test.ts

- ✓ should find directories with SKILL.md
- ✓ should ignore directories without SKILL.md
  ...

### 総計

- テスト数: XX
- 成功: XX
- 失敗: 0
```

**期待される成果物**:

- `outputs/phase-5/test-green-status.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                         | 内容                |
| -------------------- | ---------------------------------------------------------------------------- | ------------------- |
| Phase 2設計          | `outputs/phase-2/design.md`                                                  | 実装対象の設計      |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC通信セキュリティ |

---

## 成果物

| 成果物             | パス                                                         | 内容                 |
| ------------------ | ------------------------------------------------------------ | -------------------- |
| 型定義             | `packages/shared/src/types/agent.ts`                         | 共有型定義           |
| SkillScanner       | `apps/desktop/src/main/services/skill/SkillScanner.ts`       | ディレクトリスキャン |
| SkillParser        | `apps/desktop/src/main/services/skill/SkillParser.ts`        | SKILL.md解析         |
| SkillImportManager | `apps/desktop/src/main/services/skill/SkillImportManager.ts` | インポート管理       |
| SkillService       | `apps/desktop/src/main/services/skill/SkillService.ts`       | 統合サービス         |
| index              | `apps/desktop/src/main/services/skill/index.ts`              | エクスポート         |
| agentHandlers      | `apps/desktop/src/main/ipc/agentHandlers.ts`                 | IPCハンドラー        |
| channels           | `apps/desktop/src/preload/channels.ts`                       | チャネル定義（更新） |
| Green状態確認      | `outputs/phase-5/test-green-status.md`                       | テスト成功確認       |

---

## 統合テスト連携

**Phase 5での必須アクション**: Main Process↔Renderer接続の実装とテスト支援コード整備

- [ ] IPCハンドラーが正常に登録されることを確認
- [ ] preloadのチャネル定義が更新されていることを確認
- [ ] 型定義がpackages/sharedに追加されていることを確認

---

## 完了条件

- [ ] 型定義が実装されている
- [ ] SkillScannerが実装されている
- [ ] SkillParserが実装されている
- [ ] SkillImportManagerが実装されている
- [ ] SkillServiceが実装されている
- [ ] IPCハンドラーが実装されている
- [ ] チャネル定義が更新されている
- [ ] 全テストが成功状態（Green）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.json を更新

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-003-skill-management-backend/phase-6-test-expansion.md`
