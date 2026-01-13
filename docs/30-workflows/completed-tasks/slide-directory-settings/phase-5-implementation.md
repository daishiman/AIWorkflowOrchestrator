# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 5                        |
| Phase名    | 実装                     |
| 前提Phase  | Phase 4                  |
| 後続Phase  | Phase 6                  |
| ステータス | 未実施                   |
| 作成日     | 2026-01-13               |
| 機能名     | slide-directory-settings |

---

## 目的

TDDのGreen段階として、Phase 4で作成したテストを通す最小限の実装を行う。型定義、設定管理サービス、IPC通信、UIコンポーネントを実装する。

## 背景

Phase 4で作成した失敗するテストをすべて通すことを目標に、設計（Phase 2）に基づいた実装を行う。セキュリティ要件（ホワイトリスト、sender検証、パストラバーサル防止）を満たすことが重要。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 型定義の実装

**目的**: 共有型定義とIPCチャンネル定義を実装する

**実行手順**:

1. 設定型を定義: `packages/shared/src/types/slideSettings.ts`

```typescript
export interface SlideSettings {
  outputDirectory: string;
  autoCreateDirectory: boolean;
  defaultTheme: "kanagawa";
  schemaVersion: number;
}

export const DEFAULT_SLIDE_SETTINGS: SlideSettings = {
  outputDirectory: "~/Documents/Slides",
  autoCreateDirectory: true,
  defaultTheme: "kanagawa",
  schemaVersion: 1,
};

export interface DirectoryValidationResult {
  valid: boolean;
  exists: boolean;
  writable: boolean;
  error?: string;
  warning?: string;
}
```

2. IPCチャンネル定義: `apps/desktop/src/main/infrastructure/ipc/slideSettingsChannels.ts`

```typescript
export const SLIDE_SETTINGS_CHANNELS = {
  GET_DIRECTORY: "slideSettings:getDirectory",
  SET_DIRECTORY: "slideSettings:setDirectory",
  SELECT_DIRECTORY: "slideSettings:selectDirectory",
  VALIDATE_DIRECTORY: "slideSettings:validateDirectory",
  GET_ALL_SETTINGS: "slideSettings:getAllSettings",
} as const;

export type SlideSettingsChannel =
  (typeof SLIDE_SETTINGS_CHANNELS)[keyof typeof SLIDE_SETTINGS_CHANNELS];
```

3. 型のエクスポート設定を更新

**期待される成果物**:

- `packages/shared/src/types/slideSettings.ts`
- `apps/desktop/src/main/infrastructure/ipc/slideSettingsChannels.ts`

---

### タスク2: 設定管理サービスの実装

**目的**: electron-storeを使用した設定永続化サービスを実装する

**実行手順**:

1. 設定ストアを実装: `apps/desktop/src/main/settings/slideSettingsStore.ts`

```typescript
import Store from "electron-store";
import * as path from "path";
import * as fs from "fs";
import {
  SlideSettings,
  DEFAULT_SLIDE_SETTINGS,
  DirectoryValidationResult,
} from "@repo/shared";

export class SlideSettingsStore {
  private store: Store<{ slideSettings: SlideSettings }>;

  constructor() {
    this.store = new Store({
      name: "slide-settings",
      defaults: { slideSettings: DEFAULT_SLIDE_SETTINGS },
      schema: {
        /* schema定義 */
      },
    });
    this.migrate();
  }

  getSettings(): SlideSettings {
    /* 実装 */
  }
  getDirectory(): string {
    /* 実装 */
  }
  setDirectory(dirPath: string): void {
    /* 実装 */
  }
  validateDirectory(dirPath: string): DirectoryValidationResult {
    /* 実装 */
  }

  private migrate(): void {
    /* マイグレーション処理 */
  }
  private validatePath(targetPath: string): void {
    /* パストラバーサル防止 */
  }
  private expandPath(inputPath: string): string {
    /* ~展開 */
  }
}
```

2. セキュリティ対策を実装:
   - パストラバーサル防止（`../` 検出、path.resolve後のベースパス検証）
   - シンボリックリンク検証（fs.realpath）
   - 入力値サニタイゼーション

3. テストが通ることを確認

**期待される成果物**:

- `apps/desktop/src/main/settings/slideSettingsStore.ts`

---

### タスク3: IPC通信の実装

**目的**: Main側のIPCハンドラーとpreload APIを実装する

**実行手順**:

1. IPCハンドラー実装: `apps/desktop/src/main/infrastructure/ipc/slideSettingsHandlers.ts`

```typescript
import { ipcMain, dialog, BrowserWindow } from "electron";
import { SLIDE_SETTINGS_CHANNELS } from "./slideSettingsChannels";
import { SlideSettingsStore } from "../../settings/slideSettingsStore";
import { validateIpcSender } from "../security/ipc-validator";
import { Result } from "@repo/shared";

export function registerSlideSettingsHandlers(store: SlideSettingsStore): void {
  ipcMain.handle(SLIDE_SETTINGS_CHANNELS.GET_DIRECTORY, async (event) => {
    if (!validateIpcSender(event.sender)) {
      return { success: false, error: "Invalid sender" };
    }
    return { success: true, data: store.getDirectory() };
  });

  ipcMain.handle(
    SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY,
    async (event, dirPath: string) => {
      // sender検証 + バリデーション + 保存
    },
  );

  ipcMain.handle(SLIDE_SETTINGS_CHANNELS.SELECT_DIRECTORY, async (event) => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      title: "スライド出力先を選択",
    });
    return { success: true, data: result.filePaths[0] ?? null };
  });

  // 他のハンドラー...
}
```

2. preload API実装: `apps/desktop/src/preload/slideSettingsApi.ts`

```typescript
import { contextBridge, ipcRenderer } from "electron";
import { SLIDE_SETTINGS_CHANNELS } from "../main/infrastructure/ipc/slideSettingsChannels";

const createSafeInvoke = <T>(channel: string) => {
  return (...args: unknown[]): Promise<Result<T>> => {
    return ipcRenderer.invoke(channel, ...args);
  };
};

export const slideSettingsAPI = {
  getDirectory: createSafeInvoke<string>(SLIDE_SETTINGS_CHANNELS.GET_DIRECTORY),
  setDirectory: createSafeInvoke<void>(SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY),
  selectDirectory: createSafeInvoke<string | null>(
    SLIDE_SETTINGS_CHANNELS.SELECT_DIRECTORY,
  ),
  validateDirectory: createSafeInvoke<DirectoryValidationResult>(
    SLIDE_SETTINGS_CHANNELS.VALIDATE_DIRECTORY,
  ),
  getAllSettings: createSafeInvoke<SlideSettings>(
    SLIDE_SETTINGS_CHANNELS.GET_ALL_SETTINGS,
  ),
};

contextBridge.exposeInMainWorld("slideSettingsAPI", slideSettingsAPI);
```

3. グローバル型定義を更新: `apps/desktop/src/preload/index.d.ts`

**期待される成果物**:

- `apps/desktop/src/main/infrastructure/ipc/slideSettingsHandlers.ts`
- `apps/desktop/src/preload/slideSettingsApi.ts`

---

### タスク4: 設定画面UIの実装

**目的**: React UIコンポーネントを実装する

**実行手順**:

1. カスタムフック実装: `apps/desktop/src/renderer/hooks/useSlideSettings.ts`

```typescript
import { useState, useEffect, useCallback } from "react";
import { SlideSettings, DirectoryValidationResult } from "@repo/shared";

export function useSlideSettings() {
  const [settings, setSettings] = useState<SlideSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [validation, setValidation] =
    useState<DirectoryValidationResult | null>(null);

  const initialize = useCallback(async () => {
    /* 実装 */
  }, []);
  const selectDirectory = useCallback(async () => {
    /* 実装 */
  }, []);
  const setDirectory = useCallback(async (path: string) => {
    /* 実装 */
  }, []);
  const save = useCallback(async () => {
    /* 実装 */
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    settings,
    isLoading,
    error,
    isModified,
    validation,
    selectDirectory,
    setDirectory,
    save,
  };
}
```

2. UIコンポーネント実装:
   - `SlideDirectorySettings.tsx`: メインコンポーネント
   - `DirectorySelector.tsx`: ディレクトリ選択ボタン
   - `PathDisplay.tsx`: パス表示・バリデーション表示

3. 既存の設定画面に統合

**期待される成果物**:

- `apps/desktop/src/renderer/hooks/useSlideSettings.ts`
- `apps/desktop/src/renderer/components/settings/SlideDirectorySettings/`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容                              |
| -------------------- | -------------------------------------------------------------------------------- | --------------------------------- |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`     | IPC通信のセキュリティ実装パターン |
| フォーム・設定UI     | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`               | フォームUI実装パターン            |
| 入力バリデーション   | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | 入力値検証実装                    |

### 関連ドキュメント

| 参照資料      | パス                             | 内容           |
| ------------- | -------------------------------- | -------------- |
| Phase 2設計   | `outputs/phase-2/`               | 設計書         |
| Phase 4テスト | `apps/desktop/src/**/__tests__/` | 作成済みテスト |

---

## 成果物

| 成果物           | パス                                                                    | 内容              |
| ---------------- | ----------------------------------------------------------------------- | ----------------- |
| 型定義           | `packages/shared/src/types/slideSettings.ts`                            | 共有型定義        |
| チャンネル定義   | `apps/desktop/src/main/infrastructure/ipc/slideSettingsChannels.ts`     | IPCチャンネル定義 |
| 設定ストア       | `apps/desktop/src/main/settings/slideSettingsStore.ts`                  | 設定管理サービス  |
| IPCハンドラー    | `apps/desktop/src/main/infrastructure/ipc/slideSettingsHandlers.ts`     | Main側ハンドラー  |
| preload API      | `apps/desktop/src/preload/slideSettingsApi.ts`                          | preload API       |
| カスタムフック   | `apps/desktop/src/renderer/hooks/useSlideSettings.ts`                   | 設定フック        |
| UIコンポーネント | `apps/desktop/src/renderer/components/settings/SlideDirectorySettings/` | UI                |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 5での統合テスト連携アクション**:

- IPC通信の実装とテスト支援コード整備
- Main-Renderer間のデータフローを実装
- 設定永続化の実装と検証

---

## 完了条件

- [ ] 型定義が実装されている
- [ ] 設定管理サービスが実装されている
- [ ] IPCハンドラーが実装されている
- [ ] preload APIが実装されている
- [ ] UIコンポーネントが実装されている
- [ ] カスタムフックが実装されている
- [ ] **全てのテストが成功状態（Green）**
- [ ] セキュリティ要件（ホワイトリスト、sender検証、パストラバーサル防止）が実装されている
- [ ] 統合テスト連携アクションが完了している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/slide-directory-settings/phase-6-test-expansion.md`
