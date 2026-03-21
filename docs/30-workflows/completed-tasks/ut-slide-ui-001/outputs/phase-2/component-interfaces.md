# Phase 2 成果物: コンポーネントインターフェース

## 1. SlideSyncCard

```typescript
// apps/desktop/src/renderer/slide/components/SlideSyncCard.tsx

interface SlideSyncCardProps {
  projectPath: string;
  uiStatus: SlideUIStatus;
  lastSyncedAt: Date | null;
  degradedReason?: string;
}

// variantStyles（P47 対策: テストから import 可能）
export const variantStyles: Record<
  SlideUIStatus,
  { badge: string; label: string }
> = {
  synced: { badge: "bg-[#34C759] dark:bg-[#30D158]", label: "同期済み" },
  running: { badge: "bg-[#007AFF] dark:bg-[#0A84FF]", label: "同期中..." },
  degraded: { badge: "bg-[#FF9500] dark:bg-[#FF9F0A]", label: "同期失敗" },
  guidance: {
    badge: "bg-[#007AFF] dark:bg-[#0A84FF]",
    label: "設定が必要です",
  },
};
```

**配置**: SlideWorkspace 上部、常時表示
**ARIA**: `aria-label="同期状態: {label}"`

## 2. SlideProgressRow

```typescript
// apps/desktop/src/renderer/slide/components/SlideProgressRow.tsx

interface SlideProgressRowProps {
  percent: number; // 0-100
  message: string;
  onCancel: () => void;
}
```

**配置**: SlideSyncCard 直下、running 状態時のみ表示
**ARIA**: `role="progressbar"` + `aria-valuenow` + `aria-valuemin="0"` + `aria-valuemax="100"`
**キャンセル CTA**: destructive スタイル、percent === 100 で disabled

## 3. SlideWatchStatus

```typescript
// apps/desktop/src/renderer/slide/components/SlideWatchStatus.tsx

interface SlideWatchStatusProps {
  watching: boolean;
  watchPath?: string;
  syncDirection?: "forward" | "reverse";
}

// variantStyles（P47 対策）
export const dotStyles: Record<string, string> = {
  active: "bg-[#34C759] dark:bg-[#30D158]",
  inactive: "bg-[#C6C6C8] dark:bg-[#38383A]",
};

export const labelMap: Record<string, string> = {
  active: "監視中",
  inactive: "停止中",
};
```

**配置**: SlideSyncCard 内のサブ情報
**ARIA**: `role="status"`
**同期方向**: forward="&#x2192;" / reverse="&#x2190;"

## 4. SlideGuidanceBlock

```typescript
// apps/desktop/src/renderer/slide/components/SlideGuidanceBlock.tsx

type GuidanceVariant = "guidance" | "degraded";

interface GuidanceStep {
  label: string;
  description: string;
}

interface SlideGuidanceBlockProps {
  variant: GuidanceVariant;
  title: string;
  reason: string;
  steps?: GuidanceStep[];
  primaryCTA: { label: string; onClick: () => void };
  secondaryCTA?: { label: string; onClick: () => void };
}

// variantStyles（P47 対策）
export const variantStyles: Record<GuidanceVariant, string> = {
  guidance:
    "border-[#007AFF] dark:border-[#0A84FF] bg-[rgba(0,122,255,0.08)] dark:bg-[rgba(10,132,255,0.08)]",
  degraded:
    "border-[#FF9500] dark:border-[#FF9F0A] bg-[rgba(255,149,0,0.12)] dark:bg-[rgba(255,159,10,0.12)]",
};
```

**配置**: メインコンテンツ領域、degraded/guidance 状態時のみ表示
**ARIA**: `role="alert"` (degraded), `role="complementary"` (guidance)

## 5. TerminalLauncher

```typescript
// apps/desktop/src/renderer/slide/components/TerminalLauncher.tsx

interface TerminalLauncherProps {
  terminalCommand?: string;
  onCopy: () => void;
  onLaunch: () => void;
}
```

**配置**: SlideWorkspace 内、右下固定（`absolute right-0 bottom-0`）
**表示条件**: `terminalCommand` が存在する場合のみ表示
**ARIA**: `role="complementary"` + `aria-label="ターミナルランチャー"`
**コピー CTA**: クリック後 "コピーしました" フィードバック
