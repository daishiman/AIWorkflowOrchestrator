import React from "react";
import { Icon } from "../Icon";
import clsx from "clsx";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  color = "currentColor",
  className,
}) => {
  return (
    <Icon
      name="loader-2"
      size={sizeMap[size]}
      color={color}
      className={clsx("animate-spin", className)}
      spin
    />
  );
};

Spinner.displayName = "Spinner";
