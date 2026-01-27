# FileContextList 要件定義

## 1. 概要

添付されたファイルコンテキストの一覧を表示するコンテナコンポーネント。既存のFileContextBadgeを再利用し、ファイル一覧の表示・選択・削除機能を提供する。

## 2. 機能要件

### FR-001: ファイル一覧表示

- chatEditSliceの `fileContexts` 配列を表示
- 各ファイルは `FileContextBadge` コンポーネントで描画
- ファイル名、アイコン、削除ボタンを表示

### FR-002: ファイル削除

- 各バッジの削除ボタンクリックで削除実行
- `onRemove` Props または `useFileContext.removeFileContext()` を呼び出し
- 削除後は一覧から即座に消える

### FR-003: ファイル選択

- バッジクリックで選択状態を切り替え
- `selectedId` Props で選択中のコンテキストIDを管理
- `onSelect` Props でコンポーネント外からも制御可能

### FR-004: 空状態表示

- ファイルが添付されていない場合はメッセージを表示
- デフォルトメッセージ: 「ファイルが添付されていません」
- `emptyMessage` Props でカスタマイズ可能

### FR-005: スクロール対応

- 10件超のファイル時は縦スクロール
- `maxHeight` Props でスクロール領域の高さを制御
- デフォルト: `200px`

### FR-006: 動的更新

- 新しいファイル追加時に即座に表示更新
- ファイル削除時に即座に一覧から消える
- React Hooksによるリアクティブ更新

## 3. 非機能要件

### NFR-001: パフォーマンス

- 最大10件まで対応（MAX_FILE_CONTEXTS制約）
- FileContextBadgeをmemo化して再レンダリング最小化
- 仮想スクロール不要（最大10件のため）

### NFR-002: レスポンシブデザイン

- コンテナ幅に応じてバッジが折り返し
- Flexbox wrapレイアウト使用

### NFR-003: ダークモード対応

- Tailwind CSSの `dark:` 修飾子で対応
- 背景色、テキスト色、ボーダー色を切り替え

## 4. Props仕様

| Prop         | 型                     | 必須 | デフォルト                       | 説明                     |
| ------------ | ---------------------- | ---- | -------------------------------- | ------------------------ |
| contexts     | `FileContext[]`        | -    | 自動取得                         | ファイルコンテキスト配列 |
| onRemove     | `(id: string) => void` | -    | -                                | 削除コールバック         |
| onSelect     | `(id: string) => void` | -    | -                                | 選択コールバック         |
| selectedId   | `string`               | -    | -                                | 選択中のコンテキストID   |
| emptyMessage | `string`               | -    | `"ファイルが添付されていません"` | 空状態メッセージ         |
| maxHeight    | `string \| number`     | -    | `"200px"`                        | 最大高さ                 |
| className    | `string`               | -    | -                                | 追加CSSクラス            |

## 5. コンポーネント構成

```
FileContextList (organisms)
├── EmptyState - 空状態表示
│   └── <p> - メッセージテキスト
└── FileContextBadge[] (molecules) - 既存コンポーネント再利用
    ├── Icon - ファイルアイコン
    ├── FileName - ファイル名
    └── RemoveButton - 削除ボタン
```

## 6. 状態管理連携

### 使用するZustand状態

- `fileContexts` - 添付ファイルコンテキスト一覧
- `activeContextId` - アクティブなコンテキストID

### 使用するフック

- `useFileContext` - fileContexts, removeFileContext, setActiveContext

### 状態フロー

```
[fileContexts更新]
  → [FileContextList再レンダリング]
  → [FileContextBadge[] 描画]

[削除ボタンクリック]
  → [onRemove(id)]
  → [removeFileContext(id)]
  → [chatEditSlice更新]
  → [fileContexts更新]

[バッジクリック]
  → [onSelect(id)]
  → [setActiveContext(id)]
  → [activeContextId更新]
```

## 7. 完了条件

- [ ] 添付ファイル一覧が正しく表示される
- [ ] ファイル名とアイコンが表示される
- [ ] 削除ボタンクリックでファイルが削除される
- [ ] バッジクリックで選択状態が切り替わる
- [ ] ファイルがない場合に空状態メッセージが表示される
- [ ] 10件超時にスクロールが可能
