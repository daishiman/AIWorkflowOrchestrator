import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetFileWatcherGuard, useFileWatcher } from "./useFileWatcher";

describe("useFileWatcher", () => {
  const watchStart = vi.fn();
  const watchStop = vi.fn();
  let onChangedHandler: ((event: { filePath: string }) => void) | null = null;

  beforeEach(() => {
    resetFileWatcherGuard();
    vi.useFakeTimers();
    watchStart.mockReset();
    watchStop.mockReset();
    watchStart.mockResolvedValue({ success: true, watchId: "watch-1" });
    watchStop.mockResolvedValue({ success: true });
    onChangedHandler = null;
    window.electronAPI = {
      ...(window.electronAPI ?? {}),
      file: {
        ...(window.electronAPI?.file ?? {}),
        watchStart,
        watchStop,
        onChanged: (callback: (event: { filePath: string }) => void) => {
          onChangedHandler = callback;
          return () => {
            onChangedHandler = null;
          };
        },
      },
    } as typeof window.electronAPI;
  });

  it("filePath 指定時に watch を開始する", async () => {
    const onFileChanged = vi.fn();

    await act(async () => {
      renderHook(() =>
        useFileWatcher({
          filePath: "/workspace/src/app.ts",
          enabled: true,
          onFileChanged,
        }),
      );
    });

    expect(watchStart).toHaveBeenCalledTimes(1);
    expect(watchStart).toHaveBeenCalledWith({
      watchPath: "/workspace/src/app.ts",
    });
  });

  it("同一 path の再 render で重複 start しない", async () => {
    const onFileChanged = vi.fn();
    const { rerender } = renderHook(
      ({ filePath }) =>
        useFileWatcher({
          filePath,
          enabled: true,
          onFileChanged,
        }),
      {
        initialProps: { filePath: "/workspace/src/app.ts" },
      },
    );

    await act(async () => {
      rerender({ filePath: "/workspace/src/app.ts" });
    });

    expect(watchStart).toHaveBeenCalledTimes(1);
  });

  it("file:changed を debounce して再読込 callback を呼ぶ", async () => {
    const onFileChanged = vi.fn();

    await act(async () => {
      renderHook(() =>
        useFileWatcher({
          filePath: "/workspace/src/app.ts",
          enabled: true,
          onFileChanged,
        }),
      );
    });

    await act(async () => {
      onChangedHandler?.({ filePath: "/workspace/src/app.ts" });
      vi.advanceTimersByTime(299);
    });
    expect(onFileChanged).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(onFileChanged).toHaveBeenCalledWith("/workspace/src/app.ts");
  });

  it("callback が差し替わっても同一 path では再 start しない", async () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();
    const { rerender } = renderHook(
      ({ onFileChanged }) =>
        useFileWatcher({
          filePath: "/workspace/src/app.ts",
          enabled: true,
          onFileChanged,
        }),
      {
        initialProps: { onFileChanged: firstCallback },
      },
    );

    await act(async () => {
      // watcher registration completion
    });

    await act(async () => {
      rerender({ onFileChanged: secondCallback });
    });

    expect(watchStart).toHaveBeenCalledTimes(1);

    await act(async () => {
      onChangedHandler?.({ filePath: "/workspace/src/app.ts" });
      vi.advanceTimersByTime(300);
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledWith("/workspace/src/app.ts");
  });
});
