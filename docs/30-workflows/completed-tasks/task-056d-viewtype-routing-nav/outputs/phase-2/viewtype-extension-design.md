# Phase 2 ViewType拡張設計（SubAgent-A）

## 正本

- `apps/desktop/src/renderer/store/types.ts`

## ナビ対象ViewType

- `dashboard`
- `workspace`
- `chat`
- `agent`
- `skillCenter`
- `historySearch`
- `graph`
- `editor`
- `settings`

## 互換性

- `App.tsx` 側で `skill-center` 互換ケースを維持（既存導線保護）
- `navigationSlice` は `ViewType` 型の拡張追従のみで変更不要
