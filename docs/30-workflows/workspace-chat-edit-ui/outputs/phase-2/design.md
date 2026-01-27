# Phase 2: 設計

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 2                   |
| カテゴリ   | 設計                |
| 前提Phase  | Phase 1（要件定義） |
| ステータス | 未実施              |

---

## 1. 目的

FileAttachmentButton、FileContextListのコンポーネント設計とPropsインターフェースを定義する。

---

## 2. タスク一覧

### Task 1: FileAttachmentButton 設計

#### 概要

ファイル選択ダイアログを開くボタンコンポーネントの設計を行う。

#### Propsインターフェース設計

| Prop            | 型                          | 必須 | デフォルト | 説明                       |
| --------------- | --------------------------- | ---- | ---------- | -------------------------- |
| onFilesSelected | `(paths: string[]) => void` | -    | -          | ファイル選択後コールバック |
| multiple        | `boolean`                   | -    | `true`     | 複数選択許可               |
| accept          | `string[]`                  | -    | `['*']`    | 許可する拡張子             |
| maxFiles        | `number`                    | -    | `10`       | 最大選択数                 |
| disabled        | `boolean`                   | -    | `false`    | 無効化フラグ               |
| className       | `string`                    | -    | -          | 追加CSSクラス              |

#### コンポーネント構成

```
FileAttachmentButton (molecules)
├── Button (atoms) - クリック領域
└── Icon (atoms) - 添付アイコン
```

#### 状態管理連携

- useFileContext フックを使用
- attachFile メソッドでchatEditSliceに追加

#### IPC呼び出しフロー

1. ボタンクリック
2. preload経由で `dialog.showOpenDialog` を呼び出し
3. 選択されたファイルパスを取得
4. 各ファイルに対して `chat-edit:read-file` IPC呼び出し
5. chatEditSliceに結果を追加

#### 成果物

- `design-file-attachment-button.md`

---

### Task 2: FileContextList 設計

#### 概要

添付ファイル一覧を表示するコンテナコンポーネントの設計を行う。

#### Propsインターフェース設計

| Prop         | 型                     | 必須 | デフォルト                       | 説明                     |
| ------------ | ---------------------- | ---- | -------------------------------- | ------------------------ |
| contexts     | `FileContext[]`        | ✅   | -                                | ファイルコンテキスト配列 |
| onRemove     | `(id: string) => void` | -    | -                                | 削除コールバック         |
| onSelect     | `(id: string) => void` | -    | -                                | 選択コールバック         |
| selectedId   | `string`               | -    | -                                | 選択中のコンテキストID   |
| emptyMessage | `string`               | -    | `"ファイルが添付されていません"` | 空状態メッセージ         |
| maxHeight    | `string \| number`     | -    | `"200px"`                        | 最大高さ                 |
| className    | `string`               | -    | -                                | 追加CSSクラス            |

#### コンポーネント構成

```
FileContextList (organisms)
├── EmptyState (atoms) - 空状態表示
└── FileContextBadge[] (molecules) - 既存コンポーネント再利用
    ├── Icon (atoms) - ファイルアイコン
    ├── FileName (atoms) - ファイル名
    └── RemoveButton (atoms) - 削除ボタン
```

#### 状態管理連携

- chatEditSliceのfileContexts状態を購読
- removeFileContext アクションを呼び出し

#### 成果物

- `design-file-context-list.md`

---

### Task 3: アクセシビリティ設計

#### 概要

WCAG 2.1 AA準拠のアクセシビリティ実装設計を行う。

#### キーボードナビゲーション設計

| コンポーネント       | キー        | 動作                     |
| -------------------- | ----------- | ------------------------ |
| FileAttachmentButton | Enter/Space | ファイルダイアログを開く |
| FileContextList      | Tab         | 次のバッジにフォーカス   |
| FileContextList      | Shift+Tab   | 前のバッジにフォーカス   |
| FileContextBadge     | Delete      | ファイルを削除           |
| FileContextBadge     | Enter/Space | ファイルを選択           |

#### ARIA属性設計

| コンポーネント       | 属性            | 値                   |
| -------------------- | --------------- | -------------------- |
| FileAttachmentButton | `role`          | `button`             |
| FileAttachmentButton | `aria-label`    | `"ファイルを添付"`   |
| FileContextList      | `role`          | `list`               |
| FileContextList      | `aria-label`    | `"添付ファイル一覧"` |
| FileContextBadge     | `role`          | `listitem`           |
| FileContextBadge     | `aria-selected` | `true/false`         |

#### 成果物

- `design-accessibility.md`

---

### Task 4: Storybook Stories設計

#### 概要

各コンポーネントのStorybook Stories構成を設計する。

#### Stories構成

| コンポーネント       | Story名        | 説明                     |
| -------------------- | -------------- | ------------------------ |
| FileAttachmentButton | Default        | デフォルト状態           |
| FileAttachmentButton | Disabled       | 無効化状態               |
| FileAttachmentButton | WithMaxReached | 最大数到達状態           |
| FileContextList      | Empty          | 空状態                   |
| FileContextList      | WithFiles      | ファイル表示状態         |
| FileContextList      | WithManyFiles  | スクロール状態（10件超） |
| FileContextList      | WithSelected   | 選択状態                 |

#### 成果物

- `design-storybook.md`

---

## 3. 完了条件

- [ ] FileAttachmentButtonのPropsインターフェースが定義されている
- [ ] FileContextListのPropsインターフェースが定義されている
- [ ] コンポーネント階層構造が文書化されている
- [ ] IPC呼び出しフローが設計されている
- [ ] アクセシビリティ属性が設計されている
- [ ] Storybook Stories構成が設計されている

---

## 4. 参照情報

### システム仕様

| 仕様                     | パス                                                                         |
| ------------------------ | ---------------------------------------------------------------------------- |
| UIコンポーネントパターン | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    |
| 状態管理パターン         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` |

### Electron層別設計観点

| 層       | 設計観点                                         |
| -------- | ------------------------------------------------ |
| Renderer | コンポーネントProps、Hooks連携、イベントハンドラ |
| IPC      | チャンネル名、リクエスト/レスポンス型            |
| Preload  | 公開API（dialog.showOpenDialog）                 |
| Main     | IPCハンドラ実装（既存）                          |

---

## 5. 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント | 契約定義                                                   |
| ------------ | ---------------------------------------------------------- |
| IPC通信      | `chat-edit:read-file` - ReadFileRequest → ReadFileResponse |
| 状態管理     | chatEditSlice.fileContexts: FileContext[]                  |
| Preload API  | dialog.showOpenDialog → string[] (ファイルパス配列)        |

---

## 6. 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する:

| 観点             | 適用判断               | 仕様参照先                                            |
| ---------------- | ---------------------- | ----------------------------------------------------- |
| UI/UX            | ✅ コンポーネント設計  | `aiworkflow-requirements: arch-ui-components.md`      |
| アクセシビリティ | ✅ ARIA/キーボード設計 | `aiworkflow-requirements: arch-ui-components.md`      |
| アーキテクチャ   | ✅ 層分離設計          | `aiworkflow-requirements: architecture-*.md`          |
| API設計          | ✅ IPC契約設計         | `aiworkflow-requirements: llm-workspace-chat-edit.md` |

**Electronデスクトップアプリ観点（アーキテクチャ層別設計）**:

| 層                         | 設計観点                               | 仕様参照先                                            |
| -------------------------- | -------------------------------------- | ----------------------------------------------------- |
| フロントエンド（Renderer） | ✅ コンポーネント設計、状態管理、UI/UX | `aiworkflow-requirements: arch-ui-components.md`      |
| バックエンド（Main）       | IPCハンドラ（既存利用）                | `aiworkflow-requirements: llm-workspace-chat-edit.md` |
| IPC通信                    | ✅ チャンネル設計、型定義、契約        | `aiworkflow-requirements: llm-workspace-chat-edit.md` |
| Preload                    | ✅ contextBridge設計、API公開          | `aiworkflow-requirements: security-api-electron.md`   |

---

## 7. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成・管理すること:

1. Task 1: FileAttachmentButton 設計
2. Task 2: FileContextList 設計
3. Task 3: アクセシビリティ設計
4. Task 4: Storybook Stories設計
5. 設計ドキュメントの作成・配置
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに完了に更新すること。

---

## 8. タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1-4）を100%実行完了
- [ ] 各タスクの成果物（design-\*.md）が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 9. 次のPhase

Phase 3: 設計レビューゲート
