import React, { memo, useEffect, useState } from "react";
import clsx from "clsx";
import { SlideInPanel } from "../../molecules/SlideInPanel";

export interface MasterDetailLayoutProps {
  master: React.ReactNode;
  detail: React.ReactNode;
  isDetailOpen: boolean;
  masterWidth?: string;
  overlayOnMobile?: boolean;
  onCloseDetail?: () => void;
}

function getDesktopFlag(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  return window.innerWidth >= 1024;
}

const MasterDetailLayoutComponent: React.FC<MasterDetailLayoutProps> = ({
  master,
  detail,
  isDetailOpen,
  masterWidth = "380px",
  overlayOnMobile = true,
  onCloseDetail,
}) => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => getDesktopFlag());

  useEffect(() => {
    const handleResize = (): void => {
      setIsDesktop(getDesktopFlag());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isDesktop || !overlayOnMobile) {
    return (
      <div className="flex h-full min-h-0 w-full">
        <section
          className="min-h-0 overflow-auto border-r border-[var(--border-default)]"
          style={{ width: masterWidth }}
        >
          {master}
        </section>
        <section
          className={clsx(
            "min-h-0 flex-1 overflow-auto",
            !isDetailOpen && "hidden",
          )}
        >
          {detail}
        </section>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full">
      <section className="h-full overflow-auto">{master}</section>
      <SlideInPanel
        isOpen={isDetailOpen}
        onClose={onCloseDetail ?? (() => undefined)}
        side="right"
        width="100%"
        title="詳細"
        showOverlay={true}
      >
        {detail}
      </SlideInPanel>
    </div>
  );
};

export const MasterDetailLayout = memo(MasterDetailLayoutComponent);
MasterDetailLayout.displayName = "MasterDetailLayout";
