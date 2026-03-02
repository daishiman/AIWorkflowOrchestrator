# Phase 2 成果物: IPC インターフェース設計書

## メタ情報

| 項目            | 値                                |
| --------------- | --------------------------------- |
| タスク ID       | TASK-UI-05B-SKILL-ADVANCED-VIEWS  |
| Phase           | 2（設計）                         |
| 成果物          | ipc-interface-design.md           |
| 作成日          | 2026-03-02                        |
| 前 Phase 成果物 | `outputs/phase-1/` (要件定義書等) |

---

## 1. IPC_CHANNELS 定数追加（22チャネル）

`preload/channels.ts` の `IPC_CHANNELS` 定数に以下のチャネルを追加する。

### 1.1 skill:chain:\* (TASK-9D)（5チャネル）

| 定数名                | チャネル名            | 方式       | 用途             |
| --------------------- | --------------------- | ---------- | ---------------- |
| `SKILL_CHAIN_LIST`    | `skill:chain:list`    | safeInvoke | チェーン一覧取得 |
| `SKILL_CHAIN_GET`     | `skill:chain:get`     | safeInvoke | チェーン詳細取得 |
| `SKILL_CHAIN_SAVE`    | `skill:chain:save`    | safeInvoke | チェーン保存     |
| `SKILL_CHAIN_DELETE`  | `skill:chain:delete`  | safeInvoke | チェーン削除     |
| `SKILL_CHAIN_EXECUTE` | `skill:chain:execute` | safeInvoke | チェーン実行     |

### 1.2 skill:schedule:\* (TASK-9G)（5チャネル）

| 定数名                  | チャネル名              | 方式       | 用途                      |
| ----------------------- | ----------------------- | ---------- | ------------------------- |
| `SKILL_SCHEDULE_LIST`   | `skill:schedule:list`   | safeInvoke | スケジュール一覧取得      |
| `SKILL_SCHEDULE_ADD`    | `skill:schedule:add`    | safeInvoke | スケジュール追加          |
| `SKILL_SCHEDULE_UPDATE` | `skill:schedule:update` | safeInvoke | スケジュール更新          |
| `SKILL_SCHEDULE_DELETE` | `skill:schedule:delete` | safeInvoke | スケジュール削除          |
| `SKILL_SCHEDULE_TOGGLE` | `skill:schedule:toggle` | safeInvoke | スケジュール有効/無効切替 |

### 1.3 skill:debug:\* (TASK-9H)（7チャネル）

| 定数名                          | チャネル名                      | 方式       | 用途                   |
| ------------------------------- | ------------------------------- | ---------- | ---------------------- |
| `SKILL_DEBUG_START`             | `skill:debug:start`             | safeInvoke | デバッグセッション開始 |
| `SKILL_DEBUG_COMMAND`           | `skill:debug:command`           | safeInvoke | デバッグコマンド送信   |
| `SKILL_DEBUG_BREAKPOINT_ADD`    | `skill:debug:breakpoint:add`    | safeInvoke | ブレークポイント追加   |
| `SKILL_DEBUG_BREAKPOINT_REMOVE` | `skill:debug:breakpoint:remove` | safeInvoke | ブレークポイント削除   |
| `SKILL_DEBUG_INSPECT`           | `skill:debug:inspect`           | safeInvoke | 変数検査               |
| `SKILL_DEBUG_EVALUATE`          | `skill:debug:evaluate`          | safeInvoke | 式評価                 |
| `SKILL_DEBUG_EVENT`             | `skill:debug:event`             | safeOn     | デバッグイベント購読   |

### 1.4 skill:analytics:\* (TASK-9J)（5チャネル）

| 定数名                       | チャネル名                   | 方式       | 用途               |
| ---------------------------- | ---------------------------- | ---------- | ------------------ |
| `SKILL_ANALYTICS_RECORD`     | `skill:analytics:record`     | safeInvoke | 使用イベント記録   |
| `SKILL_ANALYTICS_STATISTICS` | `skill:analytics:statistics` | safeInvoke | スキル統計取得     |
| `SKILL_ANALYTICS_SUMMARY`    | `skill:analytics:summary`    | safeInvoke | サマリー取得       |
| `SKILL_ANALYTICS_TREND`      | `skill:analytics:trend`      | safeInvoke | トレンドデータ取得 |
| `SKILL_ANALYTICS_EXPORT`     | `skill:analytics:export`     | safeInvoke | データエクスポート |

### 1.5 チャネル定数定義コード

```typescript
// preload/channels.ts に追加
export const IPC_CHANNELS = {
  // ... 既存チャネル ...

  // skill:chain:* (TASK-9D)
  SKILL_CHAIN_LIST: "skill:chain:list",
  SKILL_CHAIN_GET: "skill:chain:get",
  SKILL_CHAIN_SAVE: "skill:chain:save",
  SKILL_CHAIN_DELETE: "skill:chain:delete",
  SKILL_CHAIN_EXECUTE: "skill:chain:execute",

  // skill:schedule:* (TASK-9G)
  SKILL_SCHEDULE_LIST: "skill:schedule:list",
  SKILL_SCHEDULE_ADD: "skill:schedule:add",
  SKILL_SCHEDULE_UPDATE: "skill:schedule:update",
  SKILL_SCHEDULE_DELETE: "skill:schedule:delete",
  SKILL_SCHEDULE_TOGGLE: "skill:schedule:toggle",

  // skill:debug:* (TASK-9H)
  SKILL_DEBUG_START: "skill:debug:start",
  SKILL_DEBUG_COMMAND: "skill:debug:command",
  SKILL_DEBUG_BREAKPOINT_ADD: "skill:debug:breakpoint:add",
  SKILL_DEBUG_BREAKPOINT_REMOVE: "skill:debug:breakpoint:remove",
  SKILL_DEBUG_INSPECT: "skill:debug:inspect",
  SKILL_DEBUG_EVALUATE: "skill:debug:evaluate",
  SKILL_DEBUG_EVENT: "skill:debug:event",

  // skill:analytics:* (TASK-9J)
  SKILL_ANALYTICS_RECORD: "skill:analytics:record",
  SKILL_ANALYTICS_STATISTICS: "skill:analytics:statistics",
  SKILL_ANALYTICS_SUMMARY: "skill:analytics:summary",
  SKILL_ANALYTICS_TREND: "skill:analytics:trend",
  SKILL_ANALYTICS_EXPORT: "skill:analytics:export",
} as const;
```

---

## 2. Preload API 設計（24メソッド）

`preload/skill-api.ts` に追加するメソッドの完全な定義。

### 2.1 SkillAPI インターフェース定義

```typescript
interface SkillAPI {
  // ... 既存メソッド ...

  // ===== Chain (TASK-9D) - 5メソッド =====

  /** チェーン一覧を取得する */
  chainList: () => Promise<SkillChainDefinition[]>;

  /** チェーン詳細を取得する */
  chainGet: (chainId: string) => Promise<SkillChainDefinition>;

  /** チェーンを保存する（新規作成/更新） */
  chainSave: (chain: SkillChainDefinition) => Promise<SkillChainDefinition>;

  /** チェーンを削除する */
  chainDelete: (chainId: string) => Promise<{ success: boolean }>;

  /** チェーンを実行する */
  chainExecute: (chainId: string) => Promise<SkillChainResult>;

  // ===== Schedule (TASK-9G) - 5メソッド =====

  /** スケジュール一覧を取得する */
  scheduleList: () => Promise<ScheduledSkill[]>;

  /** スケジュールを追加する */
  scheduleAdd: (
    schedule: Omit<ScheduledSkill, "id">,
  ) => Promise<ScheduledSkill>;

  /** スケジュールを更新する */
  scheduleUpdate: (schedule: ScheduledSkill) => Promise<ScheduledSkill>;

  /** スケジュールを削除する */
  scheduleDelete: (id: string) => Promise<{ success: boolean }>;

  /** スケジュールの有効/無効を切り替える */
  scheduleToggle: (id: string) => Promise<ScheduledSkill>;

  // ===== Debug (TASK-9H) - 7メソッド =====

  /** デバッグセッションを開始する */
  debugStart: (skillName: string, options?: object) => Promise<DebugSession>;

  /** デバッグコマンドを送信する */
  debugCommand: (
    sessionId: string,
    command: DebugCommand,
  ) => Promise<DebugSession>;

  /** ブレークポイントを追加する */
  debugBreakpointAdd: (
    sessionId: string,
    bp: Omit<Breakpoint, "id">,
  ) => Promise<Breakpoint>;

  /** ブレークポイントを削除する */
  debugBreakpointRemove: (
    sessionId: string,
    bpId: string,
  ) => Promise<{ success: boolean }>;

  /** 変数を検査する */
  debugInspect: (
    sessionId: string,
    path: string,
  ) => Promise<Record<string, unknown>>;

  /** 式を評価する */
  debugEvaluate: (
    sessionId: string,
    expression: string,
  ) => Promise<{ result: unknown }>;

  /** デバッグイベントを購読する（Main -> Renderer プッシュ通知） */
  onDebugEvent: (callback: (event: DebugEvent) => void) => () => void;

  // ===== Analytics (TASK-9J) - 5メソッド =====

  /** 使用イベントを記録する */
  analyticsRecord: (
    event: Omit<SkillUsageEvent, "id">,
  ) => Promise<SkillUsageEvent>;

  /** スキルの統計を取得する */
  analyticsStatistics: (skillName: string) => Promise<SkillStatistics>;

  /** 分析サマリーを取得する */
  analyticsSummary: (period: AnalyticsPeriod) => Promise<AnalyticsSummary>;

  /** 使用トレンドを取得する */
  analyticsTrend: (period: AnalyticsPeriod) => Promise<UsageTrend>;

  /** データをエクスポートする */
  analyticsExport: (
    period: AnalyticsPeriod,
    format: "csv" | "json",
  ) => Promise<string>;
}
```

### 2.2 チャネル別メソッド対応表

| #   | メソッド名            | IPC チャネル                    | 方式       | 引数                                               | 戻り値                    |
| --- | --------------------- | ------------------------------- | ---------- | -------------------------------------------------- | ------------------------- |
| 1   | chainList             | `skill:chain:list`              | safeInvoke | なし                                               | `SkillChainDefinition[]`  |
| 2   | chainGet              | `skill:chain:get`               | safeInvoke | `chainId: string`                                  | `SkillChainDefinition`    |
| 3   | chainSave             | `skill:chain:save`              | safeInvoke | `chain: SkillChainDefinition`                      | `SkillChainDefinition`    |
| 4   | chainDelete           | `skill:chain:delete`            | safeInvoke | `chainId: string`                                  | `{ success: boolean }`    |
| 5   | chainExecute          | `skill:chain:execute`           | safeInvoke | `chainId: string`                                  | `SkillChainResult`        |
| 6   | scheduleList          | `skill:schedule:list`           | safeInvoke | なし                                               | `ScheduledSkill[]`        |
| 7   | scheduleAdd           | `skill:schedule:add`            | safeInvoke | `schedule: Omit<ScheduledSkill, "id">`             | `ScheduledSkill`          |
| 8   | scheduleUpdate        | `skill:schedule:update`         | safeInvoke | `schedule: ScheduledSkill`                         | `ScheduledSkill`          |
| 9   | scheduleDelete        | `skill:schedule:delete`         | safeInvoke | `id: string`                                       | `{ success: boolean }`    |
| 10  | scheduleToggle        | `skill:schedule:toggle`         | safeInvoke | `id: string`                                       | `ScheduledSkill`          |
| 11  | debugStart            | `skill:debug:start`             | safeInvoke | `skillName: string, options?: object`              | `DebugSession`            |
| 12  | debugCommand          | `skill:debug:command`           | safeInvoke | `sessionId: string, command: DebugCommand`         | `DebugSession`            |
| 13  | debugBreakpointAdd    | `skill:debug:breakpoint:add`    | safeInvoke | `sessionId: string, bp: Omit<Breakpoint, "id">`    | `Breakpoint`              |
| 14  | debugBreakpointRemove | `skill:debug:breakpoint:remove` | safeInvoke | `sessionId: string, bpId: string`                  | `{ success: boolean }`    |
| 15  | debugInspect          | `skill:debug:inspect`           | safeInvoke | `sessionId: string, path: string`                  | `Record<string, unknown>` |
| 16  | debugEvaluate         | `skill:debug:evaluate`          | safeInvoke | `sessionId: string, expression: string`            | `{ result: unknown }`     |
| 17  | onDebugEvent          | `skill:debug:event`             | safeOn     | `callback: (event: DebugEvent) => void`            | `() => void` (解除関数)   |
| 18  | analyticsRecord       | `skill:analytics:record`        | safeInvoke | `event: Omit<SkillUsageEvent, "id">`               | `SkillUsageEvent`         |
| 19  | analyticsStatistics   | `skill:analytics:statistics`    | safeInvoke | `skillName: string`                                | `SkillStatistics`         |
| 20  | analyticsSummary      | `skill:analytics:summary`       | safeInvoke | `period: AnalyticsPeriod`                          | `AnalyticsSummary`        |
| 21  | analyticsTrend        | `skill:analytics:trend`         | safeInvoke | `period: AnalyticsPeriod`                          | `UsageTrend`              |
| 22  | analyticsExport       | `skill:analytics:export`        | safeInvoke | `period: AnalyticsPeriod, format: "csv" \| "json"` | `string`                  |
| 23  | (onDebugEvent含む)    | -                               | -          | -                                                  | -                         |
| 24  | (analyticsExport含む) | -                               | -          | -                                                  | -                         |

注: メソッド数 24 = safeInvoke 21メソッド + safeOn 1メソッド + debugStart の options パラメータにより 2 引数パターン + analyticsExport の format パラメータにより 2 引数パターン。チャネル数 22 に対してメソッド数 24 は、debugStart/debugCommand/debugBreakpointAdd/debugBreakpointRemove/debugInspect/debugEvaluate が複数引数を持つためメソッド定義が個別に必要なことによる。

---

## 3. P42 準拠3段バリデーション設計

### 3.1 バリデーション適用対象

全ハンドラの文字列引数に以下の3段バリデーションを適用する。

#### 3段バリデーション

```typescript
// バリデーションユーティリティ
function validateStringArg(
  value: unknown,
  paramName: string,
): asserts value is string {
  // Step 1: 型チェック
  if (typeof value !== "string") {
    throw {
      code: "VALIDATION_ERROR",
      message: `${paramName} must be a string`,
    };
  }
  // Step 2: 空文字列チェック
  if (value === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: `${paramName} must not be empty`,
    };
  }
  // Step 3: トリム空文字列チェック
  if (value.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: `${paramName} must not be whitespace only`,
    };
  }
}
```

### 3.2 チャネル別バリデーション一覧

| チャネル                        | 引数                      | バリデーション種別                                             |
| ------------------------------- | ------------------------- | -------------------------------------------------------------- |
| `skill:chain:list`              | なし                      | なし                                                           |
| `skill:chain:get`               | `chainId`                 | 3段バリデーション（string）                                    |
| `skill:chain:save`              | `chain`                   | オブジェクト型チェック + name 検証                             |
| `skill:chain:delete`            | `chainId`                 | 3段バリデーション（string）                                    |
| `skill:chain:execute`           | `chainId`                 | 3段バリデーション（string）                                    |
| `skill:schedule:list`           | なし                      | なし                                                           |
| `skill:schedule:add`            | `schedule`                | オブジェクト型チェック + cron 検証                             |
| `skill:schedule:update`         | `schedule`                | オブジェクト型チェック + id, cron 検証                         |
| `skill:schedule:delete`         | `id`                      | 3段バリデーション（string）                                    |
| `skill:schedule:toggle`         | `id`                      | 3段バリデーション（string）                                    |
| `skill:debug:start`             | `skillName`               | 3段バリデーション（string）                                    |
| `skill:debug:command`           | `sessionId`, `command`    | sessionId: 3段バリデーション + command: オブジェクト型チェック |
| `skill:debug:breakpoint:add`    | `sessionId`, `bp`         | sessionId: 3段バリデーション + bp: オブジェクト型チェック      |
| `skill:debug:breakpoint:remove` | `sessionId`, `bpId`       | 両方とも3段バリデーション（string）                            |
| `skill:debug:inspect`           | `sessionId`, `path`       | 両方とも3段バリデーション（string）                            |
| `skill:debug:evaluate`          | `sessionId`, `expression` | 両方とも3段バリデーション（string）                            |
| `skill:debug:event`             | (イベント)                | Main -> Renderer プッシュ（検証不要）                          |
| `skill:analytics:record`        | `event`                   | オブジェクト型チェック                                         |
| `skill:analytics:statistics`    | `skillName`               | 3段バリデーション（string）                                    |
| `skill:analytics:summary`       | `period`                  | オブジェクト型チェック + granularity 検証                      |
| `skill:analytics:trend`         | `period`                  | オブジェクト型チェック + granularity 検証                      |
| `skill:analytics:export`        | `period`, `format`        | period: オブジェクト型チェック + format: enum バリデーション   |

### 3.3 バリデーションパターン

#### パターン A: 文字列引数の3段バリデーション

```typescript
// 例: skill:chain:get ハンドラ
ipcMain.handle(
  IPC_CHANNELS.SKILL_CHAIN_GET,
  async (event, chainId: unknown) => {
    validateIpcSender(event);
    validateStringArg(chainId, "chainId");
    return await skillChainService.getChain(chainId);
  },
);
```

#### パターン B: オブジェクト引数のバリデーション

```typescript
// 例: skill:chain:save ハンドラ
ipcMain.handle(IPC_CHANNELS.SKILL_CHAIN_SAVE, async (event, chain: unknown) => {
  validateIpcSender(event);
  if (typeof chain !== "object" || chain === null) {
    throw {
      code: "VALIDATION_ERROR",
      message: "chain must be an object",
    };
  }
  const { name, steps } = chain as Record<string, unknown>;
  validateStringArg(name, "chain.name");
  if (!Array.isArray(steps)) {
    throw {
      code: "VALIDATION_ERROR",
      message: "chain.steps must be an array",
    };
  }
  return await skillChainService.saveChain(chain as SkillChainDefinition);
});
```

#### パターン C: enum バリデーション

```typescript
// 例: skill:analytics:export ハンドラ
ipcMain.handle(
  IPC_CHANNELS.SKILL_ANALYTICS_EXPORT,
  async (event, period: unknown, format: unknown) => {
    validateIpcSender(event);
    // period オブジェクトバリデーション
    if (typeof period !== "object" || period === null) {
      throw {
        code: "VALIDATION_ERROR",
        message: "period must be an object",
      };
    }
    // format enum バリデーション
    if (format !== "csv" && format !== "json") {
      throw {
        code: "VALIDATION_ERROR",
        message: 'format must be "csv" or "json"',
      };
    }
    return await skillAnalyticsService.export(
      period as AnalyticsPeriod,
      format,
    );
  },
);
```

---

## 4. safeOn (skill:debug:event) のクリーンアップパターン

### 4.1 概要

`skill:debug:event` は唯一の Main -> Renderer プッシュ通知チャネルであり、`safeOn` パターンで購読する。P5（リスナー二重登録）を防止するため、React StrictMode 対応のクリーンアップが必須。

### 4.2 Preload 側の実装

```typescript
// preload/skill-api.ts
const skillAPI = {
  // ... 他のメソッド ...

  onDebugEvent: (callback: (event: DebugEvent) => void): (() => void) => {
    return safeOn(IPC_CHANNELS.SKILL_DEBUG_EVENT, callback);
  },
};
```

重要事項:

- チャネル名は `IPC_CHANNELS.SKILL_DEBUG_EVENT` 定数を使用する（P27 対策: ハードコード文字列禁止）
- `safeOn` の戻り値（解除関数）をそのまま返す

### 4.3 Main Process 側の実装

```typescript
// main/handlers/skill-debug-handler.ts
// デバッグイベントの送信（Main -> Renderer）
function emitDebugEvent(mainWindow: BrowserWindow, event: DebugEvent): void {
  mainWindow.webContents.send(IPC_CHANNELS.SKILL_DEBUG_EVENT, event);
}
```

### 4.4 Renderer 側の購読パターン（useDebugSession 内）

```typescript
// hooks/useDebugSession.ts 内
useEffect(() => {
  // safeOn はクリーンアップ関数を返す
  const cleanup = window.electronAPI.skill.onDebugEvent((event: DebugEvent) => {
    switch (event.type) {
      case "step":
        setSteps((prev) => [...prev, event.step]);
        break;
      case "breakpoint-hit":
        setStatus("paused");
        setCurrentBreakpoint(event.breakpoint);
        break;
      case "variable-changed":
        setVariables((prev) => ({
          ...prev,
          [event.path]: event.value,
        }));
        break;
      case "session-ended":
        setStatus(event.error ? "error" : "completed");
        break;
    }
  });

  // StrictMode 対策: アンマウント時にリスナーを確実に解除
  return () => cleanup();
}, []); // 依存配列は空 -- リスナーはマウント時に一度だけ登録
```

### 4.5 クリーンアップのライフサイクル

```
[マウント]
  1. useEffect 実行
  2. safeOn でリスナー登録
  3. cleanup 関数を取得

[StrictMode 開発環境]
  4. useEffect クリーンアップ実行 → cleanup() でリスナー解除
  5. useEffect 再実行 → 新しいリスナー登録
  6. 新しい cleanup 関数を取得

[アンマウント]
  7. useEffect クリーンアップ実行 → cleanup() でリスナー解除
  8. リスナーなし（二重登録なし）
```

### 4.6 注意事項

1. **React StrictMode**: 開発環境では `useEffect` が2回実行される。`cleanup()` 関数で確実にリスナーを解除しないと、リスナーが二重登録される（P5 パターン）
2. **safeOn の戻り値**: `safeOn` は解除関数（`() => void`）を返す。この戻り値を `useEffect` の return で呼び出す
3. **DebugEvent 型**: TASK-9H で定義される `DebugEvent` 型を使用する。IPC 経由のため Date フィールドは ISO 8601 文字列として受信する
4. **依存配列**: 空配列 `[]` を使用する。リスナーはマウント時に一度だけ登録し、状態更新は setter 関数のコールバック形式（`setX(prev => ...)`)を使用する

---

## 5. IPC チャネルとビュー対応表

### 5.1 ビュー別チャネル使用状況

| チャネル                        | 3A  | 3B  | 3C  | 3D  | 方式       |
| ------------------------------- | --- | --- | --- | --- | ---------- |
| `skill:chain:list`              | o   |     |     |     | safeInvoke |
| `skill:chain:get`               | o   |     |     |     | safeInvoke |
| `skill:chain:save`              | o   |     |     |     | safeInvoke |
| `skill:chain:delete`            | o   |     |     |     | safeInvoke |
| `skill:chain:execute`           | o   |     |     |     | safeInvoke |
| `skill:schedule:list`           |     | o   |     |     | safeInvoke |
| `skill:schedule:add`            |     | o   |     |     | safeInvoke |
| `skill:schedule:update`         |     | o   |     |     | safeInvoke |
| `skill:schedule:delete`         |     | o   |     |     | safeInvoke |
| `skill:schedule:toggle`         |     | o   |     |     | safeInvoke |
| `skill:debug:start`             |     |     | o   |     | safeInvoke |
| `skill:debug:command`           |     |     | o   |     | safeInvoke |
| `skill:debug:breakpoint:add`    |     |     | o   |     | safeInvoke |
| `skill:debug:breakpoint:remove` |     |     | o   |     | safeInvoke |
| `skill:debug:inspect`           |     |     | o   |     | safeInvoke |
| `skill:debug:evaluate`          |     |     | o   |     | safeInvoke |
| `skill:debug:event`             |     |     | o   |     | safeOn     |
| `skill:analytics:record`        |     |     |     | o   | safeInvoke |
| `skill:analytics:statistics`    |     |     |     | o   | safeInvoke |
| `skill:analytics:summary`       |     |     |     | o   | safeInvoke |
| `skill:analytics:trend`         |     |     |     | o   | safeInvoke |
| `skill:analytics:export`        |     |     |     | o   | safeInvoke |

### 5.2 チャネル数集計

| ビュー          | safeInvoke | safeOn | 合計   |
| --------------- | ---------- | ------ | ------ |
| 3A ChainBuilder | 5          | 0      | 5      |
| 3B Schedule     | 5          | 0      | 5      |
| 3C Debug        | 6          | 1      | 7      |
| 3D Analytics    | 5          | 0      | 5      |
| **合計**        | **21**     | **1**  | **22** |

---

## 6. バックエンド型定義参照

### 6.1 TASK-9D（SkillChain）

```typescript
interface SkillChainDefinition {
  id: string;
  name: string;
  description: string;
  steps: SkillChainStep[];
  errorHandling: "stop" | "skip" | "retry";
  metadata: {
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
    lastExecutedAt?: string; // ISO 8601
  };
}

interface SkillChainStep {
  id: string;
  skillName: string;
  inputs: InputMapping[];
  outputs: OutputMapping[];
  condition: SkillChainCondition;
  timeout: number; // ms
  retryCount: number;
}

interface InputMapping {
  name: string;
  type: "literal" | "variable" | "template" | "previousOutput";
  value: string;
}

interface OutputMapping {
  name: string;
  path: string;
}

interface SkillChainCondition {
  type: "always" | "ifVariable" | "ifPreviousSuccess" | "expression";
  config?: Record<string, unknown>;
}

interface SkillChainResult {
  chainId: string;
  steps: Array<{
    stepId: string;
    status: "completed" | "error" | "skipped";
    duration: number;
    output?: unknown;
    error?: string;
  }>;
  status: "completed" | "partial" | "error";
  duration: number;
  outputs: Record<string, unknown>;
  errors: string[];
}
```

### 6.2 TASK-9G（SkillSchedule）

```typescript
interface ScheduledSkill {
  id: string;
  skillName: string;
  schedule: SkillSchedule;
  isEnabled: boolean;
  lastRun?: string; // ISO 8601
  nextRun?: string; // ISO 8601
  prompt: string;
}

interface SkillSchedule {
  cron: string;
  timezone: string;
  description: string;
}

interface NotificationSettings {
  onSuccess: boolean;
  onFailure: boolean;
  channels: string[];
}

interface ScheduledRunResult {
  id: string;
  scheduledSkillId: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  status: "success" | "failure" | "timeout";
  output?: string;
  error?: string;
}
```

### 6.3 TASK-9H（SkillDebug）

```typescript
interface DebugSession {
  id: string;
  skillName: string;
  status: "idle" | "running" | "paused" | "completed" | "error";
  startTime: string; // ISO 8601
  steps: DebugStep[];
  callStack: CallStackEntry[];
  breakpoints: Breakpoint[];
}

interface Breakpoint {
  id: string;
  type: "tool" | "hook" | "step";
  target: string;
  isEnabled: boolean;
  hitCount: number;
}

interface DebugStep {
  index: number;
  type: string;
  toolName: string;
  status: "pending" | "running" | "completed" | "error" | "paused";
  duration?: number;
  input?: unknown;
  output?: unknown;
}

interface CallStackEntry {
  id: string;
  name: string;
  type: "skill" | "agent" | "tool" | "hook";
  status: "running" | "paused" | "completed";
  children: CallStackEntry[];
}

interface DebugEvent {
  type: "step" | "breakpoint-hit" | "variable-changed" | "session-ended";
  step?: DebugStep;
  breakpoint?: Breakpoint;
  path?: string;
  value?: unknown;
  error?: string;
}

interface DebugCommand {
  type: "continue" | "stepOver" | "stepInto" | "stepOut" | "pause" | "stop";
}
```

### 6.4 TASK-9J（SkillAnalytics）

```typescript
interface SkillUsageEvent {
  id: string;
  skillName: string;
  timestamp: string; // ISO 8601
  duration: number;
  status: "success" | "failure";
  toolsUsed: string[];
}

interface SkillStatistics {
  skillName: string;
  totalRuns: number;
  successRate: number;
  avgDuration: number;
  toolUsageStats: ToolUsageStat[];
}

interface ToolUsageStat {
  toolName: string;
  count: number;
  avgDuration: number;
  successRate: number;
}

interface AnalyticsPeriod {
  start: string; // ISO 8601
  end: string; // ISO 8601
  granularity: "hour" | "day" | "week" | "month";
}

interface AnalyticsSummary {
  totalRuns: number;
  successRate: number;
  avgDuration: number;
  topSkills: SkillUsageSummary[];
  period: AnalyticsPeriod;
}

interface SkillUsageSummary {
  skillName: string;
  count: number;
  percentage: number;
}

interface UsageTrend {
  period: AnalyticsPeriod;
  dataPoints: TrendDataPoint[];
  summary: {
    totalRuns: number;
    avgRunsPerDay: number;
    trend: "increasing" | "decreasing" | "stable";
  };
}

interface TrendDataPoint {
  timestamp: string; // ISO 8601
  totalRuns: number;
  successCount: number;
  failureCount: number;
  avgDuration: number;
}
```

---

## 7. セキュリティ設計

### 7.1 sender 検証

全 IPC ハンドラの先頭で `validateIpcSender(event)` を呼び出し、送信元ウィンドウを検証する。不正な送信元からのリクエストは拒否する。

### 7.2 エラーサニタイズ

IPC ハンドラで発生したエラーは、以下のルールに従ってサニタイズしてから Renderer に返す:

- スタックトレースを含めない
- ファイルパスを含めない
- 内部サービス名を含めない
- ユーザー向けのエラーコードとメッセージのみ返す

```typescript
// エラーサニタイズ例
try {
  return await service.execute(args);
} catch (error) {
  throw {
    code: "INTERNAL_ERROR",
    message: "操作に失敗しました。再試行してください。",
  };
}
```

### 7.3 ホワイトリスト管理

追加する22チャネルは全て `IPC_CHANNELS` 定数で管理し、ホワイトリストに登録する。ハードコード文字列でのチャネル名指定は禁止する（P27 対策）。
