# Phase 2 成果物: IPC 契約設計書 -- skill:fork ハンドラ設計

## メタ情報

| 項目     | 値                 |
| -------- | ------------------ |
| Phase    | 2                  |
| 機能名   | TASK-9E-skill-fork |
| タスクID | TASK-9E            |
| 作成日   | 2026-02-28         |

---

## 1. skill:fork ハンドラ設計

### 1.1 チャネル仕様

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| チャネル名 | `skill:fork`                           |
| 定数名     | `IPC_CHANNELS.SKILL_FORK`              |
| 方向       | Renderer -> Main                       |
| 引数型     | `SkillForkOptions`（オブジェクト形式） |
| 戻り値型   | `IpcResult<SkillForkResult>`           |
| 登録関数   | `registerSkillHandlers()`              |
| 解除関数   | `unregisterSkillHandlers()`            |

### 1.2 ハンドラ実装設計

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts 内の registerSkillHandlers() に追加

// skill:fork - スキルをフォーク（TASK-9E）
ipcMain.handle(
  IPC_CHANNELS.SKILL_FORK,
  async (event: IpcMainInvokeEvent, args: unknown) => {
    // -- Step 1: 送信元検証 --
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_FORK, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // -- Step 2: P42準拠3段バリデーション --
    // 2-1. args がオブジェクトであることを検証
    if (typeof args !== "object" || args === null) {
      throw {
        code: "VALIDATION_ERROR",
        message: "args must be a non-null object",
      };
    }

    const forkArgs = args as Record<string, unknown>;

    // 2-2. sourceSkill: string, 非空, トリム後非空
    if (
      typeof forkArgs.sourceSkill !== "string" ||
      forkArgs.sourceSkill.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "sourceSkill must be a non-empty string",
      };
    }

    // 2-3. newName: string, 非空, トリム後非空
    if (
      typeof forkArgs.newName !== "string" ||
      forkArgs.newName.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "newName must be a non-empty string",
      };
    }

    // 2-4. description: string | undefined（指定時は非空チェック）
    if (
      forkArgs.description !== undefined &&
      (typeof forkArgs.description !== "string" ||
        forkArgs.description.trim() === "")
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "description must be a non-empty string when provided",
      };
    }

    // 2-5. copyAgents, copyReferences, copyScripts, copyAssets: boolean
    for (const flag of [
      "copyAgents",
      "copyReferences",
      "copyScripts",
      "copyAssets",
    ]) {
      if (typeof forkArgs[flag] !== "boolean") {
        throw {
          code: "VALIDATION_ERROR",
          message: `${flag} must be a boolean`,
        };
      }
    }

    // 2-6. modifyAllowedTools: string[] | undefined
    if (forkArgs.modifyAllowedTools !== undefined) {
      if (
        !Array.isArray(forkArgs.modifyAllowedTools) ||
        !forkArgs.modifyAllowedTools.every(
          (t: unknown) => typeof t === "string" && t.trim() !== "",
        )
      ) {
        throw {
          code: "VALIDATION_ERROR",
          message: "modifyAllowedTools must be an array of non-empty strings",
        };
      }
    }

    // -- Step 3: フォーク実行 --
    try {
      const result = await skillService.forkSkill(
        forkArgs as unknown as SkillForkOptions,
      );
      return { success: true, data: result };
    } catch (error) {
      log.error("[skillHandlers] skill:fork failed:", error);
      return { success: false, error: sanitizeErrorMessage(error) };
    }
  },
);
```

### 1.3 ハンドラ解除設計

```typescript
// unregisterSkillHandlers() に追加
ipcMain.removeHandler(IPC_CHANNELS.SKILL_FORK);
```

---

## 2. P42 準拠 3段バリデーション詳細

### 2.1 バリデーション対象一覧

| 引数名               | 型                      | 必須 | 3段バリデーション                        | 追加検証           |
| -------------------- | ----------------------- | ---- | ---------------------------------------- | ------------------ |
| `sourceSkill`        | `string`                | 必須 | 型チェック -> 空文字列 -> trim           | なし               |
| `newName`            | `string`                | 必須 | 型チェック -> 空文字列 -> trim           | なし               |
| `description`        | `string \| undefined`   | 任意 | 指定時: 型チェック -> 空文字列 -> trim   | 未指定時はスキップ |
| `copyAgents`         | `boolean`               | 必須 | typeof === "boolean"                     | なし               |
| `copyReferences`     | `boolean`               | 必須 | typeof === "boolean"                     | なし               |
| `copyScripts`        | `boolean`               | 必須 | typeof === "boolean"                     | なし               |
| `copyAssets`         | `boolean`               | 必須 | typeof === "boolean"                     | なし               |
| `modifyAllowedTools` | `string[] \| undefined` | 任意 | 指定時: Array.isArray -> 各要素の型+trim | 未指定時はスキップ |

### 2.2 バリデーション順序

```
Step 1: args のオブジェクト検証
  +-- typeof args !== "object" || args === null -> VALIDATION_ERROR

Step 2: 文字列引数の3段バリデーション
  |-- sourceSkill: typeof -> === "" -> .trim() === ""
  |-- newName:     typeof -> === "" -> .trim() === ""
  +-- description: undefined チェック -> typeof -> === "" -> .trim() === ""

Step 3: boolean 引数の型チェック
  |-- copyAgents:     typeof !== "boolean"
  |-- copyReferences: typeof !== "boolean"
  |-- copyScripts:    typeof !== "boolean"
  +-- copyAssets:     typeof !== "boolean"

Step 4: 配列引数の検証
  +-- modifyAllowedTools: undefined チェック -> Array.isArray ->
      every(t => typeof === "string" && .trim() !== "")
```

### 2.3 P42 準拠チェック

```typescript
// P42 パターン確認

// 不十分（trim チェックなし）
if (typeof forkArgs.sourceSkill !== "string" || forkArgs.sourceSkill === "") { ... }

// P42 準拠（3段バリデーション）
if (typeof forkArgs.sourceSkill !== "string" || forkArgs.sourceSkill.trim() === "") { ... }
```

---

## 3. リクエスト/レスポンス型設計

### 3.1 リクエスト型: SkillForkOptions

```typescript
// packages/shared/src/types/skill-fork.ts

export interface SkillForkOptions {
  /** フォーク元のスキル名（ディレクトリ名） */
  sourceSkill: string;

  /** 新スキル名（ディレクトリ名として使用される） */
  newName: string;

  /** 新スキルの説明文（省略時はフォーク元の説明を維持） */
  description?: string;

  /** agents/ ディレクトリをコピーするか */
  copyAgents: boolean;

  /** references/ ディレクトリをコピーするか */
  copyReferences: boolean;

  /** scripts/ ディレクトリをコピーするか */
  copyScripts: boolean;

  /** assets/ ディレクトリをコピーするか */
  copyAssets: boolean;

  /**
   * allowed-tools の上書き値
   * 省略時はフォーク元の設定を維持する
   */
  modifyAllowedTools?: string[];
}
```

### 3.2 レスポンス型: IpcResult<SkillForkResult>

```typescript
// 既存の IpcResult 型を使用
// 成功時: { success: true, data: SkillForkResult }
// 失敗時: { success: false, error: string }

export interface SkillForkResult {
  /** フォーク成功フラグ */
  success: boolean;

  /** 新スキルのディレクトリパス */
  newSkillPath: string;

  /** コピーされたファイルの相対パス一覧 */
  copiedFiles: string[];

  /** 警告メッセージ（非致命的な問題がある場合） */
  warnings?: string[];
}
```

### 3.3 データフロー

```
Renderer                    Preload                      Main Process
   |                           |                              |
   | forkSkill(SkillForkOpts)->|                              |
   |                           | safeInvoke("skill:fork",  ->|
   |                           |   SkillForkOptions)          |
   |                           |                              |-- validateIpcSender()
   |                           |                              |-- 3段バリデーション
   |                           |                              |-- skillService.forkSkill()
   |                           |                              |
   |                           |<-- IpcResult<SkillForkResult>|
   |<-- Promise<IpcResult<    |                              |
   |    SkillForkResult>>      |                              |
```

---

## 4. Preload API 設計

### 4.1 channels.ts への定数追加

```typescript
// apps/desktop/src/preload/channels.ts

export const IPC_CHANNELS = {
  // ... 既存チャネル

  // Skill fork operations (TASK-9E)
  SKILL_FORK: "skill:fork",
} as const;
```

### 4.2 ALLOWED_INVOKE_CHANNELS への追加

```typescript
// apps/desktop/src/preload/channels.ts

export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存チャネル

  // Skill fork channel (TASK-9E)
  IPC_CHANNELS.SKILL_FORK,
];
```

### 4.3 skill-api.ts への forkSkill メソッド追加

```typescript
// apps/desktop/src/preload/skill-api.ts

/**
 * 既存スキルをフォークして新スキルを作成する
 *
 * @param options フォークオプション
 * @returns フォーク結果（IpcResult<SkillForkResult> 形式）
 */
forkSkill: (options: SkillForkOptions): Promise<IpcResult<SkillForkResult>> =>
  safeInvoke<IpcResult<SkillForkResult>>(IPC_CHANNELS.SKILL_FORK, options),
```

### 4.4 types.ts への型追加

```typescript
// apps/desktop/src/preload/skill-api.ts
// SkillAPI インターフェースに追加

import type {
  SkillForkOptions,
  SkillForkResult,
} from "@repo/shared/types/skill-fork";

interface SkillAPI {
  // ... 既存メソッド

  /** スキルをフォークする（TASK-9E） */
  forkSkill: (options: SkillForkOptions) => Promise<IpcResult<SkillForkResult>>;
}
```

---

## 5. セキュリティ設計

### 5.1 送信元検証

```typescript
// skill:fork ハンドラの最初のステップとして実行

const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_FORK, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  throw toIPCValidationError(validation);
}
```

### 5.2 パストラバーサル防止

パストラバーサル検証は SkillForker サービス層の `validatePath()` で実施する。IPC ハンドラ層では P42 準拠の文字列バリデーションのみを行い、パス検証はサービス層に委譲する。

### 5.3 エラーサニタイズ

skill:fork ハンドラでは、既存の `sanitizeErrorMessage()` 関数を使用してエラーメッセージをサニタイズする。

```typescript
try {
  const result = await skillService.forkSkill(
    forkArgs as unknown as SkillForkOptions,
  );
  return { success: true, data: result };
} catch (error) {
  log.error("[skillHandlers] skill:fork failed:", error);
  return { success: false, error: sanitizeErrorMessage(error) };
}
```

### 5.4 SkillForkError のメッセージ設計

SkillForkError のメッセージはユーザー向けの日本語メッセージとし、内部情報を含めない。

| エラーコード | メッセージ                                           | サニタイズ必要性 |
| ------------ | ---------------------------------------------------- | ---------------- |
| 1001         | `フォーク元スキル "${sourceSkill}" が見つかりません` | 低（パスなし）   |
| 1002         | `スキル "${newName}" は既に存在します`               | 低（パスなし）   |
| 1003         | `不正なスキル名です`                                 | 不要             |
| 1004         | `引数が不正です`                                     | 不要             |
| 4001         | `SKILL.md の読み取りに失敗しました`                  | 要（パス除去）   |
| 4002         | `ディレクトリのコピーに失敗しました`                 | 要（パス除去）   |
| 4003         | `メタデータの書き込みに失敗しました`                 | 要（パス除去）   |
| 4004         | `ディレクトリの作成に失敗しました`                   | 要（パス除去）   |

---

## 6. IPC 契約チェックリスト（ipc-contract-checklist.md 準拠）

### Phase 1: チャネル定義の整合性

- [x] `IPC_CHANNELS.SKILL_FORK` が `channels.ts` に定義されている
- [x] `ALLOWED_INVOKE_CHANNELS` に `IPC_CHANNELS.SKILL_FORK` が追加されている
- [x] チャネル名がハードコード文字列ではなく定数経由で参照されている

### Phase 2: ハンドラと Preload の引数一致

- [x] ハンドラの引数型: `args: unknown`（ランタイムバリデーション）
- [x] Preload の引数型: `options: SkillForkOptions`（型安全）
- [x] `safeInvoke(IPC_CHANNELS.SKILL_FORK, options)` でオブジェクトを渡す
- [x] ハンドラ側でオブジェクトとして受け取り、プロパティごとにバリデーション

### Phase 3: P42 準拠バリデーション

- [x] 全文字列引数に3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）
- [x] boolean 引数に typeof チェック
- [x] 配列引数に Array.isArray + 要素バリデーション

### Phase 4: エラーハンドリング

- [x] バリデーションエラーは `throw` で返す
- [x] ビジネスエラーは `{ success: false, error: string }` で返す
- [x] `sanitizeErrorMessage()` でエラーサニタイズを適用

### Phase 5: 引数命名の一致（P45 対策）

- [x] ハンドラの引数名 `sourceSkill` = Preload の `SkillForkOptions.sourceSkill`
- [x] ハンドラの引数名 `newName` = Preload の `SkillForkOptions.newName`
- [x] セマンティクスが一致する命名を使用

### Phase 6: テスト設計

- [x] ハンドラのバリデーションテスト（全引数パターン）
- [x] 正常系の統合テスト（Preload -> Main -> FileSystem）
- [x] エラーサニタイズの検証テスト

---

## 7. 既存ハンドラとの比較

### 7.1 パターン比較

| 項目           | skill:import           | skill:remove           | skill:fork                      |
| -------------- | ---------------------- | ---------------------- | ------------------------------- |
| 引数形式       | `skillName: SkillName` | `skillName: SkillName` | `args: unknown`（オブジェクト） |
| バリデーション | string 3段             | string 3段             | オブジェクト + 各プロパティ     |
| エラー返却     | throw                  | throw                  | try/catch + IpcResult           |
| サニタイズ     | なし                   | なし                   | sanitizeErrorMessage 適用       |
| 送信元検証     | validateIpcSender      | validateIpcSender      | validateIpcSender               |

### 7.2 skill:fork 特有の設計判断

1. **オブジェクト形式の引数**: 複数のパラメータ（8項目）を持つため、個別引数ではなくオブジェクトとして受け取る
2. **IpcResult 形式の戻り値**: 成功/失敗を明示的に返すため、throw ではなく `{ success, data/error }` 形式を使用
3. **sanitizeErrorMessage の適用**: ファイルシステム操作エラーにパス情報が含まれるため、サニタイズを必須とする
