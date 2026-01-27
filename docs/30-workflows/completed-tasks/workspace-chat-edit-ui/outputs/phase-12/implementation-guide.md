# 実装ガイド: workspace-chat-edit-ui（Issue #494）

## メタ情報

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| タスクID | TASK-WCE-UI-001                                      |
| Issue    | #494                                                 |
| 完了日   | 2026-01-27                                           |
| テスト数 | 270（全パス）                                        |
| 機能     | FileAttachmentButton, FileContextList コンポーネント |

---

# Part 1: 概念説明（初学者向け）

## 1.1 この機能は何をするの？

### 日常生活での例え

「ファイル添付機能」は、**メールに写真を添付する**のと似ています。

例えば、友達に旅行の写真を送りたいとき、メールアプリで「添付」ボタンを押して、写真を選んで、メールに貼り付けますよね。このアプリでも同じです。AIアシスタントにファイルの内容を見てもらいたいときに、「ファイルを添付」ボタンを押して、見てほしいファイルを選びます。

### この機能でできること

| 機能             | 説明                               | 例                                 |
| ---------------- | ---------------------------------- | ---------------------------------- |
| ファイル添付     | AIに見てほしいファイルを選ぶ       | プログラムのコードファイルを選ぶ   |
| 添付ファイル一覧 | 選んだファイルを一覧で確認できる   | 3つ選んだら3つのバッジが表示される |
| ファイル削除     | 間違えて選んだファイルを取り消せる | ×ボタンを押すとリストから消える    |
| 選択状態の表示   | 今どのファイルを見ているかわかる   | 選んだファイルが青く光る           |

## 1.2 なぜこの機能が必要なの？

AIアシスタントに「このファイルを直して」とお願いするとき、**どのファイルのことか**を伝える必要があります。

口で説明するより、**実際のファイルを見せた方が早い**ですよね。この機能を使うと、AIアシスタントにファイルの中身を直接見せることができるので、より正確に修正してもらえます。

## 1.3 使い方の流れ

```
1. 「ファイルを添付」ボタンをクリック
     ↓
2. 見てほしいファイルを選ぶ（複数選べます）
     ↓
3. 選んだファイルがバッジで表示される
     ↓
4. AIアシスタントに指示を入力して送信
     ↓
5. AIがファイルを見て、編集案を提案してくれる
```

## 1.4 バッジって何？

「バッジ」は、選んだファイルを表す**小さなラベル**のことです。名札のようなものだと思ってください。

- ファイル名が書かれている
- ×ボタンで削除できる
- クリックすると選択状態になる（青く光る）

---

# Part 2: 技術詳細（開発者向け）

## 2.1 アーキテクチャ概要

### レイヤー構成

```
┌─────────────────────────────────────────────────┐
│  UI Layer (Renderer Process)                    │
│  ├── FileAttachmentButton                       │
│  ├── FileContextList                            │
│  └── FileContextBadge                           │
├─────────────────────────────────────────────────┤
│  State Layer (Zustand)                          │
│  └── chatEditSlice (useFileContext)             │
├─────────────────────────────────────────────────┤
│  IPC Layer (Electron)                           │
│  └── fileSelection.openDialog                   │
├─────────────────────────────────────────────────┤
│  Main Process                                   │
│  └── dialog.showOpenDialog                      │
└─────────────────────────────────────────────────┘
```

### データフロー

```
ユーザー操作 → FileAttachmentButton
    ↓ onClick
electronAPI.fileSelection.openDialog()
    ↓ IPC
Main Process: dialog.showOpenDialog()
    ↓ filePaths
Renderer: useFileContext.attachFile()
    ↓ state update
FileContextList: 再レンダリング
    ↓
FileContextBadge: 各ファイル表示
```

## 2.2 コンポーネント仕様

### FileAttachmentButton

| 項目     | 内容                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileAttachmentButton.tsx` |
| 責務     | ファイル選択ダイアログを開き、選択されたファイルをコンテキストに追加                         |
| 依存     | useFileContext, electronAPI.fileSelection                                                    |

**Props**

| Prop            | 型                               | 必須 | デフォルト | 説明                       |
| --------------- | -------------------------------- | ---- | ---------- | -------------------------- |
| onFilesSelected | `(files: FileContext[]) => void` | No   | -          | ファイル選択時コールバック |
| multiple        | `boolean`                        | No   | true       | 複数選択許可               |
| accept          | `string[]`                       | No   | ["*"]      | 許可する拡張子             |
| maxFiles        | `number`                         | No   | 10         | 最大ファイル数             |
| disabled        | `boolean`                        | No   | false      | 無効状態                   |
| className       | `string`                         | No   | -          | カスタムクラス             |
| children        | `ReactNode`                      | No   | -          | カスタムコンテンツ         |

### FileContextList

| 項目     | 内容                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextList.tsx` |
| 責務     | 添付ファイル一覧の表示、削除・選択操作のハンドリング                                    |
| 依存     | useFileContext, FileContextBadge                                                        |

**Props**

| Prop         | 型                     | 必須 | デフォルト                     | 説明                 |
| ------------ | ---------------------- | ---- | ------------------------------ | -------------------- |
| contexts     | `FileContext[]`        | No   | (Zustandから取得)              | 表示するコンテキスト |
| onRemove     | `(id: string) => void` | No   | -                              | 削除時コールバック   |
| onSelect     | `(id: string) => void` | No   | -                              | 選択時コールバック   |
| selectedId   | `string`               | No   | (Zustandから取得)              | 選択中のID           |
| emptyMessage | `string`               | No   | "ファイルが添付されていません" | 空状態メッセージ     |
| maxHeight    | `string`               | No   | -                              | 最大高さ             |
| className    | `string`               | No   | -                              | カスタムクラス       |

## 2.3 状態管理

### useFileContext Hook

```typescript
interface FileContextState {
  fileContexts: FileContext[];
  activeContextId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface FileContextActions {
  attachFile: (filePath: string) => Promise<void>;
  removeFileContext: (id: string) => void;
  setActiveContext: (id: string | null) => void;
  clearAllContexts: () => void;
  canAddContext: boolean; // fileContexts.length < MAX_FILE_CONTEXTS
}
```

### 定数

| 定数              | 値  | 説明                   |
| ----------------- | --- | ---------------------- |
| MAX_FILE_CONTEXTS | 10  | 最大添付ファイル数     |
| MAX_FILE_SIZE     | 10  | 最大ファイルサイズ(MB) |

## 2.4 アクセシビリティ

### WCAG 2.1 AA 準拠項目

| 要件                     | 実装内容                                  |
| ------------------------ | ----------------------------------------- |
| キーボードナビゲーション | Tab/Enter/Space/Delete で全操作可能       |
| フォーカス可視化         | focus:ring-2 で明確なフォーカスリング     |
| スクリーンリーダー対応   | aria-label, aria-current 属性を適切に設定 |
| 色コントラスト           | Tailwind CSS 標準色（4.5:1以上）          |

### WAI-ARIA 属性

| コンポーネント       | 属性                                           |
| -------------------- | ---------------------------------------------- |
| FileAttachmentButton | type="button", aria-label                      |
| FileContextList      | role="list" (リスト表示時のみ)                 |
| FileContextBadge     | role="listitem", aria-current="true/undefined" |

## 2.5 テスト構成

### テストファイル

| ファイル                      | テスト数 | 内容                      |
| ----------------------------- | -------- | ------------------------- |
| FileAttachmentButton.test.tsx | 20       | ユニットテスト            |
| FileContextList.test.tsx      | 20       | ユニットテスト            |
| accessibility.test.tsx        | 14       | axe-core アクセシビリティ |
| integration-ui.test.tsx       | 12       | 統合UIテスト              |

### テストカバレッジ

| 項目       | 値   |
| ---------- | ---- |
| テスト総数 | 270  |
| パス率     | 100% |

## 2.6 Storybook

### Stories

| ファイル                         | Stories数 | 内容          |
| -------------------------------- | --------- | ------------- |
| FileAttachmentButton.stories.tsx | 7         | 各状態のStory |
| FileContextList.stories.tsx      | 9         | 各状態のStory |
| FileContextBadge.stories.tsx     | 9         | 各状態のStory |

## 2.7 エラーハンドリング

| エラーケース           | ハンドリング                         |
| ---------------------- | ------------------------------------ |
| ダイアログキャンセル   | 何もしない（正常終了）               |
| ファイル読み込みエラー | console.error + isLoading: false     |
| 最大ファイル数超過     | ボタン無効化（canAddContext: false） |

---

## 関連ドキュメント

| ドキュメント   | パス                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| 要件定義       | `outputs/phase-1/requirements.md`                                               |
| 設計書         | `outputs/phase-2/design.md`                                                     |
| システム仕様書 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` |
| 状態管理仕様   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    |
