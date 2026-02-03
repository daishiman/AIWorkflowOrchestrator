/**
 * editorSelection ユニットテスト
 *
 * Monaco Editor選択範囲取得ユーティリティのテスト
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  setActiveEditor,
  getActiveEditor,
  getEditorSelection,
} from "../editorSelection";

// Monaco Editor型のモック
interface MockSelection {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  isEmpty: () => boolean;
}

interface MockModel {
  getValueInRange: (selection: MockSelection) => string;
}

interface MockEditor {
  getSelection: () => MockSelection | null;
  getModel: () => MockModel | null;
}

describe("editorSelection", () => {
  beforeEach(() => {
    // 各テスト前にエディタをリセット
    setActiveEditor(null);
  });

  describe("setActiveEditor", () => {
    it("エディタを設定できる", () => {
      const mockEditor: MockEditor = {
        getSelection: vi.fn(),
        getModel: vi.fn(),
      };

      setActiveEditor(mockEditor);

      expect(getActiveEditor()).toBe(mockEditor);
    });

    it("nullでエディタをクリアできる", () => {
      const mockEditor: MockEditor = {
        getSelection: vi.fn(),
        getModel: vi.fn(),
      };

      setActiveEditor(mockEditor);
      setActiveEditor(null);

      expect(getActiveEditor()).toBeNull();
    });
  });

  describe("getActiveEditor", () => {
    it("設定したエディタを取得できる", () => {
      const mockEditor: MockEditor = {
        getSelection: vi.fn(),
        getModel: vi.fn(),
      };

      setActiveEditor(mockEditor);

      expect(getActiveEditor()).toBe(mockEditor);
    });

    it("エディタ未設定時はnullを返す", () => {
      expect(getActiveEditor()).toBeNull();
    });
  });

  describe("getEditorSelection", () => {
    it("選択範囲がある時にTextSelectionを返す", () => {
      const mockSelection: MockSelection = {
        startLineNumber: 1,
        startColumn: 5,
        endLineNumber: 3,
        endColumn: 10,
        isEmpty: () => false,
      };

      const mockModel: MockModel = {
        getValueInRange: vi.fn().mockReturnValue("selected text"),
      };

      const mockEditor: MockEditor = {
        getSelection: vi.fn().mockReturnValue(mockSelection),
        getModel: vi.fn().mockReturnValue(mockModel),
      };

      setActiveEditor(mockEditor);

      const result = getEditorSelection();

      expect(result).toEqual({
        startLine: 1,
        startColumn: 5,
        endLine: 3,
        endColumn: 10,
        selectedText: "selected text",
      });
    });

    it("選択がない時（カーソルのみ）にnullを返す", () => {
      const mockSelection: MockSelection = {
        startLineNumber: 1,
        startColumn: 5,
        endLineNumber: 1,
        endColumn: 5,
        isEmpty: () => true,
      };

      const mockModel: MockModel = {
        getValueInRange: vi.fn().mockReturnValue(""),
      };

      const mockEditor: MockEditor = {
        getSelection: vi.fn().mockReturnValue(mockSelection),
        getModel: vi.fn().mockReturnValue(mockModel),
      };

      setActiveEditor(mockEditor);

      const result = getEditorSelection();

      expect(result).toBeNull();
    });

    it("エディタがnullの時にnullを返す", () => {
      setActiveEditor(null);

      const result = getEditorSelection();

      expect(result).toBeNull();
    });

    it("getSelection()がnullを返す時にnullを返す", () => {
      const mockEditor: MockEditor = {
        getSelection: vi.fn().mockReturnValue(null),
        getModel: vi.fn(),
      };

      setActiveEditor(mockEditor);

      const result = getEditorSelection();

      expect(result).toBeNull();
    });

    it("getModel()がnullを返す時にnullを返す", () => {
      const mockSelection: MockSelection = {
        startLineNumber: 1,
        startColumn: 5,
        endLineNumber: 3,
        endColumn: 10,
        isEmpty: () => false,
      };

      const mockEditor: MockEditor = {
        getSelection: vi.fn().mockReturnValue(mockSelection),
        getModel: vi.fn().mockReturnValue(null),
      };

      setActiveEditor(mockEditor);

      const result = getEditorSelection();

      expect(result).toBeNull();
    });

    it("複数行選択時にstartLine < endLineになる", () => {
      const mockSelection: MockSelection = {
        startLineNumber: 5,
        startColumn: 1,
        endLineNumber: 10,
        endColumn: 20,
        isEmpty: () => false,
      };

      const mockModel: MockModel = {
        getValueInRange: vi.fn().mockReturnValue("multi\nline\ntext"),
      };

      const mockEditor: MockEditor = {
        getSelection: vi.fn().mockReturnValue(mockSelection),
        getModel: vi.fn().mockReturnValue(mockModel),
      };

      setActiveEditor(mockEditor);

      const result = getEditorSelection();

      expect(result).not.toBeNull();
      expect(result!.startLine).toBeLessThan(result!.endLine);
      expect(result!.startLine).toBe(5);
      expect(result!.endLine).toBe(10);
    });

    it("単一行内選択時に正しいカラム番号を返す", () => {
      const mockSelection: MockSelection = {
        startLineNumber: 3,
        startColumn: 5,
        endLineNumber: 3,
        endColumn: 15,
        isEmpty: () => false,
      };

      const mockModel: MockModel = {
        getValueInRange: vi.fn().mockReturnValue("single line"),
      };

      const mockEditor: MockEditor = {
        getSelection: vi.fn().mockReturnValue(mockSelection),
        getModel: vi.fn().mockReturnValue(mockModel),
      };

      setActiveEditor(mockEditor);

      const result = getEditorSelection();

      expect(result).not.toBeNull();
      expect(result!.startLine).toBe(result!.endLine);
      expect(result!.startColumn).toBeLessThan(result!.endColumn);
      expect(result!.startColumn).toBe(5);
      expect(result!.endColumn).toBe(15);
    });

    it("selectedTextが選択範囲の文字列と一致する", () => {
      const expectedText = "const foo = 'bar';";
      const mockSelection: MockSelection = {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 19,
        isEmpty: () => false,
      };

      const mockModel: MockModel = {
        getValueInRange: vi.fn().mockReturnValue(expectedText),
      };

      const mockEditor: MockEditor = {
        getSelection: vi.fn().mockReturnValue(mockSelection),
        getModel: vi.fn().mockReturnValue(mockModel),
      };

      setActiveEditor(mockEditor);

      const result = getEditorSelection();

      expect(result).not.toBeNull();
      expect(result!.selectedText).toBe(expectedText);
      expect(mockModel.getValueInRange).toHaveBeenCalledWith(mockSelection);
    });

    it("日本語テキストを正しく取得できる", () => {
      const expectedText = "これは日本語テキストです";
      const mockSelection: MockSelection = {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 13,
        isEmpty: () => false,
      };

      const mockModel: MockModel = {
        getValueInRange: vi.fn().mockReturnValue(expectedText),
      };

      const mockEditor: MockEditor = {
        getSelection: vi.fn().mockReturnValue(mockSelection),
        getModel: vi.fn().mockReturnValue(mockModel),
      };

      setActiveEditor(mockEditor);

      const result = getEditorSelection();

      expect(result).not.toBeNull();
      expect(result!.selectedText).toBe(expectedText);
    });

    it("1文字のみの選択を正しく取得できる", () => {
      const mockSelection: MockSelection = {
        startLineNumber: 1,
        startColumn: 5,
        endLineNumber: 1,
        endColumn: 6,
        isEmpty: () => false,
      };

      const mockModel: MockModel = {
        getValueInRange: vi.fn().mockReturnValue("a"),
      };

      const mockEditor: MockEditor = {
        getSelection: vi.fn().mockReturnValue(mockSelection),
        getModel: vi.fn().mockReturnValue(mockModel),
      };

      setActiveEditor(mockEditor);

      const result = getEditorSelection();

      expect(result).not.toBeNull();
      expect(result!.selectedText).toBe("a");
      expect(result!.startColumn).toBe(5);
      expect(result!.endColumn).toBe(6);
    });
  });
});
