# Phase 1 - タスク3: IPC呼び出しフロー調査レポート

## 調査日時

2026-01-22

## 調査対象

- IPCハンドラー: `apps/desktop/src/main/ipc/skillHandlers.ts`
- Preload API: `apps/desktop/src/renderer/preload/index.ts`
- UI: `apps/desktop/src/renderer/views/AgentView/index.tsx`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`

---

## 調査結果

### 1. IPCチャンネル定義

```typescript
// channels.ts
export const IPC_CHANNELS = {
  SKILL_LIST_AVAILABLE: "skill:list-available",
  SKILL_LIST_IMPORTED: "skill:list-imported",
  SKILL_IMPORT: "skill:import",
  SKILL_REMOVE: "skill:remove",
  SKILL_GET_DETAIL: "skill:get-detail",
  SKILL_EXECUTE: "skill:execute",
} as const;
```

| チャンネル           | ALLOWED_INVOKE_CHANNELS | 状態 |
| -------------------- | ----------------------- | ---- |
| skill:list-available | ✅ 含まれている         | 正常 |
| skill:list-imported  | ✅ 含まれている         | 正常 |
| skill:import         | ✅ 含まれている         | 正常 |
| skill:remove         | ✅ 含まれている         | 正常 |
| skill:get-detail     | ✅ 含まれている         | 正常 |
| skill:execute        | ✅ 含まれている         | 正常 |

### 2. Preload API実装

```typescript
// renderer/preload/index.ts
export const skillAPI = {
  listAvailable: async (basePath?: string, forceRefresh?: boolean) => { ... },
  listImported: async () => { ... },
  import: async (skillIds: string[]) => {
    if (hasElectronAPI(window)) {
      return window.electronAPI.invoke<OperationResult<void>>("skill:import", {
        skillIds,
      });
    }
    return { success: false, error: "API not available" };
  },
  remove: async (skillId: string) => { ... },
  getDetail: async (skillId: string) => { ... },
  execute: async (skillId: string, params?: Record<string, unknown>) => { ... },
};
```

### 3. Main側ハンドラー実装

```typescript
// skillHandlers.ts
ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPORT,
  async (event: IpcMainInvokeEvent, args: { skillIds: string[] }) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_IMPORT, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    if (!Array.isArray(args?.skillIds)) {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillIds must be an array",
      };
    }
    return skillService.importSkills(args.skillIds);
  },
);
```

### 4. UI側の呼び出しフロー

```typescript
// AgentView/index.tsx
const handleImport = useCallback(
  async (skillIds: string[]) => {
    try {
      const result = await skillAPI.import(skillIds);
      if (result.success) {
        showToast(
          "success",
          `${skillIds.length}件のスキルをインポートしました`,
        );
        closeImportDialog();
        fetchSkills();
      } else {
        throw new Error(result.error || "インポートに失敗しました");
      }
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "...");
    }
  },
  [closeImportDialog, fetchSkills, showToast],
);
```

---

## データフロー図

```
┌─────────────────────────────────────────────────────────────────┐
│ Renderer Process                                                  │
│                                                                   │
│  ┌─────────────────┐     ┌──────────────────┐                   │
│  │   AgentView     │────>│  SkillImportDialog│                   │
│  │  handleImport() │     │  onImport()       │                   │
│  └────────┬────────┘     └──────────────────┘                   │
│           │                                                       │
│           ▼                                                       │
│  ┌─────────────────┐                                             │
│  │   skillAPI      │                                             │
│  │   .import()     │                                             │
│  └────────┬────────┘                                             │
│           │                                                       │
│           ▼                                                       │
│  ┌─────────────────┐                                             │
│  │ window.electron │                                             │
│  │ API.invoke()    │                                             │
│  └────────┬────────┘                                             │
│           │                                                       │
└───────────┼───────────────────────────────────────────────────────┘
            │ IPC: "skill:import"
            ▼
┌───────────────────────────────────────────────────────────────────┐
│ Main Process                                                       │
│                                                                    │
│  ┌─────────────────┐                                              │
│  │ skillHandlers   │                                              │
│  │ SKILL_IMPORT    │                                              │
│  └────────┬────────┘                                              │
│           │                                                        │
│           ▼                                                        │
│  ┌─────────────────┐                                              │
│  │  SkillService   │                                              │
│  │ .importSkills() │                                              │
│  └────────┬────────┘                                              │
│           │                                                        │
│           ▼                                                        │
│  ┌─────────────────────┐     ┌──────────────────┐                │
│  │ SkillImportManager  │────>│  electron-store  │                │
│  │ .importSkills()     │     │  skills.json     │                │
│  │ .persist()          │     │                  │                │
│  └─────────────────────┘     └──────────────────┘                │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 発見事項

### 正常動作している点

1. **チャンネル定義**: すべてのスキル管理チャンネルが正しく定義されている
2. **セキュリティ**: `ALLOWED_INVOKE_CHANNELS`にすべてのチャンネルが含まれている
3. **バリデーション**: IPCハンドラーでsender検証とパラメータ検証が行われている
4. **UIフロー**: AgentViewにインポートボタンとダイアログが実装されている

### 問題点・懸念点

1. **デバッグログの不足**:
   - ハンドラー内での詳細ログがない
   - 特に`skill:import`呼び出し時のログがない

2. **テストカバレッジ**:
   - E2E的な統合テストがない
   - Renderer→Main→Store の一連のフローをテストしていない

3. **UIからの呼び出し確認**:
   - インポートダイアログが実際に使われているか不明
   - ユーザーがインポートを実行した形跡がない（store が空）

---

## 統合テスト観点

### 必要なテストケース

1. **IPC接続テスト**:
   - `skill:import` チャンネルが正常に動作すること
   - パラメータが正しく渡されること

2. **データフローテスト**:
   - Renderer→Main→electron-store→Main→Renderer の往復フロー
   - 永続化されたデータが再読み込み時に正しく復元されること

3. **UIテスト**:
   - インポートダイアログの表示
   - スキル選択とインポート実行
   - 成功トーストの表示

---

## 結論

IPC呼び出しフローのコードに問題は見つからない。問題は以下のいずれかと考えられる：

1. **インポートが一度も実行されていない**:
   - ユーザーがインポートダイアログを使用していない可能性

2. **統合テストの不足**:
   - モックを使ったテストでは検出できない問題がある可能性
   - 実際のelectron-storeとの連携テストが必要

3. **UIからの呼び出し問題**:
   - 利用可能なスキルがない場合、インポートできない
   - `~/.claude/skills` にスキルが存在するか確認が必要
