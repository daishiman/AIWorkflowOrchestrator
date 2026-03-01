import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { SkillMetadata, SkillName } from "@repo/shared/types/skill";
import { FeaturedSection } from "../components/FeaturedSection/FeaturedSection";
import { FeaturedCard } from "../components/FeaturedSection/FeaturedCard";

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

describe("FeaturedSection", () => {
  const mockOnAdd = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("「おすすめ」ヘッダーが表示される", () => {
    const skills = [
      createMockSkillMetadata({ name: "featured-1" as SkillName }),
    ];

    render(
      <FeaturedSection
        skills={skills}
        importedSkillNames={[]}
        onAdd={mockOnAdd}
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText(/おすすめ/)).toBeInTheDocument();
  });

  it("スキルカードが最大3枚表示される", () => {
    const skills = [
      createMockSkillMetadata({
        name: "featured-1" as SkillName,
        description: "おすすめスキル1",
      }),
      createMockSkillMetadata({
        name: "featured-2" as SkillName,
        description: "おすすめスキル2",
      }),
      createMockSkillMetadata({
        name: "featured-3" as SkillName,
        description: "おすすめスキル3",
      }),
    ];

    render(
      <FeaturedSection
        skills={skills}
        importedSkillNames={[]}
        onAdd={mockOnAdd}
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText("featured-1")).toBeInTheDocument();
    expect(screen.getByText("featured-2")).toBeInTheDocument();
    expect(screen.getByText("featured-3")).toBeInTheDocument();
  });

  it("空配列で非表示になる", () => {
    const { container } = render(
      <FeaturedSection
        skills={[]}
        importedSkillNames={[]}
        onAdd={mockOnAdd}
        onSelect={mockOnSelect}
      />,
    );

    // 空配列の場合、セクション自体がレンダリングされない
    expect(container.firstChild).toBeNull();
  });

  it("各カードのonAddが正しいskillNameで呼ばれる", () => {
    const skills = [
      createMockSkillMetadata({
        name: "add-test-skill" as SkillName,
        description: "追加テスト用",
      }),
    ];

    render(
      <FeaturedSection
        skills={skills}
        importedSkillNames={[]}
        onAdd={mockOnAdd}
        onSelect={mockOnSelect}
      />,
    );

    // AddButton（「追加する」テキスト）をクリック
    const addButton = screen.getByText("追加する");
    fireEvent.click(addButton);

    expect(mockOnAdd).toHaveBeenCalledWith("add-test-skill");
  });

  it("各カードのonSelectが正しいskillNameで呼ばれる", () => {
    const skills = [
      createMockSkillMetadata({
        name: "select-test-skill" as SkillName,
        description: "選択テスト用",
      }),
    ];

    render(
      <FeaturedSection
        skills={skills}
        importedSkillNames={[]}
        onAdd={mockOnAdd}
        onSelect={mockOnSelect}
      />,
    );

    // カード本体（スキル名テキスト部分のカード）をクリック
    const cardElement =
      screen.getByText("select-test-skill").closest("[tabindex]") ??
      screen.getByText("select-test-skill").parentElement;
    if (cardElement) {
      fireEvent.click(cardElement);
    }

    expect(mockOnSelect).toHaveBeenCalledWith("select-test-skill");
  });
});

describe("FeaturedCard", () => {
  const mockOnAdd = vi.fn();
  const mockOnSelect = vi.fn();
  const defaultSkill = createMockSkillMetadata({
    name: "featured-skill" as SkillName,
    description: "おすすめスキル",
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Enter キーで onSelect が呼ばれる", () => {
    render(
      <FeaturedCard
        skill={defaultSkill}
        isAdding={false}
        isAdded={false}
        onAdd={mockOnAdd}
        onSelect={mockOnSelect}
        index={0}
      />,
    );

    const card = screen.getByTestId("featured-card-featured-skill");
    fireEvent.keyDown(card, { key: "Enter" });

    expect(mockOnSelect).toHaveBeenCalledWith("featured-skill");
  });

  it("Space キーで onSelect が呼ばれる", () => {
    render(
      <FeaturedCard
        skill={defaultSkill}
        isAdding={false}
        isAdded={false}
        onAdd={mockOnAdd}
        onSelect={mockOnSelect}
        index={0}
      />,
    );

    const card = screen.getByTestId("featured-card-featured-skill");
    const event = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    card.dispatchEvent(event);

    expect(mockOnSelect).toHaveBeenCalledWith("featured-skill");
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("resolveButtonStatus: isAdding=true で processing 状態", () => {
    render(
      <FeaturedCard
        skill={defaultSkill}
        isAdding={true}
        isAdded={false}
        onAdd={mockOnAdd}
        onSelect={mockOnSelect}
        index={0}
      />,
    );

    // processing 状態では「追加中...」テキストまたはスピナーが表示される
    const addButton = screen.getByTestId("add-button");
    expect(addButton).toHaveAttribute("aria-busy", "true");
  });

  it("resolveButtonStatus: isAdded=true で success 状態", () => {
    render(
      <FeaturedCard
        skill={defaultSkill}
        isAdding={false}
        isAdded={true}
        onAdd={mockOnAdd}
        onSelect={mockOnSelect}
        index={0}
      />,
    );

    // success 状態ではボタンが無効化される
    const addButton = screen.getByTestId("add-button");
    expect(addButton).toBeDisabled();
  });

  it("resolveButtonStatus: isAdding=false, isAdded=false で idle 状態", () => {
    render(
      <FeaturedCard
        skill={defaultSkill}
        isAdding={false}
        isAdded={false}
        onAdd={mockOnAdd}
        onSelect={mockOnSelect}
        index={0}
      />,
    );

    expect(screen.getByText("追加する")).toBeInTheDocument();
  });

  it("stagger animation delay が index に応じて設定される", () => {
    render(
      <FeaturedCard
        skill={defaultSkill}
        isAdding={false}
        isAdded={false}
        onAdd={mockOnAdd}
        onSelect={mockOnSelect}
        index={0}
      />,
    );

    const card0 = screen.getByTestId("featured-card-featured-skill");
    expect(card0.style.animationDelay).toBe("0ms");

    // index=2 のカードを別のスキル名でレンダリング
    const skill2 = createMockSkillMetadata({
      name: "featured-skill-2" as SkillName,
    });
    render(
      <FeaturedCard
        skill={skill2}
        isAdding={false}
        isAdded={false}
        onAdd={mockOnAdd}
        onSelect={mockOnSelect}
        index={2}
      />,
    );

    const card2 = screen.getByTestId("featured-card-featured-skill-2");
    expect(card2.style.animationDelay).toBe("200ms");
  });

  it("AddButtonラッパーのonKeyDownでイベント伝播が停止される", () => {
    render(
      <FeaturedCard
        skill={defaultSkill}
        isAdding={false}
        isAdded={false}
        onAdd={mockOnAdd}
        onSelect={mockOnSelect}
        index={0}
      />,
    );

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

  it("追加ボタンクリックで onAdd が呼ばれる（カードクリックは発火しない）", () => {
    render(
      <FeaturedCard
        skill={defaultSkill}
        isAdding={false}
        isAdded={false}
        onAdd={mockOnAdd}
        onSelect={mockOnSelect}
        index={0}
      />,
    );

    const addButton = screen.getByText("追加する");
    fireEvent.click(addButton);

    expect(mockOnAdd).toHaveBeenCalledWith("featured-skill");
    expect(mockOnSelect).not.toHaveBeenCalled();
  });
});
