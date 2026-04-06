/**
 * SkillCreatorResultPanel テスト
 * TASK-SDK-SC-04: Skill Output Integration
 *
 * TDD Phase 4 (Red) → Phase 5 (Green)
 * T-06: SkillCreatorResultPanel がスキル名とプレビューを表示
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { SkillOutputReadyPayload } from "@repo/shared/types/skillCreator";
import { SkillCreatorResultPanel } from "../SkillCreatorResultPanel";

describe("SkillCreatorResultPanel", () => {
  it("T-06: スキル名と SKILL.md 内容プレビューを表示する", () => {
    const payload: SkillOutputReadyPayload = {
      skillName: "my-skill",
      savedPath: "/project/.claude/skills/my-skill/SKILL.md",
      content: "name: my-skill\ndescription: テスト用スキル",
      requiresOverwriteConfirm: false,
    };

    render(
      <SkillCreatorResultPanel
        payload={payload}
        onOpenSkill={vi.fn()}
        onConfirmOverwrite={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/スキルを生成しました: my-skill/),
    ).toBeInTheDocument();
    expect(screen.getByText(/description: テスト用スキル/)).toBeInTheDocument();
  });

  it("T-06b: payload が null の場合は何も表示しない", () => {
    const { container } = render(
      <SkillCreatorResultPanel
        payload={null}
        onOpenSkill={vi.fn()}
        onConfirmOverwrite={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("T-06c: requiresOverwriteConfirm が true の場合は上書きして保存ボタンを表示する", () => {
    const payload: SkillOutputReadyPayload = {
      skillName: "existing-skill",
      savedPath: "/project/.claude/skills/existing-skill/SKILL.md",
      content: "name: existing-skill\ndescription: 既存スキル",
      requiresOverwriteConfirm: true,
    };
    const confirmSpy = vi.fn();

    render(
      <SkillCreatorResultPanel
        payload={payload}
        onOpenSkill={vi.fn()}
        onConfirmOverwrite={confirmSpy}
      />,
    );

    const confirmButton = screen.getByRole("button", {
      name: "上書きして保存",
    });
    expect(confirmButton).toBeInTheDocument();
    fireEvent.click(confirmButton);
    expect(confirmSpy).toHaveBeenCalledWith(payload);
  });

  it("T-06d: スキルを開くボタンをクリックすると onOpenSkill が呼ばれる", () => {
    const payload: SkillOutputReadyPayload = {
      skillName: "my-skill",
      savedPath: "/project/.claude/skills/my-skill/SKILL.md",
      content: "name: my-skill",
      requiresOverwriteConfirm: false,
    };
    const openSpy = vi.fn();

    render(
      <SkillCreatorResultPanel
        payload={payload}
        onOpenSkill={openSpy}
        onConfirmOverwrite={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "スキルを開く" }));
    expect(openSpy).toHaveBeenCalledWith(payload.savedPath);
  });
});
