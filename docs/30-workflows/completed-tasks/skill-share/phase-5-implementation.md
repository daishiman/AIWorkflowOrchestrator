# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase 番号 | 5                                                            |
| Phase 名   | 実装（TDD: Green）                                           |
| 目的       | Phase 4 のテストを全件パスさせる最小限の実装コードを作成する |
| 前提 Phase | Phase 4（テスト作成）                                        |
| 後続 Phase | Phase 6（テスト拡充）                                        |
| ステータス | 未実施                                                       |
| 作成日     | 2026-02-27                                                   |
| 機能名     | skill-share                                                  |

## 目的

Phase 4 で作成した全テストケース（Red 状態）をパス（Green 状態）させるために、SkillShareManager の実装、型定義の作成、IPC ハンドラの追加、および Preload 層の拡張を行う。YAGNI 原則に従い、テストをパスさせる最小限のコードのみを実装する。

## 実行タスク

- 共有型定義の作成: `packages/shared` に ShareTarget / ImportResult / ExportResult を定義する
- SkillShareManager の実装: 4 種インポート・2 種エクスポート・バリデーションの実装
- IPC ハンドラの追加: 3 チャネルのハンドラを skillHandlers.ts に追加する
- Preload 層の拡張: チャネル定数・API 関数・型定義の追加
- DI 統合: SkillService への SkillShareManager 注入
- テスト全件パス確認: Phase 4 テストが全件 Green であることを検証する

## 参照資料

| 参照資料           | パス                                                                                        | 内容                           |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 4 テスト仕様 | `docs/30-workflows/skill-share/phase-4-test-creation.md`                                    | Redフェーズで定義した実装条件  |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 3 プロセスモデル               |
| IPC 仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | ハンドラ登録パターン           |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | バリデーション仕様             |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI / Setter Injection パターン |
| 既存 skillHandlers | `apps/desktop/src/main/ipc/skillHandlers.share.ts`                                          | 既存ハンドラの実装パターン     |
| 既存 channels      | `apps/desktop/src/preload/channels.ts`                                                      | 既存チャネル定数               |
| 既存 skill-api     | `apps/desktop/src/preload/skill-api.ts`                                                     | 既存 Preload API 構造          |
| 既存 SkillService  | `apps/desktop/src/main/services/skill/SkillService.ts`                                      | サービス統合パターン           |

## システム仕様（aiworkflow-requirements）

| 仕様書                                    | 参照目的                                            |
| ----------------------------------------- | --------------------------------------------------- |
| `architecture-overview.md`                | Renderer → Preload → Main の依存方向                |
| `api-ipc-agent.md`                        | `ipcMain.handle()` 登録パターンと引数形式           |
| `security-skill-ipc.md`                   | validateIpcSender / sanitizeErrorMessage の使用方法 |
| `architecture-implementation-patterns.md` | Setter Injection パターン（P34 対策）               |
| `error-handling.md`                       | Result パターンとエラーコード体系                   |
| `interfaces-agent-sdk-skill.md`           | Skill共有APIの型定義・契約差分の同期                |
| `security-api-electron.md`                | Preload公開APIの境界防御・最小権限原則              |

## 実行手順

### T5-1: 共有型定義の作成

**対象ファイル**: `packages/shared/src/types/skill-share.ts`（新規作成）

1. 以下の型を定義する:

```typescript
/** インポート/エクスポートのソース・宛先を表す型 */
export interface ShareTarget {
  /** ソース種別 */
  type: "github" | "gist" | "local" | "url";
  /** GitHub: リポジトリ名（owner/repo 形式） */
  repo?: string;
  /** GitHub: ブランチ名（省略時は default branch） */
  branch?: string;
  /** GitHub: リポジトリ内のスキルディレクトリパス */
  path?: string;
  /** Gist: Gist ID */
  gistId?: string;
  /** Local: ローカルファイルシステムパス */
  localPath?: string;
  /** URL: スキルの URL（SKILL.md の直接 URL または ZIP アーカイブ URL） */
  url?: string;
}

/** インポート結果 */
export interface ImportResult {
  /** インポート成否 */
  success: boolean;
  /** インポートされたスキル名 */
  skillName: string;
  /** インポート先パス */
  skillPath: string;
  /** インポート元情報 */
  source: ShareTarget;
  /** インポート日時（ISO 8601 形式） */
  importedAt: string;
}

/** エクスポート結果 */
export interface ExportResult {
  /** エクスポート成否 */
  success: boolean;
  /** エクスポート先情報 */
  destination: ShareTarget;
  /** エクスポートされたファイル一覧（相対パス） */
  exportedFiles: string[];
  /** 共有 URL（Gist エクスポート時のみ） */
  shareUrl?: string;
}

/** インポート検証結果 */
export interface ValidateSourceResult {
  /** 検証成否 */
  isValid: boolean;
  /** スキル名（検証成功時） */
  skillName?: string;
  /** エラーメッセージ（検証失敗時） */
  errorMessage?: string;
}
```

2. `packages/shared/src/types/index.ts` に re-export を追加する:

```typescript
export type {
  ShareTarget,
  ImportResult,
  ExportResult,
  ValidateSourceResult,
} from "./share";
```

3. `pnpm --filter @repo/shared build` で共有パッケージのビルドが成功することを確認する

### T5-2: SkillShareManager の実装

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillShareManager.ts`（新規作成）

1. クラス構造を定義する:

```typescript
import type {
  ShareTarget,
  ImportResult,
  ExportResult,
  ValidateSourceResult,
} from "@repo/shared";

export class SkillShareManager {
  private readonly skillsDir: string;
  private readonly authKeyService: AuthKeyService;

  constructor(skillsDir: string, authKeyService: AuthKeyService) {
    this.skillsDir = skillsDir;
    this.authKeyService = authKeyService;
  }

  async import(source: ShareTarget): Promise<ImportResult> {
    /* ... */
  }
  async export(
    skillName: string,
    destination: ShareTarget,
  ): Promise<ExportResult> {
    /* ... */
  }
  async validateSource(source: ShareTarget): Promise<ValidateSourceResult> {
    /* ... */
  }

  private async importFromGitHub(source: ShareTarget): Promise<ImportResult> {
    /* ... */
  }
  private async importFromGist(source: ShareTarget): Promise<ImportResult> {
    /* ... */
  }
  private async importFromLocal(source: ShareTarget): Promise<ImportResult> {
    /* ... */
  }
  private async importFromUrl(source: ShareTarget): Promise<ImportResult> {
    /* ... */
  }
  private async exportToGist(
    skillName: string,
    source: ShareTarget,
  ): Promise<ExportResult> {
    /* ... */
  }
  private async exportToLocal(
    skillName: string,
    source: ShareTarget,
  ): Promise<ExportResult> {
    /* ... */
  }
  private validateImport(dirPath: string): Promise<ValidateSourceResult> {
    /* ... */
  }
}
```

2. 各メソッドの実装要件:

| メソッド         | 外部依存                      | セキュリティ要件                             |
| ---------------- | ----------------------------- | -------------------------------------------- |
| importFromGitHub | Octokit `repos.getContent`    | repo 形式バリデーション（owner/repo）        |
| importFromGist   | Octokit `gists.get`           | gistId の英数字バリデーション                |
| importFromLocal  | `node:fs/promises` cp/readdir | パストラバーサル検証（resolve + startsWith） |
| importFromUrl    | `fetch`                       | URL 形式バリデーション（https:// のみ）      |
| exportToGist     | Octokit `gists.create`        | GitHub トークン存在確認                      |
| exportToLocal    | `node:fs/promises` cp/mkdir   | パストラバーサル検証                         |
| validateImport   | `node:fs/promises` readFile   | SKILL.md 構造検証（タイトル行存在確認）      |

3. エラーハンドリング方針:

| エラー状況                   | エラーカテゴリ         | エラーコード |
| ---------------------------- | ---------------------- | ------------ |
| source.type が不正値         | Validation Error       | ERR_1001     |
| repo 形式が不正              | Validation Error       | ERR_1002     |
| SKILL.md 形式が不正          | Validation Error       | ERR_1002     |
| パストラバーサル検出         | Validation Error       | ERR_1003     |
| スキルが見つからない         | Business Error         | ERR_2003     |
| GitHub トークン未設定        | Business Error         | ERR_2005     |
| GitHub API / Gist API エラー | External Service Error | ERR_3001     |
| ネットワークタイムアウト     | External Service Error | ERR_3002     |
| ディレクトリが存在しない     | Infrastructure Error   | ERR_4002     |
| 書き込み権限不足             | Infrastructure Error   | ERR_4003     |

4. パストラバーサル検証の実装（importFromLocal / exportToLocal で使用）:

```typescript
import { resolve, normalize } from "node:path";

function isPathTraversal(basePath: string, targetPath: string): boolean {
  const resolvedTarget = resolve(basePath, targetPath);
  const normalizedBase = normalize(basePath);
  return !resolvedTarget.startsWith(normalizedBase);
}
```

### T5-3: IPC ハンドラの追加

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.share.ts`（既存ファイルに追加）

1. 3 チャネルのハンドラを追加する:

| チャネル名               | 引数型                                            | 戻り値型                          |
| ------------------------ | ------------------------------------------------- | --------------------------------- |
| `skill:importFromSource` | `source: ShareTarget`                             | `IpcResult<ImportResult>`         |
| `skill:export`           | `{ skillName: string; destination: ShareTarget }` | `IpcResult<ExportResult>`         |
| `skill:validateSource`   | `source: ShareTarget`                             | `IpcResult<ValidateSourceResult>` |

2. 各ハンドラで以下を実装する:
   - `validateIpcSender(event, channel, options)` による送信元検証
   - P42 準拠 3 段バリデーション:
     - 型チェック（`typeof` / `Array.isArray` / object 形状チェック）
     - 空文字列チェック（`=== ""`）
     - トリム空文字列チェック（`.trim() === ""`）
   - `source.type` の許可値チェック（`["github", "gist", "local", "url"]` ホワイトリスト）
   - `sanitizeErrorMessage(error)` によるエラーサニタイズ

3. `skill:export` ハンドラでは `destination.type` の許可値を `["gist", "local"]` に制限する

### T5-4: Preload 層の拡張

#### channels.ts への追加

**対象ファイル**: `apps/desktop/src/preload/channels.ts`

```typescript
// Skill Share チャネル
SKILL_IMPORT_FROM_SOURCE: "skill:importFromSource",
SKILL_EXPORT: "skill:export",
SKILL_VALIDATE_SOURCE: "skill:validateSource",
```

ホワイトリスト配列にも 3 チャネルを追加する。

#### skill-api.ts への追加

**対象ファイル**: `apps/desktop/src/preload/skill-api.ts`

```typescript
/** 外部ソースからスキルをインポートする */
importFromSource: (source: ShareTarget): Promise<IpcResult<ImportResult>> =>
  safeInvoke(IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE, source),

/** スキルをエクスポートする */
export: (skillName: string, destination: ShareTarget): Promise<IpcResult<ExportResult>> =>
  safeInvoke(IPC_CHANNELS.SKILL_EXPORT, { skillName, destination }),

/** インポート元を検証する */
validateSource: (source: ShareTarget): Promise<IpcResult<ValidateSourceResult>> =>
  safeInvoke(IPC_CHANNELS.SKILL_VALIDATE_SOURCE, source),
```

#### types.ts への追加

**対象ファイル**: `apps/desktop/src/preload/types.ts`

SkillAPI インターフェースに上記 3 メソッドの型を追加する。

### T5-5: DI 統合

1. `SkillService` に `SkillShareManager` を Setter Injection で注入する（P34 対策）:

```typescript
// SkillService.ts
private skillShareManager: SkillShareManager | null = null;

setSkillShareManager(manager: SkillShareManager): void {
  this.skillShareManager = manager;
}

getSkillShareManager(): SkillShareManager {
  if (!this.skillShareManager) {
    throw new Error("SkillShareManager is not initialized");
  }
  return this.skillShareManager;
}
```

2. アプリ初期化時に `SkillShareManager` を生成し `SkillService` に注入する

### T5-6: テスト全件パス確認

1. 共有パッケージをビルドする: `pnpm --filter @repo/shared build`
2. SkillShareManager テストを実行する:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillShareManager.test.ts
   ```
3. IPC ハンドラテストを実行する:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.share.test.ts
   ```
4. 既存テストに影響がないことを確認する:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/
   cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/
   ```
5. 型チェックを実行する: `pnpm --filter @repo/desktop exec tsc --noEmit`

## 成果物

| 成果物             | パス                                                        | 種別   |
| ------------------ | ----------------------------------------------------------- | ------ |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`                 | 文書   |
| 共有型定義         | `packages/shared/src/types/skill-share.ts`                  | コード |
| 共有型 re-export   | `packages/shared/src/types/index.ts`（修正）                | コード |
| SkillShareManager  | `apps/desktop/src/main/services/skill/SkillShareManager.ts` | コード |
| IPC ハンドラ追加   | `apps/desktop/src/main/ipc/skillHandlers.share.ts`（修正）  | コード |
| チャネル定数追加   | `apps/desktop/src/preload/channels.ts`（修正）              | コード |
| Preload API 追加   | `apps/desktop/src/preload/skill-api.ts`（修正）             | コード |
| Preload 型定義追加 | `apps/desktop/src/preload/types.ts`（修正）                 | コード |

## 統合テスト連携

- Phase 4 のテストが全件 Green になることが本 Phase の完了基準
- Phase 6 で統合テスト（IPC → SkillShareManager → fs/API）を追加する
- 既存の `skill:import`（ローカルインポート）テストに影響を与えないことを確認する

## 完了条件

- [ ] `packages/shared/src/types/skill-share.ts` が作成され、ShareTarget / ImportResult / ExportResult / ValidateSourceResult が定義されている
- [ ] `packages/shared/src/types/index.ts` から share.ts の全型が re-export されている
- [ ] `pnpm --filter @repo/shared build` が成功する
- [ ] `SkillShareManager.ts` が作成され、import / export / validateSource の 3 パブリックメソッドが実装されている
- [ ] importFromGitHub / importFromGist / importFromLocal / importFromUrl の 4 種プライベートメソッドが実装されている
- [ ] exportToGist / exportToLocal の 2 種プライベートメソッドが実装されている
- [ ] パストラバーサル検証が importFromLocal / exportToLocal に実装されている
- [ ] skillHandlers.ts に skill:importFromSource / skill:export / skill:validateSource の 3 ハンドラが追加されている
- [ ] 全ハンドラで P42 準拠 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）が実装されている
- [ ] 全ハンドラで validateIpcSender による送信元検証が実装されている
- [ ] channels.ts に SKILL_IMPORT_FROM_SOURCE / SKILL_EXPORT / SKILL_VALIDATE_SOURCE が追加されている
- [ ] ホワイトリスト配列に 3 チャネルが追加されている
- [ ] skill-api.ts に importFromSource / export / validateSource が追加されている
- [ ] types.ts の SkillAPI インターフェースに 3 メソッドの型が追加されている
- [ ] Phase 4 のテスト（SkillShareManager.test.ts）が全件パスする
- [ ] Phase 4 のテスト（skillHandlers.share.test.ts）が全件パスする
- [ ] 既存テスト（skillHandlers.test.ts 等）が全件パスする
- [ ] `pnpm --filter @repo/desktop exec tsc --noEmit` が成功する
- [ ] `any` 型を使用していない
- [ ] `@ts-ignore` / `@ts-expect-error` を使用していない

## スキル 100%実行確認【必須】

- [ ] `pnpm --filter @repo/shared build` が成功することを確認
- [ ] `pnpm --filter @repo/desktop exec tsc --noEmit` が成功することを確認
- [ ] Phase 4 テスト全件パスを確認（`cd apps/desktop && pnpm vitest run` で関連テストのみ）
- [ ] 既存テスト全件パスを確認（`cd apps/desktop && pnpm vitest run src/main/` で Main Process テスト全体）
- [ ] `pnpm lint` がエラーなしで完了することを確認

## 次の Phase

Phase 6: テスト拡充 — `phase-6-test-expansion.md`

## 備考

- Octokit の利用には GitHub Personal Access Token が必要。トークンは `AuthKeyService` 経由で取得する
- `fetch` による URL インポートでは `https://` プロトコルのみ許可する（`http://` は拒否）
- 既存の `skill:import` チャネル（SkillImportManager 経由のローカルインポート）は変更しない。新規の `skill:importFromSource` は SkillShareManager 経由の外部ソースインポート専用とする
- SkillShareManager のコンストラクタ引数に `AuthKeyService` を含める。GitHub API 呼び出し時にトークンを取得するために使用する
- P32 準拠: 型定義変更時は `packages/shared` と `apps/desktop/src/preload/types.ts` を同時に更新する
