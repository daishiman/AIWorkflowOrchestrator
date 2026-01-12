# スキル管理バックエンド - 設計書（統合版）

## メタ情報

| 項目     | 内容                          |
| -------- | ----------------------------- |
| Phase    | 2                             |
| タスク   | タスク5: 設計ドキュメント統合 |
| 作成日   | 2026-01-11                    |
| 機能名   | スキル管理バックエンド        |
| タスクID | AGENT-003                     |

---

## 1. 型定義

### 1.1 スキル関連型

```typescript
// packages/shared/src/types/agent.ts

/**
 * スキルアンカー情報
 * SKILL.mdのdescription内のAnchors:セクションから抽出
 */
export interface Anchor {
  /** アンカー名（書籍名、ルール名、API仕様名等） */
  source: string;
  /** 適用範囲（どの部分に適用するか） */
  application: string;
  /** 目的（なぜこのアンカーを参照するか） */
  purpose: string;
}

/**
 * スキル環境設定
 * SKILL.md本文のEnvironmentセクションから抽出（将来実装）
 */
export interface EnvironmentConfig {
  /** 実行環境タイプ */
  type: "html" | "markdown" | "code";
  /** 自動リフレッシュ有効化 */
  autoRefresh?: boolean;
  /** デバウンス時間（ミリ秒） */
  debounce?: number;
}

/**
 * スキルメタデータ
 * SKILL.mdから解析された情報を格納
 */
export interface Skill {
  /** 一意識別子（パスから生成したSHA-256の先頭16文字） */
  id: string;
  /** スキル名（SKILL.md frontmatterのnameフィールド） */
  name: string;
  /** スラッグ（ディレクトリ名、URLセーフ） */
  slug: string;
  /** スキル説明（SKILL.md frontmatterのdescriptionフィールド） */
  description: string;
  /** SKILL.mdへの絶対パス */
  path: string;
  /** トリガーキーワード配列（description内のTrigger:セクションから抽出） */
  triggers: string[];
  /** アンカー配列（description内のAnchors:セクションから抽出） */
  anchors: Anchor[];
  /** カテゴリ（tagsから推論、任意） */
  category?: string;
  /** 実行環境設定（任意、将来拡張） */
  environment?: EnvironmentConfig;
  /** ライセンス（SKILL.md frontmatterから） */
  license?: string;
  /** 許可ツール（SKILL.md frontmatterのallowed-toolsから） */
  allowedTools?: string[];
  /** タグ（SKILL.md frontmatterから） */
  tags?: string[];
  /** 依存スキル（SKILL.md frontmatterのdependenciesから） */
  dependencies?: string[];
  /** 最終更新日時（ファイルのmtime） */
  lastModified: Date;
}
```

### 1.2 スキャン結果型

```typescript
/**
 * スキルスキャン時のエラー情報
 */
export interface SkillScanError {
  /** 解析失敗したファイルのパス */
  path: string;
  /** エラーメッセージ */
  error: string;
  /** エラーコード */
  code: "PARSE_ERROR" | "READ_ERROR" | "INVALID_FORMAT";
}

/**
 * スキルスキャン結果
 */
export interface SkillScanResult {
  /** 正常に解析されたスキル配列 */
  skills: Skill[];
  /** 解析失敗したスキルのエラー情報 */
  errors: SkillScanError[];
  /** スキャン実行日時 */
  scannedAt: Date;
}
```

### 1.3 操作結果型

```typescript
/**
 * スキルインポート結果
 */
export interface ImportResult {
  /** 操作成功フラグ */
  success: boolean;
  /** インポートされたスキル数 */
  importedCount: number;
  /** 発生したエラーメッセージ配列 */
  errors: string[];
}

/**
 * スキル削除結果
 */
export interface RemoveResult {
  /** 操作成功フラグ */
  success: boolean;
  /** 実際に削除されたかどうか */
  removed: boolean;
}
```

### 1.4 エラー型

```typescript
/**
 * IPC通信共通エラー
 */
export interface IPCError {
  /** エラーコード */
  code:
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "AUTH_ERROR"
    | "INTERNAL_ERROR"
    | "PATH_TRAVERSAL";
  /** ユーザー向けエラーメッセージ */
  message: string;
  /** デバッグ情報（開発時のみ） */
  details?: unknown;
}
```

---

## 2. クラス設計

### 2.1 クラス図

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

### 2.2 SkillScanner

**責務**: `.claude/skills/`配下のディレクトリをスキャンし、SKILL.mdが存在するパスを返す

```typescript
// apps/desktop/src/main/services/skill/SkillScanner.ts

export class SkillScanner {
  private basePath: string;

  constructor(basePath: string);
  async scanDirectory(): Promise<string[]>;
  setBasePath(newPath: string): void;
  getBasePath(): string;
  private validatePath(targetPath: string): void;
}
```

### 2.3 SkillParser

**責務**: SKILL.mdファイルを読み込み・解析し、Skillオブジェクトを生成

```typescript
// apps/desktop/src/main/services/skill/SkillParser.ts

export class SkillParser {
  async parse(skillMdPath: string): Promise<Skill>;
  private parseAnchors(description: string): Anchor[];
  private parseTriggers(description: string): string[];
  private parseEnvironment(content: string): EnvironmentConfig | undefined;
  private inferCategory(tags?: string[]): string | undefined;
  private generateId(skillPath: string): string;
}
```

### 2.4 SkillImportManager

**責務**: インポート済みスキルIDの管理とelectron-storeによる永続化

```typescript
// apps/desktop/src/main/services/skill/SkillImportManager.ts

export class SkillImportManager {
  private store: Store<SkillImportStore>;
  private importedIds: Set<string>;

  constructor(store: Store<SkillImportStore>);
  async importSkills(skillIds: string[]): Promise<ImportResult>;
  async removeSkill(skillId: string): Promise<RemoveResult>;
  getImportedSkillIds(): string[];
  isImported(skillId: string): boolean;
  private persist(): void;
}
```

### 2.5 SkillService

**責務**: Facadeパターンとして他クラスを統合、キャッシュ管理

```typescript
// apps/desktop/src/main/services/skill/SkillService.ts

export class SkillService {
  private cache: Map<string, Skill>;
  private lastScanTime: Date | null;

  constructor(
    scanner: SkillScanner,
    parser: SkillParser,
    importManager: SkillImportManager,
  );
  async scanAvailableSkills(forceRefresh?: boolean): Promise<SkillScanResult>;
  async getImportedSkills(): Promise<Skill[]>;
  async importSkills(skillIds: string[]): Promise<ImportResult>;
  async removeSkill(skillId: string): Promise<RemoveResult>;
  async getSkillById(id: string): Promise<Skill | null>;
  clearCache(): void;
}
```

---

## 3. IPC設計

### 3.1 IPCチャネル一覧

| チャネル名                    | 方向          | 説明                   |
| ----------------------------- | ------------- | ---------------------- |
| `agent:scan-available-skills` | Renderer→Main | 利用可能スキル一覧取得 |
| `agent:get-imported-skills`   | Renderer→Main | インポート済みスキル   |
| `agent:import-skills`         | Renderer→Main | スキルインポート       |
| `agent:remove-skill`          | Renderer→Main | スキル削除             |
| `agent:get-skill-detail`      | Renderer→Main | スキル詳細取得         |

### 3.2 チャネル定数

```typescript
// apps/desktop/src/preload/channels.ts

export const IPC_CHANNELS = {
  AGENT_SCAN_AVAILABLE_SKILLS: "agent:scan-available-skills",
  AGENT_GET_IMPORTED_SKILLS: "agent:get-imported-skills",
  AGENT_IMPORT_SKILLS: "agent:import-skills",
  AGENT_REMOVE_SKILL: "agent:remove-skill",
  AGENT_GET_SKILL_DETAIL: "agent:get-skill-detail",
} as const;
```

### 3.3 IPCハンドラー登録

```typescript
// apps/desktop/src/main/ipc/agentHandlers.ts

export function registerAgentHandlers(skillService: SkillService): void;
export function unregisterAgentHandlers(): void;
```

### 3.4 Preload API

```typescript
// apps/desktop/src/preload/index.ts

const agentAPI = {
  scanAvailableSkills: (basePath?: string, forceRefresh?: boolean) =>
    Promise<SkillScanResult>,
  getImportedSkills: () => Promise<Skill[]>,
  importSkills: (skillIds: string[]) => Promise<ImportResult>,
  removeSkill: (skillId: string) => Promise<RemoveResult>,
  getSkillDetail: (skillId: string) => Promise<Skill | null>,
};
```

---

## 4. セキュリティ設計

### 4.1 脅威と対策

| 脅威                   | リスク | 対策                       |
| ---------------------- | ------ | -------------------------- |
| パストラバーサル攻撃   | 高     | パス正規化・ベースパス検証 |
| 不正IPC呼び出し        | 高     | IPC sender検証             |
| DevToolsからの攻撃     | 中     | DevTools呼び出し検出・拒否 |
| 入力値インジェクション | 中     | 入力バリデーション         |

### 4.2 パストラバーサル防止

```typescript
// apps/desktop/src/main/services/skill/SkillScanner.ts

private validatePath(targetPath: string): void {
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(this.basePath + path.sep)) {
    throw new Error(`Path traversal detected: ${targetPath}`);
  }
}
```

### 4.3 IPC sender検証

```typescript
// apps/desktop/src/main/infrastructure/security/ipc-validator.ts

export function validateIpcSender(sender: WebContents): boolean {
  // 1. DevToolsからの呼び出しを拒否
  if (sender.getURL().startsWith("devtools://")) return false;

  // 2. プロトコル検証
  if (!isAllowedProtocol(sender.getURL())) return false;

  // 3. BrowserWindow存在確認
  const window = BrowserWindow.fromWebContents(sender);
  if (!window || window.isDestroyed()) return false;

  return true;
}
```

### 4.4 入力バリデーション

| フィールド | バリデーション                         |
| ---------- | -------------------------------------- |
| skillId    | 非空、64文字以内、英数字・ハイフンのみ |
| skillIds   | 配列、各要素がskillIdルールに準拠      |
| basePath   | 絶対パス、存在するディレクトリ         |

---

## 5. ディレクトリ構造

```
apps/desktop/src/main/
├── ipc/
│   └── agentHandlers.ts              # IPCハンドラー登録
├── infrastructure/
│   ├── security/
│   │   └── ipc-validator.ts          # IPC sender検証
│   └── validation/
│       └── skill-validators.ts       # 入力バリデーション
└── services/
    └── skill/
        ├── SkillScanner.ts           # ディレクトリスキャン
        ├── SkillParser.ts            # SKILL.md解析
        ├── SkillImportManager.ts     # インポート管理
        ├── SkillService.ts           # 統合サービス
        ├── index.ts                  # モジュールエクスポート
        └── __tests__/
            ├── SkillScanner.test.ts
            ├── SkillParser.test.ts
            ├── SkillImportManager.test.ts
            ├── SkillService.test.ts
            └── integration.test.ts

packages/shared/src/types/
└── agent.ts                          # 共有型定義
```

---

## 6. 依存関係

### 6.1 外部ライブラリ

| ライブラリ     | 用途                       | バージョン |
| -------------- | -------------------------- | ---------- |
| gray-matter    | YAML Frontmatter解析       | ^4.x       |
| electron-store | 永続化ストレージ           | ^8.x       |
| electron       | IPC通信、BrowserWindow API | ^28.x      |

### 6.2 内部依存

```
SkillService
├── SkillScanner
│   └── fs/promises (Node.js)
├── SkillParser
│   ├── fs/promises (Node.js)
│   ├── gray-matter
│   └── crypto (Node.js)
└── SkillImportManager
    └── electron-store
```

---

## Phase 2 実行記録

### 実行タスク

- タスク1 型定義の設計: ✅ 完了
- タスク2 クラス設計: ✅ 完了
- タスク3 IPC設計: ✅ 完了
- タスク4 セキュリティ設計: ✅ 完了
- タスク5 設計ドキュメント統合: ✅ 完了

### 成果物

| 成果物           | パス                                  | 状態          |
| ---------------- | ------------------------------------- | ------------- |
| 型定義           | `outputs/phase-2/type-definitions.md` | ✅ 作成済み   |
| クラス設計       | `outputs/phase-2/class-design.md`     | ✅ 作成済み   |
| IPC設計          | `outputs/phase-2/ipc-design.md`       | ✅ 作成済み   |
| セキュリティ設計 | `outputs/phase-2/security-design.md`  | ✅ 作成済み   |
| 設計（統合）     | `outputs/phase-2/design.md`           | ✅ 本ファイル |

### 発見事項

- 良かった点: Phase 1の要件定義との整合性が取れている
- 問題点: なし
- 改善提案: なし

### 次Phaseへの引き継ぎ事項

- 型定義は`packages/shared/src/types/agent.ts`に実装
- クラスは`apps/desktop/src/main/services/skill/`に実装
- IPCハンドラーは`apps/desktop/src/main/ipc/agentHandlers.ts`に実装
- セキュリティ実装は設計書に記載のパターンに従う
- gray-matterライブラリの追加が必要
