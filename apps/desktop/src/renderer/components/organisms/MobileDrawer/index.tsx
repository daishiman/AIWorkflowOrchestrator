import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Button } from "../../atoms/Button";

export interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open,
  onClose,
  children,
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown as EventListener);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown as EventListener);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex">
      <div
        className={clsx(
          "absolute inset-0 bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={clsx(
          "relative flex flex-col w-[85vw] max-w-[320px] h-screen",
          "bg-[rgba(20,20,20,0.95)] backdrop-blur-xl",
          "transform transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-end p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="閉じる"
          >
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

MobileDrawer.displayName = "MobileDrawer";
