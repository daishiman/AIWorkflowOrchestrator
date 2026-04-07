# Phase 6: リグレッションテスト結果 — UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 実行コマンド

```bash
cd apps/desktop && CLAUDE_SKIP_HEAVY_HOOKS=1 pnpm vitest run \
  src/preload/__tests__/skill-creator-api.approval.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx
```

## 結果

```
RUN  v2.1.9

✓ src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx (10 tests) 86ms
✓ src/preload/__tests__/skill-creator-api.approval.test.ts (9 tests) 6ms

Test Files  2 passed (2)
     Tests  19 passed (19)
  Start at  21:24:35
  Duration  2.62s
```

## 判定

| TC ID              | 説明                                                          | 結果 |
| ------------------ | ------------------------------------------------------------- | ---- |
| TC-APPR-01         | onApprovalRequest メソッド存在確認                            | PASS |
| TC-APPR-02         | approval:request チャンネルで ipcRenderer.on が呼ばれる       | PASS |
| TC-APPR-03         | ipcRenderer イベント発火時にコールバックが payload を受け取る | PASS |
| TC-APPR-04         | onApprovalRequest の戻り値が function（unsubscribe）          | PASS |
| TC-APPR-05         | unsubscribe 後に ipcRenderer.removeListener が呼ばれる        | PASS |
| TC-APPR-06（補足） | IPC_CHANNELS.APPROVAL_REQUEST が approval:request             | PASS |
| TC-APPR-06         | レンダリング時に onApprovalRequest が呼ばれる                 | PASS |
| TC-APPR-07         | onApprovalRequest callback 発火で approval-sheet が表示される | PASS |
| TC-APPR-08         | approve ボタンで respondToApproval が呼ばれる                 | PASS |
| TC-APPR-09         | reject ボタンで respondToApproval が呼ばれる                  | PASS |
| TC-APPR-10         | アンマウント時に unsubscribe 関数が呼ばれる                   | PASS |
| TC-APPR-11         | 多重購読（両コールバックが呼ばれる）                          | PASS |
| TC-APPR-12         | アンサブスクライブ後の再購読                                  | PASS |
| TC-APPR-13         | ALLOWED_ON_CHANNELS 確認（safeOn 正常経路）                   | PASS |
| TC-APPR-14         | respondToApproval 非影響確認（回帰ガード）                    | PASS |
| TC-APPR-15         | getDisclosureInfo 非影響確認（回帰ガード）                    | PASS |
| TC-APPR-16         | approval payload が null の場合（UI が表示されない）          | PASS |
| TC-APPR-17         | approve 後に pendingApproval がクリア（UI 非表示）            | PASS |
| TC-APPR-18         | reject 後に pendingApproval がクリア（UI 非表示）             | PASS |

## 総合判定: PASS（19/19件）

Phase 4 の TC-APPR-01〜10 のリグレッションも含め全件 PASS。
