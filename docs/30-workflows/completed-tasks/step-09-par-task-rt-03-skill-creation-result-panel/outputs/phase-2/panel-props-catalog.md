# Phase 2: Panel Props Catalog

## PanelError (共通)

```typescript
interface PanelError {
  code?: string;
  message: string;
  retryable?: boolean;
}
```

## ErrorBannerProps

```typescript
interface ErrorBannerProps {
  error: PanelError;
  onRetry?: () => void;
}
```

## PlanResultDetailPanelProps

```typescript
interface PlanResultDetailPanelProps {
  planResult: RuntimeSkillCreatorPlanResult | null;
  error?: PanelError | null;
  isLoading?: boolean;
  onRetry?: () => void;
}
```

## ExecuteResultDetailPanelProps

```typescript
interface ExecuteResultDetailPanelProps {
  executeResult: RuntimeSkillCreatorExecuteResult | null;
  error?: PanelError | null;
  isLoading?: boolean;
  onRetry?: () => void;
}
```

## Tailwind CSS Design Tokens

| パターン       | class                                                                            |
| -------------- | -------------------------------------------------------------------------------- |
| カードコンテナ | `rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5` |
| ヘッダー       | `text-base font-semibold text-[var(--text-primary)]`                             |
| セクション区切 | `border-t border-[var(--border-primary)] pt-3 mt-3`                              |
| リスト         | `space-y-2 text-sm text-[var(--text-primary)]`                                   |
| バッジ/タグ    | `inline-flex items-center rounded-full px-2 py-1 text-xs font-medium`            |
| 成功バッジ     | `bg-[var(--status-success)]/10 text-[var(--status-success)]`                     |
| 失敗バッジ     | `bg-[var(--status-error)]/10 text-[var(--status-error)]`                         |
| エラー背景     | `border border-[var(--status-error)]/30 bg-[var(--status-error)]/5`              |
| メタデータ     | `rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3`    |
