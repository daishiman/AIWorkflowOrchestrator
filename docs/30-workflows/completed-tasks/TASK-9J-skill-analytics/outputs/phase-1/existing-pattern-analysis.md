# Phase 1 Task 1: 既存パターン分析

## 調査概要

TASK-9J（スキル分析ダッシュボード）の実装に先立ち、既存のスキル関連サービス・IPCハンドラ・Preload API・永続化ストアのパターンを調査し、踏襲すべき実装パターンを特定した。

### 調査対象ファイル

| ファイル                                                         | 役割                                       |
| ---------------------------------------------------------------- | ------------------------------------------ |
| `apps/desktop/src/main/services/skill/SkillService.ts`           | スキル管理Facadeサービス                   |
| `apps/desktop/src/main/services/skill/SkillShareManager.ts`      | スキル共有（インポート・エクスポート）管理 |
| `apps/desktop/src/main/services/skill/SkillScheduler.ts`         | スキルスケジュール実行管理                 |
| `apps/desktop/src/main/services/skill/ScheduleStore.ts`          | スケジュール永続化ストア（electron-store） |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                     | スキルIPCハンドラ登録                      |
| `apps/desktop/src/preload/channels.ts`                           | IPCチャネル定義                            |
| `apps/desktop/src/preload/skill-api.ts`                          | Preload API公開                            |
| `apps/desktop/src/main/infrastructure/security/ipc-validator.ts` | IPC Sender検証                             |

---

## 1. サービスクラス構造パターン

### 1.1 Facadeパターン（SkillService）

`SkillService`は複数の専門サービス（`SkillScanner`, `SkillParser`, `SkillImportManager`）を統合するFacadeとして機能する。

```typescript
export class SkillService {
  private cache: Map<SkillId, Skill> = new Map();
  private lastScanTime: Date | null = null;
  private skillExecutor: SkillExecutor | null = null;

  constructor(
    private scanner: SkillScanner,
    private parser: SkillParser,
    public importManager: SkillImportManager,
  ) {}

  // Setter Injection（遅延初期化パターン、P34準拠）
  setSkillExecutor(executor: SkillExecutor): void {
    this.skillExecutor = executor;
  }
}
```

**パターン特徴:**

- Constructor Injection: 生成時に利用可能な依存オブジェクトを注入
- Setter Injection: BrowserWindow等の外部リソースが必要な依存（P34準拠）
- privateフィールドでキャッシュ機構を保持

### 1.2 Constructor Injection パターン（SkillShareManager）

```typescript
export class SkillShareManager {
  constructor(
    private readonly gitHubClient: GitHubClient,
    private readonly fileSystem: FileSystemAdapter,
    private readonly skillValidator: SkillValidator,
    private readonly skillService: SkillServiceDep,
  ) {}
}
```

**パターン特徴:**

- 依存インターフェースをファイル上部に定義（`interface GitHubClient`, `interface FileSystemAdapter` 等）
- `private readonly` でイミュータブルに保持
- テスタビリティ: モック可能なインターフェースで依存を受け取る

### 1.3 Constructor Injection パターン（SkillScheduler）

```typescript
export class SkillScheduler {
  private scheduleStore: ScheduleStore;
  private skillExecutor: SchedulerSkillExecutor;
  private activeJobs: Map<string, ActiveJob> = new Map();

  constructor(
    scheduleStore: ScheduleStore,
    skillExecutor: SchedulerSkillExecutor,
  ) {
    this.scheduleStore = scheduleStore;
    this.skillExecutor = skillExecutor;
  }
}
```

**パターン特徴:**

- 依存インターフェースを`export`してテスト側からも参照可能にする
- 内部状態（`activeJobs`）はMapで管理
- テスト用メソッド（`getActiveJobCount()`, `hasActiveJob()`）を提供

### 1.4 エラー定義パターン

`SkillShareManager`ではエラーをカテゴリ別にconst objectで定義する:

```typescript
const SHARE_ERRORS = {
  INVALID_FORMAT: {
    code: 1002,
    category: "validation" as const,
    isRetryable: false,
  },
  PATH_TRAVERSAL: {
    code: 1003,
    category: "validation" as const,
    isRetryable: false,
  },
  SKILL_NOT_FOUND: {
    code: 2003,
    category: "business" as const,
    isRetryable: false,
  },
  EXTERNAL_SERVICE: {
    code: 3001,
    category: "external" as const,
    isRetryable: false,
  },
  FILE_NOT_FOUND: {
    code: 4002,
    category: "infrastructure" as const,
    isRetryable: false,
  },
} as const;
```

**エラーコード範囲（`02-code-quality.md`準拠）:**

- 1000-1999: Validation Error（リトライ不可）
- 2000-2999: Business Error（リトライ不可）
- 3000-3999: External Service Error（リトライ可能）
- 4000-4999: Infrastructure Error（リトライ可能）

### 1.5 Result型パターン

```typescript
function createSuccess<T>(data: T): ShareResult<T> {
  return { success: true, data };
}

function createError<T>(error: ShareError): ShareResult<T> {
  return { success: false, error };
}
```

---

## 2. IPCハンドラ登録パターン

### 2.1 ハンドラ登録関数の構造

`skillHandlers.ts`は`registerSkillHandlers()`と`registerSkillScheduleHandlers()`の2つの登録関数をexportする。各関数は以下の署名を持つ:

```typescript
export function registerSkillHandlers(
  mainWindow: BrowserWindow,
  skillService: SkillService,
): void { ... }

export function registerSkillScheduleHandlers(
  mainWindow: BrowserWindow,
  skillScheduler: SkillScheduler,
  scheduleStore: ScheduleStore,
): void { ... }
```

**パターン特徴:**

- 第1引数: `mainWindow: BrowserWindow`（validateIpcSenderで使用）
- 第2引数以降: 必要なサービスインスタンス
- 戻り値: `void`

### 2.2 個別ハンドラの共通構造

各ハンドラは以下の5ステップで統一されている:

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_SCHEDULE_ADD,
  async (event: IpcMainInvokeEvent, args: ArgsType) => {
    // Step 1: Sender検証
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_SCHEDULE_ADD,
      {
        getAllowedWindows: () => [mainWindow],
      },
    );
    if (!validation.valid) {
      return toIPCValidationError(validation);
      // または: throw toIPCValidationError(validation);
    }

    // Step 2: 引数バリデーション（P42準拠3段バリデーション）
    const skillNameError = validateStringArg(args?.skillName, "skillName");
    if (skillNameError) return skillNameError;

    // Step 3: ビジネスロジック実行
    try {
      const result = await service.doSomething(args);
      // Step 4: 成功レスポンス
      return { success: true, data: result };
    } catch (error) {
      // Step 5: エラーレスポンス
      log.error("[skillHandlers] skill:xxx failed:", error);
      return { success: false, error: sanitizeErrorMessage(error) };
    }
  },
);
```

### 2.3 ハンドラ解除関数

```typescript
export function unregisterSkillScheduleHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_LIST);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_ADD);
  // ...全チャネルを列挙
}
```

**パターン特徴:**

- 全チャネルを明示的に`removeHandler`で解除
- P5対策: 二重登録防止のためunregister後にregisterする運用

### 2.4 バリデーション失敗時のレスポンス方式の分岐

`skillHandlers.ts`内では、バリデーション失敗時に2つのレスポンス方式が混在する:

| 方式                               | 使用箇所                                                                                                                | 特徴                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `throw`                            | `SKILL_IMPORT`, `SKILL_REMOVE`, `SKILL_ABORT`, `SKILL_GET_STATUS`, `SKILL_ANALYZE`, `SKILL_IMPROVE`, `SKILL_OPTIMIZE`系 | ipcMain.handleがエラーをRenderer側でrejectに変換 |
| `return { success: false, error }` | `SKILL_SCHEDULE_*`系                                                                                                    | Renderer側で`.success`をチェック                 |

TASK-9Gのスケジュール系ハンドラは`return`方式、それ以前のハンドラは`throw`方式を使用する。最新のTASK-9Gパターン（`return`方式 + `validateStringArg`共通関数）が推奨される。

---

## 3. チャネル定義パターン

### 3.1 命名規則

`channels.ts`では階層構造の命名規則を使用:

```
skill:{機能グループ}:{アクション}
```

**具体例:**
| チャネル定数名 | 文字列値 |
|----------------|----------|
| `SKILL_SCHEDULE_LIST` | `"skill:schedule:list"` |
| `SKILL_SCHEDULE_ADD` | `"skill:schedule:add"` |
| `SKILL_SCHEDULE_UPDATE` | `"skill:schedule:update"` |
| `SKILL_SCHEDULE_DELETE` | `"skill:schedule:delete"` |
| `SKILL_SCHEDULE_TOGGLE` | `"skill:schedule:toggle"` |
| `SKILL_IMPORT_FROM_SOURCE` | `"skill:importFromSource"` |
| `SKILL_OPTIMIZE_VARIANTS` | `"skill:optimize:variants"` |

**パターン特徴:**

- `as const`で型安全にする
- 定数名は`SKILL_`プレフィックス + UPPER_SNAKE_CASE
- 文字列値は`skill:`プレフィックス + コロン区切りのkebab-case

### 3.2 ホワイトリスト登録

新規チャネルはIPC_CHANNELS定義に加えて`ALLOWED_INVOKE_CHANNELS`または`ALLOWED_ON_CHANNELS`にも追加が必要:

```typescript
// invoke（Request-Response）チャネル
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ...
  IPC_CHANNELS.SKILL_SCHEDULE_LIST,
  IPC_CHANNELS.SKILL_SCHEDULE_ADD,
  // ...
];

// on（Event Push）チャネル
export const ALLOWED_ON_CHANNELS: readonly string[] = [
  // ...（アナリティクスはイベントPushを使用しない見込み）
];
```

### 3.3 コメントによるグループ分け

```typescript
  // Skill schedule operations (TASK-9G)
  SKILL_SCHEDULE_LIST: "skill:schedule:list",
  SKILL_SCHEDULE_ADD: "skill:schedule:add",
```

各機能グループをTASK IDコメントで区切る規約。

---

## 4. Preload API公開パターン

### 4.1 SkillAPI インターフェース定義

`skill-api.ts`は以下の構造を持つ:

1. **importセクション**: `@repo/shared`からの型インポート
2. **SkillAPI interface定義**: 全メソッドのJSDoc付きインターフェース
3. **IpcResult<T>型定義**: `{ success: boolean; data?: T; error?: string }`
4. **safeInvoke / safeInvokeUnwrap / safeOn ヘルパー関数**
5. **skillAPI オブジェクト実装**: インターフェースの実装

### 4.2 safeInvoke vs safeInvokeUnwrap の使い分け

| ヘルパー              | 用途                               | 動作                                                           |
| --------------------- | ---------------------------------- | -------------------------------------------------------------- |
| `safeInvoke<T>`       | ハンドラの戻り値をそのまま返す     | ホワイトリストチェック後にipcRenderer.invoke                   |
| `safeInvokeUnwrap<T>` | `{ success, data }` ラッパーを展開 | success=falseの場合Errorをスロー、success=trueの場合dataを返す |
| `safeOn<T>`           | イベント購読                       | ホワイトリストチェック後にipcRenderer.on                       |

**使い分け基準:**

- ハンドラが `{ success: true, data: T }` 形式で返す場合 → `safeInvokeUnwrap`
- ハンドラが直接値を返す場合（`throw`でエラーを返す場合） → `safeInvoke`
- Main→Renderer のイベントPush → `safeOn`

### 4.3 スケジュール系API実装例（TASK-9G）

```typescript
// === Skill Schedule Operations (TASK-9G) ===

scheduleList: (): Promise<ScheduledSkill[]> =>
  safeInvokeUnwrap<ScheduledSkill[]>(IPC_CHANNELS.SKILL_SCHEDULE_LIST),

scheduleAdd: (
  input: Omit<ScheduledSkill, "id" | "runHistory">,
): Promise<ScheduledSkill> =>
  safeInvokeUnwrap<ScheduledSkill>(IPC_CHANNELS.SKILL_SCHEDULE_ADD, input),

scheduleUpdate: (
  id: string,
  updates: Partial<ScheduledSkill>,
): Promise<void> =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_SCHEDULE_UPDATE, { id, updates }),

scheduleDelete: (id: string): Promise<void> =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_SCHEDULE_DELETE, { id }),

scheduleToggle: (id: string): Promise<ScheduledSkill | undefined> =>
  safeInvokeUnwrap<ScheduledSkill | undefined>(
    IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE,
    { id },
  ),
```

**パターン特徴:**

- 複数引数はオブジェクト`{ id, updates }`にまとめて渡す
- 戻り値の型パラメータを`safeInvokeUnwrap<T>`に明示
- メソッド名はcamelCaseで`schedule`プレフィックス

---

## 5. セキュリティパターン

### 5.1 validateIpcSender() パターン

```typescript
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_SCHEDULE_LIST, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  return toIPCValidationError(validation);
}
```

**検証内容（3段階）:**

1. `BrowserWindow.fromWebContents(sender)` でウィンドウ取得可否
2. DevToolsからの呼び出しでないか確認
3. 許可されたウィンドウリストに含まれるか照合

**検証失敗時のレスポンス:**

```typescript
{
  success: false,
  error: {
    code: "IPC_UNAUTHORIZED" | "IPC_FORBIDDEN",
    message: "Unauthorized IPC call: ..."
  }
}
```

### 5.2 sanitizeErrorMessage() パターン

```typescript
function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return DEFAULT_ERROR_MESSAGE;
  }

  let message = error.message;

  // JavaScriptランタイムエラー → 汎用メッセージ
  if (JS_RUNTIME_ERROR_PATTERN.test(message)) {
    return DEFAULT_ERROR_MESSAGE;
  }

  // スタックトレース除去
  message = message.replace(STACK_TRACE_PATTERN, "");
  // パス情報除去
  message = message.replace(UNIX_PATH_PATTERN, "[path]");
  message = message.replace(WINDOWS_PATH_PATTERN, "[path]");
  // IPアドレス除去
  message = message.replace(IP_ADDRESS_PATTERN, "[host]");
  // 機密情報マスク
  message = message.replace(SENSITIVE_DATA_PATTERN, "$1=***");

  return message || DEFAULT_ERROR_MESSAGE;
}
```

**除去対象:**

- スタックトレース
- Unix/Windowsファイルパス → `[path]`
- IPアドレス:ポート → `[host]`
- `token=xxx`, `key=xxx`, `password=xxx`, `secret=xxx` → `$1=***`
- JavaScriptランタイムエラー（`Cannot read properties of undefined`等） → 汎用メッセージ

---

## 6. バリデーションパターン

### 6.1 P42準拠3段バリデーション

**直接記述パターン（既存のskill:importハンドラ等）:**

```typescript
// P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

**共通関数パターン（TASK-9Gスケジュール系、最新推奨パターン）:**

```typescript
function validateStringArg(
  value: unknown,
  argName: string,
): { success: false; error: string } | null {
  if (typeof value !== "string" || value.trim() === "") {
    return {
      success: false,
      error: `${argName} must be a non-empty string`,
    };
  }
  return null;
}

// 使用例
const skillNameError = validateStringArg(args?.skillName, "skillName");
if (skillNameError) return skillNameError;
```

### 6.2 オブジェクト引数のバリデーション

```typescript
// オブジェクト引数の場合（skill:get-detail）
if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillId must be a non-empty string",
  };
}
```

### 6.3 複合バリデーション（スケジュール系）

```typescript
// スケジュール種別ごとのバリデーション
if (!args.schedule || typeof args.schedule.type !== "string") {
  return { success: false, error: "schedule.type is required" };
}
if (
  args.schedule.type === "cron" &&
  (typeof args.schedule.cronExpression !== "string" ||
    args.schedule.cronExpression.trim() === "")
) {
  return {
    success: false,
    error: "cronExpression is required for cron schedule type",
  };
}
if (args.schedule.type === "interval") {
  if (
    typeof args.schedule.interval !== "number" ||
    args.schedule.interval <= 0
  ) {
    return { success: false, error: "interval must be a positive number" };
  }
}
```

---

## 7. electron-store永続化パターン

### 7.1 ScheduleStore の構造

```typescript
import ElectronStore from "electron-store";

/** ストアスキーマ */
interface ScheduleStoreSchema {
  scheduledSkills: ScheduledSkill[];
}

export class ScheduleStore {
  private store: ElectronStore<ScheduleStoreSchema>;
  private schedules: ScheduledSkill[];

  constructor(store?: ElectronStore<ScheduleStoreSchema>) {
    this.store =
      store ??
      new ElectronStore<ScheduleStoreSchema>({
        name: "skill-schedules",
        defaults: {
          scheduledSkills: [],
        },
      });

    // P19対策: electron-store から復元時にバリデーション
    const raw: unknown = this.store.get("scheduledSkills");
    this.schedules = Array.isArray(raw)
      ? raw.filter(
          (item): item is ScheduledSkill =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as Record<string, unknown>).id === "string",
        )
      : [];
  }
}
```

**パターン特徴:**

1. **スキーマ型定義**: `interface XxxStoreSchema` で型安全なストア構造を定義
2. **命名規則**: `new ElectronStore({ name: "skill-schedules" })` で機能別にストアファイルを分離
3. **デフォルト値**: `defaults: { scheduledSkills: [] }` で空配列をデフォルト設定
4. **DI対応**: コンストラクタで`store?`をオプショナルに受け取り、テスト時にモック注入可能
5. **P19対策**: `unknown`型で受け取り、`Array.isArray()` + `.filter()` でバリデーション
6. **メモリキャッシュ**: `private schedules`でインメモリコピーを保持し、CRUDはメモリ上で実行後に`persist()`で書き込み

### 7.2 永続化メソッド

```typescript
private persist(): void {
  this.store.set("scheduledSkills", this.schedules);
}
```

CRUD操作後に毎回`persist()`を呼び出す。

### 7.3 CRUD操作パターン

| メソッド                   | 操作                              | persist呼び出し |
| -------------------------- | --------------------------------- | --------------- |
| `getAll()`                 | 読み取り（コピーを返す）          | なし            |
| `getById(id)`              | 読み取り                          | なし            |
| `add(schedule)`            | 追加                              | あり            |
| `update(id, updates)`      | 更新（IDは上書き不可）            | あり            |
| `delete(id)`               | 削除                              | あり            |
| `addRunResult(id, result)` | 履歴追加（MAX_RUN_HISTORY件まで） | あり            |

---

## 8. TASK-9Jで踏襲すべきパターンまとめ

### 8.1 サービスクラス設計

| パターン                 | 採用理由                                       | 適用先                                                         |
| ------------------------ | ---------------------------------------------- | -------------------------------------------------------------- |
| Constructor Injection    | テスタビリティ確保、依存インターフェースの明示 | `SkillAnalyticsService`（ScheduleStore, SkillService等を注入） |
| 依存インターフェース定義 | 疎結合化、モック容易性                         | サービスクラス上部に`interface XxxDep`を定義                   |
| エラー定義const object   | カテゴリ別エラーコード管理                     | `ANALYTICS_ERRORS`を定義（1000-5999範囲で割当）                |
| Result型パターン         | 明示的なエラーハンドリング                     | `createSuccess<T>()` / `createError<T>()`                      |

### 8.2 IPCハンドラ

| パターン                                                                                    | 採用理由                           | 適用先                             |
| ------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------- |
| `registerXxxHandlers()` / `unregisterXxxHandlers()` 関数ペア                                | P5対策（二重登録防止）             | `registerSkillAnalyticsHandlers()` |
| 5ステップ構造（Sender検証→バリデーション→ビジネスロジック→成功レスポンス→エラーレスポンス） | 統一されたハンドラ構造             | 全アナリティクスハンドラ           |
| `validateStringArg()` 共通関数                                                              | P42準拠3段バリデーションの重複排除 | 文字列引数の検証                   |
| `toIpcErrorResponse()` 共通関数                                                             | エラーレスポンス生成の統一         | catchブロック内                    |
| `return`方式（`{ success: false, error }`）                                                 | TASK-9Gの最新パターンに準拠        | バリデーションエラー時             |

### 8.3 チャネル定義

| パターン                          | 採用理由             | 適用先                                                        |
| --------------------------------- | -------------------- | ------------------------------------------------------------- |
| `SKILL_ANALYTICS_*` 定数名        | UPPER_SNAKE_CASE統一 | `SKILL_ANALYTICS_GET_USAGE`, `SKILL_ANALYTICS_GET_TRENDS`等   |
| `"skill:analytics:*"` 文字列値    | 階層命名規則準拠     | `"skill:analytics:getUsage"`, `"skill:analytics:getTrends"`等 |
| `ALLOWED_INVOKE_CHANNELS`への追加 | ホワイトリスト管理   | 全アナリティクスチャネル                                      |
| TASK IDコメント                   | グループ分け         | `// Skill analytics operations (TASK-9J)`                     |

### 8.4 Preload API

| パターン                                   | 採用理由                        | 適用先                                      |
| ------------------------------------------ | ------------------------------- | ------------------------------------------- |
| `SkillAPI`インターフェースへのメソッド追加 | 型安全なAPI公開                 | `analyticsGetUsage`, `analyticsGetTrends`等 |
| `safeInvokeUnwrap<T>()`                    | `{ success, data }`ラッパー展開 | 全アナリティクスAPI                         |
| JSDoc付きメソッド定義                      | API仕様の明示                   | 全メソッド                                  |
| オブジェクト引数 `{ skillName, period }`   | 複数引数のまとめ渡し            | フィルタ条件を含むAPI                       |

### 8.5 永続化ストア

| パターン                              | 採用理由                           | 適用先                            |
| ------------------------------------- | ---------------------------------- | --------------------------------- |
| `AnalyticsStore`クラス                | `ScheduleStore`と同等のCRUD+永続化 | 使用履歴・実行統計の永続化        |
| `ElectronStore<AnalyticsStoreSchema>` | 型安全なスキーマ定義               | `{ usageRecords: UsageRecord[] }` |
| `name: "skill-analytics"`             | 機能別ストアファイル分離           | アナリティクス専用ストア          |
| P19対策バリデーション                 | 破損データ耐性                     | コンストラクタでの復元時検証      |
| DI対応（`store?`オプショナル引数）    | テスト時のモック注入               | コンストラクタ                    |
| メモリキャッシュ + `persist()`        | 読み取り性能最適化                 | インメモリCRUD後に永続化          |
| `MAX_*`定数による上限管理             | ストレージ肥大化防止               | 履歴レコード件数制限              |

### 8.6 セキュリティ

| パターン                                         | 採用理由                   | 適用先                   |
| ------------------------------------------------ | -------------------------- | ------------------------ |
| `validateIpcSender()` + `toIPCValidationError()` | 全ハンドラでSender検証必須 | 全アナリティクスハンドラ |
| `sanitizeErrorMessage()`                         | 内部情報漏洩防止           | エラーレスポンス生成時   |
| `getAllowedWindows: () => [mainWindow]`          | mainWindowのみ許可         | 検証オプション           |
