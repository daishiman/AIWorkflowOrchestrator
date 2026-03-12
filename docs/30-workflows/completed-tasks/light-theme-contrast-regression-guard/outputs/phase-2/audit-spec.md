# Audit Spec

> P50パターン該当: 検証・補完モード。既存 hardcoded color drift の抽出規則を formalize する。

## Raw Pattern

```text
text-white
text-white/
bg-white/
border-white/10
bg-slate-
text-slate-
bg-zinc-
text-zinc-
```

## Hot Spot Priority

| 優先度 | 対象                       | 根拠                       |
| ------ | -------------------------- | -------------------------- |
| P1     | `WorkspaceSearchPanel.tsx` | 33 hit                     |
| P1     | `AuthView/index.tsx`       | 4 hit                      |
| P1     | `ThemeSelector/index.tsx`  | 4 hit                      |
| P2     | Settings shell / Dashboard | hit 数は低いが被害面が広い |

## Exclusion Rule

1. token value 参照として正当化される `var(--*)` は対象外
2. dark baseline 用の比較 capture は drift とみなさない
3. bug path 専用 harness 内の mock-only style は current issue へ直結させない

## Current / Baseline Split

| 分類              | 条件                                                   |
| ----------------- | ------------------------------------------------------ |
| current violation | 今回の変更対象 surface で新規または未解消の drift      |
| baseline backlog  | 既存 workflow 由来で本 task では仕様のみ参照する drift |
