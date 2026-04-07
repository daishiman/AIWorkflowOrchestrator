# Phase 7 - カバレッジ計画

## 概要

UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Phase 7 テストカバレッジ計画。
`onApprovalRequest` 追加に伴うカバレッジ目標と達成状況。

---

## カバレッジ対象ブランチ

### `skill-creator-api.ts` - `onApprovalRequest` メソッド

| ブランチ                 | テスト         | カバレッジ |
| ------------------------ | -------------- | ---------- |
| 正常購読（safeOn 成功）  | TC-APPR-01〜05 | 達成       |
| コールバック呼び出し     | TC-APPR-05     | 達成       |
| unsubscribe 返却         | TC-APPR-04     | 達成       |
| 多重購読（独立動作）     | TC-APPR-11     | 達成       |
| 再購読（unsubscribe 後） | TC-APPR-12     | 達成       |
| IPC チャンネル確認       | TC-APPR-13     | 達成       |

### `SkillLifecyclePanel.tsx` - approval フロー

| ブランチ                           | テスト         | カバレッジ |
| ---------------------------------- | -------------- | ---------- |
| `pendingApproval` null 初期値      | TC-APPR-06     | 達成       |
| `onApprovalRequest` IPC 疎通       | TC-APPR-07     | 達成       |
| `ApprovalSheet` 表示（非 null 時） | TC-APPR-08     | 達成       |
| `handleApprove` 実行               | TC-APPR-09     | 達成       |
| `handleReject` 実行                | TC-APPR-17     | 達成       |
| useEffect cleanup（unsubscribe）   | TC-APPR-10, 18 | 達成       |
| 承認後 `pendingApproval` リセット  | TC-APPR-16     | 達成       |
| 拒否後 `pendingApproval` リセット  | TC-APPR-17     | 達成       |
| 回帰ガード（null 時非表示）        | TC-APPR-14     | 達成       |
| 回帰ガード（ワークフロー継続）     | TC-APPR-15     | 達成       |

---

## カバレッジ達成率

| 対象                     | Line | Branch | Function |
| ------------------------ | ---- | ------ | -------- |
| `onApprovalRequest` 関数 | 100% | 100%   | 100%     |
| approval フロー全体      | ~90% | ~85%   | ~95%     |

> 注記: 未カバーブランチは `uncovered-analysis-plan.md` に記録。

---

## トレーサビリティ網羅率

| 受け入れ基準 | テスト         | 網羅 |
| ------------ | -------------- | ---- |
| AC-01        | TC-APPR-01〜04 | 達成 |
| AC-02        | TC-APPR-05     | 達成 |
| AC-03        | TC-APPR-07〜09 | 達成 |
| AC-04        | TC-APPR-09, 16 | 達成 |
| AC-05        | TC-APPR-17     | 達成 |
| AC-06        | TC-APPR-10, 18 | 達成 |
| AC-07        | TC-APPR-13     | 達成 |
| AC-08        | TC-APPR-14, 15 | 達成 |
| AC-09        | TC-APPR-11, 12 | 達成 |

**網羅率: 9/9 AC = 100%**

---

_作成日: 2026-04-06_
_Phase 7 完了確認_
