# UT-4: Approval Sheet パフォーマンス計測基準定義と検証

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| ID         | UT-4                                            |
| 由来タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 由来       | Phase 11 DI-4                                   |
| 優先度     | MEDIUM                                          |
| ステータス | 未着手                                          |
| 検出日     | 2026-03-24                                      |

---

## 概要

NFR-4（Approval Sheet 表示 200ms 以内）の計測方法を定義し、テストで検証する。パフォーマンス基準が未検証のまま残ると UX 劣化のリスクがある。

## 計測方法候補

- `Performance.now()` による手動計測
- React Profiler を使ったレンダリング計測
- Playwright の `performance.timing` による E2E 計測

## 対象ファイル

| ファイル                                                                                  | 変更種別 |
| ----------------------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx`                        | 確認     |
| `apps/desktop/src/renderer/components/execution/__tests__/ApprovalSheet.test.tsx`（新規） | 追加     |

## 受入基準

- [ ] 計測方法が決定・文書化されている
- [ ] Approval Sheet 表示が 200ms 以内であることをテストで検証できる
- [ ] CI でパフォーマンス回帰を検知できる仕組みがある
