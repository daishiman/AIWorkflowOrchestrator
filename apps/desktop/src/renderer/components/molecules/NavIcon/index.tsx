import React, { useState } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../../atoms/Icon";
import { Tooltip } from "../Tooltip";

export interface NavIconProps {
  icon: IconName;
  tooltip: string;
  active?: boolean;
  onClick: () => void;
  shortcut?: string;
}

export const NavIcon: React.FC<NavIconProps> = ({
  icon,
  tooltip,
  active = false,
  onClick,
  shortcut,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const tooltipContent = shortcut ? `${tooltip} (${shortcut})` : tooltip;

  return (
    <Tooltip content={tooltipContent} position="right" delay={500}>
      <button
        className={clsx(
          "relative flex items-center justify-center",
          "w-12 h-12 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "focus:ring-offset-gray-900",
          {
            "bg-white/10 border-l-2 border-blue-500": active,
            "bg-white/5": isHovered && !active,
            "hover:bg-white/5": !active,
          },
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={tooltip}
        aria-pressed={active}
        role="button"
      >
        <Icon name={icon} size={24} className="text-white" />
      </button>
    </Tooltip>
  );
};

NavIcon.displayName = "NavIcon";
