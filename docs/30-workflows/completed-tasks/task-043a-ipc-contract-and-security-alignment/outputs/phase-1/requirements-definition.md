# Phase 1 要件定義書

## 概要

- タスク: TASK-043A IPC契約・セキュリティ整合
- 実施日: 2026-03-05
- 担当: SubAgent-A（契約）/ SubAgent-B（セキュリティ）/ SubAgent-C（エラー）

## 機能要件

| ID    | 要件                                                                                    | 根拠                                  |
| ----- | --------------------------------------------------------------------------------------- | ------------------------------------- |
| FR-01 | `skill:import` は `skillName: string`（trim後非空）だけを受け付ける                     | `interfaces-agent-sdk-skill.md` / P42 |
| FR-02 | `skill:import` と `skill:importFromSource` の責務を分離し、UI import 導線で混在させない | `api-ipc-agent.md`                    |
| FR-03 | Main IPC で sender 検証失敗を明示し、`ERR_2004` に正規化する                            | `security-electron-ipc.md`            |
| FR-04 | 予期しない例外を `INTERNAL_ERROR` + `ERR_5001` に正規化する                             | `error-handling.md`                   |
| FR-05 | Preload 側で share 系 errorCode を透過し Renderer で判定可能にする                      | `security-api-electron.md`            |

## 非機能要件

| ID     | 要件                                                         |
| ------ | ------------------------------------------------------------ |
| NFR-01 | `validateIpcSender` を share 系全ハンドラの先頭で実行する    |
| NFR-02 | Main/Preload/Renderer の契約ドリフトをテストで検出可能にする |
| NFR-03 | 失敗時メッセージは内部情報漏洩を避ける（`Internal error`）   |
| NFR-04 | 変更は import 連携境界内に限定し、既存チャネル互換を維持する |

## 要件トレーサビリティ

| 要件  | 実装/テスト反映                                                                     |
| ----- | ----------------------------------------------------------------------------------- |
| FR-01 | `skillHandlers.share.ts` の trim/P42 バリデーション + `skillHandlers.share.test.ts` |
| FR-02 | `skill-api.contract.test.ts` の import/importFromSource 境界テスト                  |
| FR-03 | sender 失敗時 `ERR_2004` 検証テスト                                                 |
| FR-04 | 例外正規化 `ERR_5001` 検証テスト                                                    |
| FR-05 | preload contract テストの errorCode 透過検証                                        |
