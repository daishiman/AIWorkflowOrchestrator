# 設計レビュー結果 - UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 作成日: 2026-04-06

## Phase: 3

---

## 機能設計チェック

| チェック項目                                                     | 判定    | 根拠                                                                         |
| ---------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| `onApprovalRequest` の型シグネチャが `preload/index.ts` と対称か | ✅ PASS | `outputs/phase-2/ipc-contract-design.md` で対称性確認済み                    |
| `safeOn` パターンが既存実装（`onProgress` 等）と一致するか       | ✅ PASS | `onWorkflowStateChanged` / `onAdapterStatusChanged` / `onOutputReady` と同形 |
| `ALLOWED_ON_CHANNELS` に `APPROVAL_REQUEST` が含まれるか         | ✅ PASS | `channels.ts` line 777 で確認済み                                            |
| `SkillLifecyclePanel.tsx` の `useEffect` cleanup が正しいか      | ✅ PASS | `return unsubscribe` パターンを設計に明記                                    |
| `respondToApproval` との接続が切れていないか                     | ✅ PASS | `handleApprove`/`handleReject` → `respondToApproval` に接続設計              |

---

## 責務境界チェック

| チェック項目                            | 判定    | 根拠                                                     |
| --------------------------------------- | ------- | -------------------------------------------------------- |
| Main Process 変更が不要であることを確認 | ✅ PASS | `approvalHandlers.ts` は変更不要、設計に明記             |
| 型定義変更が最小限か                    | ✅ PASS | payload shape は local alias で閉じる、shared 型変更なし |
| channels.ts 変更が不要であることを確認  | ✅ PASS | `ALLOWED_ON_CHANNELS` 登録済み確認                       |

---

## リスク評価

| リスク                                                    | 深刻度 | 対策状況                                          |
| --------------------------------------------------------- | ------ | ------------------------------------------------- |
| approval request payload shape の drift                   | HIGH   | local alias で実在形状に揃える設計確定 ✅         |
| `SkillLifecyclePanel.tsx` の既存 approval UI との二重表示 | MEDIUM | `pendingApproval` state 新規追加で二重表示なし ✅ |
| cleanup 漏れによるメモリリーク                            | LOW    | useEffect return で unsubscribe を強制 ✅         |

---

## MAJOR / MINOR 判定

### MAJOR 指摘: 0件

### MINOR 指摘: 1件

| ID       | 内容                                                               | 対応方針                                                                                                |
| -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| MINOR-01 | `normalizeApprovalOperationType` の変換ロジックが fallthrough のみ | Phase 5 実装時に明示的に `external_send` のみ個別判定、それ以外は `dangerous_operation` fallback とする |
