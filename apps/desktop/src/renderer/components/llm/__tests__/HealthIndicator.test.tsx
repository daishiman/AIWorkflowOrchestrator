/**
 * HealthIndicator Component Tests
 *
 * TDD Phase: Red (failing tests - implementation not yet created)
 *
 * Tests for AC-UI-003: HealthIndicator - 接続状態表示
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Component to be implemented
import { HealthIndicator } from "../HealthIndicator";

// Types
import type { HealthCheckResult } from "@repo/shared/types/llm";

describe("HealthIndicator", () => {
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("UI-012: 正常接続表示", () => {
    it("should display green indicator for connected status", () => {
      const healthStatus: HealthCheckResult = {
        status: "connected",
        providerId: "openai",
        latency: 150,
        checkedAt: new Date(),
      };

      render(
        <HealthIndicator
          healthStatus={healthStatus}
          onRefresh={mockOnRefresh}
          isChecking={false}
        />,
      );

      const indicator = screen.getByTestId("health-indicator");
      expect(indicator).toHaveClass("bg-green-500");
    });

    it("should show Connected tooltip for healthy status", async () => {
      const healthStatus: HealthCheckResult = {
        status: "connected",
        providerId: "openai",
        latency: 150,
        checkedAt: new Date(),
      };

      render(
        <HealthIndicator
          healthStatus={healthStatus}
          onRefresh={mockOnRefresh}
          isChecking={false}
        />,
      );

      const indicator = screen.getByTestId("health-indicator");
      await userEvent.hover(indicator);

      expect(screen.getByRole("tooltip")).toHaveTextContent(/connected/i);
    });

    it("should display latency in tooltip", async () => {
      const healthStatus: HealthCheckResult = {
        status: "connected",
        providerId: "openai",
        latency: 150,
        checkedAt: new Date(),
      };

      render(
        <HealthIndicator
          healthStatus={healthStatus}
          onRefresh={mockOnRefresh}
          isChecking={false}
        />,
      );

      const indicator = screen.getByTestId("health-indicator");
      await userEvent.hover(indicator);

      expect(screen.getByRole("tooltip")).toHaveTextContent(/150ms/i);
    });
  });

  describe("UI-013: エラー状態表示", () => {
    it("should display red indicator for error status", () => {
      const healthStatus: HealthCheckResult = {
        status: "error",
        providerId: "openai",
        errorMessage: "API key invalid",
        checkedAt: new Date(),
      };

      render(
        <HealthIndicator
          healthStatus={healthStatus}
          onRefresh={mockOnRefresh}
          isChecking={false}
        />,
      );

      const indicator = screen.getByTestId("health-indicator");
      expect(indicator).toHaveClass("bg-red-500");
    });

    it("should show error message in tooltip", async () => {
      const healthStatus: HealthCheckResult = {
        status: "error",
        providerId: "openai",
        errorMessage: "API key invalid",
        checkedAt: new Date(),
      };

      render(
        <HealthIndicator
          healthStatus={healthStatus}
          onRefresh={mockOnRefresh}
          isChecking={false}
        />,
      );

      const indicator = screen.getByTestId("health-indicator");
      await userEvent.hover(indicator);

      expect(screen.getByRole("tooltip")).toHaveTextContent(/API key invalid/i);
    });
  });

  describe("UI-014: 確認中状態表示", () => {
    it("should display loading spinner when checking", () => {
      render(
        <HealthIndicator
          healthStatus={undefined}
          onRefresh={mockOnRefresh}
          isChecking={true}
        />,
      );

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should show Checking... tooltip when checking", async () => {
      render(
        <HealthIndicator
          healthStatus={undefined}
          onRefresh={mockOnRefresh}
          isChecking={true}
        />,
      );

      const indicator = screen.getByTestId("health-indicator");
      await userEvent.hover(indicator);

      expect(screen.getByRole("tooltip")).toHaveTextContent(/checking/i);
    });
  });

  describe("UI-015: 更新ボタンクリック", () => {
    it("should call onRefresh when refresh button is clicked", async () => {
      const healthStatus: HealthCheckResult = {
        status: "connected",
        providerId: "openai",
        latency: 150,
        checkedAt: new Date(),
      };

      render(
        <HealthIndicator
          healthStatus={healthStatus}
          onRefresh={mockOnRefresh}
          isChecking={false}
        />,
      );

      const refreshButton = screen.getByRole("button", { name: /refresh/i });
      await userEvent.click(refreshButton);

      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });

    it("should disable refresh button while checking", () => {
      render(
        <HealthIndicator
          healthStatus={undefined}
          onRefresh={mockOnRefresh}
          isChecking={true}
        />,
      );

      const refreshButton = screen.getByRole("button", { name: /refresh/i });
      expect(refreshButton).toBeDisabled();
    });
  });

  describe("UI-016: 未確認状態", () => {
    it("should display gray indicator when healthStatus is undefined", () => {
      render(
        <HealthIndicator
          healthStatus={undefined}
          onRefresh={mockOnRefresh}
          isChecking={false}
        />,
      );

      const indicator = screen.getByTestId("health-indicator");
      expect(indicator).toHaveClass("bg-gray-400");
    });

    it("should show 未確認 tooltip when not checked", async () => {
      render(
        <HealthIndicator
          healthStatus={undefined}
          onRefresh={mockOnRefresh}
          isChecking={false}
        />,
      );

      const indicator = screen.getByTestId("health-indicator");
      await userEvent.hover(indicator);

      expect(screen.getByRole("tooltip")).toHaveTextContent(/未確認/i);
    });
  });

  describe("Disconnected Status", () => {
    it("should display yellow indicator for disconnected status", () => {
      const healthStatus: HealthCheckResult = {
        status: "disconnected",
        providerId: "openai",
        checkedAt: new Date(),
      };

      render(
        <HealthIndicator
          healthStatus={healthStatus}
          onRefresh={mockOnRefresh}
          isChecking={false}
        />,
      );

      const indicator = screen.getByTestId("health-indicator");
      expect(indicator).toHaveClass("bg-yellow-500");
    });
  });

  describe("Accessibility", () => {
    it("should have accessible status description", () => {
      const healthStatus: HealthCheckResult = {
        status: "connected",
        providerId: "openai",
        latency: 150,
        checkedAt: new Date(),
      };

      render(
        <HealthIndicator
          healthStatus={healthStatus}
          onRefresh={mockOnRefresh}
          isChecking={false}
        />,
      );

      const indicator = screen.getByTestId("health-indicator");
      expect(indicator).toHaveAttribute("aria-label");
    });

    it("should announce status changes to screen readers", () => {
      const { rerender } = render(
        <HealthIndicator
          healthStatus={undefined}
          onRefresh={mockOnRefresh}
          isChecking={true}
        />,
      );

      const healthStatus: HealthCheckResult = {
        status: "connected",
        providerId: "openai",
        latency: 150,
        checkedAt: new Date(),
      };

      rerender(
        <HealthIndicator
          healthStatus={healthStatus}
          onRefresh={mockOnRefresh}
          isChecking={false}
        />,
      );

      // Should have live region for announcements
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });
});
