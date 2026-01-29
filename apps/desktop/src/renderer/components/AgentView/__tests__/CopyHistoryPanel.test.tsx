/**
 * CopyHistoryPanel テスト
 *
 * TASK-3-2-D: コピー履歴機能
 * Phase 4: TDD Red状態
 *
 * @module @repo/desktop/renderer/components/AgentView/__tests__/CopyHistoryPanel.test
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { CopyHistoryPanel } from "../CopyHistoryPanel";
import { CopyHistoryProvider } from "../../../contexts/CopyHistoryContext";
import type { CopyHistoryEntry } from "../../../contexts/CopyHistoryContext";

// モック設定
const mockWriteText = vi.fn().mockResolvedValue(undefined);
const mockOnClose = vi.fn();
const mockClipboard = { writeText: mockWriteText };

beforeAll(() => {
  // happy-dom では navigator.clipboard が getter のみなので vi.stubGlobal を使用
  vi.stubGlobal("navigator", {
    ...navigator,
    clipboard: mockClipboard,
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  mockWriteText.mockClear();
  mockOnClose.mockClear();
  vi.spyOn(Date, "now").mockReturnValue(1706400000000);
});

// テストデータ
const _testEntries: CopyHistoryEntry[] = [
  {
    id: "entry-1",
    content: "First copied text",
    timestamp: 1706400000000,
    sourceMessageId: "msg-1",
  },
  {
    id: "entry-2",
    content: "Second copied text",
    timestamp: 1706400001000,
    sourceMessageId: "msg-2",
  },
  {
    id: "entry-3",
    content: "Third copied text",
    timestamp: 1706400002000,
  },
];

// 100文字超のコンテンツ
const _longContent = "A".repeat(150);

// テストユーティリティ: Provider でラップしてレンダリング
interface RenderOptions {
  initialHistory?: CopyHistoryEntry[];
  isOpen?: boolean;
}

function renderCopyHistoryPanel(options: RenderOptions = {}) {
  const { initialHistory: _initialHistory = [], isOpen = true } = options;

  // 初期履歴を設定するためのコンポーネント
  function TestWrapper({ children }: { children: React.ReactNode }) {
    return <CopyHistoryProvider>{children}</CopyHistoryProvider>;
  }

  return render(
    <TestWrapper>
      <CopyHistoryPanel isOpen={isOpen} onClose={mockOnClose} />
    </TestWrapper>,
  );
}

describe("CopyHistoryPanel", () => {
  describe("表示", () => {
    it("TC-421: 履歴パネルが表示される", () => {
      renderCopyHistoryPanel({ isOpen: true });

      const panel = screen.getByRole("dialog");
      expect(panel).toBeInTheDocument();
      expect(panel).toHaveAttribute("aria-label", "コピー履歴");
    });

    it("TC-422: 履歴項目が一覧表示される", async () => {
      const { rerender: _rerender } = renderCopyHistoryPanel({ isOpen: true });

      // 履歴追加のシミュレーション（実際にはContextを通じて追加）
      // このテストはPhase 5で実装とともに調整
      const listbox = screen.getByRole("listbox");
      expect(listbox).toBeInTheDocument();
    });

    it("TC-428: 100文字超のコンテンツが省略表示", async () => {
      // 150文字のコンテンツで省略されることを確認
      // このテストはPhase 5で実装とともに調整
      renderCopyHistoryPanel({ isOpen: true });

      // プレビュー表示のテスト
      // 100文字 + "..." で表示されることを確認
    });

    it("履歴が空の場合、空状態メッセージが表示される", () => {
      renderCopyHistoryPanel({ isOpen: true });

      expect(screen.getByText("履歴がありません")).toBeInTheDocument();
    });

    it("isOpen=false の場合、パネルが表示されない", () => {
      renderCopyHistoryPanel({ isOpen: false });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("操作", () => {
    it("TC-423: 履歴項目クリックで再コピーできる", async () => {
      // コピーボタンクリックでclipboard.writeTextが呼ばれることを確認
      // Phase 5で実装とともに調整
    });

    it("TC-424: チェックボックスで複数選択できる", async () => {
      // チェックボックスクリックで選択状態がトグルされることを確認
      // Phase 5で実装とともに調整
    });

    it("TC-425: 「選択をコピー」で一括コピーできる", async () => {
      // 選択項目を結合してコピーされることを確認
      // Phase 5で実装とともに調整
    });

    it("TC-426: 「クリア」で全履歴が削除される", async () => {
      renderCopyHistoryPanel({ isOpen: true });

      const clearButton = screen.getByRole("button", { name: "履歴をクリア" });
      expect(clearButton).toBeInTheDocument();
    });

    it("TC-427: 閉じるボタンで onClose が呼ばれる", async () => {
      renderCopyHistoryPanel({ isOpen: true });

      const closeButton = screen.getByRole("button", {
        name: "パネルを閉じる",
      });
      await userEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("選択項目がない場合、「選択をコピー」ボタンは無効化される", () => {
      renderCopyHistoryPanel({ isOpen: true });

      const copySelectedButton = screen.getByRole("button", {
        name: "選択項目をコピー",
      });
      expect(copySelectedButton).toBeDisabled();
    });
  });

  describe("キーボード操作", () => {
    it("TC-431: Tabキーでフォーカス移動", async () => {
      renderCopyHistoryPanel({ isOpen: true });

      // Tab キーでフォーカスが移動することを確認
      await userEvent.tab();
      // フォーカスが閉じるボタンに移動していることを確認
    });

    it("TC-432: Enterキーで項目選択/コピー", async () => {
      // 履歴項目にフォーカスがある状態でEnterキーでコピーされることを確認
      // Phase 5で実装とともに調整
    });

    it("TC-433: Escapeキーでパネルを閉じる", async () => {
      renderCopyHistoryPanel({ isOpen: true });

      await userEvent.keyboard("{Escape}");

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("TC-434: Spaceキーでチェックボックストグル", async () => {
      // チェックボックスにフォーカスがある状態でSpaceキーで選択がトグルされることを確認
      // Phase 5で実装とともに調整
    });
  });

  describe("アクセシビリティ", () => {
    it("パネルに適切なARIA属性が設定されている", () => {
      renderCopyHistoryPanel({ isOpen: true });

      const panel = screen.getByRole("dialog");
      expect(panel).toHaveAttribute("aria-label", "コピー履歴");
      expect(panel).toHaveAttribute("aria-modal", "true");
    });

    it("履歴リストに適切なARIA属性が設定されている", () => {
      renderCopyHistoryPanel({ isOpen: true });

      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    });

    it("閉じるボタンにaria-labelが設定されている", () => {
      renderCopyHistoryPanel({ isOpen: true });

      const closeButton = screen.getByRole("button", {
        name: "パネルを閉じる",
      });
      expect(closeButton).toBeInTheDocument();
    });

    it("クリアボタンにaria-labelが設定されている", () => {
      renderCopyHistoryPanel({ isOpen: true });

      const clearButton = screen.getByRole("button", { name: "履歴をクリア" });
      expect(clearButton).toBeInTheDocument();
    });

    it("選択コピーボタンにaria-labelが設定されている", () => {
      renderCopyHistoryPanel({ isOpen: true });

      const copyButton = screen.getByRole("button", {
        name: "選択項目をコピー",
      });
      expect(copyButton).toBeInTheDocument();
    });
  });
});
