# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 2                        |
| Phase名    | 設計                     |
| 前提Phase  | Phase 1                  |
| 後続Phase  | Phase 3                  |
| ステータス | 未実施                   |
| 作成日     | 2026-01-13               |
| 機能名     | slide-directory-settings |

---

## 目的

スライド出力ディレクトリ設定機能のアーキテクチャ設計を行う。コンポーネント設計、IPC通信設計、永続化スキーマ設計を詳細化し、実装の基盤を作る。

## 背景

Phase 1で定義した要件に基づき、Electron環境でのセキュアなIPC通信とelectron-storeを使用した永続化を実現する設計を行う。既存のシステム仕様（security-api-electron.md、ui-ux-forms.md）に準拠した設計が必要。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コンポーネント設計

**目的**: 設定画面UIのコンポーネント構造を設計する

**実行手順**:

1. コンポーネント階層を設計する:

```
apps/desktop/src/renderer/
├── components/
│   └── settings/
│       └── SlideDirectorySettings/
│           ├── index.tsx                    # エントリーポイント
│           ├── SlideDirectorySettings.tsx   # メインコンポーネント
│           ├── DirectorySelector.tsx        # ディレクトリ選択UI
│           ├── PathDisplay.tsx              # パス表示コンポーネント
│           └── types.ts                     # コンポーネント型定義
└── hooks/
    └── useSlideSettings.ts                  # 設定管理カスタムフック
```

2. 各コンポーネントの責務を定義:
   - `SlideDirectorySettings`: 設定セクション全体の管理
   - `DirectorySelector`: ディレクトリ選択ダイアログの起動・結果処理
   - `PathDisplay`: 現在のパス表示・バリデーションエラー表示
   - `useSlideSettings`: IPC通信を介した設定の読み書き

3. コンポーネント設計を `outputs/phase-2/component-design.md` に出力

**期待される成果物**:

- `outputs/phase-2/component-design.md`

---

### タスク2: IPC通信インターフェース設計

**目的**: Main-Renderer間のセキュアなIPC通信を設計する

**実行手順**:

1. IPCチャンネル定義（ホワイトリスト方式）:

```typescript
// apps/desktop/src/main/infrastructure/ipc/slideSettingsChannels.ts
export const SLIDE_SETTINGS_CHANNELS = {
  GET_DIRECTORY: "slideSettings:getDirectory",
  SET_DIRECTORY: "slideSettings:setDirectory",
  SELECT_DIRECTORY: "slideSettings:selectDirectory",
  VALIDATE_DIRECTORY: "slideSettings:validateDirectory",
  GET_ALL_SETTINGS: "slideSettings:getAllSettings",
} as const;
```

2. IPC通信のセキュリティ要件:
   - `contextBridge.exposeInMainWorld` で限定的なAPI公開
   - 全チャンネルでsender検証を実施
   - パストラバーサル攻撃の防止
   - 入力値のサニタイゼーション

3. preload API設計:

```typescript
// apps/desktop/src/preload/slideSettingsApi.ts
export interface SlideSettingsAPI {
  getDirectory: () => Promise<Result<string>>;
  setDirectory: (path: string) => Promise<Result<void>>;
  selectDirectory: () => Promise<Result<string | null>>;
  validateDirectory: (path: string) => Promise<Result<ValidationResult>>;
  getAllSettings: () => Promise<Result<SlideSettings>>;
}
```

4. IPC設計を `outputs/phase-2/ipc-design.md` に出力

**期待される成果物**:

- `outputs/phase-2/ipc-design.md`

---

### タスク3: electron-storeスキーマ設計

**目的**: 設定の永続化スキーマを設計する

**実行手順**:

1. 設定スキーマ定義:

```typescript
// packages/shared/src/types/slideSettings.ts
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
```

2. electron-store設定:

```typescript
// apps/desktop/src/main/settings/slideSettingsStore.ts
import Store from "electron-store";

interface StoreSchema {
  slideSettings: SlideSettings;
}

const schema: Store.Schema<StoreSchema> = {
  slideSettings: {
    type: "object",
    properties: {
      outputDirectory: { type: "string" },
      autoCreateDirectory: { type: "boolean" },
      defaultTheme: { type: "string", enum: ["kanagawa"] },
      schemaVersion: { type: "number" },
    },
    required: ["outputDirectory", "autoCreateDirectory", "schemaVersion"],
    default: DEFAULT_SLIDE_SETTINGS,
  },
};
```

3. マイグレーション戦略:
   - `schemaVersion` でバージョン管理
   - 古いバージョンからの自動マイグレーション
   - 破損時のデフォルト値フォールバック

4. スキーマ設計を `outputs/phase-2/store-schema-design.md` に出力

**期待される成果物**:

- `outputs/phase-2/store-schema-design.md`

---

### タスク4: データフロー設計

**目的**: 設定の読み書きフローを設計する

**実行手順**:

1. 設定読み込みフロー:

   ```
   [Renderer] useSlideSettings.initialize()
       ↓
   [Preload] slideSettingsAPI.getAllSettings()
       ↓
   [Main] ipcMain.handle("slideSettings:getAllSettings")
       ↓
   [Main] slideSettingsStore.get("slideSettings")
       ↓
   [Renderer] setState(settings)
   ```

2. ディレクトリ選択フロー:

   ```
   [Renderer] DirectorySelector.onClick()
       ↓
   [Preload] slideSettingsAPI.selectDirectory()
       ↓
   [Main] dialog.showOpenDialog({ properties: ["openDirectory"] })
       ↓
   [Renderer] validateAndSetPath(selectedPath)
       ↓
   [Preload] slideSettingsAPI.setDirectory(path)
       ↓
   [Main] slideSettingsStore.set("slideSettings.outputDirectory", path)
   ```

3. データフロー図を `outputs/phase-2/data-flow-design.md` に出力

**期待される成果物**:

- `outputs/phase-2/data-flow-design.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容                                 |
| -------------------- | -------------------------------------------------------------------------------- | ------------------------------------ |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`     | IPC通信のセキュリティ・CSP設定       |
| フォーム・設定UI     | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`               | フォーム設計・バリデーションパターン |
| 入力バリデーション   | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | 入力値検証パターン                   |

### 関連ドキュメント

| 参照資料      | パス                                        | 内容                  |
| ------------- | ------------------------------------------- | --------------------- |
| Phase 1成果物 | `outputs/phase-1/`                          | 要件定義書            |
| 既存IPC実装   | `apps/desktop/src/main/infrastructure/ipc/` | 既存のIPCパターン参照 |

---

## 成果物

| 成果物             | パス                                     | 内容                          |
| ------------------ | ---------------------------------------- | ----------------------------- |
| コンポーネント設計 | `outputs/phase-2/component-design.md`    | UIコンポーネント設計書        |
| IPC設計            | `outputs/phase-2/ipc-design.md`          | IPC通信インターフェース設計書 |
| スキーマ設計       | `outputs/phase-2/store-schema-design.md` | electron-storeスキーマ設計書  |
| データフロー設計   | `outputs/phase-2/data-flow-design.md`    | データフロー図                |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 2での統合テスト連携アクション**:

- IPC通信インターフェースの契約（型定義）を設計に反映
- Main-Renderer間のデータフローを明確化
- electron-storeスキーマと永続化の整合性を設計

---

## 完了条件

- [ ] コンポーネント設計が完了している
- [ ] IPCチャンネル定義が完了している
- [ ] preload API設計が完了している
- [ ] electron-storeスキーマが設計されている
- [ ] データフロー図が作成されている
- [ ] セキュリティ要件（ホワイトリスト、sender検証）が設計に反映されている
- [ ] 統合テスト連携アクションが完了している
- [ ] 全成果物が `outputs/phase-2/` に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/slide-directory-settings/phase-3-design-review.md`
