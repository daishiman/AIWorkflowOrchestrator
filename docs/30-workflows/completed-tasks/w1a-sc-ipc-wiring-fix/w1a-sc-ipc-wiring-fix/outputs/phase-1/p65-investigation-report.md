# P65 調査レポート

> タスクID: TASK-SC-01-IPC-WIRING-FIX
> 作成日: 2026-03-23
> Phase: 1 - 要件定義

## 調査対象

P65: Runtime helper の dead-end namespace による IPC contract drift

## 調査結果: 既解消

### 検証方法

1. `grep -rn "creator:" apps/desktop/src/main/handlers/` で旧 namespace を検索
2. `grep -rn "ipcMain.handle" apps/desktop/src/main/handlers/creatorHandlers.ts` でハンドラ登録を確認
3. channels.ts の定数定義と Preload allowlist の突合

### 検証結果

| 検証項目                                | 結果                                |
| --------------------------------------- | ----------------------------------- |
| 旧 `creator:*` namespace のハンドラ登録 | 0件（完全除去済み）                 |
| creatorHandlers.ts の全チャネル prefix  | `skill-creator:` に統一済み         |
| Preload allowlist との整合性            | 全16チャネルが allowlist に含まれる |
| channels.ts 定数定義の網羅性            | 全16チャネルに対応する定数が存在    |

### 結論

PR #1447（feat(ipc): Runtime Skill Creator public IPC wiring 統合）により P65 は解消済み。本タスクでは P65 再発防止テスト（IPC-P65-001, IPC-P65-002）を追加し、ガードレールを強化した。
