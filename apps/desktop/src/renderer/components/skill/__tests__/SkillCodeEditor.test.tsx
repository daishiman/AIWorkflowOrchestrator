import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SkillCodeEditor } from "../SkillCodeEditor";

describe("SkillCodeEditor", () => {
  it("value を表示し、変更を onChange に伝える", () => {
    const onChange = vi.fn();
    render(
      <SkillCodeEditor
        value="initial"
        onChange={onChange}
        language="markdown"
      />,
    );

    const editor = screen.getByRole("textbox", { name: "コードエディター" });
    fireEvent.change(editor, { target: { value: "updated" } });

    expect(onChange).toHaveBeenCalledWith("updated");
  });

  it("readOnly モードで入力を禁止する", () => {
    render(
      <SkillCodeEditor
        value="readonly"
        onChange={vi.fn()}
        language="markdown"
        isReadOnly
      />,
    );

    const editor = screen.getByRole("textbox", { name: "コードエディター" });
    expect(editor).toHaveAttribute("readonly");
    expect(editor).toHaveAttribute("aria-readonly", "true");
  });

  it("Tab キーで2スペースを挿入する", () => {
    const onChange = vi.fn();
    render(
      <SkillCodeEditor value="abc" onChange={onChange} language="markdown" />,
    );

    const editor = screen.getByRole("textbox", {
      name: "コードエディター",
    }) as HTMLTextAreaElement;
    editor.setSelectionRange(1, 1);

    fireEvent.keyDown(editor, { key: "Tab" });

    expect(onChange).toHaveBeenCalledWith("a  bc");
  });
});
