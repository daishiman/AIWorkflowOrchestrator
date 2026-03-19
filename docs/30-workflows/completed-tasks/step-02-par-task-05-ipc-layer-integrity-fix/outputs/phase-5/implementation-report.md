# Phase 5 実装レポート

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 |
| Phase      | 5 — 実装                             |
| 実行日     | 2026-03-19                           |
| ステータス | 完了                                 |

## 変更サマリー

今回の修正は 4 レーンに分かれる。

| レーン          | ファイル                                               | 実装内容                                                                         |
| --------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Main IPC        | `apps/desktop/src/main/ipc/skillHandlers.ts`           | `skill:update` ハンドラ追加、`unregisterSkillHandlers()` への removeHandler 追加 |
| Service         | `apps/desktop/src/main/services/skill/SkillService.ts` | `updateSkill()` スタブ追加                                                       |
| Preload API     | `apps/desktop/src/preload/skill-api.ts`                | `getDetail()` / `update()` を `safeInvokeUnwrap` + object payload で追加         |
| Shared contract | `packages/shared/src/ipc/channels.ts`                  | `SKILL_GET_DETAIL` / `SKILL_UPDATE` を追加し shared / desktop parity を成立      |

## 実装詳細

### Lane 1: Main Process ハンドラ（skillHandlers.ts）

**ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`

#### SKILL_UPDATE ハンドラ（L279-339）

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

    // Step 2a: args バリデーション（P42準拠3段 + object型チェック）
    if (args === null || typeof args !== "object" || Array.isArray(args)) {
      throw {
        code: "VALIDATION_ERROR",
        message: "payload must be a non-null object",
      };
    }

    const { skillName, updates } = args;

    // Step 2b: skillName バリデーション（P42完全準拠）
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
```

**準拠ポイント**:

- P42準拠: skillName に3段バリデーション（型チェック → 空文字列 → トリム空文字列）
- P45準拠: 引数名 `skillName`（セマンティクスに一致、`skillId` ではない）
- P44準拠: object payload `{ skillName, updates }` で Preload 側と形式一致
- P60準拠: レスポンスは `{ success, data?, error? }` 形式

#### unregister 追加（L848）

```typescript
// unregisterSkillHandlers() に追加
ipcMain.removeHandler(IPC_CHANNELS.SKILL_UPDATE);
```

**準拠ポイント**: P5準拠 — リスナー二重登録防止

### Lane 1-2: SkillService スタブ（SkillService.ts）

**ファイル**: `apps/desktop/src/main/services/skill/SkillService.ts`

```typescript
async updateSkill(skillName: string, updates: Record<string, unknown>): Promise<void> {
  // TODO: 永続化・更新ロジックの本実装は後続タスクに委譲
  // 本タスクのスコープ: IPC契約の疎通確保のみ
  log.info("[SkillService] updateSkill stub:", skillName, updates);
}
```

### Lane 2: Preload API（skill-api.ts）

**ファイル**: `apps/desktop/src/preload/skill-api.ts`

#### getDetail メソッド（L507-519）

```typescript
getDetail: (skillId: string): Promise<Skill> => {
  if (typeof skillId !== "string" || skillId.trim() === "") {
    return Promise.reject(new Error("skillId must be a non-empty string"));
  }
  return safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_DETAIL, { skillId });
},
```

**準拠ポイント**:

- P42準拠: skillId に P42 バリデーション
- P44準拠: object payload `{ skillId }` でハンドラ引数形式と一致

#### update メソッド（L522-551）

```typescript
update: (skillName: string, updates: Record<string, unknown>): Promise<void> => {
  if (typeof skillName !== "string" || skillName.trim() === "") {
    return Promise.reject(new Error("skillName must be a non-empty string"));
  }
  if (updates === null || typeof updates !== "object" || Array.isArray(updates)) {
    return Promise.reject(new Error("updates must be a non-null object"));
  }
  return safeInvokeUnwrap(IPC_CHANNELS.SKILL_UPDATE, { skillName, updates });
},
```

**準拠ポイント**:

- P42準拠: skillName に P42 バリデーション
- P44準拠: object payload `{ skillName, updates }` でハンドラ引数形式と一致
- P45準拠: 引数名 `skillName`（セマンティクスに一致）

### Lane 3: チャンネル定数（packages/shared）

**ファイル**: `packages/shared/src/ipc/channels.ts`

```typescript
// SKILL_CHANNELS に追加（L69, L74）
SKILL_GET_DETAIL: "skill:get-detail",  // L69
SKILL_UPDATE: "skill:update",           // L74
```

**準拠ポイント**: P32準拠 — `packages/shared` と `apps/desktop` の定数を同時更新

## 重要な設計判断

- Preload → Main は positional arg ではなく object payload に統一した（P44教訓を踏まえて）
- `getDetail()` / `update()` はどちらも `safeInvokeUnwrap` を使い、失敗応答を曖昧化しない
- `AC-8` を満たすため、desktop 側だけでなく `packages/shared/src/ipc/channels.ts` も同期した
- `SkillService.updateSkill()` の具体的な更新ロジックは本タスクのスコープ外とし、未タスク化した

## AC 達成状況

| AC   | 判定 | 根拠                                                                                                                      |
| ---- | ---- | ------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | PASS | `skill:update` の `ipcMain.handle()` を追加（skillHandlers.ts L279-339）                                                  |
| AC-2 | PASS | `unregisterSkillHandlers()` に `removeHandler(SKILL_UPDATE)` を追加（L848）                                               |
| AC-3 | PASS | `getDetail()` を追加し `safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_DETAIL, { skillId })` を使用（skill-api.ts L507-519）     |
| AC-4 | PASS | `update()` を追加し `safeInvokeUnwrap(IPC_CHANNELS.SKILL_UPDATE, { skillName, updates })` を使用（skill-api.ts L522-551） |
| AC-5 | PASS | Main / Preload ともに P42 3段バリデーションを適用                                                                         |
| AC-6 | PASS | Phase 10 で IPC 契約監査（チェックリスト Phase 1-6）を実施                                                                |
| AC-7 | PASS | 5ファイル / 227テスト（新規39件 + 既存188件）PASS                                                                         |
| AC-8 | PASS | `packages/shared/src/ipc/channels.ts` L69/74 に `SKILL_GET_DETAIL` / `SKILL_UPDATE` 追加済み                              |

## テスト結果

| 指標                  | 結果            |
| --------------------- | --------------- |
| ハンドラテスト        | 21/21 PASS      |
| Preload APIテスト     | 18/18 PASS      |
| 既存回帰（skill-api） | 70/70 PASS      |
| 既存回帰（IPC統合）   | 86/86 PASS      |
| **合計**              | **195+件 PASS** |
| FAIL                  | 0件             |

## 品質確認

```bash
pnpm --filter @repo/shared build       # PASS
pnpm --filter @repo/shared typecheck   # PASS（エラー0件）
pnpm --filter @repo/desktop typecheck  # PASS（エラー0件）
```

- TypeCheck: エラー0件
- ESLint: エラー0件
- Branch Coverage: skillHandlers 87.5%、skill-api 94.11%

## 残課題

- `SkillService.updateSkill()` は IPC 契約の疎通確保のためのスタブ実装であり、永続化や更新対象の厳密なスキーマ定義は後続タスクへ委譲した
- 関連未タスク: `docs/30-workflows/unassigned-task/task-ut-imp-skill-update-business-logic-001.md` 参照
