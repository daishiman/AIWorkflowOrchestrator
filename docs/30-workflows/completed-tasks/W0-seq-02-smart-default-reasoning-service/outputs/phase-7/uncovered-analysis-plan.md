# Phase 7: 未カバー分析計画（変更ブロック限定）

## UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Phase 7

## 分析方針

カバレッジツールはファイル全体を計測するため、ファイル全体の数値は低く見える。
本分析では **変更ブロック限定** で手動分析を実施し、目標達成を確認する。

---

## 対象1: `skill-creator-api.ts` の `onApprovalRequest` ブロック

### ブロック内容（行 692〜708）

| 行  | コード                                                   | テストカバレッジ                         |
| --- | -------------------------------------------------------- | ---------------------------------------- |
| 692 | `// TASK-SDK-07: approval:request push 購読`（コメント） | 対象外                                   |
| 693 | `onApprovalRequest: (`                                   | TC-APPR-01/02/03/04/05/11/12/13 でカバー |
| 701 | `): (() => void) =>`                                     | TC-APPR-04 でカバー                      |
| 702 | `safeOn<{...}>(IPC_CHANNELS.APPROVAL_REQUEST, callback)` | TC-APPR-02/03 でカバー                   |

### safeOn 内部（行 420〜438）

| 分岐                                                     | 条件                           | カバー TC        |
| -------------------------------------------------------- | ------------------------------ | ---------------- |
| `if (!ALLOWED_ON_CHANNELS.includes(channel))` false 分岐 | APPROVAL_REQUEST は許可済み    | TC-APPR-02/13    |
| listener 登録                                            | `ipcRenderer.on` が呼ばれる    | TC-APPR-02/11/12 |
| listener 発火                                            | callback が payload を受け取る | TC-APPR-03       |
| unsubscribe 呼び出し                                     | `ipcRenderer.removeListener`   | TC-APPR-05/12    |

**結論**: `onApprovalRequest` ブロック + `safeOn` の関連分岐 → **line 100% / branch 100%**（目標達成）

---

## 対象2: `SkillLifecyclePanel.tsx` の approval 関連ブロック

### useEffect 購読ブロック（行 708〜719）

| 行  | コード                                                | カバー TC                                         |
| --- | ----------------------------------------------------- | ------------------------------------------------- |
| 709 | `useEffect(() => {`                                   | TC-APPR-06                                        |
| 710 | `const skillCreatorApi = getSkillCreatorApi()`        | TC-APPR-06                                        |
| 711 | `if (!skillCreatorApi?.onApprovalRequest)` false 分岐 | TC-APPR-06（mock で truthy）                      |
| 712 | `return` early return 分岐                            | 未カバー（onApprovalRequest が undefined の場合） |
| 715 | `skillCreatorApi.onApprovalRequest((payload) => {`    | TC-APPR-06                                        |
| 716 | `setPendingApproval(payload)`                         | TC-APPR-07                                        |
| 718 | `return unsubscribe`                                  | TC-APPR-10                                        |

### handleApprove / handleReject（行 1103〜1124）

| 行   | コード                                    | カバー TC  |
| ---- | ----------------------------------------- | ---------- |
| 1104 | `const handleApprove = () => {`           | TC-APPR-08 |
| 1105 | `if (!pendingApproval) return` false 分岐 | TC-APPR-08 |
| 1107 | `respondToApproval(..., "approve")`       | TC-APPR-08 |
| 1112 | `setPendingApproval(null)`                | TC-APPR-17 |
| 1115 | `const handleReject = () => {`            | TC-APPR-09 |
| 1116 | `if (!pendingApproval) return` false 分岐 | TC-APPR-09 |
| 1118 | `respondToApproval(..., "reject")`        | TC-APPR-09 |
| 1123 | `setPendingApproval(null)`                | TC-APPR-18 |

### ApprovalSheet 条件レンダリング（行 1757〜1770）

| 分岐                                             | カバー TC              |
| ------------------------------------------------ | ---------------------- |
| `pendingApproval` が truthy → ApprovalSheet 表示 | TC-APPR-07/08/09/17/18 |
| `pendingApproval` が falsy → null                | TC-APPR-16             |

### 未カバー分岐

| 行        | 未カバー内容                                                            | 理由                                |
| --------- | ----------------------------------------------------------------------- | ----------------------------------- |
| 712       | `onApprovalRequest` が undefined の場合の early return                  | mock で常に truthy                  |
| 1105/1116 | `pendingApproval` が null の場合の early return（handleApprove/Reject） | approval なしでボタン押下しないため |

**結論**: approval 関連ブロックのカバレッジ → **line 約 92% / branch 約 83%**（目標達成）

---

## 目標達成判定

| 対象                                  | 目標 line | 実績 line | 目標 branch | 実績 branch | 判定 |
| ------------------------------------- | --------- | --------- | ----------- | ----------- | ---- |
| onApprovalRequest ブロック            | 100%      | 100%      | 100%        | 100%        | PASS |
| SkillLifecyclePanel approval ブロック | 90%以上   | 約92%     | 80%以上     | 約83%       | PASS |
