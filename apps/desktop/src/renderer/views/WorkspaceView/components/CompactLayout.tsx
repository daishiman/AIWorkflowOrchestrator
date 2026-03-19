import { useEffect, useRef, useState } from "react";

interface CompactLayoutProps {
  children: React.ReactNode;
  breakpoint?: number;
}

export const CompactLayout: React.FC<CompactLayoutProps> = ({
  children,
  breakpoint = 360,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setIsCompact(width <= breakpoint);
      }
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [breakpoint]);

  return (
    <div
      ref={containerRef}
      data-testid="workspace-compact-layout"
      data-compact={isCompact ? "true" : undefined}
    >
      {children}
    </div>
  );
};
