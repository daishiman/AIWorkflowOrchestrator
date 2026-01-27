# Storybook 要件定義

## 1. 概要

workspace-chat-edit 全コンポーネントのStorybook Stories要件。コンポーネントの各状態・バリエーションを視覚的に確認し、開発・デバッグ・ドキュメント化を支援する。

## 2. 対象コンポーネント

### 新規作成

| コンポーネント       | ストーリーファイル               | 優先度 |
| -------------------- | -------------------------------- | ------ |
| FileAttachmentButton | FileAttachmentButton.stories.tsx | 高     |
| FileContextList      | FileContextList.stories.tsx      | 高     |

### 既存（要確認・作成）

| コンポーネント      | ストーリーファイル              | 優先度 |
| ------------------- | ------------------------------- | ------ |
| FileContextBadge    | FileContextBadge.stories.tsx    | 中     |
| FileContextDropZone | FileContextDropZone.stories.tsx | 中     |
| ApplyControls       | ApplyControls.stories.tsx       | 中     |
| DiffEditor          | DiffEditor.stories.tsx          | 低     |
| DiffPreview         | DiffPreview.stories.tsx         | 低     |
| EditCommandInput    | EditCommandInput.stories.tsx    | 中     |

## 3. Stories仕様

### FileAttachmentButton Stories

| Story名        | 説明             | Props設定                                |
| -------------- | ---------------- | ---------------------------------------- |
| Default        | デフォルト状態   | -                                        |
| Disabled       | 無効化状態       | `disabled: true`                         |
| WithMaxReached | 最大数到達状態   | `canAddContext: false` をモック          |
| Loading        | ローディング中   | 内部ローディング状態をモック             |
| WithCallback   | コールバック付き | `onFilesSelected` にアクションをバインド |

### FileContextList Stories

| Story名       | 説明                 | Props設定                           |
| ------------- | -------------------- | ----------------------------------- |
| Empty         | 空状態               | `contexts: []`                      |
| WithFiles     | ファイル表示状態     | `contexts: [mockFile1, mockFile2]`  |
| WithManyFiles | スクロール状態       | `contexts: [12個のモックファイル]`  |
| WithSelected  | 選択状態             | `selectedId: "file-1"`              |
| CustomEmpty   | カスタム空メッセージ | `emptyMessage: "ドラッグ&ドロップ"` |

### FileContextBadge Stories

| Story名      | 説明           | Props設定                    |
| ------------ | -------------- | ---------------------------- |
| Default      | デフォルト状態 | -                            |
| Active       | アクティブ状態 | `isActive: true`             |
| WithRemove   | 削除ボタン付き | `onRemove` 設定              |
| LongFileName | 長いファイル名 | `fileName: "very-long-name"` |
| Selected     | 選択状態       | `isActive: true`             |

### FileContextDropZone Stories

| Story名   | 説明             | Props設定           |
| --------- | ---------------- | ------------------- |
| Default   | デフォルト状態   | -                   |
| Dragging  | ドラッグ中状態   | isDragging をモック |
| WithFiles | ファイル添付済み | children 設定       |
| WithError | エラー状態       | error をモック      |

### ApplyControls Stories

| Story名  | 説明           | Props設定         |
| -------- | -------------- | ----------------- |
| Default  | デフォルト状態 | -                 |
| Loading  | ローディング中 | `isLoading: true` |
| Disabled | 無効化状態     | `disabled: true`  |

### EditCommandInput Stories

| Story名     | 説明           | Props設定              |
| ----------- | -------------- | ---------------------- |
| Default     | デフォルト状態 | -                      |
| WithValue   | 入力済み状態   | `value: "refactor"`    |
| Placeholder | プレースホルダ | `placeholder` カスタム |
| Disabled    | 無効化状態     | `disabled: true`       |

## 4. Storybook設定要件

### 必須アドオン

- `@storybook/addon-essentials` - 基本アドオン
- `@storybook/addon-a11y` - アクセシビリティ検証
- `@storybook/addon-interactions` - インタラクションテスト
- `@storybook/addon-actions` - アクションロギング

### カテゴリ構成

```
workspace-chat-edit/
├── Atoms/
│   └── (common components)
├── Molecules/
│   ├── FileAttachmentButton
│   └── FileContextBadge
├── Organisms/
│   ├── FileContextList
│   ├── FileContextDropZone
│   ├── ApplyControls
│   └── EditCommandInput
└── Templates/
    ├── DiffEditor
    └── DiffPreview
```

### モック戦略

#### Zustand Store モック

```typescript
// decorators で store をモック
import { useStore } from '../../../store';

const mockStore = {
  fileContexts: [],
  activeContextId: null,
  canAddContext: true,
  // ...
};

// Story decorator
export const decorators = [
  (Story) => {
    useStore.setState(mockStore);
    return <Story />;
  },
];
```

#### Electron API モック

```typescript
// window.electronAPI をモック
const mockElectronAPI = {
  fileSelection: {
    openDialog: async () => ({
      success: true,
      data: { canceled: false, filePaths: ["/mock/file.ts"] },
    }),
  },
};

// beforeEach で設定
beforeEach(() => {
  (window as any).electronAPI = mockElectronAPI;
});
```

## 5. アクセシビリティテスト

### 自動テスト

- 各ストーリーで `@storybook/addon-a11y` によるaxe検証
- WCAG 2.1 AA 違反を自動検出

### 検証項目

- [ ] 色コントラスト
- [ ] キーボードアクセシビリティ
- [ ] ARIA属性の正しさ
- [ ] フォーカス管理

## 6. 出力先

```
apps/desktop/src/renderer/features/workspace-chat-edit/stories/
├── FileAttachmentButton.stories.tsx
├── FileContextList.stories.tsx
├── FileContextBadge.stories.tsx
├── FileContextDropZone.stories.tsx
├── ApplyControls.stories.tsx
├── DiffEditor.stories.tsx
├── DiffPreview.stories.tsx
└── EditCommandInput.stories.tsx
```

## 7. 完了条件

- [ ] FileAttachmentButton の全ストーリーが作成されている
- [ ] FileContextList の全ストーリーが作成されている
- [ ] 既存コンポーネントのストーリーが作成/更新されている
- [ ] 全ストーリーがStorybookで正常に表示される
- [ ] アクセシビリティアドオンで重大な違反がない
- [ ] アクションログが正しく出力される
