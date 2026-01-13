# データフロー設計書 - スライド出力ディレクトリ設定

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 2                        |
| タスク     | T-02-4                   |
| 作成日     | 2026-01-13               |
| 機能名     | slide-directory-settings |
| ステータス | 完了                     |

---

## 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Renderer Process                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    React Components                                │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                SlideDirectorySettings                        │  │  │
│  │  │  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐ │  │  │
│  │  │  │  PathDisplay   │  │DirectorySelector │  │  Checkbox   │ │  │  │
│  │  │  └────────────────┘  └──────────────────┘  └─────────────┘ │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                              │                                     │  │
│  │                              ▼                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                  useSlideSettings Hook                       │  │  │
│  │  │   (state管理 + IPC通信の抽象化)                              │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                  │                                       │
│                                  ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                window.electronAPI.slideSettings                    │  │
│  │   (contextBridge経由で公開されたAPI)                               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ IPC (invoke/handle)
                                   │
┌─────────────────────────────────────────────────────────────────────────┐
│                            Preload Script                                │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     slideSettingsAPI                               │  │
│  │   safeInvoke() wrapper with channel whitelist                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ ipcRenderer.invoke()
                                   │
┌─────────────────────────────────────────────────────────────────────────┐
│                            Main Process                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                  slideSettingsHandlers                             │  │
│  │   ipcMain.handle() で各チャンネルを処理                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                  │                                       │
│                                  ▼                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────┐  │
│  │   validation.ts  │  │slideSettingsStore│  │   dialog API        │  │
│  │  (パス検証)       │  │  (electron-store)│  │  (OS標準ダイアログ) │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────────┘  │
│                                  │                                       │
│                                  ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    slide-settings.json                             │  │
│  │                      (永続化ファイル)                               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 詳細データフロー

### 1. 設定読み込みフロー（初期化時）

```
[Renderer] コンポーネントマウント
    │
    ▼
[Renderer] useSlideSettings().loadSettings()
    │
    ▼
[Renderer] setIsLoading(true)
    │
    ▼
[Preload] window.electronAPI.slideSettings.getAllSettings()
    │
    ▼
[Preload] safeInvoke("slideSettings:getAllSettings")
    │      ↓ チャンネルホワイトリスト検証
    ▼
[Main] ipcMain.handle("slideSettings:getAllSettings")
    │
    ▼
[Main] getSlideSettingsStore().store
    │      ↓ JSONファイル読み込み（初回のみ）
    ▼
[Main] return { success: true, data: settings }
    │
    ▼
[Renderer] result受信
    │      ↓ result.success チェック
    ├── success → setSettings(result.data)
    │              setIsLoading(false)
    │
    └── failure → setError(result.error)
                  setIsLoading(false)
```

**シーケンス図**:

```
Renderer          Preload           Main              Store
   │                │                │                  │
   │ loadSettings() │                │                  │
   │───────────────>│                │                  │
   │                │ safeInvoke()   │                  │
   │                │───────────────>│                  │
   │                │                │ get settings     │
   │                │                │─────────────────>│
   │                │                │                  │
   │                │                │<─────────────────│
   │                │                │ SlideSettings    │
   │                │<───────────────│                  │
   │                │ Result<T>      │                  │
   │<───────────────│                │                  │
   │ setState()     │                │                  │
   │                │                │                  │
```

---

### 2. ディレクトリ選択フロー

```
[Renderer] DirectorySelector.onClick()
    │
    ▼
[Renderer] setIsSelecting(true)
    │
    ▼
[Preload] window.electronAPI.slideSettings.selectDirectory()
    │
    ▼
[Main] dialog.showOpenDialog(mainWindow, {
    │      properties: ["openDirectory", "createDirectory"]
    │    })
    │
    ├── canceled → return { success: true, data: null }
    │
    └── selected → return { success: true, data: filePaths[0] }
    │
    ▼
[Renderer] result受信
    │      ↓ result.data がnullでない場合
    ▼
[Renderer] onChange(result.data)  // 親コンポーネントに通知
    │
    ▼
[Renderer] onValidate(result.data)  // バリデーション実行
    │
    ▼
[Preload] window.electronAPI.slideSettings.validateDirectory({ path })
    │
    ▼
[Main] validateDirectoryForSettings(path)
    │      ↓ パストラバーサルチェック
    │      ↓ 存在確認
    │      ↓ 書き込み権限チェック
    ▼
[Main] return { success: true, data: ValidationResult }
    │
    ▼
[Renderer] setValidationResult(result.data)
    │
    ▼
[Renderer] setIsSelecting(false)
```

**シーケンス図**:

```
User              Renderer          Preload           Main              Dialog
  │                  │                │                │                  │
  │ click "選択..."  │                │                │                  │
  │─────────────────>│                │                │                  │
  │                  │ selectDirectory│                │                  │
  │                  │───────────────>│                │                  │
  │                  │                │───────────────>│                  │
  │                  │                │                │ showOpenDialog() │
  │                  │                │                │─────────────────>│
  │                  │                │                │                  │
  │                  │                │                │<─────────────────│
  │                  │                │                │ filePaths        │
  │                  │                │<───────────────│                  │
  │                  │<───────────────│                │                  │
  │                  │ path           │                │                  │
  │                  │                │                │                  │
  │                  │ validateDir    │                │                  │
  │                  │───────────────>│                │                  │
  │                  │                │───────────────>│                  │
  │                  │                │                │ validate()       │
  │                  │                │<───────────────│                  │
  │                  │<───────────────│                │                  │
  │                  │ ValidationResult                │                  │
  │<─────────────────│                │                │                  │
  │ UI更新            │                │                │                  │
```

---

### 3. 設定保存フロー

```
[Renderer] ユーザーが「保存」ボタンをクリック
    │
    ▼
[Renderer] handleSave()
    │      ↓ バリデーション結果確認（エラー時は中断）
    ▼
[Renderer] setIsSaving(true)
    │
    ▼
[Preload] window.electronAPI.slideSettings.setDirectory({
    │        path: directory,
    │        autoCreate: autoCreateDirectory
    │      })
    │
    ▼
[Main] ipcMain.handle("slideSettings:setDirectory")
    │
    ▼
[Main] validateDirectoryPath(request.path)
    │      ↓ パストラバーサルチェック
    │
    ├── invalid → return { success: false, error: "..." }
    │
    └── valid ↓
              │
              ▼
[Main] if (autoCreate && !exists) {
    │    fs.mkdirSync(expandedPath, { recursive: true })
    │  }
    │
    ▼
[Main] store.set("outputDirectory", path)
    │  store.set("autoCreateDirectory", autoCreate)
    │
    ▼
[Main] return { success: true }
    │
    ▼
[Renderer] result受信
    │
    ├── success → setIsSaving(false)
    │              setIsModified(false)
    │              onSaveSuccess?.()  // コールバック呼び出し
    │
    └── failure → setIsSaving(false)
                  setError(result.error)
```

**シーケンス図**:

```
User              Renderer          Preload           Main              Store
  │                  │                │                │                  │
  │ click "保存"     │                │                │                  │
  │─────────────────>│                │                │                  │
  │                  │ setDirectory() │                │                  │
  │                  │───────────────>│                │                  │
  │                  │                │───────────────>│                  │
  │                  │                │                │ validate()       │
  │                  │                │                │                  │
  │                  │                │                │ mkdir (if needed)│
  │                  │                │                │                  │
  │                  │                │                │ store.set()      │
  │                  │                │                │─────────────────>│
  │                  │                │                │                  │
  │                  │                │                │<─────────────────│
  │                  │                │<───────────────│                  │
  │                  │<───────────────│                │                  │
  │<─────────────────│                │                │                  │
  │ 成功通知          │                │                │                  │
```

---

### 4. キャンセルフロー

```
[Renderer] ユーザーが「キャンセル」ボタンをクリック
    │
    ▼
[Renderer] handleCancel()
    │
    ├── isModified === false → onCancel?.()
    │
    └── isModified === true ↓
                            │
                            ▼
[Renderer] 確認ダイアログ表示
    │      「変更を破棄しますか？」
    │
    ├── キャンセル → 何もしない
    │
    └── OK → loadSettings()  // 元の値を再読み込み
             setIsModified(false)
             onCancel?.()
```

---

## 状態遷移図

### useSlideSettings フック状態

```
                    ┌─────────────┐
                    │   initial   │
                    │ isLoading:  │
                    │   true      │
                    └──────┬──────┘
                           │
                           │ loadSettings()
                           ▼
              ┌────────────────────────┐
              │                        │
              │        loading         │
              │                        │
              └───────────┬────────────┘
                          │
           ┌──────────────┴──────────────┐
           │                             │
           ▼                             ▼
    ┌─────────────┐              ┌─────────────┐
    │    ready    │              │    error    │
    │ isLoading:  │              │ isLoading:  │
    │   false     │              │   false     │
    │ error: null │              │ error: msg  │
    └──────┬──────┘              └──────┬──────┘
           │                            │
           │ user action                │ retry
           ▼                            │
    ┌─────────────┐                     │
    │  modified   │                     │
    │ isModified: │ ────────────────────┘
    │   true      │
    └──────┬──────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐  ┌──────────┐
│ saving │  │ cancelled│
└───┬────┘  └──────────┘
    │
    ├── success → ready
    │
    └── failure → error
```

---

## エラー処理フロー

### IPC通信エラー

```
[Renderer] API呼び出し
    │
    ▼
[Preload] safeInvoke()
    │
    ├── チャンネル不正 → reject("Channel not allowed")
    │                    │
    │                    ▼
    │              [Renderer] catch(error)
    │                    │
    │                    ▼
    │              setError(error.message)
    │
    └── チャンネルOK → ipcRenderer.invoke()
                       │
                       ├── Main側エラー → { success: false, error }
                       │                   │
                       │                   ▼
                       │             [Renderer] if (!result.success)
                       │                   │
                       │                   ▼
                       │             setError(result.error)
                       │
                       └── 成功 → { success: true, data }
```

---

## 統合テスト連携ポイント

### Main-Renderer間の契約

| フロー           | IPC Channel                       | リクエスト                 | レスポンス                 |
| ---------------- | --------------------------------- | -------------------------- | -------------------------- |
| 設定読み込み     | `slideSettings:getAllSettings`    | なし                       | `Result<SlideSettings>`    |
| 設定保存         | `slideSettings:setDirectory`      | `SetDirectoryRequest`      | `Result<void>`             |
| ディレクトリ選択 | `slideSettings:selectDirectory`   | なし                       | `Result<string \| null>`   |
| バリデーション   | `slideSettings:validateDirectory` | `ValidateDirectoryRequest` | `Result<ValidationResult>` |

### テストダブル設計

```typescript
// テスト用モック
const mockSlideSettingsAPI: SlideSettingsAPI = {
  getAllSettings: vi.fn().mockResolvedValue({
    success: true,
    data: {
      outputDirectory: "~/Documents/Slides",
      autoCreateDirectory: true,
      defaultTheme: "kanagawa",
      schemaVersion: 1,
    },
  }),
  setDirectory: vi.fn().mockResolvedValue({ success: true }),
  selectDirectory: vi.fn().mockResolvedValue({
    success: true,
    data: "/selected/path",
  }),
  validateDirectory: vi.fn().mockResolvedValue({
    success: true,
    data: { status: "valid", message: "有効なディレクトリです" },
  }),
  getDirectory: vi.fn().mockResolvedValue({
    success: true,
    data: "~/Documents/Slides",
  }),
};
```

---

## 完了確認

- [x] 設定読み込みフローが詳細化されている
- [x] ディレクトリ選択フローが詳細化されている
- [x] 設定保存フローが詳細化されている
- [x] キャンセルフローが詳細化されている
- [x] 状態遷移図が作成されている
- [x] エラー処理フローが定義されている
- [x] 統合テスト連携ポイントが明確化されている
- [x] シーケンス図が作成されている
