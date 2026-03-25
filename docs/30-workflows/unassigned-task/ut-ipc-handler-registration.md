# UT-6: IPC Handler 登録

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| ID         | UT-6                                            |
| 由来タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 由来       | 後続統合タスク（production統合）                |
| 優先度     | HIGH                                            |
| ステータス | 未着手                                          |
| 検出日     | 2026-03-24                                      |

---

## 概要

`main/ipc/index.ts` へ advancedConsoleHandlers・approvalHandlers・disclosureHandlers の3ハンドラを追加し、ApprovalGate を DI で注入する。統合なしでは IPC チャンネルが機能しない。

## 対象ファイル

| ファイル                                               | 変更種別 |
| ------------------------------------------------------ | -------- |
| `apps/desktop/src/main/ipc/index.ts`                   | 修正     |
| `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts` | 参照     |
| `apps/desktop/src/main/ipc/approvalHandlers.ts`        | 参照     |
| `apps/desktop/src/main/ipc/disclosureHandlers.ts`      | 参照     |

## 受入基準

- [ ] `index.ts` に3ハンドラの登録処理が追加されている
- [ ] ApprovalGate が DI パターンで注入されている
- [ ] 各 IPC チャンネルが Renderer から呼び出せる
- [ ] 登録に関するテストが PASS する
