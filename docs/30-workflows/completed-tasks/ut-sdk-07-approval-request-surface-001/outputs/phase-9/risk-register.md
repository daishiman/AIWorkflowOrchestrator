# Phase 9 - リスク台帳

## 概要

UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Phase 9 リスク台帳。
実装時に識別されたリスクと対処状況の記録。

---

## リスク一覧

| リスク ID | 内容                                                                  | 発生確率 | 影響度 | 総合 | 対処状況                          |
| --------- | --------------------------------------------------------------------- | -------- | ------ | ---- | --------------------------------- |
| RISK-01   | `skillCreatorAPI` 未設定時に `onApprovalRequest` 購読がスキップされる | 低       | 低     | 低   | 許容済み（graceful degradation）  |
| RISK-02   | `respondToApproval` IPC 失敗時に UI がブロックされる可能性            | 極低     | 中     | 低   | 未タスク化（後続検討）            |
| RISK-03   | 多重 `onApprovalRequest` 購読によるメモリリーク                       | 低       | 低     | 低   | TC-APPR-11 で確認済み（独立動作） |

---

## RISK-01 詳細

### 内容

`getSkillCreatorApi()` が null を返す場合、`onApprovalRequest` の購読が実行されない。
その結果、承認要求が画面に表示されない。

### 対処

設計上の意図的な graceful degradation。Electron preload が正常にロードされていない環境（e.g., Jest/Vitest モック環境）では期待された動作。

**判定: 許容済み**

---

## RISK-02 詳細

### 内容

`respondToApproval` が IPC invoke 失敗（timeout/network error）した場合、`pendingApproval` が null にリセットされず UI がブロックされる可能性。

### 対処

実運用環境での IPC 失敗は極めて稀。現時点では対処を後続未タスクとして記録。

**判定: 低優先度。後続フェーズで `UT-SDK-07-APPROVAL-RESPOND-ERROR-001` として formalize を検討。**

---

## RISK-03 詳細

### 内容

`useEffect` に複数の `onApprovalRequest` 購読が存在する場合のメモリリーク。

### 対処

TC-APPR-11（多重購読）と TC-APPR-18（useEffect cleanup）で確認済み。
`useEffect` の cleanup 関数で unsubscribe が確実に呼ばれるため、リーク発生しない。

**判定: テスト済み、リスク解消**

---

_作成日: 2026-04-06_
_Phase 9 完了確認_
