# UT-9: revokeAll() セッション終了時呼び出し実装

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| ID         | UT-9                                            |
| 由来タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 由来       | 後続統合タスク（production統合）                |
| 優先度     | MEDIUM                                          |
| ステータス | 未着手                                          |
| 検出日     | 2026-03-24                                      |

---

## 概要

セッション終了時（abort / done）に `ApprovalGate.revokeAll()` を呼び出してトークンをクリアする。実装なしでもセッションをまたいでトークンが残るリスクがある。

## 対象ファイル

| ファイル                                                                | 変更種別 |
| ----------------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/` 配下のセッション終了処理（既存ファイルに追加） | 修正     |
| `apps/desktop/src/main/services/runtime/ApprovalGate.ts`                | 参照     |

## 受入基準

- [ ] セッション abort 時に `ApprovalGate.revokeAll()` が呼び出される
- [ ] セッション done 時に `ApprovalGate.revokeAll()` が呼び出される
- [ ] セッション終了後にトークンが残存していない
- [ ] 関連テストが PASS する
