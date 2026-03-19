# Phase 2: 設計書

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| タスクID   | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001                  |
| Phase      | 2 — 設計                                              |
| 作成日     | 2026-03-19                                            |
| ステータス | 完了                                                  |
| 依存       | [phase-1/requirements.md](../phase-1/requirements.md) |

## 設計方針

- P44/P45準拠: ハンドラ引数とPreload呼び出しのセマンティクスを一致させる
- P42準拠: 全文字列引数に3段バリデーション（型チェック → 空文字列 → トリム空文字列）
- P32準拠: `packages/shared` と `apps/desktop` のチャンネル定数を同時更新
- P5準拠: 新規ハンドラは必ず unregister リストにも追加

---

## 1. IPC契約設計

### 1-1. SKILL_UPDATE ハンドラ設計

**チャンネル**: `"skill:update"` (`IPC_CHANNELS.SKILL_UPDATE`)

**引数形式（Main Process 受信側）**:

```typescript
args: {
  skillName: string;  // スキル名（空文字不可、trim後も空文字不可）
  updates: {
    description?: string;
    enabled?: boolean;
  };
}
```

**P44準拠検討**: SKILL_UPDATEは `{ skillName, updates }` のobject payloadを採用する。

- `skillName` は既存の `skill:remove` パターン（P45解決済み）と命名を合わせる
- `updates` は部分更新（Partial）として扱い、必須フィールドなし

**バリデーション順序**（P42準拠3段 + P60準拠 object形式レスポンス）:

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_UPDATE,
  async (
    event: IpcMainInvokeEvent,
    args: { skillName: string; updates: Record<string, unknown> },
  ) => {
    // Step 1: IPC送信元検証
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_UPDATE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // Step 2a: args 自体のバリデーション（null/非オブジェクト/配列を排除）
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

    // Step 2c: updates バリデーション（null/非オブジェクト/配列を排除）
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
```

**登録解除（P5準拠）**:

```typescript
// unregisterSkillHandlers() に追加
ipcMain.removeHandler(IPC_CHANNELS.SKILL_UPDATE);
```

### 1-2. SKILL_GET_DETAIL Preload API 設計

**メソッドシグネチャ**:

```typescript
getDetail: (skillId: string): Promise<Skill> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_DETAIL, { skillId }),
```

**設計根拠**:

- 既存ハンドラが `args: { skillId: string }` のobject形式で受け取るため、Preload側も `{ skillId }` のobjectを渡す
- P44の教訓: ハンドラ引数形式とPreload呼び出し形式を一致させる
- `safeInvokeUnwrap` を使用（既存パターンに合わせる）

### 1-3. SKILL_UPDATE Preload API 設計

**型定義（packages/shared側 or 型推論）**:

```typescript
type SkillUpdateParams = {
  description?: string;
  enabled?: boolean;
};
```

**メソッドシグネチャ**:

```typescript
update: (skillName: string, updates: Record<string, unknown>): Promise<void> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_UPDATE, { skillName, updates }),
```

**設計根拠**:

- ハンドラが `{ skillName, updates }` のobjectを受け取るため、Preload側も同形式で渡す
- `skillName` 命名はP45解決済みパターン（`skill:remove`）と統一

---

## 2. バリデーション設計

詳細: [validation-design.md](./validation-design.md)

### バリデーション全箇所一覧

| 対象                  | フィールド                 | バリデーション種別                     |
| --------------------- | -------------------------- | -------------------------------------- |
| skill:update ハンドラ | `args.skillName`           | P42準拠3段（型 → 空文字 → trim空文字） |
| skill:update ハンドラ | `args.updates`             | object型チェック（null/undefined除外） |
| skill:update ハンドラ | `args.updates.description` | 省略可能 — 提供時は文字列型チェック    |
| skill:update ハンドラ | `args.updates.enabled`     | 省略可能 — 提供時はboolean型チェック   |

---

## 3. 型定義設計

### 変更対象ファイル（P32準拠）

| ファイル                               | 変更内容                                                | 優先度 |
| -------------------------------------- | ------------------------------------------------------- | ------ |
| `packages/shared/src/ipc/channels.ts`  | `SKILL_GET_DETAIL` / `SKILL_UPDATE` 定数追加            | 必須   |
| `apps/desktop/src/preload/channels.ts` | 変更なし（既に定義済み）                                | —      |
| `apps/desktop/src/preload/types.ts`    | 変更なし（`import("./skill-api").SkillAPI` で自動反映） | —      |

### packages/shared への追加定数

```typescript
// packages/shared/src/ipc/channels.ts に追加
SKILL_GET_DETAIL: "skill:get-detail",
SKILL_UPDATE: "skill:update",
```

---

## 4. ファイル変更計画（Lane分割）

### Lane 1: Main Process（skillHandlers.ts）

| 変更箇所                    | 内容                                                                    |
| --------------------------- | ----------------------------------------------------------------------- |
| `registerSkillHandlers()`   | `skill:update` ハンドラを追加（SKILL_GET_DETAIL既存ハンドラの後に配置） |
| `unregisterSkillHandlers()` | `ipcMain.removeHandler(IPC_CHANNELS.SKILL_UPDATE)` 追加                 |

### Lane 2: Preload（skill-api.ts）

| 変更箇所              | 内容                     |
| --------------------- | ------------------------ |
| SkillAPI オブジェクト | `getDetail` メソッド追加 |
| SkillAPI オブジェクト | `update` メソッド追加    |

### Lane 3: 共有定数（packages/shared）

| 変更箇所                              | 内容                                         |
| ------------------------------------- | -------------------------------------------- |
| `packages/shared/src/ipc/channels.ts` | `SKILL_GET_DETAIL` / `SKILL_UPDATE` 定数追加 |

---

## 5. テスト設計方針

### 新規テストが必要な箇所

| テスト対象               | テストファイル          | テストケース数（想定） |
| ------------------------ | ----------------------- | ---------------------- |
| `skill:update` ハンドラ  | `skillHandlers.test.ts` | 7〜10件                |
| `skill-api.ts getDetail` | `skill-api.test.ts`     | 3〜5件                 |
| `skill-api.ts update`    | `skill-api.test.ts`     | 3〜5件                 |

### テストケース設計方針

**skill:update ハンドラ**:

- 正常系: 有効な `skillName` + `updates` でハンドラが呼ばれる
- 異常系（P42バリデーション）:
  - `skillName` が undefined/null
  - `skillName` が空文字列 `""`
  - `skillName` がスペースのみ `"   "`
  - `updates` が undefined/null
  - `updates` がオブジェクト以外
- セキュリティ: 不正なIPC送信元からのリクエスト拒否
- IPC送信元検証エラー時のthrow

**レスポンス形式（P60準拠）**:

```typescript
// 成功時
{ success: true, data: updatedSkill }

// 失敗時
{ success: false, error: sanitizedErrorMessage }

// バリデーションエラー時（throw）
{ code: "VALIDATION_ERROR", message: "..." }
```

---

## 6. IPC契約チェックリスト Phase 1-3

| チェック項目                                         | 状態                                                                        |
| ---------------------------------------------------- | --------------------------------------------------------------------------- |
| Phase 1: チャンネル名がホワイトリスト登録済み        | 確認済み（SKILL_UPDATE L494, SKILL_GET_DETAIL L486）                        |
| Phase 2: ハンドラ引数形式がPreload呼び出し形式と一致 | 設計書で定義（SKILL_UPDATE: object payload、SKILL_GET_DETAIL: `{skillId}`） |
| Phase 3: 引数名のセマンティクスが実際の値と一致      | `skillName` = スキル名（P45準拠）、`skillId` = スキルID                     |
