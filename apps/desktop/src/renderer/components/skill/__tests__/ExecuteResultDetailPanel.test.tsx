import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { RuntimeSkillCreatorExecuteResult } from "@repo/shared/types";
import {
  ExecuteResultDetailPanel,
  type ExecuteResultDetailPanelProps,
} from "../ExecuteResultDetailPanel";
import type { PanelError } from "../ErrorBanner";

function createMockExecuteResult(
  overrides?: Partial<RuntimeSkillCreatorExecuteResult>,
): RuntimeSkillCreatorExecuteResult {
  return {
    executeId: "exec-001",
    skillName: "test-skill",
    success: true,
    ...overrides,
  };
}

function renderPanel(overrides?: Partial<ExecuteResultDetailPanelProps>) {
  const props: ExecuteResultDetailPanelProps = {
    executeResult: createMockExecuteResult(),
    ...overrides,
  };
  return render(<ExecuteResultDetailPanel {...props} />);
}

describe("ExecuteResultDetailPanel", () => {
  // T-ERP-01: success: true の executeResult を渡す
  it("成功時に成功バッジと成功メッセージが表示される", () => {
    renderPanel();

    expect(screen.getByText("test-skill")).toBeInTheDocument();
    expect(screen.getByText("成功")).toBeInTheDocument();
    expect(
      screen.getByText("スキルが正常に作成されました"),
    ).toBeInTheDocument();
  });

  // T-ERP-02: success: false の executeResult を渡す
  it("失敗時に失敗バッジとエラーメッセージが表示される", () => {
    renderPanel({
      executeResult: createMockExecuteResult({
        success: false,
        error: "タイムアウトしました",
      }),
    });

    expect(screen.getByText("失敗")).toBeInTheDocument();
    expect(screen.getByText("スキルの作成に失敗しました")).toBeInTheDocument();
    expect(screen.getByText("タイムアウトしました")).toBeInTheDocument();
  });

  // T-ERP-03: executeResult が null
  it("executeResult が null の場合は何も表示されない", () => {
    const { container } = renderPanel({ executeResult: null });

    expect(container.firstChild).toBeNull();
  });

  // T-ERP-04: isLoading が true
  it("isLoading が true の場合はスケルトンが表示される", () => {
    renderPanel({ isLoading: true });

    expect(screen.getByTestId("execute-result-skeleton")).toBeInTheDocument();
  });

  // T-ERP-05: error が設定されている
  it("executeResult が null で error がある場合は ErrorBanner が表示される", () => {
    const error: PanelError = {
      message: "IPC エラーが発生しました",
    };
    renderPanel({ executeResult: null, error });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("IPC エラーが発生しました")).toBeInTheDocument();
  });

  // T-ERP-06: success: false で error フィールドあり
  it("失敗時にエラーメッセージが表示される", () => {
    renderPanel({
      executeResult: createMockExecuteResult({
        success: false,
        error: "Permission denied",
      }),
    });

    expect(screen.getByText("Permission denied")).toBeInTheDocument();
  });

  // T-ERP-07: success: false で onRetry が渡される
  it("失敗時に再試行ボタンが表示され、クリックで onRetry が呼ばれる", () => {
    const onRetry = vi.fn();
    renderPanel({
      executeResult: createMockExecuteResult({ success: false }),
      onRetry,
    });

    const retryButton = screen.getByRole("button", { name: "再試行" });
    expect(retryButton).toBeInTheDocument();
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // T-ERP-08: executeId が表示される
  it("executeId がフッターに表示される", () => {
    renderPanel();

    expect(screen.getByText("Execute ID: exec-001")).toBeInTheDocument();
  });

  // T-ERP-09: sessionId / resultSubtype / stopReason
  it("metadata 行に sessionId, resultSubtype, stopReason が表示される", () => {
    renderPanel({
      executeResult: createMockExecuteResult({
        sessionId: "sess-123",
        resultSubtype: "end_turn",
        stopReason: "max_tokens",
      }),
    });

    expect(screen.getByText("sess-123")).toBeInTheDocument();
    expect(screen.getByText("end_turn")).toBeInTheDocument();
    expect(screen.getByText("max_tokens")).toBeInTheDocument();
  });

  // T-ERP-10: permissionDenials と sdkEvents
  it("permissionDenials の件数が折りたたみとして表示される", () => {
    renderPanel({
      executeResult: createMockExecuteResult({
        permissionDenials: [
          { toolName: "Write", reason: "ユーザーが拒否" },
          { reason: "自動拒否" },
        ],
      }),
    });

    const toggle = screen.getByRole("button", {
      name: /Permission Denials \(2\)/,
    });
    expect(toggle).toBeInTheDocument();

    // 展開
    fireEvent.click(toggle);
    expect(screen.getByText("Write")).toBeInTheDocument();
    expect(screen.getByText("ユーザーが拒否")).toBeInTheDocument();
    expect(screen.getByText("自動拒否")).toBeInTheDocument();
  });

  it("sdkEvents の件数が折りたたみとして表示される", () => {
    renderPanel({
      executeResult: createMockExecuteResult({
        sdkEvents: [
          { eventType: "init", text: "初期化完了" },
          { eventType: "error", errorMessage: "接続エラー" },
        ],
      }),
    });

    const toggle = screen.getByRole("button", {
      name: /SDK Events \(2\)/,
    });
    expect(toggle).toBeInTheDocument();

    // 展開
    fireEvent.click(toggle);
    expect(screen.getByText("[init]")).toBeInTheDocument();
    expect(screen.getByText("初期化完了")).toBeInTheDocument();
    expect(screen.getByText("[error]")).toBeInTheDocument();
    expect(screen.getByText("接続エラー")).toBeInTheDocument();
  });

  // T-ERP-10b: sourceProvenance
  it("sourceProvenance が表示される", () => {
    renderPanel({
      executeResult: createMockExecuteResult({
        sourceProvenance: {
          resolvedSkillCreatorRoot: "/path/to/root",
          manifestPath: "/path/to/manifest.json",
          resourceDescriptorHash: "abc123",
          manifestCacheKey: "cache-key-456",
        },
      }),
    });

    expect(screen.getByText("Source Provenance")).toBeInTheDocument();
    expect(screen.getByText("/path/to/root")).toBeInTheDocument();
    expect(screen.getByText("/path/to/manifest.json")).toBeInTheDocument();
    expect(screen.getByText("abc123")).toBeInTheDocument();
    expect(screen.getByText("cache-key-456")).toBeInTheDocument();
  });

  // T-ERP-11: terminal_handoff → ExecuteResultDetailPanel は表示しない
  it("executeResult が null の場合はパネルが表示されない（handoff パターン）", () => {
    const { container } = renderPanel({ executeResult: null });

    expect(container.firstChild).toBeNull();
  });

  // Edge case: skillName が空文字列
  it("skillName が空文字列の場合は fallback が表示される", () => {
    renderPanel({
      executeResult: createMockExecuteResult({ skillName: "" }),
    });

    expect(screen.getByText("名称未設定")).toBeInTheDocument();
  });

  // Edge case: 成功時に onRetry は非表示
  it("成功時には再試行ボタンが表示されない", () => {
    const onRetry = vi.fn();
    renderPanel({
      executeResult: createMockExecuteResult({ success: true }),
      onRetry,
    });

    expect(
      screen.queryByRole("button", { name: "再試行" }),
    ).not.toBeInTheDocument();
  });

  // Edge case: provenance の warningNote
  it("warningNote がある場合は amber 色で表示される", () => {
    renderPanel({
      executeResult: createMockExecuteResult({
        sourceProvenance: {
          warningNote: "ルートが変更されています",
        },
      }),
    });

    expect(screen.getByText("ルートが変更されています")).toBeInTheDocument();
  });

  // Edge case: 500文字の長い error メッセージでもレンダリングされる
  it("500文字の長い error メッセージが正常にレンダリングされる", () => {
    const longError = "E".repeat(500);
    renderPanel({
      executeResult: createMockExecuteResult({
        success: false,
        error: longError,
      }),
    });

    expect(screen.getByText(longError)).toBeInTheDocument();
  });

  // Edge case: 20個の permissionDenials の件数が正しく表示される
  it("20個の permissionDenials の件数が正しく表示される", () => {
    const permissionDenials = Array.from({ length: 20 }, (_, i) => ({
      toolName: `Tool-${i}`,
      reason: `Reason-${i}`,
    }));
    renderPanel({
      executeResult: createMockExecuteResult({ permissionDenials }),
    });

    const toggle = screen.getByRole("button", {
      name: /Permission Denials \(20\)/,
    });
    expect(toggle).toBeInTheDocument();

    // 展開して全件表示を確認
    fireEvent.click(toggle);
    for (let i = 0; i < 20; i++) {
      expect(screen.getByText(`Tool-${i}`)).toBeInTheDocument();
    }
  });

  // Edge case: 100個の sdkEvents の件数が正しく表示される
  it("100個の sdkEvents の件数が正しく表示される", () => {
    const sdkEvents = Array.from({ length: 100 }, (_, i) => ({
      eventType: `event-${i}`,
      text: `text-${i}`,
    }));
    renderPanel({
      executeResult: createMockExecuteResult({ sdkEvents }),
    });

    const toggle = screen.getByRole("button", {
      name: /SDK Events \(100\)/,
    });
    expect(toggle).toBeInTheDocument();
  });

  // Edge case: 長い sourceProvenance パスでもレンダリングされる
  it("長い sourceProvenance パスが正常にレンダリングされる", () => {
    const longPath = "/" + "very-long-directory-name/".repeat(20) + "file.json";
    renderPanel({
      executeResult: createMockExecuteResult({
        sourceProvenance: {
          resolvedSkillCreatorRoot: longPath,
          manifestPath: longPath,
          resourceDescriptorHash: "h".repeat(128),
          manifestCacheKey: "k".repeat(128),
        },
      }),
    });

    expect(screen.getByText("Source Provenance")).toBeInTheDocument();
    const rootElements = screen.getAllByText(longPath);
    expect(rootElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("h".repeat(128))).toBeInTheDocument();
    expect(screen.getByText("k".repeat(128))).toBeInTheDocument();
  });

  // Edge case: isLoading true → false の状態遷移でスケルトンが消える
  it("isLoading true → false の状態遷移でスケルトンが消えコンテンツが表示される", () => {
    const { rerender } = render(
      <ExecuteResultDetailPanel executeResult={null} isLoading={true} />,
    );

    // ローディング中はスケルトンが表示される
    expect(screen.getByTestId("execute-result-skeleton")).toBeInTheDocument();
    expect(screen.queryByText("test-skill")).not.toBeInTheDocument();

    // ローディング完了 → executeResult セット
    rerender(
      <ExecuteResultDetailPanel
        executeResult={createMockExecuteResult()}
        isLoading={false}
      />,
    );

    // スケルトンが消え、コンテンツが表示される
    expect(
      screen.queryByTestId("execute-result-skeleton"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("test-skill")).toBeInTheDocument();
    expect(screen.getByText("成功")).toBeInTheDocument();
  });

  // Edge case: error 状態から executeResult がセットされるとエラーがクリアされる
  it("error 状態から executeResult セットでエラーがクリアされる", () => {
    const error: PanelError = {
      message: "接続エラーが発生しました",
    };
    const { rerender } = render(
      <ExecuteResultDetailPanel executeResult={null} error={error} />,
    );

    // エラーが表示される
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("接続エラーが発生しました")).toBeInTheDocument();

    // executeResult がセットされ、error が解除される
    rerender(
      <ExecuteResultDetailPanel
        executeResult={createMockExecuteResult()}
        error={null}
      />,
    );

    // エラーバナーが消え、正常なコンテンツが表示される
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("test-skill")).toBeInTheDocument();
    expect(screen.getByText("成功")).toBeInTheDocument();
  });
});
