# Phase 6 - 拡充テストケース一覧

## 概要

UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 のテスト拡充フェーズ（Phase 6）成果物。
TC-APPR-11〜18 の追加テストケースと全19件の PASS 確認記録。

---

## 拡充テストケース（TC-APPR-11〜18）

### preload 層拡充テスト（TC-APPR-11〜13）

| テストID   | 対象                          | 内容                                                                                                                    | 結果 |
| ---------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---- |
| TC-APPR-11 | onApprovalRequest（多重購読） | 同一インスタンスで `onApprovalRequest` を2回呼び出した場合、2つの購読が独立して動作し、両方のコールバックが呼ばれること | PASS |
| TC-APPR-12 | onApprovalRequest（再購読）   | unsubscribe 後に再度 `onApprovalRequest` を呼び出した場合、新しい購読が正常に動作すること                               | PASS |
| TC-APPR-13 | IPC チャンネル確認            | `onApprovalRequest` が `APPROVAL_CHANNELS.APPROVAL_REQUEST` チャンネルを使用していること（IPC 契約対称性）              | PASS |

### SkillLifecyclePanel 層拡充テスト（TC-APPR-14〜18）

| テストID   | 対象                               | 内容                                                                                                | 結果 |
| ---------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- | ---- |
| TC-APPR-14 | 回帰ガード（既存スナップショット） | `pendingApproval` state が null の場合、`ApprovalSheet` が表示されないこと（既存 UI への影響なし）  | PASS |
| TC-APPR-15 | 回帰ガード（ワークフロー継続）     | approval 完了後、ワークフロー実行が継続（blocked 状態にならない）こと                               | PASS |
| TC-APPR-16 | UI 非表示確認（承認後）            | `handleApprove` 実行後、`pendingApproval` が null にリセットされ `ApprovalSheet` が非表示になること | PASS |
| TC-APPR-17 | UI 非表示確認（拒否後）            | `handleReject` 実行後、`pendingApproval` が null にリセットされ `ApprovalSheet` が非表示になること  | PASS |
| TC-APPR-18 | useEffect cleanup                  | コンポーネントのアンマウント時に購読が解除（unsubscribe）されること（メモリリーク防止）             | PASS |

---

## テスト全件サマリー（TC-APPR-01〜18）

| テストID   | フェーズ | 対象                           | 結果 |
| ---------- | -------- | ------------------------------ | ---- |
| TC-APPR-01 | Phase 4  | onApprovalRequest 存在確認     | PASS |
| TC-APPR-02 | Phase 4  | 型シグネチャ確認               | PASS |
| TC-APPR-03 | Phase 4  | safeOn パターン使用確認        | PASS |
| TC-APPR-04 | Phase 4  | unsubscribe 返却確認           | PASS |
| TC-APPR-05 | Phase 4  | コールバック呼び出し確認       | PASS |
| TC-APPR-06 | Phase 4  | pendingApproval state 初期値   | PASS |
| TC-APPR-07 | Phase 4  | onApprovalRequest IPC 疎通     | PASS |
| TC-APPR-08 | Phase 4  | ApprovalSheet 表示確認         | PASS |
| TC-APPR-09 | Phase 4  | handleApprove 呼び出し         | PASS |
| TC-APPR-10 | Phase 4  | cleanup unsubscribe 確認       | PASS |
| TC-APPR-11 | Phase 6  | 多重購読                       | PASS |
| TC-APPR-12 | Phase 6  | 再購読                         | PASS |
| TC-APPR-13 | Phase 6  | IPC チャンネル確認             | PASS |
| TC-APPR-14 | Phase 6  | 回帰ガード（スナップショット） | PASS |
| TC-APPR-15 | Phase 6  | 回帰ガード（継続）             | PASS |
| TC-APPR-16 | Phase 6  | UI 非表示（承認後）            | PASS |
| TC-APPR-17 | Phase 6  | UI 非表示（拒否後）            | PASS |
| TC-APPR-18 | Phase 6  | useEffect cleanup              | PASS |

**合計: 18/18 PASS**（Phase 4: 10件、Phase 6: 8件）

> 注記: `TC-APPR-01〜18` で 18件として記録。なお vitest 実行時は preload テスト群と UI テスト群を合算して 19 tests PASS として報告される（fixture setup を含む）。

---

## テスト実行コマンド

```bash
# preload 層テスト
cd apps/desktop && pnpm exec vitest run src/preload/__tests__/skill-creator-api.approval.test.ts

# SkillLifecyclePanel 層テスト
cd apps/desktop && pnpm exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx
```

---

_作成日: 2026-04-06_
_Phase 6 完了確認_
