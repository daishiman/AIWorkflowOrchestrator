# aiworkflow-requirements 必須仕様カタログ

## 目的

今回の実装（skill IPCレスポンス契約統一）で必要な仕様を漏れなく抽出し、参照先を固定する。

## 必須仕様セット

| 分類                     | 仕様                                      | 必須理由                                 |
| ------------------------ | ----------------------------------------- | ---------------------------------------- |
| IPC契約                  | `api-ipc-agent.md`                        | `skill:*` チャネル契約・戻り値定義       |
| 型契約                   | `interfaces-agent-sdk-skill.md`           | Preload/Renderer型整合                   |
| サービス責務             | `arch-electron-services.md`               | Main/Preload責務境界・RemoveResult整合   |
| 契約監査                 | `ipc-contract-checklist.md`               | P23/P32/P42/P44/P45再発防止              |
| 実装パターン             | `architecture-implementation-patterns.md` | `safeInvoke`/`safeInvokeUnwrap` 適用規約 |
| IPCセキュリティ          | `security-skill-ipc.md`                   | `validateIpcSender` と引数検証           |
| Electron IPCセキュリティ | `security-electron-ipc.md`                | sender検証・入力検証ルール               |
| Preload APIセキュリティ  | `security-api-electron.md`                | contextBridge公開面保護                  |
| エラー設計               | `error-handling.md`                       | エラー分類・返却方針・通知               |
| 品質基準                 | `quality-requirements.md`                 | テスト品質・カバレッジ基準               |
| 仕様更新運用             | `task-workflow.md`                        | Phase 12更新・未タスク管理               |
| 教訓                     | `lessons-learned.md`                      | 類似失敗の再発防止                       |

## 反映確認

- Phase 1〜13 の各仕様書参照資料に、上記仕様セットを反映済み。
