/**
 * @file RiskPanel.test.tsx
 * @description RiskPanel コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 *
 * P39準拠: fireEventのみ使用（happy-dom環境）
 * P47準拠: riskLevelStyles をimportして検証
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { createMockRisk } from "./helpers/test-data-factory";
import { RiskPanel, riskLevelStyles } from "../RiskPanel";

describe("RiskPanel", () => {
  beforeEach(() => {
    // テスト間で状態を共有しない（P9準拠）
  });

  it("リスク情報を表示する", () => {
    const risks = [
      createMockRisk({
        category: "security",
        level: "high",
        description: "セキュリティリスク",
      }),
      createMockRisk({
        category: "performance",
        level: "medium",
        description: "パフォーマンスリスク",
      }),
      createMockRisk({
        category: "compatibility",
        level: "low",
        description: "互換性リスク",
      }),
    ];

    render(<RiskPanel risks={risks} />);

    expect(screen.getByText("セキュリティリスク")).toBeInTheDocument();
    expect(screen.getByText("パフォーマンスリスク")).toBeInTheDocument();
    expect(screen.getByText("互換性リスク")).toBeInTheDocument();

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(3);
  });

  it("リスクリストにaria-labelがある", () => {
    const risks = [
      createMockRisk({
        category: "security",
        level: "high",
        description: "セキュリティリスク",
      }),
    ];

    render(<RiskPanel risks={risks} />);
    expect(
      screen.getByRole("list", { name: "リスク情報一覧" }),
    ).toBeInTheDocument();
  });

  it("criticalレベルにエラー色を適用する", () => {
    const risks = [
      createMockRisk({
        level: "critical",
        description: "クリティカルなリスク",
      }),
    ];

    render(<RiskPanel risks={risks} />);

    const listItem = screen.getByRole("listitem");
    const expectedStyles = riskLevelStyles.critical;
    for (const style of expectedStyles.split(" ")) {
      expect(listItem.className).toContain(style);
    }
  });

  it("highレベルに警告色を適用する", () => {
    const risks = [
      createMockRisk({
        level: "high",
        description: "高レベルリスク",
      }),
    ];

    render(<RiskPanel risks={risks} />);

    const listItem = screen.getByRole("listitem");
    const expectedStyles = riskLevelStyles.high;
    for (const style of expectedStyles.split(" ")) {
      expect(listItem.className).toContain(style);
    }
  });

  it("medium/lowレベルに情報色を適用する", () => {
    const risks = [
      createMockRisk({
        level: "medium",
        description: "中程度リスク",
      }),
      createMockRisk({
        level: "low",
        description: "低リスク",
      }),
    ];

    render(<RiskPanel risks={risks} />);

    const listItems = screen.getAllByRole("listitem");

    const mediumItem = listItems[0];
    for (const style of riskLevelStyles.medium.split(" ")) {
      expect(mediumItem.className).toContain(style);
    }

    const lowItem = listItems[1];
    for (const style of riskLevelStyles.low.split(" ")) {
      expect(lowItem.className).toContain(style);
    }
  });

  it("mitigationテキストを表示する", () => {
    const risks = [
      createMockRisk({
        description: "リスク説明",
        mitigation: "入力値のサニタイズを追加する",
      }),
    ];

    render(<RiskPanel risks={risks} />);

    expect(screen.getByText("対策")).toBeInTheDocument();
    expect(
      screen.getByText("入力値のサニタイズを追加する"),
    ).toBeInTheDocument();
  });

  it("mitigation未定義時は対策セクション非表示", () => {
    const risks = [
      createMockRisk({
        description: "リスク説明",
        mitigation: undefined,
      }),
    ];

    render(<RiskPanel risks={risks} />);

    expect(screen.queryByText("対策")).not.toBeInTheDocument();
  });

  it("impact情報を表示する", () => {
    const risks = [
      createMockRisk({
        description: "リスク説明",
        impact: "不正入力による予期しない動作",
      }),
    ];

    render(<RiskPanel risks={risks} />);

    expect(screen.getByText("影響")).toBeInTheDocument();
    expect(
      screen.getByText("不正入力による予期しない動作"),
    ).toBeInTheDocument();
  });

  // ============================================
  // Phase 6: 境界値テスト
  // ============================================

  // ------------------------------------------
  // 8. 全4レベルのリスクが同時に存在する場合
  // ------------------------------------------
  it("全4レベルのリスクが同時に存在する場合", () => {
    const risks = [
      createMockRisk({
        category: "security",
        level: "critical",
        description: "クリティカルリスク",
      }),
      createMockRisk({
        category: "performance",
        level: "high",
        description: "高レベルリスク",
      }),
      createMockRisk({
        category: "compatibility",
        level: "medium",
        description: "中程度リスク",
      }),
      createMockRisk({
        category: "maintenance",
        level: "low",
        description: "低レベルリスク",
      }),
    ];

    render(<RiskPanel risks={risks} />);

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(4);

    // 各レベルのスタイルが正しく適用されている
    for (const style of riskLevelStyles.critical.split(" ")) {
      expect(listItems[0].className).toContain(style);
    }
    for (const style of riskLevelStyles.high.split(" ")) {
      expect(listItems[1].className).toContain(style);
    }
    for (const style of riskLevelStyles.medium.split(" ")) {
      expect(listItems[2].className).toContain(style);
    }
    for (const style of riskLevelStyles.low.split(" ")) {
      expect(listItems[3].className).toContain(style);
    }

    // 全テキストが表示されている
    expect(screen.getByText("クリティカルリスク")).toBeInTheDocument();
    expect(screen.getByText("高レベルリスク")).toBeInTheDocument();
    expect(screen.getByText("中程度リスク")).toBeInTheDocument();
    expect(screen.getByText("低レベルリスク")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 9. 単一リスクのみの表示
  // ------------------------------------------
  it("単一リスクのみの表示", () => {
    const risks = [
      createMockRisk({
        category: "security",
        level: "high",
        description: "唯一のリスク",
        impact: "影響範囲は限定的",
        mitigation: "定期的な監視を実施",
      }),
    ];

    render(<RiskPanel risks={risks} />);

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(1);
    expect(screen.getByText("唯一のリスク")).toBeInTheDocument();
    expect(screen.getByText("影響範囲は限定的")).toBeInTheDocument();
    expect(screen.getByText("定期的な監視を実施")).toBeInTheDocument();
  });

  // ============================================
  // Phase 6: スタイルテスト
  // ============================================

  // ------------------------------------------
  // 10. riskLevelStyles の4レベル全てが定義されている
  // ------------------------------------------
  it("riskLevelStyles の4レベル全てが定義されている", () => {
    expect(riskLevelStyles).toHaveProperty("critical");
    expect(riskLevelStyles).toHaveProperty("high");
    expect(riskLevelStyles).toHaveProperty("medium");
    expect(riskLevelStyles).toHaveProperty("low");

    // critical はエラー色を含む
    expect(riskLevelStyles.critical).toContain("--status-error");
    // high は警告色を含む
    expect(riskLevelStyles.high).toContain("--status-warning");
    // medium は情報色を含む
    expect(riskLevelStyles.medium).toContain("--status-info");
    // low はボーダー色を含む
    expect(riskLevelStyles.low).toContain("--border-primary");
  });
});
