/**
 * FileContextBadge Storybook Stories
 */

import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { within, userEvent } from "@storybook/test";
import { FileContextBadge } from "../components/FileContextBadge";
import type { FileContext } from "../types";

/**
 * モックファイルデータ
 */
const mockFile: FileContext = {
  id: "file-1",
  filePath: "/project/src/index.ts",
  fileName: "index.ts",
  content: "export default {}",
  language: "typescript",
  addedAt: new Date("2026-01-24T00:00:00Z"),
  fileSize: 1024,
};

const meta: Meta<typeof FileContextBadge> = {
  title: "workspace-chat-edit/FileContextBadge",
  component: FileContextBadge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
## 概要

ファイルコンテキストをバッジとして表示するコンポーネント。

## 使用方法

\`\`\`tsx
import { FileContextBadge } from './FileContextBadge';

<FileContextBadge
  context={file}
  isActive={false}
  onRemove={() => console.log('remove')}
  onSelect={() => console.log('select')}
/>
\`\`\`

## Props

| Prop | 型 | デフォルト | 説明 |
|------|------|------|------|
| context | FileContext | - | ファイルコンテキスト |
| isActive | boolean | false | アクティブ状態 |
| onRemove | () => void | - | 削除コールバック |
| onSelect | () => void | - | 選択コールバック |
| showTooltip | boolean | true | ツールチップ表示 |
| className | string | - | 追加CSSクラス |
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
    context: {
      control: "object",
      description: "ファイルコンテキスト",
    },
    isActive: {
      control: "boolean",
      description: "アクティブ（選択）状態",
    },
    showTooltip: {
      control: "boolean",
      description: "ツールチップを表示するか",
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
 * デフォルト状態
 */
export const Default: Story = {
  args: {
    context: mockFile,
  },
};

/**
 * アクティブ状態
 */
export const Active: Story = {
  args: {
    context: mockFile,
    isActive: true,
  },
};

/**
 * 削除ボタン付き
 */
export const WithRemove: Story = {
  args: {
    context: mockFile,
    onRemove: action("onRemove"),
  },
};

/**
 * 長いファイル名
 */
export const LongFileName: Story = {
  args: {
    context: {
      ...mockFile,
      fileName: "very-long-file-name-that-should-be-truncated.typescript.tsx",
      filePath:
        "/project/src/components/very-long-file-name-that-should-be-truncated.typescript.tsx",
    },
  },
};

/**
 * 選択とコールバック
 */
export const WithCallbacks: Story = {
  args: {
    context: mockFile,
    onRemove: action("onRemove"),
    onSelect: action("onSelect"),
  },
};

/**
 * ツールチップなし
 */
export const WithoutTooltip: Story = {
  args: {
    context: mockFile,
    showTooltip: false,
  },
};

/**
 * インタラクションテスト - クリック
 */
export const ClickInteraction: Story = {
  args: {
    context: mockFile,
    onSelect: action("onSelect"),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("バッジをクリック", async () => {
      const badge = canvas.getByRole("listitem");
      await userEvent.click(badge);
    });
  },
};

/**
 * インタラクションテスト - 削除
 */
export const RemoveInteraction: Story = {
  args: {
    context: mockFile,
    onRemove: action("onRemove"),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("削除ボタンをクリック", async () => {
      const removeButton = canvas.getByRole("button", { name: /削除/ });
      await userEvent.click(removeButton);
    });
  },
};

/**
 * キーボード操作テスト
 */
export const KeyboardNavigation: Story = {
  args: {
    context: mockFile,
    onSelect: action("onSelect"),
    onRemove: action("onRemove"),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("バッジにフォーカス", async () => {
      const badge = canvas.getByRole("listitem");
      badge.focus();
    });

    await step("Enterキーで選択", async () => {
      await userEvent.keyboard("{Enter}");
    });
  },
};
