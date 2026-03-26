# UT-8: Approval Request Push 実装

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| ID         | UT-8                                            |
| 由来タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 由来       | 後続統合タスク（production統合）                |
| 優先度     | HIGH                                            |
| ステータス | 未着手                                          |
| 検出日     | 2026-03-24                                      |

---

## 概要

Main プロセスから Renderer へ承認要求を Push 通知する実装（`webContents.send` / IPC イベント）を行う。Push なしでは Approval Sheet が表示されない。

## 対象ファイル

| ファイル                                                              | 変更種別 |
| --------------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/` 配下のイベント送信処理（既存ファイルに追加） | 修正     |
| `apps/desktop/src/renderer/hooks/useApprovalFlow.ts`                  | 参照     |

## 受入基準

- [ ] Main プロセスが `webContents.send` で承認要求を Push できる
- [ ] Renderer 側で承認要求イベントを受信し Approval Sheet が表示される
- [ ] 承認・拒否の結果が Main プロセスに返却される
- [ ] イベント送受信のテストが PASS する
