import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";

export interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  children: React.ReactNode;
}

const positionStyles = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = "right",
  delay = 300,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={clsx(
            "absolute whitespace-nowrap z-50",
            "pointer-events-none",
            positionStyles[position],
          )}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-md shadow-lg">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

Tooltip.displayName = "Tooltip";
