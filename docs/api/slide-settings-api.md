# Slide Settings API Reference

## 概要

スライド出力ディレクトリ設定のAPI仕様書。IPC API、カスタムフック、型定義を含む。

## IPC API

### slideSettings:getDirectory

現在設定されているディレクトリパスを取得します。

- **チャンネル**: `slideSettings:getDirectory`
- **引数**: なし
- **戻り値**: `{ success: true; data: string } | { success: false; error: string }`

```typescript
const result = await ipcRenderer.invoke("slideSettings:getDirectory");
if (result.success) {
  console.log(result.data); // "/Users/username/Documents/Slides"
}
```

### slideSettings:setDirectory

ディレクトリパスを設定します。

- **チャンネル**: `slideSettings:setDirectory`
- **引数**: `path: string`
- **戻り値**: `{ success: true; data: void } | { success: false; error: string }`

```typescript
const result = await ipcRenderer.invoke(
  "slideSettings:setDirectory",
  "/path/to/directory",
);
if (!result.success) {
  console.error(result.error);
}
```

### slideSettings:selectDirectory

OS標準のダイアログでディレクトリを選択します。

- **チャンネル**: `slideSettings:selectDirectory`
- **引数**: なし
- **戻り値**: `{ success: true; data: string | null } | { success: false; error: string }`
- **備考**: キャンセル時は `data: null`

```typescript
const result = await ipcRenderer.invoke("slideSettings:selectDirectory");
if (result.success && result.data) {
  console.log("Selected:", result.data);
}
```

### slideSettings:validateDirectory

パスの有効性を検証します。

- **チャンネル**: `slideSettings:validateDirectory`
- **引数**: `path: string`
- **戻り値**: `ValidationResult`

```typescript
interface ValidationResult {
  status: "valid" | "warning" | "error";
  message: string;
}

const result = await ipcRenderer.invoke(
  "slideSettings:validateDirectory",
  "/path/to/check",
);
console.log(result.status, result.message);
```

### slideSettings:getAll

全設定を取得します。

- **チャンネル**: `slideSettings:getAll`
- **引数**: なし
- **戻り値**: `{ success: true; data: SlideSettings } | { success: false; error: string }`

```typescript
const result = await ipcRenderer.invoke("slideSettings:getAll");
if (result.success) {
  const { outputDirectory, autoCreateDirectory, defaultTheme } = result.data;
}
```

## Preload API

Rendererプロセスで使用可能なAPI。`window.slideSettingsAPI`経由でアクセス。

```typescript
interface SlideSettingsAPI {
  getDirectory(): Promise<IPCResult<string>>;
  setDirectory(path: string): Promise<IPCResult<void>>;
  selectDirectory(): Promise<IPCResult<string | null>>;
  validateDirectory(path: string): Promise<ValidationResult>;
  getAll(): Promise<IPCResult<SlideSettings>>;
}

// 使用例
const dir = await window.slideSettingsAPI.getDirectory();
```

## React Hooks

### useSlideSettings

スライド設定の状態管理フック。

```typescript
import { useSlideSettings } from "../hooks/useSlideSettings";

function MyComponent() {
  const {
    settings, // SlideSettings | null - 現在の設定
    isLoading, // boolean - 読み込み中
    error, // string | null - エラーメッセージ
    isModified, // boolean - 未保存の変更あり
    validation, // ValidationResult | null - バリデーション結果
    isSaving, // boolean - 保存中
    setDirectory, // (path: string) => void - パスを設定
    selectDirectory, // () => Promise<void> - ダイアログで選択
    save, // () => Promise<void> - 設定を保存
    clearError, // () => void - エラーをクリア
  } = useSlideSettings();

  return (
    <div>
      <input
        value={settings?.outputDirectory || ""}
        onChange={(e) => setDirectory(e.target.value)}
      />
      <button onClick={selectDirectory}>Browse</button>
      <button onClick={save} disabled={!isModified || isSaving}>
        Save
      </button>
    </div>
  );
}
```

## 型定義

### SlideSettings

```typescript
export interface SlideSettings {
  /** 出力ディレクトリパス */
  outputDirectory: string;
  /** 存在しない場合に自動作成するか */
  autoCreateDirectory: boolean;
  /** デフォルトテーマ */
  defaultTheme: string;
  /** スキーマバージョン */
  schemaVersion: number;
}
```

### ValidationResult

```typescript
export interface ValidationResult {
  /** バリデーション状態 */
  status: "valid" | "warning" | "error";
  /** メッセージ */
  message: string;
}
```

### IPCResult

```typescript
export type IPCResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

## エラーコード

| エラーメッセージ         | 原因                       |
| ------------------------ | -------------------------- |
| Path is required         | パスが空                   |
| Security risk detected   | パストラバーサルの検出     |
| Directory does not exist | ディレクトリが存在しない   |
| Path is not a directory  | パスがファイルを指している |
| No write permission      | 書き込み権限なし           |
| Invalid IPC sender       | 不正なIPC送信元            |

## 関連ドキュメント

- [技術ドキュメント](../technical/slide-settings.md)
- [ユーザーガイド](../user-guide/slide-settings.md)
