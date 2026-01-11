# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 2                      |
| Phase名    | 設計                   |
| 前提Phase  | Phase 1                |
| 後続Phase  | Phase 3                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-11             |
| 機能名     | スキル管理バックエンド |

---

## 目的

Phase 1で定義した要件に基づき、スキル管理バックエンドの詳細設計を行う。型定義、クラス設計、IPC設計を100人中100人が同じ理解で実装できる粒度で設計する。

## 背景

要件定義が完了し、SKILL.md解析仕様・IPC契約が明確になった。この設計フェーズでは、実装に直結する詳細設計を行い、TDDでのテスト作成に必要な情報を提供する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 型定義の設計

**目的**: packages/sharedに共有型定義を設計する

**実行手順**:

1. システム仕様を確認する:
   - `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`

2. 以下の型定義を設計する:

```typescript
// packages/shared/src/types/agent.ts

/** スキルアンカー情報 */
export interface Anchor {
  source: string; // アンカー名（書籍名、ルール名等）
  application: string; // 適用範囲
  purpose: string; // 目的
}

/** スキル環境設定 */
export interface EnvironmentConfig {
  type: "html" | "markdown" | "code";
  autoRefresh?: boolean;
  debounce?: number;
}

/** スキルメタデータ */
export interface Skill {
  id: string; // パスから生成したハッシュ（SHA-256の先頭16文字）
  name: string; // SKILL.md内のnameフィールド
  slug: string; // ディレクトリ名
  description: string; // SKILL.md内のdescriptionフィールド
  path: string; // SKILL.mdへの絶対パス
  triggers: string[]; // Trigger: セクションから抽出
  anchors: Anchor[]; // Anchors: セクションから抽出
  category?: string; // カテゴリ（tagsから推論）
  environment?: EnvironmentConfig;
  license?: string;
  allowedTools?: string[];
  tags?: string[];
  dependencies?: string[];
  lastModified: Date;
}

/** スキルスキャンエラー */
export interface SkillScanError {
  path: string;
  error: string;
  code: "PARSE_ERROR" | "READ_ERROR" | "INVALID_FORMAT";
}

/** スキルスキャン結果 */
export interface SkillScanResult {
  skills: Skill[];
  errors: SkillScanError[];
  scannedAt: Date;
}

/** インポート結果 */
export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
}

/** 削除結果 */
export interface RemoveResult {
  success: boolean;
  removed: boolean;
}

/** IPC共通エラー */
export interface IPCError {
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "AUTH_ERROR" | "INTERNAL_ERROR";
  message: string;
  details?: unknown;
}
```

**期待される成果物**:

- `outputs/phase-2/type-definitions.md`

---

### タスク2: クラス設計

**目的**: Main Processサービス層のクラス設計を行う

**実行手順**:

1. 以下のクラスを設計する:

**SkillScanner**: ディレクトリスキャン責務

```typescript
// apps/desktop/src/main/services/skill/SkillScanner.ts

export class SkillScanner {
  constructor(private basePath: string) {}

  /**
   * スキルディレクトリをスキャンし、SKILL.mdが存在するパスを返す
   * @returns SKILL.mdへの絶対パスの配列
   */
  async scanDirectory(): Promise<string[]> {}

  /**
   * ベースパスを変更する
   */
  setBasePath(path: string): void {}

  /**
   * ベースパスを取得する
   */
  getBasePath(): string {}
}
```

**SkillParser**: SKILL.md解析責務

```typescript
// apps/desktop/src/main/services/skill/SkillParser.ts

export class SkillParser {
  /**
   * SKILL.mdを解析してSkillオブジェクトを返す
   * @param skillMdPath SKILL.mdへの絶対パス
   */
  async parse(skillMdPath: string): Promise<Skill> {}

  /**
   * descriptionからAnchorsを抽出
   */
  private parseAnchors(description: string): Anchor[] {}

  /**
   * descriptionからTriggersを抽出
   */
  private parseTriggers(description: string): string[] {}

  /**
   * Environment設定を解析
   */
  private parseEnvironment(content: string): EnvironmentConfig | undefined {}

  /**
   * パスからIDを生成（SHA-256の先頭16文字）
   */
  private generateId(path: string): string {}
}
```

**SkillImportManager**: インポート管理責務

```typescript
// apps/desktop/src/main/services/skill/SkillImportManager.ts

export class SkillImportManager {
  constructor(private store: ElectronStore) {}

  /**
   * スキルをインポート
   */
  async importSkills(skillIds: string[]): Promise<ImportResult> {}

  /**
   * スキルを削除
   */
  async removeSkill(skillId: string): Promise<RemoveResult> {}

  /**
   * インポート済みスキルIDを取得
   */
  getImportedSkillIds(): string[] {}

  /**
   * インポート状態を永続化
   */
  private persist(): void {}
}
```

**SkillService**: 統合サービス（Facade）

```typescript
// apps/desktop/src/main/services/skill/SkillService.ts

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
   */
  async scanAvailableSkills(forceRefresh = false): Promise<SkillScanResult> {}

  /**
   * インポート済みスキルを取得
   */
  async getImportedSkills(): Promise<Skill[]> {}

  /**
   * スキルをインポート
   */
  async importSkills(skillIds: string[]): Promise<ImportResult> {}

  /**
   * スキルを削除
   */
  async removeSkill(skillId: string): Promise<RemoveResult> {}

  /**
   * スキル詳細を取得
   */
  async getSkillById(id: string): Promise<Skill | null> {}

  /**
   * キャッシュをクリア
   */
  clearCache(): void {}
}
```

2. クラス図を作成する:

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
└─────────────────┘  │ - generateId    │  └─────────────────────┘
                     └─────────────────┘
```

**期待される成果物**:

- `outputs/phase-2/class-design.md`

---

### タスク3: IPC設計

**目的**: IPCハンドラーとチャネル定義を設計する

**実行手順**:

1. システム仕様を確認する:
   - `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`

2. IPCチャネル定義を設計する:

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

3. IPCハンドラーを設計する:

```typescript
// apps/desktop/src/main/ipc/agentHandlers.ts

import { ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { SkillService } from "../services/skill/SkillService";
import { validateIpcSender } from "../infrastructure/security/ipc-validator";

export function registerAgentHandlers(skillService: SkillService): void {
  // agent:scan-available-skills
  ipcMain.handle(
    IPC_CHANNELS.AGENT_SCAN_AVAILABLE_SKILLS,
    async (event: IpcMainInvokeEvent, args?: { basePath?: string }) => {
      if (!validateIpcSender(event.sender)) {
        throw { code: "AUTH_ERROR", message: "Invalid IPC sender" };
      }
      return skillService.scanAvailableSkills();
    },
  );

  // agent:get-imported-skills
  ipcMain.handle(
    IPC_CHANNELS.AGENT_GET_IMPORTED_SKILLS,
    async (event: IpcMainInvokeEvent) => {
      if (!validateIpcSender(event.sender)) {
        throw { code: "AUTH_ERROR", message: "Invalid IPC sender" };
      }
      return skillService.getImportedSkills();
    },
  );

  // agent:import-skills
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

  // agent:remove-skill
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

  // agent:get-skill-detail
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

4. preload APIを設計する:

```typescript
// apps/desktop/src/preload/index.ts に追加

export const electronAPI = {
  // 既存API...

  // Agent関連
  agent: {
    scanAvailableSkills: (basePath?: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.AGENT_SCAN_AVAILABLE_SKILLS, {
        basePath,
      }),
    getImportedSkills: () =>
      ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_IMPORTED_SKILLS),
    importSkills: (skillIds: string[]) =>
      ipcRenderer.invoke(IPC_CHANNELS.AGENT_IMPORT_SKILLS, { skillIds }),
    removeSkill: (skillId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.AGENT_REMOVE_SKILL, { skillId }),
    getSkillDetail: (skillId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_SKILL_DETAIL, { skillId }),
  },
};
```

**期待される成果物**:

- `outputs/phase-2/ipc-design.md`

---

### タスク4: セキュリティ設計

**目的**: パストラバーサル防止・IPC sender検証の設計を行う

**実行手順**:

1. システム仕様を確認する:
   - `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`
   - `.claude/skills/aiworkflow-requirements/references/local-agent.md`

2. パストラバーサル防止を設計する:

```typescript
// apps/desktop/src/main/services/skill/SkillScanner.ts

import * as path from "path";
import * as fs from "fs/promises";

export class SkillScanner {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = path.resolve(basePath);
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

  async scanDirectory(): Promise<string[]> {
    const skillPaths: string[] = [];
    const entries = await fs.readdir(this.basePath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith(".")) continue; // 隠しディレクトリを除外

      const skillMdPath = path.join(this.basePath, entry.name, "SKILL.md");
      this.validatePath(skillMdPath); // パス検証

      try {
        await fs.access(skillMdPath);
        skillPaths.push(skillMdPath);
      } catch {
        // SKILL.mdが存在しない場合はスキップ
      }
    }

    return skillPaths;
  }
}
```

3. IPC sender検証を設計する:

```typescript
// apps/desktop/src/main/infrastructure/security/ipc-validator.ts

import { WebContents, BrowserWindow } from "electron";

/**
 * IPC senderが許可されたBrowserWindowからの呼び出しかを検証
 * DevToolsからの呼び出しを拒否
 */
export function validateIpcSender(sender: WebContents): boolean {
  // DevToolsからの呼び出しを検出・拒否
  if (sender.getURL().startsWith("devtools://")) {
    return false;
  }

  // senderに対応するBrowserWindowを取得
  const window = BrowserWindow.fromWebContents(sender);
  if (!window) {
    return false;
  }

  // 許可されたウィンドウかを確認
  // 本実装では単純にBrowserWindowが存在すればOK
  // 将来的にはウィンドウIDのホワイトリスト検証を追加可能
  return true;
}
```

**期待される成果物**:

- `outputs/phase-2/security-design.md`

---

### タスク5: 設計ドキュメント統合

**目的**: 全設計を1つのドキュメントにまとめる

**実行手順**:

1. タスク1-4の成果物を統合する
2. `outputs/phase-2/design.md` を作成する
3. 以下のセクションを含める:
   - 型定義
   - クラス設計
   - クラス図
   - IPC設計
   - セキュリティ設計
   - ディレクトリ構造

**期待される成果物**:

- `outputs/phase-2/design.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                            |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | agentSlice、Zustand設計         |
| Electronセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC通信セキュリティ、sender検証 |
| ローカルエージェント   | `.claude/skills/aiworkflow-requirements/references/local-agent.md`           | パス検証、ファイルアクセス制限  |

---

## 成果物

| 成果物           | パス                                  | 内容                     |
| ---------------- | ------------------------------------- | ------------------------ |
| 型定義           | `outputs/phase-2/type-definitions.md` | TypeScript型定義         |
| クラス設計       | `outputs/phase-2/class-design.md`     | クラス図・メソッド設計   |
| IPC設計          | `outputs/phase-2/ipc-design.md`       | チャネル・ハンドラー設計 |
| セキュリティ設計 | `outputs/phase-2/security-design.md`  | セキュリティ対策設計     |
| 設計（統合）     | `outputs/phase-2/design.md`           | 全設計統合ドキュメント   |

---

## 統合テスト連携

**Phase 2での必須アクション**: IPC契約・型定義・エラーレスポンス形式を設計に反映

- [ ] IPCチャネル名と引数・戻り値の型を設計に含める
- [ ] エラーレスポンス形式（IPCError）を設計に含める
- [ ] Main Process↔Renderer間の契約を明確化

---

## 完了条件

- [ ] 型定義が設計されている
- [ ] クラス設計が完成している（SkillScanner, SkillParser, SkillImportManager, SkillService）
- [ ] クラス図が作成されている
- [ ] IPC設計が完成している
- [ ] セキュリティ設計が完成している（パストラバーサル防止、sender検証）
- [ ] 全設計が `outputs/phase-2/design.md` に統合されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.json を更新

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-003-skill-management-backend/phase-3-design-review.md`
