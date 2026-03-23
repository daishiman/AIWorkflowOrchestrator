# UNASSIGNED-01: openTerminal IPC handler の確認と実装

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| タスクID | UNASSIGNED-01                                   |
| 優先度   | 高                                              |
| 元タスク | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 |
| 検出元   | Phase 3 設計レビュー MINOR-A（GAP-04）          |
| 検出日   | 2026-03-23                                      |

---

## 概要

`app:open-terminal` IPC channel が Main Process に登録されているかどうかを確認し、
未登録の場合は新規実装を行う。

## 背景

Phase 3 設計レビューで「GAP-04 openTerminal IPC channel 存在確認が未実施」として指摘された。
ChatPanel の `handleOpenTerminal` ハンドラが呼び出す IPC channel の実体が存在しないと、
手動テスト MT-03（handoff → ターミナル起動）が失敗する。

## スコープ

### 含むもの

- `apps/desktop/src/main/` 内の `app:open-terminal` 登録状況確認
- `apps/desktop/src/preload/` 内の allowlist への追加確認
- 未登録の場合の新規 IPC handler 実装
- `IPC_CHANNELS.APP_OPEN_TERMINAL` 定数追加

### 含まないもの

- ChatPanel コンポーネントの変更（既存の呼び出しコードはそのまま）
- Terminal View コンポーネントの実装（UNASSIGNED-03 のスコープ）

## 確認コマンド

```bash
grep -rn "open-terminal\|openTerminal" apps/desktop/src/main/
grep -rn "open-terminal\|openTerminal" apps/desktop/src/preload/
```

## 実装方針（未登録の場合）

ipc-contract-checklist.md Phase 1-6 を遵守して実装する。

```typescript
// IPC_CHANNELS に追加
APP_OPEN_TERMINAL = "app:open-terminal";

// Main handler
ipcMain.handle(IPC_CHANNELS.APP_OPEN_TERMINAL, async (event) => {
  // Electron の shell.openExternal または BrowserWindow で terminal を開く
  // P42 準拠: 引数なしのため バリデーション不要
});
```

## 受入基準

- [ ] `app:open-terminal` が Main Process に登録されているか確認した
- [ ] 未登録の場合は新規 IPC handler を実装した
- [ ] Preload allowlist に `app:open-terminal` を追加した
- [ ] `IPC_CHANNELS` 定数に `APP_OPEN_TERMINAL = 'app:open-terminal'` を追加した
- [ ] `pnpm typecheck` が通ることを確認した
- [ ] MT-03（handoff → ターミナル起動）が期待結果を充足することを確認した

## 参照

- `apps/desktop/src/main/ipc/` — IPC handler 登録箇所
- `apps/desktop/src/preload/` — allowlist 管理箇所
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` — IPC 契約チェックリスト
- `docs/30-workflows/unassigned-task/ut-viewtype-terminal-addition.md` — UNASSIGNED-03（連携タスク）
