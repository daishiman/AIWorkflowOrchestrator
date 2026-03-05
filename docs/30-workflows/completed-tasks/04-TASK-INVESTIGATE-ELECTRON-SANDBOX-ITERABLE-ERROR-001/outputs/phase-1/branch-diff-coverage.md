# Phase 1 ブランチ差分カバレッジ

## 対象ブランチ情報

- Branch: `docs/task-04-electron-sandbox-iterable-error-001-spec`
- HEAD: `8eee219d0`

## 実装差分（本タスク関連）

```text
apps/desktop/src/main/ipc/profileHandlers.test.ts  |  76 ++++++++++++++++
apps/desktop/src/main/ipc/profileHandlers.ts       |   7 +-
apps/desktop/src/renderer/store/slices/authSlice.test.ts    |  40 +++++++++
apps/desktop/src/renderer/store/slices/authSlice.ts | 100 +++++++++++++++++++--
4 files changed, 211 insertions(+), 12 deletions(-)
```

## 差分→検証対応

- Main IPC差分: `profileHandlers.test.ts` で通知payload整合を検証。
- Renderer差分: `authSlice.test.ts` で正規化・回復パスを検証。
- UI回帰: `AccountSection.portal.test.tsx` で影響範囲の非退行を確認。
