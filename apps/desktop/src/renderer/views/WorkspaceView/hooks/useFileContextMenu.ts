import { useState } from "react";

export interface FileContextMenuState {
  x: number;
  y: number;
  filePath: string;
}

export interface UseFileContextMenuReturn {
  menu: FileContextMenuState | null;
  openMenu: (x: number, y: number, filePath: string) => void;
  closeMenu: () => void;
}

export function useFileContextMenu(): UseFileContextMenuReturn {
  const [menu, setMenu] = useState<FileContextMenuState | null>(null);

  return {
    menu,
    openMenu: (x, y, filePath) => setMenu({ x, y, filePath }),
    closeMenu: () => setMenu(null),
  };
}
