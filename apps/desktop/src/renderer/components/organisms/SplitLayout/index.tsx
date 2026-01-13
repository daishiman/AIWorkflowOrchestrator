/**
 * SplitLayout - 分割レイアウトコンポーネント
 * 左右2つのパネルをドラッグ可能なディバイダーで分割表示
 * @module SplitLayout
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

export interface SplitLayoutProps {
  /** 左パネルのコンテンツ */
  leftPanel: React.ReactNode;
  /** 右パネルのコンテンツ */
  rightPanel: React.ReactNode;
  /** 初期分割比率（0-100、左パネルの幅%） */
  initialRatio?: number;
  /** 最小分割比率 */
  minRatio?: number;
  /** 最大分割比率 */
  maxRatio?: number;
  /** 比率変更時のコールバック */
  onRatioChange?: (ratio: number) => void;
  /** 右パネル表示フラグ */
  showRightPanel?: boolean;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * 分割比率をmin/max範囲内にクランプ
 */
const clampRatio = (ratio: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, ratio));
};

/**
 * SplitLayout コンポーネント
 */
export const SplitLayout: React.FC<SplitLayoutProps> = ({
  leftPanel,
  rightPanel,
  initialRatio = 50,
  minRatio = 20,
  maxRatio = 80,
  onRatioChange,
  showRightPanel = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(
    clampRatio(initialRatio, minRatio, maxRatio),
  );
  const [isDragging, setIsDragging] = useState(false);

  /**
   * ドラッグ開始ハンドラ
   */
  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
    },
    [],
  );

  /**
   * ドラッグ中ハンドラ
   */
  const handleDrag = useCallback(
    (clientX: number) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      // テスト環境や幅0の場合は処理をスキップ
      if (rect.width === 0) return;

      const x = clientX - rect.left;
      const newRatio = (x / rect.width) * 100;
      const clampedRatio = clampRatio(newRatio, minRatio, maxRatio);

      setRatio(clampedRatio);
      onRatioChange?.(clampedRatio);
    },
    [isDragging, minRatio, maxRatio, onRatioChange],
  );

  /**
   * ドラッグ終了ハンドラ
   */
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * マウス移動イベント
   */
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDrag(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  /**
   * キーボード操作ハンドラ
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = 5; // 5%ずつ移動
      let newRatio = ratio;

      switch (e.key) {
        case "ArrowLeft":
          newRatio = ratio - step;
          break;
        case "ArrowRight":
          newRatio = ratio + step;
          break;
        case "Home":
          newRatio = minRatio;
          break;
        case "End":
          newRatio = maxRatio;
          break;
        default:
          return;
      }

      e.preventDefault();
      const clampedRatio = clampRatio(newRatio, minRatio, maxRatio);
      setRatio(clampedRatio);
      onRatioChange?.(clampedRatio);
    },
    [ratio, minRatio, maxRatio, onRatioChange],
  );

  // 右パネル非表示時は左パネルのみ表示
  if (!showRightPanel) {
    return (
      <div
        ref={containerRef}
        className={clsx("flex h-full w-full", className)}
        data-testid="split-layout"
      >
        <div className="h-full w-full" data-testid="left-panel">
          {leftPanel}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={clsx(
        "flex h-full w-full",
        isDragging && "select-none cursor-col-resize",
        className,
      )}
      data-testid="split-layout"
    >
      {/* 左パネル */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${ratio}%` }}
        data-testid="left-panel"
      >
        {leftPanel}
      </div>

      {/* ディバイダー */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(ratio)}
        aria-valuemin={minRatio}
        aria-valuemax={maxRatio}
        aria-label="分割位置を調整"
        tabIndex={0}
        className={clsx(
          "flex-shrink-0 w-1 cursor-col-resize",
          "bg-[var(--border-subtle)] hover:bg-[var(--border-default)]",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          isDragging && "bg-blue-500",
        )}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onKeyDown={handleKeyDown}
        data-testid="divider"
      >
        {/* ドラッグハンドル視覚表示 */}
        <div className="w-full h-full flex items-center justify-center">
          <div
            className={clsx(
              "w-0.5 h-8 rounded-full",
              "bg-[var(--text-tertiary)]",
              isDragging && "bg-white",
            )}
          />
        </div>
      </div>

      {/* 右パネル */}
      <div
        className="h-full flex-1 overflow-hidden"
        style={{ width: `${100 - ratio}%` }}
        data-testid="right-panel"
      >
        {rightPanel}
      </div>
    </div>
  );
};

SplitLayout.displayName = "SplitLayout";
