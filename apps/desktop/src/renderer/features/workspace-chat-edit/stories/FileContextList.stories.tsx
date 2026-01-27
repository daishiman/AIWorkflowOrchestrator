/**
 * FileContextList Storybook Stories
 */

import type { Meta, StoryObj, StoryFn } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { within, userEvent } from "@storybook/test";
import { FileContextList } from "../components/FileContextList";
import { useStore } from "../../../store";
import type { FileContext } from "../types";

/**
 * Store モック用 Decorator
 */
const withMockStore = (
  initialState: Partial<{
    fileContexts: FileContext[];
    activeContextId: string | null;
  }>,
) => {
  return (Story: StoryFn) => {
    useStore.setState({
      fileContexts: [],
      activeContextId: null,
      isDragging: false,
      error: null,
      ...initialState,
    });
    return <Story />;
  };
};

/**
 * モックファイルデータ
 */
const mockFiles: FileContext[] = [
  {
    id: "file-1",
    filePath: "/project/src/index.ts",
    fileName: "index.ts",
    content: "export default {}",
    language: "typescript",
    addedAt: new Date("2026-01-24T00:00:00Z"),
    fileSize: 1024,
  },
  {
    id: "file-2",
    filePath: "/project/src/utils.ts",
    fileName: "utils.ts",
    content: "export const fn = () => {}",
    language: "typescript",
    addedAt: new Date("2026-01-24T00:00:00Z"),
    fileSize: 2048,
  },
  {
    id: "file-3",
    filePath: "/project/src/components/Button.tsx",
    fileName: "Button.tsx",
    content: "export const Button = () => <button />",
    language: "typescriptreact",
    addedAt: new Date("2026-01-24T00:00:00Z"),
    fileSize: 512,
  },
];

/**
 * 大量のモックファイル
 */
const manyMockFiles: FileContext[] = Array(12)
  .fill(null)
  .map((_, i) => ({
    id: `file-${i}`,
    filePath: `/project/src/file${i}.ts`,
    fileName: `file${i}.ts`,
    content: "",
    language: "typescript",
    addedAt: new Date("2026-01-24T00:00:00Z"),
    fileSize: 1000 * (i + 1),
  }));

const meta: Meta<typeof FileContextList> = {
  title: "workspace-chat-edit/FileContextList",
  component: FileContextList,
  tags: ["autodocs"],
  decorators: [withMockStore({})],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## 概要

添付ファイル一覧を表示するコンテナコンポーネント。

## 使用方法

\`\`\`tsx
import { FileContextList } from './FileContextList';

<FileContextList
  contexts={files}
  onRemove={(id) => console.log('remove', id)}
  onSelect={(id) => console.log('select', id)}
/>
\`\`\`

## Props

| Prop | 型 | デフォルト | 説明 |
|------|------|------|------|
| contexts | FileContext[] | storeから取得 | ファイル一覧 |
| onRemove | (id: string) => void | - | 削除コールバック |
| onSelect | (id: string) => void | - | 選択コールバック |
| selectedId | string | - | 選択中のID |
| emptyMessage | string | "ファイルが添付されていません" | 空状態メッセージ |
| maxHeight | string \\| number | - | 最大高さ |
| className | string | - | 追加CSSクラス |
`,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
          { id: "list", enabled: true },
        ],
      },
    },
  },
  argTypes: {
    contexts: {
      control: "object",
      description: "ファイルコンテキスト配列",
    },
    selectedId: {
      control: "text",
      description: "選択中のコンテキストID",
    },
    emptyMessage: {
      control: "text",
      description: "空状態のメッセージ",
    },
    maxHeight: {
      control: "text",
      description: "最大高さ（例: '200px'）",
    },
    onRemove: {
      action: "onRemove",
      description: "削除コールバック",
    },
    onSelect: {
      action: "onSelect",
      description: "選択コールバック",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 空状態
 */
export const Empty: Story = {
  args: {
    contexts: [],
  },
};

/**
 * ファイル一覧表示
 */
export const WithFiles: Story = {
  args: {
    contexts: mockFiles,
  },
};

/**
 * 大量のファイル（スクロール）
 */
export const WithManyFiles: Story = {
  args: {
    contexts: manyMockFiles,
    maxHeight: "200px",
  },
};

/**
 * 選択状態
 */
export const WithSelected: Story = {
  args: {
    contexts: mockFiles,
    selectedId: "file-1",
  },
};

/**
 * カスタム空メッセージ
 */
export const CustomEmptyMessage: Story = {
  args: {
    contexts: [],
    emptyMessage: "ファイルをドラッグ&ドロップしてください",
  },
};

/**
 * コールバック付き
 */
export const WithCallbacks: Story = {
  args: {
    contexts: mockFiles,
    onRemove: action("onRemove"),
    onSelect: action("onSelect"),
  },
};

/**
 * インタラクションテスト - クリック選択
 */
export const SelectInteraction: Story = {
  args: {
    contexts: mockFiles,
    onSelect: action("onSelect"),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("最初のファイルをクリック", async () => {
      const firstBadge = canvas.getByText("index.ts");
      await userEvent.click(firstBadge);
    });
  },
};

/**
 * インタラクションテスト - 削除
 */
export const RemoveInteraction: Story = {
  args: {
    contexts: mockFiles,
    onRemove: action("onRemove"),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("削除ボタンをクリック", async () => {
      const removeButtons = canvas.getAllByRole("button", { name: /削除/ });
      await userEvent.click(removeButtons[0]);
    });
  },
};

/**
 * キーボードナビゲーション
 */
export const KeyboardNavigation: Story = {
  args: {
    contexts: mockFiles,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("最初のアイテムにフォーカス", async () => {
      const firstItem = canvas.getAllByRole("listitem")[0];
      firstItem.focus();
    });

    await step("Tabで次のアイテムへ", async () => {
      await userEvent.tab();
    });
  },
};
