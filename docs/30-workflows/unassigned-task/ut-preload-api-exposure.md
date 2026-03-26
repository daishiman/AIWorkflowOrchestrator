# UT-7: Preload API 公開

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| ID         | UT-7                                            |
| 由来タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 由来       | 後続統合タスク（production統合）                |
| 優先度     | HIGH                                            |
| ステータス | 未着手                                          |
| 検出日     | 2026-03-24                                      |

---

## 概要

`preload/index.ts` の contextBridge に advancedConsole・approval・disclosure の各 API を追加する。contextBridge 未公開では Renderer から IPC を呼び出せない。

## 対象ファイル

| ファイル                               | 変更種別 |
| -------------------------------------- | -------- |
| `apps/desktop/src/preload/index.ts`    | 修正     |
| `apps/desktop/src/preload/channels.ts` | 参照     |

## 受入基準

- [ ] contextBridge に `advancedConsole` API が公開されている
- [ ] contextBridge に `approval` API が公開されている
- [ ] contextBridge に `disclosure` API が公開されている
- [ ] Renderer から各 API を window 経由で呼び出せる
- [ ] 型定義が preload 側と Renderer 側で一致している
