import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { SkillMetadata, SkillName } from "@repo/shared/types/skill";
import { SkillCard } from "../components/SkillCard";

// --- テストデータファクトリ ---

const createMockSkillMetadata = (
  overrides: Partial<SkillMetadata> = {},
): SkillMetadata => ({
  name: "test-skill" as SkillName,
  description: "テスト用スキル",
  path: ".claude/skills/test-skill/SKILL.md",
  allowedTools: ["Read", "Write"],
  updatedAt: new Date("2026-01-01"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
  ...overrides,
});

describe("SkillCard", () => {
  const mockOnSelect = vi.fn();
  const mockOnAdd = vi.fn();
  const defaultSkill = createMockSkillMetadata({
    name: "my-skill" as SkillName,
    description: "スキルの説明文です",
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("スキル名と説明が表示される", () => {
    render(
      <SkillCard
        skill={defaultSkill}
        isAdded={false}
        onSelect={mockOnSelect}
        onAdd={mockOnAdd}
      />,
    );

    expect(screen.getByText("my-skill")).toBeInTheDocument();
    expect(screen.getByText("スキルの説明文です")).toBeInTheDocument();
  });

  it("未追加時にAddButtonが「追加する」状態で表示される", () => {
    render(
      <SkillCard
        skill={defaultSkill}
        isAdded={false}
        onSelect={mockOnSelect}
        onAdd={mockOnAdd}
      />,
    );

    expect(screen.getByText("追加する")).toBeInTheDocument();
  });

  it("追加済み時にAddButtonが「追加済み!」状態で表示される", () => {
    render(
      <SkillCard
        skill={defaultSkill}
        isAdded={true}
        onSelect={mockOnSelect}
        onAdd={mockOnAdd}
      />,
    );

    expect(screen.getByText(/追加済み/)).toBeInTheDocument();
  });

  it("カードクリックでonSelectが呼ばれる（skillNameを引数に）", () => {
    render(
      <SkillCard
        skill={defaultSkill}
        isAdded={false}
        onSelect={mockOnSelect}
        onAdd={mockOnAdd}
      />,
    );

    // カード全体をクリック
    const card =
      screen.getByText("my-skill").closest("[tabindex]") ??
      screen.getByText("my-skill").parentElement;
    if (card) {
      fireEvent.click(card);
    }

    expect(mockOnSelect).toHaveBeenCalledWith("my-skill");
  });

  it("追加ボタンクリックでonAddが呼ばれる（イベント伝播停止）", () => {
    render(
      <SkillCard
        skill={defaultSkill}
        isAdded={false}
        onSelect={mockOnSelect}
        onAdd={mockOnAdd}
      />,
    );

    const addButton = screen.getByText("追加する");
    fireEvent.click(addButton);

    expect(mockOnAdd).toHaveBeenCalledWith("my-skill");
    // イベント伝播停止: onSelectは呼ばれないことを検証
    // （AddButton のクリックハンドラ内で stopPropagation する設計）
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it("フォーカスリングが表示される（tabIndex=0）", () => {
    render(
      <SkillCard
        skill={defaultSkill}
        isAdded={false}
        onSelect={mockOnSelect}
        onAdd={mockOnAdd}
      />,
    );

    // カード要素に tabIndex=0 が設定されている
    const card = screen.getByText("my-skill").closest("[tabindex='0']");
    expect(card).not.toBeNull();
  });

  it("説明文が1行で切り捨てられる（truncateクラス）", () => {
    const longDescSkill = createMockSkillMetadata({
      name: "long-desc-skill" as SkillName,
      description:
        "これは非常に長い説明文で、カード上では1行に切り捨てられて表示されるべきテキストです。余分なテキストは省略されます。",
    });

    render(
      <SkillCard
        skill={longDescSkill}
        isAdded={false}
        onSelect={mockOnSelect}
        onAdd={mockOnAdd}
      />,
    );

    const descElement = screen.getByText(longDescSkill.description);
    // truncate または line-clamp-1 クラスが適用されている
    expect(
      descElement.className.includes("truncate") ||
        descElement.className.includes("line-clamp"),
    ).toBe(true);
  });

  it("Enter キーで onSelect が呼ばれる", () => {
    render(
      <SkillCard
        skill={defaultSkill}
        isAdded={false}
        onSelect={mockOnSelect}
        onAdd={mockOnAdd}
      />,
    );

    const card = screen.getByTestId("skill-card-my-skill");
    fireEvent.keyDown(card, { key: "Enter" });

    expect(mockOnSelect).toHaveBeenCalledWith("my-skill");
  });

  it("Space キーで onSelect が呼ばれる（e.preventDefault も確認）", () => {
    render(
      <SkillCard
        skill={defaultSkill}
        isAdded={false}
        onSelect={mockOnSelect}
        onAdd={mockOnAdd}
      />,
    );

    const card = screen.getByTestId("skill-card-my-skill");
    const event = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    card.dispatchEvent(event);

    expect(mockOnSelect).toHaveBeenCalledWith("my-skill");
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("getFileCount が正しいファイル数を返す（フッターに表示）", () => {
    const skillWithFiles = createMockSkillMetadata({
      name: "file-count-skill" as SkillName,
      agents: [
        {
          filename: "a.md",
          relativePath: "agents/a.md",
          description: "agent",
          size: 100,
        },
      ],
      references: [
        {
          filename: "r.md",
          relativePath: "references/r.md",
          description: "ref",
          size: 100,
        },
        {
          filename: "r2.md",
          relativePath: "references/r2.md",
          description: "ref2",
          size: 100,
        },
      ],
      indexes: [
        {
          filename: "i.md",
          relativePath: "indexes/i.md",
          description: "idx",
          size: 100,
        },
      ],
      otherFiles: [
        { filename: "o.json", size: 50, type: "other" },
        { filename: "o2.json", size: 50, type: "other" },
      ],
    });

    render(
      <SkillCard
        skill={skillWithFiles}
        isAdded={false}
        onSelect={mockOnSelect}
        onAdd={mockOnAdd}
      />,
    );

    // agents(1) + references(2) + indexes(1) + otherFiles(2) = 6
    expect(screen.getByText("6ファイル")).toBeInTheDocument();
  });

  it("AddButtonラッパーのonKeyDownでイベント伝播が停止される", () => {
    render(
      <SkillCard
        skill={defaultSkill}
        isAdded={false}
        onSelect={mockOnSelect}
        onAdd={mockOnAdd}
      />,
    );

    // AddButton を包む div[role="presentation"] のキーダウンイベント
    const presentationDiv = screen
      .getByTestId("add-button")
      .closest('[role="presentation"]');
    expect(presentationDiv).not.toBeNull();

    if (presentationDiv) {
      const stopPropagationSpy = vi.fn();
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      });
      Object.defineProperty(event, "stopPropagation", {
        value: stopPropagationSpy,
      });
      presentationDiv.dispatchEvent(event);
      expect(stopPropagationSpy).toHaveBeenCalled();
    }
  });

  it("ファイル数が0の場合はファイル数テキストが空", () => {
    const skillNoFiles = createMockSkillMetadata({
      name: "no-files-skill" as SkillName,
      agents: [],
      references: [],
      indexes: [],
      otherFiles: [],
    });

    render(
      <SkillCard
        skill={skillNoFiles}
        isAdded={false}
        onSelect={mockOnSelect}
        onAdd={mockOnAdd}
      />,
    );

    expect(screen.queryByText(/ファイル/)).toBeNull();
  });
});
