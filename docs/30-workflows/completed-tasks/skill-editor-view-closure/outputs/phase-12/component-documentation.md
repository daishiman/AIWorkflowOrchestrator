# SkillEditorView コンポーネントドキュメント

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | UT-UI-05A                                          |
| 対象       | SkillEditorView クロージャ（7 機能統合）           |
| 作成日     | 2026-03-03                                         |
| Phase      | 12 (ドキュメント)                                  |
| ベースパス | `apps/desktop/src/renderer/views/SkillEditorView/` |

---

## 1. Toast

**ファイル**: `components/Toast.tsx`
**分類**: atom
**機能ID**: UT-UI-05A-004

保存成功/失敗時のポップアップ通知コンポーネント。

### Props

| Prop      | 型           | 必須 | デフォルト | 説明                             |
| --------- | ------------ | ---- | ---------- | -------------------------------- |
| id        | `string`     | Yes  | -          | Toast の一意識別子               |
| type      | `ToastType`  | Yes  | -          | `"success"` または `"error"`     |
| message   | `string`     | Yes  | -          | 表示メッセージ                   |
| onDismiss | `() => void` | Yes  | -          | 閉じるボタン押下時のコールバック |

### ARIA 属性

| 属性         | 値                                       | 説明                                         |
| ------------ | ---------------------------------------- | -------------------------------------------- |
| `role`       | `"status"` (success) / `"alert"` (error) | success は polite、error は assertive に通知 |
| `aria-label` | `"閉じる"` (閉じるボタン)                | 閉じるボタンのアクセシブルラベル             |

### CSS 変数依存

| CSS 変数           | 用途         |
| ------------------ | ------------ |
| `--status-success` | 成功背景色   |
| `--status-error`   | エラー背景色 |

### バリアントスタイル定義

```typescript
export const toastVariantStyles: Record<ToastType, string> = {
  success: "bg-[var(--status-success)] text-white",
  error: "bg-[var(--status-error)] text-white",
};
```

P47 対策として `toastVariantStyles` をモジュールスコープに export し、テスト側からも import して使用する。

### アイコン

| type    | アイコン      | data-testid          |
| ------- | ------------- | -------------------- |
| success | `CheckCircle` | `toast-icon-success` |
| error   | `XCircle`     | `toast-icon-error`   |

### アニメーション

- `transition-opacity duration-200`: フェードイン/アウト
- `motion-reduce:transition-none`: prefers-reduced-motion 時にアニメーション無効化

---

## 2. MobileDrawer

**ファイル**: `components/MobileDrawer.tsx`
**分類**: molecule
**機能ID**: UT-UI-05A-002

768px 未満の画面幅でファイルツリーを格納するスライドインドロワー。

### Props

| Prop     | 型                | 必須 | デフォルト | 説明                       |
| -------- | ----------------- | ---- | ---------- | -------------------------- |
| isOpen   | `boolean`         | Yes  | -          | ドロワーの開閉状態         |
| onClose  | `() => void`      | Yes  | -          | 閉じる操作時のコールバック |
| children | `React.ReactNode` | Yes  | -          | ドロワー内コンテンツ       |

### data-testid

| 要素         | data-testid      |
| ------------ | ---------------- |
| オーバーレイ | `drawer-overlay` |
| ドロワー本体 | `mobile-drawer`  |

### ARIA 属性

| 属性          | 値                 | 説明                                     |
| ------------- | ------------------ | ---------------------------------------- |
| `aria-hidden` | `"true"` (overlay) | オーバーレイはスクリーンリーダーに非表示 |
| `tabIndex`    | `-1` (drawer)      | プログラマティックフォーカス用           |

### キーボード操作

| キー   | 動作             |
| ------ | ---------------- |
| Escape | ドロワーを閉じる |

### ビジュアル仕様

| 項目           | 値                                              |
| -------------- | ----------------------------------------------- |
| 幅             | 280px                                           |
| スライド方向   | 左→右                                           |
| オーバーレイ   | `bg-black bg-opacity-30 backdrop-blur-sm`       |
| z-index        | overlay: 30, drawer: 40                         |
| アニメーション | `transition-transform duration-250 ease-in-out` |
| reduced motion | `motion-reduce:transition-none`                 |

### CSS 変数依存

| CSS 変数           | 用途               |
| ------------------ | ------------------ |
| `--bg-secondary`   | ドロワー背景色     |
| `--border-default` | ドロワー右ボーダー |

### フォーカス管理

- ドロワー開時: `drawerRef.current.focus()` でドロワー本体にフォーカス移動（M-001 対応）

---

## 3. ReadOnlyBanner

**ファイル**: `components/ReadOnlyBanner.tsx`
**分類**: atom
**機能ID**: UT-UI-05A-005

読み取り専用モード時に表示される警告バナー。

### Props

| Prop       | 型        | 必須 | デフォルト | 説明                            |
| ---------- | --------- | ---- | ---------- | ------------------------------- |
| isReadOnly | `boolean` | Yes  | -          | `true` で表示、`false` で非表示 |

### 表示内容

| 条件               | レンダリング                                        |
| ------------------ | --------------------------------------------------- |
| `isReadOnly=true`  | Lock アイコン + 「読み取り専用 --- 編集できません」 |
| `isReadOnly=false` | `null`（何も表示しない）                            |

### data-testid

| 要素          | data-testid          |
| ------------- | -------------------- |
| Lock アイコン | `readonly-lock-icon` |

### CSS 変数依存

| CSS 変数           | 用途         |
| ------------------ | ------------ |
| `--bg-tertiary`    | バナー背景色 |
| `--border-default` | 下ボーダー   |
| `--text-secondary` | テキスト色   |

---

## 4. EditorToolBar

**ファイル**: `components/EditorToolBar.tsx`
**分類**: molecule

エディター上部のツールバー。保存・バックアップ・閉じるボタンを配置する。

### Props

| Prop          | 型           | 必須 | デフォルト | 説明                             |
| ------------- | ------------ | ---- | ---------- | -------------------------------- |
| selectedFile  | `string`     | Yes  | -          | 現在選択中のファイルパス         |
| hasChanges    | `boolean`    | Yes  | -          | 未保存変更があるか               |
| isSaving      | `boolean`    | Yes  | -          | 保存処理実行中か                 |
| isReadOnly    | `boolean`    | Yes  | -          | 読み取り専用モードか             |
| onSave        | `() => void` | Yes  | -          | 保存ボタン押下時のコールバック   |
| onClose       | `() => void` | Yes  | -          | 閉じるボタン押下時のコールバック |
| onOpenBackups | `() => void` | Yes  | -          | バックアップボタン押下時         |

### ARIA 属性

| 属性         | 値                       | 対象               |
| ------------ | ------------------------ | ------------------ |
| `role`       | `"toolbar"`              | ツールバー本体     |
| `aria-label` | `"エディターツールバー"` | ツールバー本体     |
| `aria-label` | `"保存"`                 | 保存ボタン         |
| `aria-label` | `"バックアップ"`         | バックアップボタン |
| `aria-label` | `"閉じる"`               | 閉じるボタン       |

### 条件付き表示

| 条件          | 挙動                                                                |
| ------------- | ------------------------------------------------------------------- |
| `isReadOnly`  | 保存ボタン非表示、代わりに Lock アイコン (`toolbar-lock-icon`) 表示 |
| `!isReadOnly` | 保存ボタン表示                                                      |
| `isSaving`    | Save アイコンの代わりに Loader2 スピナー (`save-spinner`) 表示      |
| `hasChanges`  | ファイル名の横に `●` マーカー表示                                   |

### 保存ボタンの disabled 条件

```typescript
const isSaveDisabled = !hasChanges || isSaving || isReadOnly;
```

### CSS 変数依存

| CSS 変数           | 用途               |
| ------------------ | ------------------ |
| `--bg-secondary`   | ツールバー背景     |
| `--bg-tertiary`    | ホバー背景         |
| `--border-default` | 下ボーダー         |
| `--text-primary`   | ファイル名テキスト |
| `--text-secondary` | アイコン色         |
| `--status-primary` | 変更マーカー色     |

---

## 5. UnsavedChangesDialog

**ファイル**: `components/UnsavedChangesDialog.tsx`
**分類**: molecule
**機能ID**: UT-UI-05A-006

未保存変更がある状態でナビゲーション/閉じる操作を行ったときの確認ダイアログ。

### Props

| Prop                 | 型           | 必須 | デフォルト | 説明                                 |
| -------------------- | ------------ | ---- | ---------- | ------------------------------------ |
| isOpen               | `boolean`    | Yes  | -          | ダイアログの表示状態                 |
| fileName             | `string`     | Yes  | -          | 未保存変更があるファイル名           |
| onSaveAndContinue    | `() => void` | Yes  | -          | 「保存して続行」ボタンのコールバック |
| onDiscardAndContinue | `() => void` | Yes  | -          | 「保存せず続行」ボタンのコールバック |
| onCancel             | `() => void` | Yes  | -          | 「キャンセル」ボタンのコールバック   |

### ARIA 属性

| 属性          | 値               | 対象           |
| ------------- | ---------------- | -------------- |
| `role`        | `"alertdialog"`  | ダイアログ本体 |
| `aria-modal`  | `"true"`         | ダイアログ本体 |
| `aria-label`  | `"未保存の変更"` | ダイアログ本体 |
| `aria-hidden` | `"true"`         | オーバーレイ   |

### data-testid

| 要素         | data-testid              |
| ------------ | ------------------------ |
| オーバーレイ | `unsaved-dialog-overlay` |

### キーボード操作

| キー   | 動作                  |
| ------ | --------------------- |
| Escape | `onCancel` を呼び出す |

### ダイアログ内ボタン

| ボタンテキスト | スタイル                                               | コールバック           |
| -------------- | ------------------------------------------------------ | ---------------------- |
| 保存せず続行   | `text-[var(--status-error)]` (赤テキスト)              | `onDiscardAndContinue` |
| キャンセル     | `text-[var(--text-primary)]` (通常テキスト)            | `onCancel`             |
| 保存して続行   | `bg-[var(--status-primary)] text-white` (青背景白文字) | `onSaveAndContinue`    |

### フォーカス管理

- ダイアログ開時: `dialogRef.current.focus()` でダイアログ本体にフォーカス移動
- `tabIndex={-1}` によるプログラマティックフォーカス

### ビジュアル仕様

| 項目         | 値                  |
| ------------ | ------------------- |
| 幅           | 400px (最大 90vw)   |
| z-index      | overlay: 50         |
| 角丸         | `rounded-xl` (12px) |
| オーバーレイ | `bg-black/30`       |
| 影           | `shadow-lg`         |

### CSS 変数依存

| CSS 変数           | 用途                |
| ------------------ | ------------------- |
| `--bg-primary`     | ダイアログ背景      |
| `--bg-tertiary`    | ボタンホバー背景    |
| `--border-default` | ダイアログボーダー  |
| `--text-primary`   | タイトル/ボタン文字 |
| `--text-secondary` | 説明テキスト        |
| `--status-primary` | 保存ボタン背景      |
| `--status-error`   | 破棄ボタン文字色    |

---

## 6. EditorPanel

**ファイル**: `components/EditorPanel/EditorPanel.tsx`
**分類**: molecule

テキストエリアベースのコードエディターパネル。ローディング状態、読み取り専用モード、ステータスバーを統合する。

### Props

| Prop       | 型                        | 必須 | デフォルト | 説明                                   |
| ---------- | ------------------------- | ---- | ---------- | -------------------------------------- |
| content    | `string`                  | Yes  | -          | エディターのテキストコンテンツ         |
| language   | `string`                  | Yes  | -          | ファイルの言語（ステータスバーに表示） |
| isLoading  | `boolean`                 | Yes  | -          | ローディング状態                       |
| isReadOnly | `boolean`                 | Yes  | -          | 読み取り専用モード                     |
| onChange   | `(value: string) => void` | Yes  | -          | コンテンツ変更時のコールバック         |

### ARIA 属性

| 属性            | 値               | 条件                  |
| --------------- | ---------------- | --------------------- |
| `aria-readonly` | `"true"`         | `isReadOnly=true` 時  |
| `aria-readonly` | (属性自体を省略) | `isReadOnly=false` 時 |

### 状態別レンダリング

| 状態                        | 表示内容                                              |
| --------------------------- | ----------------------------------------------------- |
| `isLoading=true`            | Loader スピナー (`editor-loading`) + 空ステータスバー |
| content 空 & 非ローディング | プレースホルダー「ファイルを選択してください」        |
| 通常                        | textarea + ステータスバー (行数, 文字数, 言語)        |

### data-testid

| 要素             | data-testid      |
| ---------------- | ---------------- |
| ローディング表示 | `editor-loading` |

### CSS 変数依存

| CSS 変数           | 用途                                        |
| ------------------ | ------------------------------------------- |
| `--bg-primary`     | エディター背景                              |
| `--text-primary`   | テキスト色                                  |
| `--text-secondary` | ローディングアイコン色 / プレースホルダー色 |

### パフォーマンス最適化

- `lineCount`: `useMemo` で content 変更時のみ再計算
- `charCount`: `useMemo` で content 変更時のみ再計算
- `handleChange`: `useCallback` でイベントハンドラのメモ化

### アニメーション

- `transition-opacity duration-150`: テキストエリアのフェード
- `motion-reduce:transition-none`: prefers-reduced-motion 時に無効化
