# Storybook 設計書

## 1. 概要

workspace-chat-edit コンポーネントのStorybook Stories実装設計。

## 2. ディレクトリ構成

```
apps/desktop/src/renderer/features/workspace-chat-edit/
├── components/
│   ├── FileAttachmentButton.tsx
│   ├── FileContextList.tsx
│   └── ...
└── stories/
    ├── FileAttachmentButton.stories.tsx
    ├── FileContextList.stories.tsx
    ├── FileContextBadge.stories.tsx
    ├── FileContextDropZone.stories.tsx
    ├── ApplyControls.stories.tsx
    ├── DiffEditor.stories.tsx
    ├── DiffPreview.stories.tsx
    └── EditCommandInput.stories.tsx
```

## 3. 共通設定

### Meta設定テンプレート

```typescript
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Component> = {
  title: "workspace-chat-edit/Component",
  component: Component,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "コンポーネントの説明",
      },
    },
  },
  argTypes: {
    // Props定義
  },
};

export default meta;
type Story = StoryObj<typeof meta>;
```

### 共通Decorator

```typescript
// Store モック用 Decorator
const withMockStore = (initialState: Partial<ChatEditState>) => {
  return (Story: StoryFn) => {
    // 状態をリセット
    useStore.setState({
      ...initialState,
    });
    return <Story />;
  };
};

// Electron API モック用 Decorator
const withMockElectronAPI = () => {
  return (Story: StoryFn) => {
    (window as any).electronAPI = {
      fileSelection: {
        openDialog: async () => ({
          success: true,
          data: { canceled: false, filePaths: ['/mock/file.ts'] },
        }),
      },
    };
    return <Story />;
  };
};
```

## 4. FileAttachmentButton Stories

### Stories定義

```typescript
// Default
export const Default: Story = {
  args: {},
};

// Disabled
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

// WithMaxReached
export const WithMaxReached: Story = {
  decorators: [
    withMockStore({
      fileContexts: Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `file-${i}`,
          filePath: `/path/to/file${i}.ts`,
          fileName: `file${i}.ts`,
          content: "",
          language: "typescript",
          addedAt: new Date(),
          fileSize: 1000,
        })),
    }),
  ],
};

// Loading
export const Loading: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.click(button);
  },
};

// WithCallback
export const WithCallback: Story = {
  args: {
    onFilesSelected: action("onFilesSelected"),
  },
};
```

## 5. FileContextList Stories

### モックデータ

```typescript
const mockFiles: FileContext[] = [
  {
    id: "file-1",
    filePath: "/project/src/index.ts",
    fileName: "index.ts",
    content: "export default {}",
    language: "typescript",
    addedAt: new Date(),
    fileSize: 1024,
  },
  {
    id: "file-2",
    filePath: "/project/src/utils.ts",
    fileName: "utils.ts",
    content: "export const fn = () => {}",
    language: "typescript",
    addedAt: new Date(),
    fileSize: 2048,
  },
];

const manyMockFiles = Array(12)
  .fill(null)
  .map((_, i) => ({
    id: `file-${i}`,
    filePath: `/project/src/file${i}.ts`,
    fileName: `file${i}.ts`,
    content: "",
    language: "typescript",
    addedAt: new Date(),
    fileSize: 1000 * (i + 1),
  }));
```

### Stories定義

```typescript
// Empty
export const Empty: Story = {
  args: {
    contexts: [],
  },
};

// WithFiles
export const WithFiles: Story = {
  args: {
    contexts: mockFiles,
  },
};

// WithManyFiles
export const WithManyFiles: Story = {
  args: {
    contexts: manyMockFiles,
    maxHeight: "200px",
  },
};

// WithSelected
export const WithSelected: Story = {
  args: {
    contexts: mockFiles,
    selectedId: "file-1",
  },
};

// CustomEmpty
export const CustomEmpty: Story = {
  args: {
    contexts: [],
    emptyMessage: "ファイルをドラッグ&ドロップしてください",
  },
};
```

## 6. FileContextBadge Stories

```typescript
// Default
export const Default: Story = {
  args: {
    context: mockFiles[0],
  },
};

// Active
export const Active: Story = {
  args: {
    context: mockFiles[0],
    isActive: true,
  },
};

// WithRemove
export const WithRemove: Story = {
  args: {
    context: mockFiles[0],
    onRemove: action("onRemove"),
  },
};

// LongFileName
export const LongFileName: Story = {
  args: {
    context: {
      ...mockFiles[0],
      fileName: "very-long-file-name-that-should-be-truncated.typescript.tsx",
    },
  },
};
```

## 7. アクセシビリティテスト

### a11y アドオン設定

```typescript
// .storybook/main.ts
export default {
  addons: [
    "@storybook/addon-a11y",
    // ...
  ],
};
```

### Story内でのa11y設定

```typescript
export const Default: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
          { id: "label", enabled: true },
        ],
      },
    },
  },
};
```

## 8. インタラクションテスト

### play関数例

```typescript
export const ClickInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("ボタンをクリック", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
    });

    await step("結果を確認", async () => {
      await expect(canvas.getByText("ファイルを添付")).toBeInTheDocument();
    });
  },
};
```

## 9. ドキュメント設定

### autodocs設定

```typescript
const meta: Meta<typeof Component> = {
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
## 使用方法

\`\`\`tsx
import { FileAttachmentButton } from './FileAttachmentButton';

<FileAttachmentButton
  onFilesSelected={(paths) => console.log(paths)}
/>
\`\`\`

## Props

| Prop | 型 | 説明 |
|------|------|------|
| onFilesSelected | (paths: string[]) => void | 選択後コールバック |
`,
      },
    },
  },
};
```

## 10. 完了条件

- [x] ディレクトリ構成設計
- [x] 共通設定・Decorator設計
- [x] FileAttachmentButton Stories設計
- [x] FileContextList Stories設計
- [x] FileContextBadge Stories設計
- [x] アクセシビリティテスト設計
- [x] インタラクションテスト設計
- [x] ドキュメント設定
