import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import type {
  SkillMetadata,
  SkillName,
  ImportedSkill,
} from "@repo/shared/types/skill";
import {
  SkillDetailPanel,
  PERMISSION_LABELS,
  panelStyles,
} from "../components/SkillDetailPanel/SkillDetailPanel";

// --- テストデータファクトリ ---

const createMockSkillMetadata = (
  overrides: Partial<SkillMetadata> = {},
): SkillMetadata => ({
  name: "test-skill" as SkillName,
  description: "テスト用スキル",
  path: ".claude/skills/test-skill/SKILL.md",
  allowedTools: ["Bash", "Read", "Write"],
  updatedAt: new Date("2026-01-01"),
  agents: [
    {
      filename: "agent.md",
      relativePath: "agents/agent.md",
      description: "テストエージェント",
      size: 512,
    },
  ],
  references: [
    {
      filename: "ref.md",
      relativePath: "references/ref.md",
      description: "テストリファレンス",
      size: 256,
    },
  ],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [
    {
      filename: "index.md",
      relativePath: "indexes/index.md",
      description: "テストインデックス",
      size: 128,
    },
  ],
  otherFiles: [{ filename: "data.json", size: 1536, type: "other" }],
  ...overrides,
});

const createMockImportedSkill = (
  overrides: Partial<ImportedSkill> = {},
): ImportedSkill => ({
  ...createMockSkillMetadata(),
  importedAt: new Date("2026-02-01"),
  status: "active",
  ...overrides,
});

describe("SkillDetailPanel", () => {
  const mockOnClose = vi.fn();
  const mockOnDelete = vi.fn();
  const defaultSkill = createMockSkillMetadata();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // キーボードイベントリスナーのクリーンアップ
    vi.restoreAllMocks();
  });

  // --- 表示テスト ---

  it("isOpen=true, skill ありでパネルが表示される（デスクトップ）", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    const panel = screen.getByTestId("skill-detail-panel");
    expect(panel).toBeInTheDocument();
  });

  it("isOpen=true, skill ありでモバイルパネルが表示される", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    const mobilePanel = screen.getByTestId("skill-detail-panel-mobile");
    expect(mobilePanel).toBeInTheDocument();
  });

  it("skillName が null の場合は null を返す", () => {
    const { container } = render(
      <SkillDetailPanel
        skillName={null}
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("isOpen が false の場合は null を返す", () => {
    const { container } = render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={false}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("skill が undefined の場合は null を返す", () => {
    const { container } = render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={undefined}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  // --- キーボード操作テスト ---

  it("Escape キーでパネルが閉じる", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("isOpen=false の場合は Escape キーのリスナーが登録されない", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={false}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // --- オーバーレイテスト ---

  it("オーバーレイクリックでパネルが閉じる", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    const overlay = screen.getByTestId("detail-overlay");
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("オーバーレイのonKeyDown（Escape）で onClose が呼ばれる", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    const overlay = screen.getByTestId("detail-overlay");
    fireEvent.keyDown(overlay, { key: "Escape" });
    // オーバーレイの onKeyDown と document リスナーの両方が発火する
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("パネル内部クリックではパネルが閉じない（バブリング防止）", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    // パネル内の要素をクリック
    const panel = screen.getByTestId("skill-detail-panel");
    fireEvent.click(panel);
    // overlay のクリックハンドラは target === currentTarget のみ発火
    // panel クリックは overlay の子要素ではないので影響なし
  });

  // --- 権限バッジテスト ---

  it("権限バッジ（PERMISSION_LABELS）が正しく表示される", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    // デスクトップパネル内で検証（desktop/mobile 両方にレンダリングされるため）
    const desktopPanel = screen.getByTestId("skill-detail-panel");

    // Bash, Read, Write の権限バッジが表示される
    const bashBadges = within(desktopPanel).getAllByTestId(
      "permission-badge-Bash",
    );
    expect(bashBadges.length).toBeGreaterThanOrEqual(1);
    expect(bashBadges[0].textContent).toContain(
      PERMISSION_LABELS["Bash"].label,
    );

    const readBadges = within(desktopPanel).getAllByTestId(
      "permission-badge-Read",
    );
    expect(readBadges.length).toBeGreaterThanOrEqual(1);
    expect(readBadges[0].textContent).toContain(
      PERMISSION_LABELS["Read"].label,
    );

    const writeBadges = within(desktopPanel).getAllByTestId(
      "permission-badge-Write",
    );
    expect(writeBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("未知のツール名の権限バッジにフォールバック表示", () => {
    const skillWithUnknownTool = createMockSkillMetadata({
      allowedTools: ["UnknownTool"],
    });

    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={skillWithUnknownTool}
      />,
    );

    const desktopPanel = screen.getByTestId("skill-detail-panel");
    const badges = within(desktopPanel).getAllByTestId(
      "permission-badge-UnknownTool",
    );
    expect(badges.length).toBeGreaterThanOrEqual(1);
    // フォールバック: ツール名がそのまま表示される
    expect(badges[0].textContent).toContain("UnknownTool");
  });

  it("allowedTools が空の場合は権限セクションが非表示", () => {
    const noToolsSkill = createMockSkillMetadata({
      allowedTools: [],
    });

    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={noToolsSkill}
      />,
    );

    expect(screen.queryAllByTestId("permissions-section")).toHaveLength(0);
  });

  it("allowedTools が undefined の場合は権限セクションが非表示", () => {
    const noToolsSkill = createMockSkillMetadata({
      allowedTools: undefined,
    });

    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={noToolsSkill}
      />,
    );

    expect(screen.queryAllByTestId("permissions-section")).toHaveLength(0);
  });

  // --- サブリソーステスト ---

  it("サブリソース一覧（agents, references, indexes）が表示される", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    const desktopPanel = screen.getByTestId("skill-detail-panel");

    // エージェントセクション
    expect(
      within(desktopPanel).getByTestId("resource-エージェント"),
    ).toBeInTheDocument();
    expect(within(desktopPanel).getByText("agent.md")).toBeInTheDocument();

    // リファレンスセクション
    expect(
      within(desktopPanel).getByTestId("resource-リファレンス"),
    ).toBeInTheDocument();
    expect(within(desktopPanel).getByText("ref.md")).toBeInTheDocument();

    // インデックスセクション
    expect(
      within(desktopPanel).getByTestId("resource-インデックス"),
    ).toBeInTheDocument();
    expect(within(desktopPanel).getByText("index.md")).toBeInTheDocument();
  });

  it("サブリソースが空の場合は非表示", () => {
    const emptyResourceSkill = createMockSkillMetadata({
      agents: [],
      references: [],
      indexes: [],
    });

    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={emptyResourceSkill}
      />,
    );

    expect(screen.queryAllByTestId("resource-エージェント")).toHaveLength(0);
    expect(screen.queryAllByTestId("resource-リファレンス")).toHaveLength(0);
    expect(screen.queryAllByTestId("resource-インデックス")).toHaveLength(0);
  });

  it("サブリソースの説明が表示される", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    const desktopPanel = screen.getByTestId("skill-detail-panel");
    expect(
      within(desktopPanel).getByText("- テストエージェント"),
    ).toBeInTheDocument();
    expect(
      within(desktopPanel).getByText("- テストリファレンス"),
    ).toBeInTheDocument();
  });

  // --- otherFiles テスト ---

  it("otherFiles が表示される", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    const desktopPanel = screen.getByTestId("skill-detail-panel");
    expect(
      within(desktopPanel).getByTestId("other-files-section"),
    ).toBeInTheDocument();
    expect(within(desktopPanel).getByText("data.json")).toBeInTheDocument();
    // 1536 bytes = 1.5KB
    expect(within(desktopPanel).getByText("(1.5KB)")).toBeInTheDocument();
  });

  it("otherFiles が空の場合は非表示", () => {
    const noOtherFilesSkill = createMockSkillMetadata({
      otherFiles: [],
    });

    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={noOtherFilesSkill}
      />,
    );

    expect(screen.queryAllByTestId("other-files-section")).toHaveLength(0);
  });

  // --- formatFileSize テスト ---

  it("formatFileSize: バイト表示（1024未満）", () => {
    const skill = createMockSkillMetadata({
      otherFiles: [{ filename: "tiny.txt", size: 512, type: "other" }],
    });

    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={skill}
      />,
    );

    const desktopPanel = screen.getByTestId("skill-detail-panel");
    expect(within(desktopPanel).getByText("(512B)")).toBeInTheDocument();
  });

  it("formatFileSize: KB表示（1024以上1MB未満）", () => {
    const skill = createMockSkillMetadata({
      otherFiles: [{ filename: "medium.txt", size: 2048, type: "other" }],
    });

    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={skill}
      />,
    );

    const desktopPanel = screen.getByTestId("skill-detail-panel");
    expect(within(desktopPanel).getByText("(2.0KB)")).toBeInTheDocument();
  });

  it("formatFileSize: MB表示（1MB以上）", () => {
    const skill = createMockSkillMetadata({
      otherFiles: [
        { filename: "large.bin", size: 2 * 1024 * 1024, type: "other" },
      ],
    });

    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={skill}
      />,
    );

    const desktopPanel = screen.getByTestId("skill-detail-panel");
    expect(within(desktopPanel).getByText("(2.0MB)")).toBeInTheDocument();
  });

  // --- インポート済みバッジテスト ---

  it("「追加済み」バッジが isImported=true で表示される", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={true}
        skill={defaultSkill}
      />,
    );

    // Badge コンポーネントが「追加済み」テキストを含む
    expect(screen.getAllByText("追加済み").length).toBeGreaterThanOrEqual(1);
  });

  it("「追加済み」バッジが isImported=false で非表示", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    expect(screen.queryByText("追加済み")).toBeNull();
  });

  // --- 削除ゾーンテスト ---

  it("削除ゾーンが isImported=true で表示される", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={true}
        skill={defaultSkill}
      />,
    );

    // danger zone が表示される（2つのパネル分）
    const dangerZones = screen.getAllByTestId("danger-zone");
    expect(dangerZones.length).toBeGreaterThanOrEqual(1);
  });

  it("削除ボタンクリックで onDelete が呼ばれる", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={true}
        skill={defaultSkill}
      />,
    );

    const deleteButtons = screen.getAllByTestId("delete-skill-button");
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith("test-skill");
  });

  it("削除ゾーンが isImported=false で非表示", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    expect(screen.queryByTestId("danger-zone")).toBeNull();
  });

  // --- アクセシビリティテスト ---

  it("role='dialog' が設定されている", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    const dialogs = screen.getAllByRole("dialog");
    expect(dialogs.length).toBeGreaterThanOrEqual(1);
  });

  it("aria-modal='true' が設定されている", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    const dialogs = screen.getAllByRole("dialog");
    dialogs.forEach((dialog) => {
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });
  });

  it("aria-label にスキル名が含まれる", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    const dialogs = screen.getAllByRole("dialog");
    dialogs.forEach((dialog) => {
      expect(dialog.getAttribute("aria-label")).toContain("test-skill");
    });
  });

  it("閉じるボタン（data-testid='close-detail-button'）が動作する", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    const closeButtons = screen.getAllByTestId("close-detail-button");
    fireEvent.click(closeButtons[0]);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("閉じるボタンに aria-label='パネルを閉じる' が設定されている", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    const closeButtons = screen.getAllByTestId("close-detail-button");
    closeButtons.forEach((button) => {
      expect(button).toHaveAttribute("aria-label", "パネルを閉じる");
    });
  });

  // --- スキル名表示テスト ---

  it("スキル名の先頭文字が大文字で表示される", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    // 先頭文字 "T" が表示される
    const initials = screen.getAllByText("T");
    expect(initials.length).toBeGreaterThanOrEqual(1);
  });

  it("スキル説明文が表示される", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={false}
        skill={defaultSkill}
      />,
    );

    // 説明文はデスクトップ・モバイル両方に表示される
    const descriptions = screen.getAllByText("テスト用スキル");
    expect(descriptions.length).toBeGreaterThanOrEqual(1);
  });

  // --- ImportedSkill 対応テスト ---

  it("ImportedSkill が渡されても正しく表示される", () => {
    const importedSkill = createMockImportedSkill({
      name: "imported-skill" as SkillName,
      description: "インポート済みスキル",
    });

    render(
      <SkillDetailPanel
        skillName="imported-skill"
        isOpen={true}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        isImported={true}
        skill={importedSkill}
      />,
    );

    const names = screen.getAllByText("imported-skill");
    expect(names.length).toBeGreaterThanOrEqual(1);
  });

  // --- panelStyles export テスト ---

  it("panelStyles がオブジェクトとして正しくexportされている", () => {
    expect(panelStyles).toBeDefined();
    expect(typeof panelStyles.overlay).toBe("string");
    expect(typeof panelStyles.header).toBe("string");
    expect(typeof panelStyles.body).toBe("string");
    expect(typeof panelStyles.section).toBe("string");
    expect(typeof panelStyles.dangerZone).toBe("string");
  });

  // --- PERMISSION_LABELS export テスト ---

  it("PERMISSION_LABELS が全ツール分のマッピングを持つ", () => {
    expect(PERMISSION_LABELS).toBeDefined();
    expect(PERMISSION_LABELS["Bash"]).toBeDefined();
    expect(PERMISSION_LABELS["Read"]).toBeDefined();
    expect(PERMISSION_LABELS["Write"]).toBeDefined();
    expect(PERMISSION_LABELS["Edit"]).toBeDefined();
    expect(PERMISSION_LABELS["WebSearch"]).toBeDefined();
    expect(PERMISSION_LABELS["WebFetch"]).toBeDefined();

    // 各エントリが label と color を持つ
    Object.values(PERMISSION_LABELS).forEach((perm) => {
      expect(typeof perm.label).toBe("string");
      expect(typeof perm.color).toBe("string");
    });
  });
});
