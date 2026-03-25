# UT-1: Approval token TTL 実装と検証

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| ID         | UT-1                                             |
| 由来タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001  |
| 由来       | Phase 3 MINOR R-M1 / Phase 11 DI-1               |
| 優先度     | LOW                                              |
| ステータス | 設計コード実装済み（production統合は後続タスク） |
| 検出日     | 2026-03-24                                       |

---

## 概要

ApprovalGate の approval token TTL を 300s で実装し、テストで有効期限切れシナリオを検証する。設計で「単一操作ごとの失効」が定義済みであり、秒数は実装詳細。

## 実装根拠

`ApprovalGate.ts` で `APPROVAL_TTL_SECONDS = 300` が実装済み。`approvalGate.test.ts` の APR-10〜APR-16 でTTL検証テスト実装済み。

## 対象ファイル

| ファイル                                                                | 変更種別 |
| ----------------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/services/runtime/ApprovalGate.ts`                | 確認     |
| `apps/desktop/src/main/services/runtime/__tests__/approvalGate.test.ts` | 確認     |

## 受入基準

- [ ] APPROVAL_TTL_SECONDS = 300 が正しく設定されている
- [ ] TTL 超過後にトークンが無効化される
- [ ] テスト APR-10〜APR-16 がすべて PASS する
- [ ] production統合時にTTLが正しく機能する
