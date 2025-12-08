import React from "react";
import clsx from "clsx";

export interface GlassPanelProps {
  children: React.ReactNode;
  radius?: "none" | "sm" | "md" | "lg";
  blur?: "none" | "sm" | "md" | "lg";
  className?: string;
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
}) => {
  return (
    <div
      className={clsx(
        "relative",
        "bg-[rgba(30,30,30,0.6)]",
        "border border-white/10",
        "shadow-[0_20px_60px_rgba(0,0,0,0.6)]",
        blurStyles[blur],
        radiusStyles[radius],
        className,
      )}
    >
      {children}
    </div>
  );
};

GlassPanel.displayName = "GlassPanel";
