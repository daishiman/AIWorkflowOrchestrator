# Phase 3 成果物: リスク登録簿

## リスク一覧

| ID   | リスク                                                         | 影響                | 対策                                                   | 状態     |
| ---- | -------------------------------------------------------------- | ------------------- | ------------------------------------------------------ | -------- |
| R-01 | ViewType移行時の命名ドリフト（`skill-center` / `skillCenter`） | 画面遷移失敗        | 両値対応を維持し段階移行                               | 監視中   |
| R-02 | IPCチャネル追加時のallowlist漏れ                               | Preload呼び出し失敗 | `channels.ui-01-store-ipc-architecture.test.ts` で固定 | 対策済み |
| R-03 | Main/Preload/Rendererの型ドリフト                              | 実行時例外          | shared型 + preload型を同期管理                         | 対策済み |
| R-04 | IPC sender未検証                                               | セキュリティリスク  | `validateIpcSender` を両ハンドラへ適用                 | 解消     |
| R-05 | エラー情報露出                                                 | 情報漏えいリスク    | `sanitizeErrorMessage` を適用                          | 解消     |

## ゲート判定

- MAJOR: 0
- MINOR: 1（R-01: 移行期間の命名併存）
- 判定: PASS
