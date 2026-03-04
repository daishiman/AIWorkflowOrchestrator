# Phase 2 インターフェース仕様

- 作成日: 2026-03-04

## SearchBar

```ts
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  shortcutHint?: string;
  autoFocus?: boolean;
}
```

## CodeViewer

```ts
interface CodeViewerProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  filePath?: string;
  showCopyButton?: boolean;
}
```

## TabSwitcher

```ts
interface TabSwitcherTab {
  id: string;
  label: string;
  icon?: IconName;
  badge?: string | number;
  disabled?: boolean;
}

interface TabSwitcherProps {
  tabs: TabSwitcherTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: "underline" | "pill";
}
```

## SlideInPanel

```ts
interface SlideInPanelProps {
  isOpen: boolean;
  onClose: () => void;
  side: "right" | "left";
  width?: string;
  title?: string;
  children: React.ReactNode;
  showOverlay?: boolean;
}
```

## ConfirmDialog

```ts
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}
```
