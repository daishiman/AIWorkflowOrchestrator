# [#849] "[UT-FIX-SKILL-REMOVE-INTERFACE-001] 未タスク仕様書: skill:remove IPCハンドラ・Preloadインターフェース不整合修正"

## メタ情報

```yaml
task_id: UT-FIX-SKILL-REMOVE-INTERFACE-001
task_name: 未タスク仕様書: skill:remove IPCハンドラ・Preloadインターフェース不整合修正
category: -
target_feature: -
priority: 高
scale: -
status: 未実施
source_phase: -
created_date: 2026-02-20
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-fix-skill-remove-interface-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 目的

skill:remove IPCチャンネルのインターフェース不整合を修正し、UIからのスキル削除操作を正常に動作させる。同時にP42準拠の3段バリデーションを適用する。

## 現状の不整合

### 不整合箇所1: P44パターン（インターフェース不整合）

#### Main Process側（skillHandlers.ts:145-160）

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_REMOVE,
  async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
    // ...
    if (typeof args?.skillId !== "string") {
      throw { code: "VALIDATION_ERROR", message: "skillId must be a string" };
    }
    return skillService.removeSkill(args.skillId);
  },
);
```

- 期待する引数: `{ skillId: string }`（オブジェクト形式）

#### Preload側（skill-api.ts:264-265）

```typescript
remove: (skillName: string): Promise<void> =>
  safeInvoke(IPC_CHANNELS.SKILL_REMOVE, skillName),
```

- 実際に送信される引数: `string`（単一文字列）
- `args` に文字列が入ると `args?.skillId` は `undefined` → バリデーションエラー

### 不整合箇所2: P42パターン（.trim()バリデーション漏れ）

```typescript
// 現状: .trim() チェックなし
if (typeof args?.skillId !== "string") {
  throw { code: "VALIDATION_ERROR", message: "skillId must be a string" };
}
```

スペースのみの文字列（`"   "`）がバリデーションを通過してサービス層に到達する。

## 修正方針

UT-FIX-SKILL-IMPORT-INTERFACE-001 と同じアプローチA（ハンドラ側をPreload側に合わせる）を採用する。

### 修正後のコード（想定）

```typescript
// skill:remove - スキルを削除
ipcMain.handle(
  IPC_CHANNELS.SKILL_REMOVE,
  async (event: IpcMainInvokeEvent, skillName: string) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_REMOVE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    // P42準拠 3段バリデーション
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
    return skillService.removeSkill(skillName);
  },
);
```

## 修正対象ファイル

| ファイル                                                    | 修正内容                                                |
| ----------------------------------------------------------- | ------------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                | skill:remove ハンドラの引数を `string` に変更 + P42適用 |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` | skill:remove テストを修正 + P42バリデーションテスト追加 |

### 変更不要ファイル

| ファイル                                | 理由                                                         |
| --------------------------------------- | ------------------------------------------------------------ |
| `apps/desktop/src/preload/skill-api.ts` | 元から正しい: `safeInvoke(SKILL_REMOVE, skillName)`          |
| `apps/desktop/src/preload/types.ts`     | 元から正しい: `remove: (skillName: string) => Promise<void>` |

## 完了条件

- [ ] skill:remove ハンドラの引数を `{ skillId: string }` から `string` に変更
- [ ] P42準拠の3段バリデーション（型チェック→空文字列→trim空文字列）を実装
- [ ] 内部で `skillService.removeSkill(skillName)` を呼び出す（配列化不要）
- [ ] 既存テスト SH-RM-01〜04 を修正し全PASS
- [ ] P42バリデーションテスト（空文字列、スペースのみ、null、undefined、number）を追加
- [ ] ESLint エラー 0件
- [ ] TypeScript 型エラー 0件（本変更起因）
- [ ] 全テスト PASS

## 参照

- P44: `06-known-pitfalls.md` skill:import IPCハンドラとPreloadのインターフェース不整合
- P42: `06-known-pitfalls.md` 文字列引数の .trim() バリデーション漏れ
- UT-FIX-SKILL-IMPORT-INTERFACE-001: 本タスクの修正パターンをそのまま適用可能
