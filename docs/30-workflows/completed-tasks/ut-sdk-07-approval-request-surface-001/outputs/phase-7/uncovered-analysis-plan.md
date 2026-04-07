# Phase 7 - 未カバーブランチ分析計画

## 概要

UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Phase 7 未カバーブランチの分析と対処計画。

---

## 未カバーブランチ一覧

| ID    | 対象                                        | 未カバー理由                                                              | 優先度 | 対処方針           |
| ----- | ------------------------------------------- | ------------------------------------------------------------------------- | ------ | ------------------ |
| UC-01 | `respondToApproval` 失敗時（network error） | IPC invoke が失敗した場合のエラーハンドリングパスが未テスト               | 低     | 未タスク化（後続） |
| UC-02 | `skillCreatorAPI` 未設定時の購読スキップ    | `getSkillCreatorApi()` が null を返す場合の条件分岐（許容済みとして設計） | 低     | 許容（設計意図）   |

---

## UC-01 詳細分析

### 内容

`respondToApproval` が IPC invoke 失敗（network error / timeout）した場合の `pendingApproval` state 更新が未テスト。

### 影響評価

- 現状: エラー時は UI がそのままになる可能性がある
- リスク: 低（worktree 環境での IPC 失敗は実運用では発生しにくい）
- 対処: `UT-SDK-07-APPROVAL-RESPOND-ERROR-001` として未タスク登録を検討（後続フェーズで判断）

### 代替テスト

TC-APPR-09（正常 handleApprove）と TC-APPR-17（正常 handleReject）で正常パスは100%カバー済み。

---

## UC-02 詳細分析

### 内容

`SkillLifecyclePanel` で `skillCreatorAPI` が取得できない場合、`onApprovalRequest` の購読をスキップする分岐。

### 設計意図

`getSkillCreatorApi()` が null を返すケースは、Electron preload が正常にロードされていない環境（テスト/開発時のモック）に限られる。実運用では発生しない前提で設計済み。

### 判定

許容済み（graceful degradation として設計）。追加テスト不要。

---

## 対処方針まとめ

- UC-01: 低優先度未タスクとして記録。Phase 12 で unassigned-task 化するか判断。
- UC-02: 許容。テスト追加不要。

---

_作成日: 2026-04-06_
_Phase 7 完了確認_
