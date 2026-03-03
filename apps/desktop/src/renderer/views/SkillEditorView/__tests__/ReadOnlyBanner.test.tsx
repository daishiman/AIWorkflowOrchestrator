/**
 * ReadOnlyBanner コンポーネント テスト
 * UT-UI-05A-005: 読み取り専用表示強化
 *
 * Phase 4 - TDD Red
 */
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReadOnlyBanner } from "../components/ReadOnlyBanner";

describe("ReadOnlyBanner", () => {
  it("isReadOnly=true でバナーが表示される", () => {
    render(<ReadOnlyBanner isReadOnly={true} />);
    expect(screen.getByText(/読み取り専用/)).toBeInTheDocument();
  });

  it("Lock アイコンが表示される", () => {
    render(<ReadOnlyBanner isReadOnly={true} />);
    // lucide-react Lock icon renders as SVG
    expect(screen.getByTestId("readonly-lock-icon")).toBeInTheDocument();
  });

  it("バナーテキストが「読み取り専用 -- 編集できません」である", () => {
    render(<ReadOnlyBanner isReadOnly={true} />);
    expect(
      screen.getByText("読み取り専用 \u2014 編集できません"),
    ).toBeInTheDocument();
  });

  it("isReadOnly=false でバナーが非表示になる", () => {
    render(<ReadOnlyBanner isReadOnly={false} />);
    expect(screen.queryByText(/読み取り専用/)).not.toBeInTheDocument();
  });
});
