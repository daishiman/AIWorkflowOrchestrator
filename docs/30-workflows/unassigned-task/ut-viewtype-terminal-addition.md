# UNASSIGNED-03: ViewType に "terminal" を追加

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| タスクID | UNASSIGNED-03                                   |
| 優先度   | 中                                              |
| 元タスク | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 |
| 検出元   | Phase 5 実装時発見                              |
| 検出日   | 2026-03-23                                      |

---

## 概要

`ViewType` ユニオン型に `"terminal"` が含まれていないため、
`handleTerminalSwitch` と `handleOpenTerminal` が `setCurrentView("agent")` で代替実装されている。
Terminal surface への直接ナビゲーションを実現するには `ViewType` に `"terminal"` を追加し、
対応する View コンポーネントを実装する必要がある。

## 背景

Phase 5 実装中に発見。`apps/desktop/src/renderer/store/types.ts` の `ViewType` に
`"terminal"` が存在しないため、ChatPanel の handoff → ターミナル起動の導線が
`"agent"` ビューへのナビゲーションで代替されている。
Actionability は OK だが正確性がない状態。

UNASSIGNED-01（`app:open-terminal` IPC handler）と合わせて対応することで、
完全な terminal surface 導線が実現する。

## スコープ

### 含むもの

- `ViewType` への `"terminal"` 追加（`apps/desktop/src/renderer/store/types.ts`）
- terminal view に対応する React コンポーネントの作成（最小実装）
- `handleTerminalSwitch` / `handleOpenTerminal` の `setCurrentView("terminal")` への更新
- RenderView での terminal ルーティング対応

### 含まないもの

- Terminal エミュレータの本格実装（最小の View コンポーネントで十分）
- `app:open-terminal` IPC handler の実装（UNASSIGNED-01 のスコープ）

## 実装方針

```typescript
// apps/desktop/src/renderer/store/types.ts
export type ViewType =
  | "chat"
  | "agent"
  | "settings"
  | "terminal"  // 追加
  | ...;

// ChatPanel.tsx の修正
const handleTerminalSwitch = useCallback(() => {
  setCurrentView("terminal");  // "agent" → "terminal" に変更
}, [setCurrentView]);

const handleOpenTerminal = useCallback(() => {
  setCurrentView("terminal");  // "agent" → "terminal" に変更
  // IPC 呼び出しは UNASSIGNED-01 完了後に追加
}, [setCurrentView]);
```

## 受入基準

- [ ] `ViewType` に `"terminal"` を追加した
- [ ] terminal view に対応する React コンポーネントを作成した（最小実装可）
- [ ] ChatPanel の `handleTerminalSwitch` / `handleOpenTerminal` を `setCurrentView("terminal")` に更新した
- [ ] `pnpm typecheck` が通ることを確認した
- [ ] 関連テストが PASS することを確認した

## 参照

- `apps/desktop/src/renderer/store/types.ts` — ViewType 定義
- `apps/desktop/src/renderer/components/organisms/ChatPanel/` — 修正対象コンポーネント
- `apps/desktop/src/renderer/components/RenderView/` — View ルーティング
- `docs/30-workflows/unassigned-task/ut-chatpanel-open-terminal-ipc-handler.md` — UNASSIGNED-01（連携タスク）
