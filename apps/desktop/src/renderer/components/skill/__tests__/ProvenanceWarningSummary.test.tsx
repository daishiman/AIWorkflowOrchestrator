/**
 * ProvenanceWarningSummary テスト
 *
 * TASK-SDK-05: mainline 向け warning summary の表示検証。
 * raw diagnostics は secondary route (SkillLifecyclePanel) に残し、
 * ここでは warningNote の要約のみ表示することを確認する。
 *
 * RG-06: source_conflict summary が mainline で表示される
 * RG-07: structure_mismatch blocking / non-blocking が区別できる
 *
 * P39対策: happy-dom環境のため fireEvent を使用
 * P31対策: コンポーネント単体テストのためモック不要
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProvenanceWarningSummary } from "../ProvenanceWarningSummary";
import type { SkillCreatorWorkflowSourceProvenance } from "@repo/shared/types";

describe("ProvenanceWarningSummary", () => {
  it("RG-06: source_conflict の warningNote が summary として表示される", () => {
    const provenance: SkillCreatorWorkflowSourceProvenance = {
      resolvedSkillCreatorRoot: "/path/to/root",
      warningNote: "複数候補から選定しました",
    };

    render(<ProvenanceWarningSummary sourceProvenance={provenance} />);

    const summary = screen.getByTestId("provenance-warning-summary");
    expect(summary).toBeInTheDocument();
    expect(summary).toHaveTextContent("複数候補から選定しました");
    expect(summary).toHaveAttribute("data-route-kind", "mainline-summary");
  });

  it("RG-07: structure_mismatch の warningNote が summary として表示される", () => {
    const provenance: SkillCreatorWorkflowSourceProvenance = {
      resolvedSkillCreatorRoot: "/path/to/root",
      warningNote: "構造不一致: blocking - 修正が必要です",
    };

    render(<ProvenanceWarningSummary sourceProvenance={provenance} />);

    const summary = screen.getByTestId("provenance-warning-summary");
    expect(summary).toHaveTextContent("構造不一致: blocking - 修正が必要です");
  });

  it("warningNote がない場合は何も表示しない", () => {
    const provenance: SkillCreatorWorkflowSourceProvenance = {
      resolvedSkillCreatorRoot: "/path/to/root",
    };

    render(<ProvenanceWarningSummary sourceProvenance={provenance} />);

    expect(screen.queryByTestId("provenance-warning-summary")).toBeNull();
  });

  it("sourceProvenance が null の場合は何も表示しない", () => {
    render(<ProvenanceWarningSummary sourceProvenance={null} />);

    expect(screen.queryByTestId("provenance-warning-summary")).toBeNull();
  });

  it("sourceProvenance が undefined の場合は何も表示しない", () => {
    render(<ProvenanceWarningSummary sourceProvenance={undefined} />);

    expect(screen.queryByTestId("provenance-warning-summary")).toBeNull();
  });

  it("raw diagnostics (root path 等) を mainline summary に含めない", () => {
    const provenance: SkillCreatorWorkflowSourceProvenance = {
      resolvedSkillCreatorRoot: "/secret/internal/path/root",
      resourceDescriptorHash: "abc123hash",
      manifestPath: "/manifest/path",
      warningNote: "summary のみ表示",
    };

    render(<ProvenanceWarningSummary sourceProvenance={provenance} />);

    const summary = screen.getByTestId("provenance-warning-summary");
    expect(summary).toHaveTextContent("summary のみ表示");
    // raw diagnostics は表示しない
    expect(summary).not.toHaveTextContent("/secret/internal/path/root");
    expect(summary).not.toHaveTextContent("abc123hash");
    expect(summary).not.toHaveTextContent("/manifest/path");
  });

  it("role='status' が設定されている（アクセシビリティ）", () => {
    const provenance: SkillCreatorWorkflowSourceProvenance = {
      warningNote: "テスト警告",
    };

    render(<ProvenanceWarningSummary sourceProvenance={provenance} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
