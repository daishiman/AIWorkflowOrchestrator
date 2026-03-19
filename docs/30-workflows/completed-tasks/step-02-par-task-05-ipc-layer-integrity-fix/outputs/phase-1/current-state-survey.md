# Phase 1: 現状調査レポート

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 |
| Phase    | 1 — 要件定義（現状調査）             |
| 作成日   | 2026-03-19                           |
| 調査手法 | P50チェック（コード静的確認）        |

## 調査対象

スキル関連IPCチャンネル（SKILL_UPDATE / SKILL_GET_DETAIL）の実装状態を確認する。

## P50判定: 実装済みPASS

全項目が実装済みであり、Phase 4-5 は「検証・補完」モードで実施する。

## Critical 1: SKILL_UPDATE（解消済み）

### 調査結果

| 確認箇所              | ファイル                                               | 状態                                                    |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| チャンネル定数定義    | `apps/desktop/src/preload/channels.ts`                 | `SKILL_UPDATE: "skill:update"` — 定義済み               |
| ホワイトリスト登録    | `apps/desktop/src/preload/channels.ts`                 | `ALLOWED_INVOKE_CHANNELS` に登録済み                    |
| IPCハンドラ登録       | `apps/desktop/src/main/ipc/skillHandlers.ts` L279-339  | **実装済み** — `ipcMain.handle(SKILL_UPDATE, ...)` あり |
| ハンドラ登録解除      | `apps/desktop/src/main/ipc/skillHandlers.ts` L848      | **実装済み** — `removeHandler(SKILL_UPDATE)` あり       |
| Preload API メソッド  | `apps/desktop/src/preload/skill-api.ts` L522-551       | **実装済み** — `update()` メソッドあり                  |
| SkillService メソッド | `apps/desktop/src/main/services/skill/SkillService.ts` | **実装済み** — `updateSkill()` 実装済み                 |
| packages/shared 定数  | `packages/shared/src/ipc/channels.ts` L74              | **実装済み** — `SKILL_UPDATE: "skill:update"` あり      |

### 実装詳細

- P45準拠: 引数名 `skillName`（セマンティクスに一致）
- P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）適用済み
- Preload側も `{ skillName, updates }` の object payload で一致（P44準拠）

## Critical 2: SKILL_GET_DETAIL Preload API（解消済み）

### 調査結果

| 確認箇所             | ファイル                                              | 状態                                                        |
| -------------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| チャンネル定数定義   | `apps/desktop/src/preload/channels.ts`                | `SKILL_GET_DETAIL: "skill:get-detail"` — 定義済み           |
| ホワイトリスト登録   | `apps/desktop/src/preload/channels.ts`                | `ALLOWED_INVOKE_CHANNELS` に登録済み                        |
| IPCハンドラ登録      | `apps/desktop/src/main/ipc/skillHandlers.ts` L241-277 | **実装済み** — `ipcMain.handle(SKILL_GET_DETAIL, ...)` あり |
| Preload API メソッド | `apps/desktop/src/preload/skill-api.ts` L507-519      | **実装済み** — `getDetail()` メソッドあり                   |
| packages/shared 定数 | `packages/shared/src/ipc/channels.ts` L69             | **実装済み** — `SKILL_GET_DETAIL: "skill:get-detail"` あり  |

### 実装詳細

- Preload側は `safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_DETAIL, { skillId })` を呼び出す
- P42準拠: 3段バリデーション（Preload層での早期拒否）適用済み
- Main Process ハンドラと Preload API の引数形式が一致（P44準拠）

## 既存実装の確認（正常動作ハンドラ）

### 既存 skill:get-detail ハンドラ（参照パターン）

`apps/desktop/src/main/ipc/skillHandlers.ts` L241-273 に以下のパターンが存在し、新規ハンドラの参照実装として使用する:

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_GET_DETAIL,
  async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_GET_DETAIL, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillId must be a non-empty string",
      };
    }
    try {
      const skill = await skillService.getSkillById(args.skillId);
      if (skill) return { success: true, data: skill };
      return { success: false, error: "スキルが見つかりません" };
    } catch (error) {
      log.error("[skillHandlers] skill:get-detail failed:", error);
      return { success: false, error: sanitizeErrorMessage(error) };
    }
  },
);
```

### 既存 Preload API パターン（参照）

`apps/desktop/src/preload/skill-api.ts` の既存メソッドパターン:

```typescript
remove: (skillName: SkillName): Promise<RemoveResult> =>
  safeInvoke(IPC_CHANNELS.SKILL_REMOVE, skillName),
```

## 共有チャンネル定数の差分

| チャンネル       | `apps/desktop/src/preload/channels.ts` | `packages/shared/src/ipc/channels.ts` |
| ---------------- | -------------------------------------- | ------------------------------------- |
| SKILL_GET_DETAIL | 定義済み（L179）                       | **未定義**                            |
| SKILL_UPDATE     | 定義済み（L189）                       | **未定義**                            |

P32準拠: 両ファイルへの同時更新が必要。ただし `apps/desktop/src/preload/types.ts` の `SkillAPI` は `import("./skill-api").SkillAPI` で自動反映されるため更新不要。

## 調査結論

実装が必要な箇所は4点:

1. `skillHandlers.ts`: `skill:update` ハンドラの新規追加 + unregister追加
2. `skill-api.ts`: `getDetail()` / `update()` メソッドの新規追加
3. `packages/shared/src/ipc/channels.ts`: `SKILL_GET_DETAIL` / `SKILL_UPDATE` 定数追加
4. （スコープ外）`SkillService.updateSkill()` の完全実装
