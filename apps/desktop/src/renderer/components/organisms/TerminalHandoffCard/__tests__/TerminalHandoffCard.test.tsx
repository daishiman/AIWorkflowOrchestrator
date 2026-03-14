/**
 * TerminalHandoffCard component tests
 * P39: happy-dom environment - use fireEvent instead of userEvent
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { TerminalHandoffCard } from "../TerminalHandoffCard";

const defaultGuidance = {
  terminalCommand: "claude --continue 'Fix the bug in auth.ts'",
  contextSummary: "auth.ts L45-60, authentication flow refactor",
  reason:
    "This operation requires file system access not available in this environment.",
};

const defaultProps = {
  guidance: defaultGuidance,
  onCopyCommand: vi.fn(),
  onDismiss: vi.fn(),
};

describe("TerminalHandoffCard", () => {
  describe("content rendering", () => {
    it("displays guidance.reason", () => {
      render(<TerminalHandoffCard {...defaultProps} />);
      expect(screen.getByText(defaultGuidance.reason)).toBeInTheDocument();
    });

    it("displays terminalCommand in monospace font", () => {
      render(<TerminalHandoffCard {...defaultProps} />);
      const commandEl = screen.getByText(defaultGuidance.terminalCommand);
      expect(commandEl).toBeInTheDocument();
      expect(commandEl.closest("[class*='font-mono']")).toBeTruthy();
    });

    it("displays guidance.contextSummary", () => {
      render(<TerminalHandoffCard {...defaultProps} />);
      expect(
        screen.getByText(defaultGuidance.contextSummary),
      ).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onCopyCommand when copy button is clicked", async () => {
      const onCopyCommand = vi.fn();
      render(
        <TerminalHandoffCard {...defaultProps} onCopyCommand={onCopyCommand} />,
      );

      const copyButton = screen.getByLabelText("Copy terminal command");
      await act(async () => {
        fireEvent.click(copyButton);
      });

      expect(onCopyCommand).toHaveBeenCalledTimes(1);
    });

    it("calls onDismiss when dismiss button is clicked", async () => {
      const onDismiss = vi.fn();
      render(<TerminalHandoffCard {...defaultProps} onDismiss={onDismiss} />);

      const dismissButton = screen.getByLabelText("Dismiss handoff guidance");
      await act(async () => {
        fireEvent.click(dismissButton);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe("accessibility", () => {
    it("has role='alert'", () => {
      render(<TerminalHandoffCard {...defaultProps} />);
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("has aria-label for the card", () => {
      render(<TerminalHandoffCard {...defaultProps} />);
      expect(
        screen.getByLabelText("Terminal handoff guidance"),
      ).toBeInTheDocument();
    });

    it("has aria-label on dismiss button", () => {
      render(<TerminalHandoffCard {...defaultProps} />);
      expect(
        screen.getByLabelText("Dismiss handoff guidance"),
      ).toBeInTheDocument();
    });

    it("has aria-label on copy button", () => {
      render(<TerminalHandoffCard {...defaultProps} />);
      expect(
        screen.getByLabelText("Copy terminal command"),
      ).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("displays long command string with break-all styling", () => {
      const longCommand =
        "claude --continue 'Fix the authentication flow in auth.ts including token refresh, session management, and PKCE validation across multiple files: src/auth/token.ts src/auth/session.ts src/auth/pkce.ts'";
      render(
        <TerminalHandoffCard
          {...defaultProps}
          guidance={{ ...defaultGuidance, terminalCommand: longCommand }}
        />,
      );
      const commandEl = screen.getByText(longCommand);
      expect(commandEl).toBeInTheDocument();
      expect(commandEl).toHaveClass("break-all");
    });

    it("copy button shows 'Copied!' then reverts to 'Copy' after 2 seconds (P13: advanceTimersByTime)", async () => {
      vi.useFakeTimers();

      try {
        render(<TerminalHandoffCard {...defaultProps} />);
        const copyButton = screen.getByLabelText("Copy terminal command");

        expect(copyButton).toHaveTextContent("Copy");

        await act(async () => {
          fireEvent.click(copyButton);
        });

        expect(copyButton).toHaveTextContent("Copied!");

        await act(async () => {
          vi.advanceTimersByTime(1999);
        });
        expect(copyButton).toHaveTextContent("Copied!");

        await act(async () => {
          vi.advanceTimersByTime(1);
        });
        expect(copyButton).toHaveTextContent("Copy");
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
