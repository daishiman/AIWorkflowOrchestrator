import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Icon } from "../../atoms/Icon";
import { Spinner } from "../../atoms/Spinner";

export interface DynamicIslandProps {
  visible: boolean;
  status: "processing" | "completed";
  message: string;
  duration?: number;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  visible,
  status,
  message,
  duration = 3000,
}) => {
  const [isShowing, setIsShowing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsShowing(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });

      if (status === "completed" && duration > 0) {
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setTimeout(() => {
            setIsShowing(false);
          }, 300);
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsShowing(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [visible, status, duration]);

  if (!isShowing) {
    return null;
  }

  return (
    <div
      className={clsx(
        "fixed top-4 left-1/2 -translate-x-1/2 z-[700]",
        "transition-all duration-300 ease-out",
        {
          "opacity-100 translate-y-0": isAnimating,
          "opacity-0 -translate-y-4": !isAnimating,
        },
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={clsx(
          "flex items-center gap-3 px-6 py-3",
          "bg-gray-900/90 backdrop-blur-md",
          "rounded-full shadow-xl",
          "border border-white/10",
        )}
      >
        {status === "processing" && (
          <Spinner size="sm" className="text-blue-400" />
        )}
        {status === "completed" && (
          <div className="flex items-center justify-center w-5 h-5">
            <Icon name="check" size={20} className="text-green-400" />
          </div>
        )}
        <span className="text-sm text-white font-medium whitespace-nowrap">
          {message}
        </span>
      </div>
    </div>
  );
};

DynamicIsland.displayName = "DynamicIsland";
