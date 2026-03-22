# Phase 8: リファクタ境界

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 8                                                  |
| 作成日   | 2026-03-22                                         |

## 1. 安全にリファクタ可能な構造

| 対象                     | リファクタ内容                                     | 条件                                   |
| ------------------------ | -------------------------------------------------- | -------------------------------------- |
| BLOCKED_GUIDANCE_MAP     | reason グループごとに分割定義 → spread で合成      | 全 reason が Record でカバーされる限り |
| GuidanceBlock            | variant styles を CSS module に移行                | variantStyles Record パターン維持      |
| guidanceActionDispatcher | switch → Record<ActionType, Handler> lookup に変更 | 全 action type がカバーされる限り      |

## 2. 崩してはいけない contract

| contract                                     | 根拠                   | 検証方法              |
| -------------------------------------------- | ---------------------- | --------------------- |
| BLOCKED_GUIDANCE_MAP の Record 網羅性        | AC-1: 全 reason カバー | TypeScript 型チェック |
| useBlockedGuidance の null safety            | ready 状態の表現       | CT-02 テスト          |
| GuidanceBlock の AND ガード                  | AC-4: no-op 排除       | RG-03 テスト          |
| surface 間の CTA 統一                        | AC-1: 一貫性           | IS-05, RG-05 テスト   |
| setCurrentView("settings") の 1 クリック到達 | AC-5: 2 クリック以下   | MT-02 手動テスト      |
