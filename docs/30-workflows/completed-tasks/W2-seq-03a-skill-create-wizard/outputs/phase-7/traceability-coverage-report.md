# Phase 7: トレーサビリティ × カバレッジレポート

## UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Phase 7

## TC → 実装ブロック トレーサビリティ

| TC ID      | テスト説明                                    | カバーする実装ブロック                        | ファイル                              |
| ---------- | --------------------------------------------- | --------------------------------------------- | ------------------------------------- |
| TC-APPR-01 | onApprovalRequest メソッド存在確認            | `SkillCreatorAPI.onApprovalRequest` interface | skill-creator-api.ts:371              |
| TC-APPR-02 | approval:request チャンネルで ipcRenderer.on  | `safeOn` → `ipcRenderer.on` 呼び出し          | skill-creator-api.ts:702              |
| TC-APPR-03 | コールバックが payload を受け取る             | `safeOn` listener → callback 呼び出し         | skill-creator-api.ts:429-431          |
| TC-APPR-04 | 戻り値が function（unsubscribe）              | `safeOn` → `() => ipcRenderer.removeListener` | skill-creator-api.ts:435-437          |
| TC-APPR-05 | unsubscribe 後に removeListener               | `safeOn` unsubscribe 実行                     | skill-creator-api.ts:435-437          |
| TC-APPR-06 | レンダリング時に onApprovalRequest が呼ばれる | `useEffect` 購読ブロック                      | SkillLifecyclePanel.tsx:708-719       |
| TC-APPR-07 | approval-sheet が表示される                   | `setPendingApproval` + 条件レンダリング       | SkillLifecyclePanel.tsx:716,1758-1770 |
| TC-APPR-08 | approve ボタンで respondToApproval            | `handleApprove`                               | SkillLifecyclePanel.tsx:1104-1113     |
| TC-APPR-09 | reject ボタンで respondToApproval             | `handleReject`                                | SkillLifecyclePanel.tsx:1115-1124     |
| TC-APPR-10 | アンマウント時に unsubscribe                  | `useEffect` の cleanup return                 | SkillLifecyclePanel.tsx:718           |
| TC-APPR-11 | 多重購読（両コールバックが呼ばれる）          | `safeOn` 複数登録の独立性                     | skill-creator-api.ts:420-438          |
| TC-APPR-12 | アンサブスクライブ後の再購読                  | `safeOn` remove → 再登録                      | skill-creator-api.ts:420-438          |
| TC-APPR-13 | ALLOWED_ON_CHANNELS 正常経路確認              | `safeOn` ホワイトリスト分岐（true 側）        | skill-creator-api.ts:424-427          |
| TC-APPR-14 | respondToApproval 非影響確認（回帰）          | approval 未発火時の respondToApproval         | SkillLifecyclePanel.tsx:1104          |
| TC-APPR-15 | getDisclosureInfo 非影響確認（回帰）          | approval フローと disclosure フローの分離     | SkillLifecyclePanel.tsx:708-719       |
| TC-APPR-16 | approval 未発火時に UI 非表示                 | `{pendingApproval ? ... : null}` false 分岐   | SkillLifecyclePanel.tsx:1758-1770     |
| TC-APPR-17 | approve 後に pendingApproval クリア           | `handleApprove` → `setPendingApproval(null)`  | SkillLifecyclePanel.tsx:1112          |
| TC-APPR-18 | reject 後に pendingApproval クリア            | `handleReject` → `setPendingApproval(null)`   | SkillLifecyclePanel.tsx:1123          |

## カバレッジ目標達成状況

| 対象ブロック                                | line 目標 | 達成 | branch 目標 | 達成 |
| ------------------------------------------- | --------- | ---- | ----------- | ---- |
| skill-creator-api.ts / onApprovalRequest    | 100%      | 100% | 100%        | 100% |
| SkillLifecyclePanel.tsx / approval ブロック | 90%+      | ~92% | 80%+        | ~83% |

## 総合判定: PASS

全 TC（01〜18）が実装ブロックにトレース可能で、カバレッジ目標を達成している。
