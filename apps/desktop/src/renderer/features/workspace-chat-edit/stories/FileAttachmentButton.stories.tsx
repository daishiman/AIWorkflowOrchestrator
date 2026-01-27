/**
 * FileAttachmentButton Storybook Stories
 */

import type { Meta, StoryObj, StoryFn } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { expect, within, userEvent } from "@storybook/test";
import { FileAttachmentButton } from "../components/FileAttachmentButton";
import { useStore } from "../../../store";
import type { FileContext } from "../types";

/**
 * Store モック用 Decorator
 */
const withMockStore = (
  initialState: Partial<{ fileContexts: FileContext[]; error: string | null }>,
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
 * Electron API モック用 Decorator
 */
const withMockElectronAPI = () => {
  return (Story: StoryFn) => {
    (
      window as unknown as {
        electronAPI: {
          fileSelection: {
            openDialog: () => Promise<{
              success: boolean;
              data: { canceled: boolean; filePaths: string[] };
            }>;
          };
        };
      }
    ).electronAPI = {
      fileSelection: {
        openDialog: async () => ({
          success: true,
          data: { canceled: false, filePaths: ["/mock/file.ts"] },
        }),
      },
    };
    return <Story />;
  };
};

const meta: Meta<typeof FileAttachmentButton> = {
  title: "workspace-chat-edit/FileAttachmentButton",
  component: FileAttachmentButton,
  tags: ["autodocs"],
  decorators: [withMockElectronAPI(), withMockStore({})],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## 概要

ファイル選択ダイアログを開くボタンコンポーネント。

## 使用方法

\`\`\`tsx
import { FileAttachmentButton } from './FileAttachmentButton';

<FileAttachmentButton
  onFilesSelected={(paths) => console.log(paths)}
/>
\`\`\`

## Props

| Prop | 型 | デフォルト | 説明 |
|------|------|------|------|
| onFilesSelected | (paths: string[]) => void | - | 選択後コールバック |
| multiple | boolean | true | 複数選択許可 |
| accept | string[] | ['*'] | 許可する拡張子 |
| maxFiles | number | 10 | 最大選択数 |
| disabled | boolean | false | 無効化フラグ |
| className | string | - | 追加CSSクラス |
| children | ReactNode | "ファイルを添付" | ボタンテキスト |
`,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
          { id: "label", enabled: true },
        ],
      },
    },
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "ボタンを無効化",
    },
    multiple: {
      control: "boolean",
      description: "複数ファイル選択を許可",
    },
    maxFiles: {
      control: { type: "number", min: 1, max: 10 },
      description: "最大選択ファイル数",
    },
    onFilesSelected: {
      action: "onFilesSelected",
      description: "ファイル選択後のコールバック",
    },
    className: {
      control: "text",
      description: "追加CSSクラス",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態
 */
export const Default: Story = {
  args: {},
};

/**
 * 無効化状態
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/**
 * 最大ファイル数到達状態
 */
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

/**
 * カスタムテキスト
 */
export const WithCustomText: Story = {
  args: {
    children: "ファイルを追加",
  },
};

/**
 * コールバック付き
 */
export const WithCallback: Story = {
  args: {
    onFilesSelected: action("onFilesSelected"),
  },
};

/**
 * インタラクションテスト - クリック
 */
export const ClickInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("ボタンをクリック", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
    });

    await step("ボタンが存在することを確認", async () => {
      await expect(canvas.getByText("ファイルを添付")).toBeInTheDocument();
    });
  },
};

/**
 * キーボード操作テスト
 */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("ボタンにフォーカス", async () => {
      const button = canvas.getByRole("button");
      button.focus();
    });

    await step("Enterキーで操作", async () => {
      await userEvent.keyboard("{Enter}");
    });
  },
};
