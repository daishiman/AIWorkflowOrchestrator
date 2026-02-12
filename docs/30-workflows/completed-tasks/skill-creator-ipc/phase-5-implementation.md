# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 5                                      |
| タスクID | TASK-9B-H-SKILL-CREATOR-IPC            |
| タスク名 | SkillCreatorServiceのIPCハンドラー登録 |
| 機能名   | skill-creator-ipc                      |
| 作成日   | 2026-02-12                             |
| 次Phase  | Phase 6: テスト拡充                    |

## 目的

Phase 4で作成したテスト（Red状態）を全てPASSさせるための最小限の実装を行う（TDD: Green）。既存IPCハンドラーパターン（skillHandlers.ts）に準拠し、6チャンネル（5 invoke + 1 on）を実装する。Renderer→Preload→Main→SkillCreatorService→Main→Preload→Rendererの完全なデータフローを構築する。

---

## 実行タスク

### Task 1: チャンネル定義追加

**対象ファイル**: `apps/desktop/src/preload/channels.ts`

#### 1-1. チャンネル定数追加

`IPC_CHANNELS`オブジェクトに以下6つの定数を追加する:

```typescript
SKILL_CREATOR_DETECT_MODE: 'skill-creator:detect-mode',
SKILL_CREATOR_CREATE: 'skill-creator:create',
SKILL_CREATOR_EXECUTE_TASKS: 'skill-creator:execute-tasks',
SKILL_CREATOR_VALIDATE: 'skill-creator:validate',
SKILL_CREATOR_VALIDATE_SCHEMA: 'skill-creator:validate-schema',
SKILL_CREATOR_PROGRESS: 'skill-creator:progress',
```

#### 1-2. ホワイトリスト登録

- `ALLOWED_INVOKE_CHANNELS`に5チャンネルを追加:
  - `IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE`
  - `IPC_CHANNELS.SKILL_CREATOR_CREATE`
  - `IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS`
  - `IPC_CHANNELS.SKILL_CREATOR_VALIDATE`
  - `IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA`
- `ALLOWED_ON_CHANNELS`に1チャンネルを追加:
  - `IPC_CHANNELS.SKILL_CREATOR_PROGRESS`

#### 1-3. 実装確認

```bash
# チャンネル定数の定義確認
grep -n "SKILL_CREATOR" apps/desktop/src/preload/channels.ts
```

### Task 2: ハンドラー実装

**対象ファイル**: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`（新規作成）

#### 2-1. エクスポート関数

```typescript
/**
 * SkillCreator IPCハンドラーを登録する
 * @param mainWindow - BrowserWindowインスタンス（sender検証・進捗通知送信用）
 * @param skillCreatorService - SkillCreatorServiceインスタンス（DI）
 */
export function registerSkillCreatorHandlers(
  mainWindow: BrowserWindow,
  skillCreatorService: SkillCreatorService,
): void;

/**
 * 登録済みIPCハンドラーを解除する
 */
export function unregisterSkillCreatorHandlers(): void;
```

#### 2-2. 各ハンドラーの処理フロー（全ハンドラー共通）

1. `validateIpcSender(event, mainWindow)` で送信元ウィンドウを検証
2. Zodスキーマで引数バリデーション（型チェック、必須フィールド確認）
3. `skillCreatorService` の対応メソッドを呼び出し
4. `{ success: true, data: T }` 形式でレスポンスを返却
5. 例外発生時は `{ success: false, error: sanitizeError(error) }` でサニタイズ済みメッセージを返却

#### 2-3. チャンネル別バリデーション仕様

| チャンネル                      | Zodスキーマ                                                        | バリデーション内容                       |
| ------------------------------- | ------------------------------------------------------------------ | ---------------------------------------- |
| `skill-creator:detect-mode`     | `z.object({ request: z.string().min(1) })`                         | `request`が非空文字列                    |
| `skill-creator:create`          | `CreateSkillOptionsSchema`                                         | 全必須フィールドの型・値検証             |
| `skill-creator:execute-tasks`   | `ExecuteTasksOptionsSchema`                                        | 全必須フィールドの型・値検証             |
| `skill-creator:validate`        | `z.object({ skillDir: z.string().min(1) })` + パストラバーサル検証 | `skillDir`が非空文字列かつ`..`を含まない |
| `skill-creator:validate-schema` | `z.object({ skillDir: z.string().min(1) })`                        | `skillDir`が非空文字列                   |

#### 2-4. パストラバーサル対策

```typescript
function validatePathSafety(skillDir: string): void {
  if (skillDir.includes("..")) {
    throw new ValidationError("Path traversal detected");
  }
  const resolvedPath = path.resolve(skillDir);
  // ベースディレクトリ配下であることを検証
}
```

#### 2-5. エラーサニタイズ

```typescript
function sanitizeError(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message; // バリデーションエラーはユーザー向けメッセージを返却
  }
  // 内部エラーはスタックトレース・ファイルパス・モジュール名を除去
  return "An internal error occurred. Please try again.";
}
```

### Task 3: registerAllIpcHandlers連携

**対象ファイル**: `apps/desktop/src/main/ipc/index.ts`

#### 3-1. SkillCreatorService生成

- SkillCreatorServiceインスタンスを生成する
- P34対策: SkillCreatorServiceがmainWindowに依存する場合はSetter Injectionパターンを使用する

#### 3-2. ハンドラー登録追加

```typescript
import {
  registerSkillCreatorHandlers,
  unregisterSkillCreatorHandlers,
} from "./skillCreatorHandlers";

// registerAllIpcHandlers内で呼び出し
registerSkillCreatorHandlers(mainWindow, skillCreatorService);
```

#### 3-3. ハンドラー解除追加

```typescript
// unregisterAllIpcHandlers内で呼び出し
unregisterSkillCreatorHandlers();
```

### Task 4: Preload API実装

**対象ファイル**: `apps/desktop/src/preload/api/skill-creator-api.ts`（新規作成）

#### 4-1. 実装コード

```typescript
import { safeInvoke, safeOn } from "../safe-ipc";
import { IPC_CHANNELS } from "../channels";
import type { SkillCreatorAPI } from "../types";

export const skillCreatorAPI: SkillCreatorAPI = {
  detectMode: (request: string) =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE, { request }),

  createSkill: (options) =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CREATE, options),

  executeTasks: (options) =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS, options),

  validateSkill: (skillDir: string) =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_VALIDATE, { skillDir }),

  validateWithSchema: (skillDir: string) =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA, { skillDir }),

  onProgress: (callback) =>
    safeOn(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, callback),
};
```

#### 4-2. P27対策確認

全チャンネル名が`IPC_CHANNELS`定数経由で参照されていることを以下のコマンドで検証する:

```bash
# ハードコード文字列の検出（0件であること）
grep -n "skill-creator:" apps/desktop/src/preload/api/skill-creator-api.ts
```

### Task 5: 型定義追加（P32対策: 2箇所同時更新）

#### 5-1. 共有型定義

**対象ファイル**: `packages/shared/src/skill-creator/types.ts`

以下の型が定義済みか確認し、不足分を追加する:

- `SkillCreatorMode`
- `CreateSkillOptions`
- `ExecuteTasksOptions`
- `ExecutionReport`
- `SkillCreatorProgress`
- `ValidationResult`
- `IpcResult<T>`

#### 5-2. Preload型定義

**対象ファイル**: `apps/desktop/src/preload/types.ts`

`SkillCreatorAPI`インターフェースを追加する:

```typescript
export interface SkillCreatorAPI {
  detectMode: (request: string) => Promise<IpcResult<SkillCreatorMode>>;
  createSkill: (options: CreateSkillOptions) => Promise<IpcResult<string>>;
  executeTasks: (
    options: ExecuteTasksOptions,
  ) => Promise<IpcResult<ExecutionReport>>;
  validateSkill: (skillDir: string) => Promise<IpcResult<boolean>>;
  validateWithSchema: (
    skillDir: string,
  ) => Promise<IpcResult<ValidationResult>>;
  onProgress: (callback: (data: SkillCreatorProgress) => void) => () => void;
}
```

#### 5-3. Window型拡張

`ElectronAPI`型に`skillCreator`プロパティを追加する:

```typescript
interface ElectronAPI {
  // 既存のAPI定義...
  skillCreator: SkillCreatorAPI;
}
```

#### 5-4. 型整合性検証

```bash
# 2箇所の型定義を同一コミットで更新後に検証
pnpm typecheck
```

### Task 6: 進捗通知実装

#### 6-1. Main Process側（skillCreatorHandlers.ts内）

```typescript
// SkillCreatorServiceの進捗コールバックを設定
skillCreatorService.onProgress((progress: SkillCreatorProgress) => {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress);
  }
});
```

#### 6-2. Preload側（skill-creator-api.ts内）

```typescript
onProgress: (callback: (data: SkillCreatorProgress) => void) =>
  safeOn(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, callback),
```

#### 6-3. mainWindow破棄チェック

- `mainWindow.isDestroyed()`が`true`の場合、`webContents.send()`を呼び出さない
- `isDestroyed()`チェックを`send()`の直前で毎回実行する

---

## 参照資料

| 資料名                      | パス                                                                                        | 説明                              |
| --------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| Phase 4テストコード         | `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts`                   | Green化対象のテスト               |
| Phase 4 Preloadテストコード | `apps/desktop/src/preload/__tests__/skill-creator-api.test.ts`                              | Green化対象のテスト               |
| 既存チャンネル定義          | `apps/desktop/src/preload/channels.ts`                                                      | チャンネル定数の追加先            |
| 既存ハンドラーパターン      | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                | 実装パターンの参考                |
| 既存Preload APIパターン     | `apps/desktop/src/preload/api/`                                                             | Preload API実装の参考             |
| IPC通信セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証・エラーサニタイズ基準  |
| スキルIPCセキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | SkillCreator固有セキュリティ要件  |
| IPC永続化アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`                 | IPCチャンネル登録/解除パターン    |
| スキルIPCチャンネル仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | IPCチャンネルインターフェース定義 |
| Agent IPC仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 既存IPCハンドラー実装パターン参照 |
| Handler Map方式実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC実装パターン                   |
| 既知の落とし穴              | `.claude/rules/06-known-pitfalls.md`                                                        | P23, P27, P32, P34, P35           |

---

## 統合テスト連携【必須】

フロント/バック接続実装の確認:

| 統合ポイント                    | 確認項目                                                 | AC参照    |
| ------------------------------- | -------------------------------------------------------- | --------- |
| Renderer→Preload                | skillCreatorAPIの各メソッドがsafeInvokeを正しく呼び出す  | AC-01〜05 |
| Preload→Main                    | IPCチャンネルがホワイトリストに登録されている            | AC-10     |
| Main→SkillCreatorService        | ハンドラーがSkillCreatorServiceの対応メソッドを呼び出す  | AC-01〜05 |
| Main→Preload→Renderer（戻り値） | `{ success: true, data: T }`形式のレスポンスが返却される | AC-01〜05 |
| Main→Preload→Renderer（進捗）   | mainWindow.webContents.sendで進捗通知が送信される        | AC-06     |
| エラーフロー                    | サービスエラーがサニタイズされてRendererに返却される     | AC-09     |

---

## 多角的チェック観点

| 観点             | 確認項目                                                                  |
| ---------------- | ------------------------------------------------------------------------- |
| P23対策          | `window.skillCreatorAPI`は作成せず`window.electronAPI.skillCreator`に統一 |
| P27対策          | 全チャンネル名が`IPC_CHANNELS`定数経由で参照されている                    |
| P32対策          | `packages/shared`と`preload/types.ts`の型定義が同一コミットで更新         |
| P34対策          | SkillCreatorServiceの遅延初期化にSetter Injectionパターンを使用           |
| P35対策          | 全テストファイルにmockSkillCreatorServiceを追加済み                       |
| sender検証       | 全5 invokeハンドラーで`validateIpcSender`が呼び出される                   |
| エラーサニタイズ | 内部エラー情報（スタックトレース、ファイルパス）がRendererに漏洩しない    |

---

## Pitfall対策テーブル【必須】

| Pitfall ID | タイトル                 | 本タスクでの対策                                                                                    |
| ---------- | ------------------------ | --------------------------------------------------------------------------------------------------- |
| P23        | API二重定義の型管理      | `window.electronAPI.skillCreator`に統一、`window.skillCreatorAPI`は作成しない                       |
| P27        | ハードコード文字列       | 全チャンネル名を`IPC_CHANNELS`定数経由で参照                                                        |
| P32        | 型定義二箇所同時更新     | `packages/shared/src/skill-creator/types.ts` + `apps/desktop/src/preload/types.ts`を1コミットで更新 |
| P34        | 遅延初期化DI             | SkillCreatorServiceはSetter Injectionで注入（mainWindow依存）                                       |
| P35        | DI追加時テストモック修正 | 全テストファイルにmockSkillCreatorServiceを追加                                                     |

---

## コード成果物配置先

全コード成果物は`apps/desktop/src/`配下に配置する（`outputs/`ではない）:

| ファイル種別           | 配置先パス                                          |
| ---------------------- | --------------------------------------------------- |
| チャンネル定義（更新） | `apps/desktop/src/preload/channels.ts`              |
| ハンドラー（新規）     | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` |
| IPC登録統合（更新）    | `apps/desktop/src/main/ipc/index.ts`                |
| Preload API（新規）    | `apps/desktop/src/preload/api/skill-creator-api.ts` |
| Preload統合（更新）    | `apps/desktop/src/preload/index.ts`                 |
| Preload型定義（更新）  | `apps/desktop/src/preload/types.ts`                 |
| 共有型定義（更新）     | `packages/shared/src/skill-creator/types.ts`        |

---

## 成果物

| 成果物                 | パス                                                | 説明                                 |
| ---------------------- | --------------------------------------------------- | ------------------------------------ |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`         | 実装内容の要約                       |
| チャンネル定義（更新） | `apps/desktop/src/preload/channels.ts`              | 6チャンネル定数 + ホワイトリスト追加 |
| ハンドラー（新規）     | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | 5ハンドラー + register/unregister    |
| IPC登録統合（更新）    | `apps/desktop/src/main/ipc/index.ts`                | SkillCreatorHandlers登録追加         |
| Preload API（新規）    | `apps/desktop/src/preload/api/skill-creator-api.ts` | safeInvoke/safeOnブリッジ実装        |
| Preload統合（更新）    | `apps/desktop/src/preload/index.ts`                 | contextBridge.exposeInMainWorld追加  |
| Preload型定義（更新）  | `apps/desktop/src/preload/types.ts`                 | SkillCreatorAPIインターフェース追加  |
| 共有型定義（更新）     | `packages/shared/src/skill-creator/types.ts`        | IPC固有型追加                        |

---

## 完了条件

- [ ] `channels.ts`に6チャンネル定数が定義されている
- [ ] `ALLOWED_INVOKE_CHANNELS`に5チャンネルが登録されている
- [ ] `ALLOWED_ON_CHANNELS`に1チャンネルが登録されている
- [ ] `skillCreatorHandlers.ts`が新規作成され、5ハンドラーが登録される
- [ ] 全ハンドラーで`validateIpcSender`が処理冒頭に呼び出される
- [ ] 全ハンドラーでZodスキーマによる引数バリデーションが実装されている
- [ ] `validate`ハンドラーでパストラバーサル対策が実装されている
- [ ] `unregisterSkillCreatorHandlers`で5ハンドラーが解除される
- [ ] Preload APIが`contextBridge`経由でRendererに公開されている
- [ ] 進捗通知が`mainWindow.webContents.send`で送信される
- [ ] `mainWindow.isDestroyed()`チェックが進捗通知の直前で実行される
- [ ] 型定義が`packages/shared`と`preload/types.ts`の2箇所で同時更新されている
- [ ] `pnpm typecheck`が成功する
- [ ] Phase 4の全テストがGreen状態（全PASS）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

| サブタスクID | タスク名                    | ステータス | 完了条件                              |
| ------------ | --------------------------- | ---------- | ------------------------------------- |
| T5-1         | チャンネル定義追加          | 未着手     | 6定数 + ホワイトリスト登録完了        |
| T5-2         | ハンドラー実装              | 未着手     | 5ハンドラー + register/unregister完了 |
| T5-3         | registerAllIpcHandlers連携  | 未着手     | index.tsにハンドラー登録追加完了      |
| T5-4         | Preload API実装             | 未着手     | safeInvoke/safeOnブリッジ実装完了     |
| T5-5         | 型定義追加（2箇所同時更新） | 未着手     | shared + preload型定義更新完了        |
| T5-6         | 進捗通知実装                | 未着手     | Main→Renderer通知フロー実装完了       |

---

## タスク100%実行確認【必須】

- [ ] Task 1（チャンネル定義追加）: 完了
- [ ] Task 2（ハンドラー実装）: 完了
- [ ] Task 3（registerAllIpcHandlers連携）: 完了
- [ ] Task 4（Preload API実装）: 完了
- [ ] Task 5（型定義追加）: 完了
- [ ] Task 6（進捗通知実装）: 完了
- [ ] 全成果物が生成されている
- [ ] Phase 4の全テストがGreen状態

---

## TDD検証

```bash
# 型チェック
pnpm typecheck

# Phase 4テスト実行（Green状態確認）
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts
pnpm --filter @repo/desktop vitest run apps/desktop/src/preload/__tests__/skill-creator-api.test.ts

# P27対策検証: ハードコード文字列の検出（0件であること）
grep -rn "skill-creator:" apps/desktop/src/preload/api/skill-creator-api.ts
grep -rn "skill-creator:" apps/desktop/src/main/ipc/skillCreatorHandlers.ts

# 確認項目
# - [ ] SCIT-REG-01〜03: 全PASS
# - [ ] SCIT-NRM-01〜06: 全PASS
# - [ ] SCIT-ERR-01〜12: 全PASS
# - [ ] SCIT-SEC-01〜04: 全PASS
# - [ ] SCIT-BND-01〜08: 全PASS
# - [ ] SCIT-PRE-01〜07: 全PASS
# - [ ] 既存テストに影響がない
```

---

## 次のPhase

[Phase 6: テスト拡充](./phase-6-test-expansion.md)
