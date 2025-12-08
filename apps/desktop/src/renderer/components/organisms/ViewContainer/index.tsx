import React from "react";
import clsx from "clsx";
import { GlassPanel } from "../GlassPanel";

export interface ViewContainerProps {
  children: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  scroll?: "none" | "vertical" | "horizontal" | "both";
  className?: string;
}

const paddingStyles = {
  none: "p-0",
  sm: "p-[16px]",
  md: "p-[24px]",
  lg: "p-[32px]",
};

const scrollStyles = {
  none: "overflow-hidden",
  vertical: "overflow-y-auto overflow-x-hidden",
  horizontal: "overflow-x-auto overflow-y-hidden",
  both: "overflow-auto",
};

export const ViewContainer: React.FC<ViewContainerProps> = ({
  children,
  padding = "md",
  scroll = "vertical",
  className,
}) => {
  return (
    <GlassPanel
      radius="lg"
      blur="md"
      className={clsx(
        "h-full",
        paddingStyles[padding],
        scrollStyles[scroll],
        "[&::-webkit-scrollbar]:w-2",
        "[&::-webkit-scrollbar]:h-2",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:bg-white/20",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-thumb]:hover:bg-white/30",
        "[&::-webkit-scrollbar-corner]:bg-transparent",
        className,
      )}
    >
      {children}
    </GlassPanel>
  );
};

ViewContainer.displayName = "ViewContainer";
