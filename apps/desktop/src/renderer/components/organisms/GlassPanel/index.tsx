import React from "react";
import clsx from "clsx";

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: "none" | "sm" | "md" | "lg";
  blur?: "none" | "sm" | "md" | "lg";
}

const radiusStyles = {
  none: "rounded-none",
  sm: "rounded-[8px]",
  md: "rounded-[16px]",
  lg: "rounded-[24px]",
};

const blurStyles = {
  none: "backdrop-blur-none",
  sm: "backdrop-blur-[10px]",
  md: "backdrop-blur-[20px]",
  lg: "backdrop-blur-[40px]",
};

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  radius = "md",
  blur = "md",
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "relative",
        "bg-[var(--bg-glass)]",
        "border border-[var(--border-subtle)]",
        "shadow-[var(--shadow-xl)]",
        blurStyles[blur],
        radiusStyles[radius],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

GlassPanel.displayName = "GlassPanel";
