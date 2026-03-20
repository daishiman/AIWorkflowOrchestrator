# IPC層整合性修正 実装ガイド

## Part 1: 中学生レベルの説明

### なぜ必要だったか

この修正は、「窓口はあるのに受け付ける人がいない」「受付の奥には人がいるのに窓口メニューに載っていない」という 2 つのズレを直すためのものです。

- `skill:update`
  - たとえると、電話番号は配られているのに受話器を取る人がいない状態でした。誰かが電話をかけても、ずっと呼び出し音が鳴るだけで誰も出ません。これを「デッドチャンネル」と言います。
- `skill:get-detail`
  - たとえると、役所の中では手続きできるのに、受付の案内板にその手続き名が書かれていない状態でした。窓口担当者はいるのに、外から問い合わせる手段がなかったのです。

### 何を直したか

| 問題                            | 直した内容                                                   |
| ------------------------------- | ------------------------------------------------------------ |
| `skill:update` デッドチャンネル | Main Process に handler を追加し、終了時の解除も追加した     |
| `skill:get-detail` の窓口不足   | Preload API に `getDetail()` を追加した                      |
| shared / desktop の定数ズレ     | `packages/shared/src/ipc/channels.ts` に定数を追加して揃えた |

### 入力チェックの考え方

入力チェックは、郵便物の宛名を見るのに近いです。

1. 文字かどうかを見る
2. 空欄ではないかを見る
3. スペースだけではないかを見る

この 3段階を通らない値は、早い段階で止めます。

---

## Part 2: 技術者向け詳細

### 変更ファイル

| ファイル                                               | 役割                                                   |
| ------------------------------------------------------ | ------------------------------------------------------ |
| `apps/desktop/src/main/ipc/skillHandlers.ts`           | `skill:update` handler / unregister 追加               |
| `apps/desktop/src/main/services/skill/SkillService.ts` | `updateSkill()` スタブ追加                             |
| `apps/desktop/src/preload/skill-api.ts`                | `getDetail()` / `update()` を公開                      |
| `packages/shared/src/ipc/channels.ts`                  | `SKILL_GET_DETAIL` / `SKILL_UPDATE` を shared 側へ追加 |

### API シグネチャ

```ts
getDetail(skillId: string): Promise<Skill>
update(skillName: string, updates: Record<string, unknown>): Promise<void>
```

### SKILL_UPDATE ハンドラ詳細（skillHandlers.ts）

P42 / P45 / P5 対策を全て適用した実装:

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_UPDATE,
  async (
    event: IpcMainInvokeEvent,
    args: { skillName: string; updates: Record<string, unknown> },
  ) => {
    // Step 1: IPC送信元検証 (P5対策 — sender validation)
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_UPDATE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // Step 2a: args バリデーション（null / 配列を除外）
    if (args === null || typeof args !== "object" || Array.isArray(args)) {
      throw {
        code: "VALIDATION_ERROR",
        message: "payload must be a non-null object",
      };
    }

    const { skillName, updates } = args;

    // Step 2b: skillName バリデーション（P42準拠3段）
    if (
      typeof skillName !== "string" ||
      skillName === "" ||
      skillName.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }

    // Step 2c: updates バリデーション
    if (
      updates === null ||
      typeof updates !== "object" ||
      Array.isArray(updates)
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "updates must be a non-null object",
      };
    }

    // Step 3: 処理実行
    try {
      await skillService.updateSkill(skillName, updates);
      return { success: true, data: undefined };
    } catch (error) {
      log.error("[skillHandlers] skill:update failed:", error);
      return { success: false, error: sanitizeErrorMessage(error) };
    }
  },
);

// unregisterSkillHandlers() に追加 (P5対策 — 二重登録防止)
ipcMain.removeHandler(IPC_CHANNELS.SKILL_UPDATE);
```

**準拠ポイント**:

- P42準拠: `skillName` に3段バリデーション（型チェック → 空文字列 → トリム空文字列）
- P45準拠: 引数名 `skillName`（セマンティクスに一致、`skillId` ではない）
- P44準拠: object payload `{ skillName, updates }` で Preload 側と形式一致
- P5準拠: `unregisterSkillHandlers()` に `removeHandler` を追加してリスナー二重登録を防止
- P60準拠: レスポンスは `{ success, data?, error? }` 形式

### getDetail / update Preload API 詳細（skill-api.ts）

```typescript
// getDetail
getDetail: (skillId: string): Promise<Skill> => {
  if (
    typeof skillId !== "string" ||
    skillId === "" ||
    skillId.trim() === ""
  ) {
    return Promise.reject({
      code: "VALIDATION_ERROR",
      message: "skillId must be a non-empty string",
    });
  }
  return safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_DETAIL, { skillId });
},

// update
update: (skillName: string, updates: Record<string, unknown>): Promise<void> => {
  if (
    typeof skillName !== "string" ||
    skillName === "" ||
    skillName.trim() === ""
  ) {
    return Promise.reject({
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    });
  }
  if (updates === null || typeof updates !== "object" || Array.isArray(updates)) {
    return Promise.reject({
      code: "VALIDATION_ERROR",
      message: "updates must be a non-null object",
    });
  }
  return safeInvokeUnwrap(IPC_CHANNELS.SKILL_UPDATE, { skillName, updates });
},
```

**準拠ポイント**:

- P42準拠: 各引数に P42 バリデーション
- P44準拠: object payload でハンドラ引数形式と一致
- P45準拠: `update()` の引数名 `skillName`（セマンティクスに一致）

### エラーとエッジケース

| ケース                       | 挙動                                       |
| ---------------------------- | ------------------------------------------ |
| `skillId` / `skillName` が空 | `VALIDATION_ERROR`                         |
| `updates` が `null` / 配列   | `VALIDATION_ERROR`                         |
| sender が不正                | IPC validation error                       |
| 対象スキルが見つからない     | `safeInvokeUnwrap` により reject / throw   |
| `updateSkill()` 本体未実装   | 現時点ではスタブ。follow-up 未タスクで継続 |

### 設定値・定数

| 名称                            | 値 / 方針                            |
| ------------------------------- | ------------------------------------ |
| `IPC_CHANNELS.SKILL_GET_DETAIL` | `"skill:get-detail"`                 |
| `IPC_CHANNELS.SKILL_UPDATE`     | `"skill:update"`                     |
| 更新ロジック本体                | 本タスクでは未実装。follow-up へ分離 |

---

## Part 3: IPCチャンネル仕様

### skill:update チャンネル

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| チャンネル名 | `skill:update`                     |
| 定数         | `IPC_CHANNELS.SKILL_UPDATE`        |
| 方向         | Renderer → Main（invoke / handle） |

**引数（Preload → Main）**:

```typescript
{
  skillName: string; // スキル識別名（非空文字列、trim後も非空）
  updates: Record<string, unknown>; // 更新内容オブジェクト（非null、非配列）
}
```

**バリデーション**:

| フィールド  | ルール                                                                 |
| ----------- | ---------------------------------------------------------------------- |
| `skillName` | `typeof === "string"` かつ `!== ""` かつ `.trim() !== ""` (P42準拠3段) |
| `updates`   | `!== null` かつ `typeof === "object"` かつ `!Array.isArray()`          |

**戻り値**:

```typescript
// 成功時
{
  success: true;
  data: undefined;
}

// 失敗時（バリデーションエラー）
{
  code: "VALIDATION_ERROR";
  message: string;
}

// 失敗時（処理エラー）
{
  success: false;
  error: string;
} // sanitize済みのエラーメッセージ
```

**説明**: スキルのメタ情報を更新するチャンネル。本タスクでは `SkillService.updateSkill()` がスタブ実装（ログ出力のみ）。永続化・スキーマ定義は後続タスク（`task-ut-imp-skill-update-business-logic-001.md`）で実装予定。

---

### skill:get-detail チャンネル

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| チャンネル名 | `skill:get-detail`                 |
| 定数         | `IPC_CHANNELS.SKILL_GET_DETAIL`    |
| 方向         | Renderer → Main（invoke / handle） |

**引数（Preload → Main）**:

```typescript
{
  skillId: string; // スキルID（非空文字列、trim後も非空）
}
```

**バリデーション**:

| フィールド | ルール                                                |
| ---------- | ----------------------------------------------------- |
| `skillId`  | `typeof === "string"` かつ `.trim() !== ""` (P42準拠) |

**戻り値**:

```typescript
// 成功時
{
  success: true;
  data: Skill;
}

// 失敗時（バリデーションエラー / 対象なし）
{
  success: false;
  error: string;
}
```

**説明**: 指定IDのスキル詳細情報を取得するチャンネル。Preload 側が `getDetail()` を公開することで Renderer から呼び出し可能となった。本チャンネルのハンドラは既存実装済みであり、本タスクでは Preload 側の公開（`getDetail()`追加）のみ対応。

---

### チャンネル定数一覧（本タスクで追加）

| 定数名             | チャンネル文字列     | 追加ファイル                              |
| ------------------ | -------------------- | ----------------------------------------- |
| `SKILL_GET_DETAIL` | `"skill:get-detail"` | `packages/shared/src/ipc/channels.ts` L69 |
| `SKILL_UPDATE`     | `"skill:update"`     | `packages/shared/src/ipc/channels.ts` L74 |
