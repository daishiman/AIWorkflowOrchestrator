import { useEffect, useRef, useState } from "react";

export interface UsePanelResizeOptions {
  width: number;
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  direction?: "forward" | "reverse";
  onWidthChange: (width: number) => void;
}

export interface UsePanelResizeReturn {
  isDragging: boolean;
  handleMouseDown: (event: React.MouseEvent<HTMLElement>) => void;
  handleDoubleClick: () => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
}

function clamp(value: number, minWidth: number, maxWidth: number): number {
  return Math.min(maxWidth, Math.max(minWidth, value));
}

export function usePanelResize({
  width,
  minWidth,
  maxWidth,
  defaultWidth,
  direction = "forward",
  onWidthChange,
}: UsePanelResizeOptions): UsePanelResizeReturn {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);
  const directionFactor = direction === "forward" ? 1 : -1;

  useEffect(() => {
    if (!isDragging) {
      return undefined;
    }

    const handleMouseMove = (event: MouseEvent): void => {
      const delta = (event.clientX - startXRef.current) * directionFactor;
      onWidthChange(clamp(startWidthRef.current + delta, minWidth, maxWidth));
    };

    const handleMouseUp = (): void => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, maxWidth, minWidth, onWidthChange]);

  return {
    isDragging,
    handleMouseDown: (event) => {
      event.preventDefault();
      startXRef.current = event.clientX;
      startWidthRef.current = width;
      setIsDragging(true);
    },
    handleDoubleClick: () => {
      onWidthChange(defaultWidth);
    },
    handleKeyDown: (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onWidthChange(clamp(width - 20 * directionFactor, minWidth, maxWidth));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onWidthChange(clamp(width + 20 * directionFactor, minWidth, maxWidth));
      } else if (event.key === "Home") {
        event.preventDefault();
        onWidthChange(minWidth);
      } else if (event.key === "End") {
        event.preventDefault();
        onWidthChange(maxWidth);
      }
    },
  };
}
