# Implementation Guide

## Part 1: まず何を直したのか

### 日常生活での例え

たとえば、会話の途中で前の質問に戻って確認し直す場面を考えると分かりやすい。いま表示している質問と、あとから届いた新しい質問が混ざると、どちらに答えればよいか分からなくなる。RALLY-002 は、その「いったん戻した質問を優先し、新しい質問が届いたら通常の流れへ戻る」という約束を、後から読んでも迷わない形に固定した。

### この task でできるようになったこと

| 項目                            | 説明                                                  |
| ------------------------------- | ----------------------------------------------------- |
| 復元時の優先規則を固定          | undo 後は復元した質問を優先表示する                   |
| 通常復帰条件を固定              | 新しい `requestId` が来たら通常の snapshot 表示へ戻る |
| 後続 task への handoff を簡潔化 | RALLY-010 以降が前提を再調査しなくてよくなる          |

## Part 2: 技術者向けガイド

### 変更サマリ

| ファイル                                                                                                       | 内容                                                                |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                                       | `restoredPendingRequest` の優先規則と clear 条件を comment で明文化 |
| `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx` | targeted regression 5件を追加                                       |
| `docs/30-workflows/wave0-par-RALLY-002/outputs/phase-5`〜`phase-13`                                            | task 固有 close-out を補完                                          |

### 型と契約

```ts
const pendingRequest =
  restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null;

useEffect(() => {
  if (workflowSnapshot?.awaitingUserInput) {
    setRestoredPendingRequest(null);
  }
}, [workflowSnapshot?.awaitingUserInput?.requestId]);
```

### 使用例

- undo 後に `restoredPendingRequest` が入る
- その間は `pendingRequest` が restored 側を採用する
- 新しい `awaitingUserInput.requestId` が来たら restored を clear して通常フローに戻る

### エラーハンドリングと境界

| 条件                             | 動作                    |
| -------------------------------- | ----------------------- |
| `restoredPendingRequest` が null | snapshot をそのまま使う |
| `awaitingUserInput` が null      | 待機表示                |
| submit 成功後                    | restored state を clear |

### 設定可能パラメータ / 定数

| 項目                | 値                |
| ------------------- | ----------------- |
| taskId              | `TASK-RALLY-002`  |
| implementation_mode | `verify_existing` |
| visualMode          | `NON_VISUAL`      |

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要

- primary evidence: `outputs/phase-11/TASK-RALLY-002-manual-test-report.md`
- supplemental evidence: `outputs/phase-10/final-review-result.md`
- supplemental evidence: `outputs/phase-11/manual-test-result.md`
