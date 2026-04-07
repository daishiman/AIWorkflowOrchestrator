# 受け入れ基準 - UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 作成日: 2026-04-06

## Phase: 1

## ステータス: completed

---

## AC一覧（検証可能）

| AC-ID | 基準                                                                                   | 確認方法                                    |
| ----- | -------------------------------------------------------------------------------------- | ------------------------------------------- |
| AC-01 | `SkillCreatorAPI` interface に `onApprovalRequest` メソッドが定義されている            | `skill-creator-api.ts` interface を目視確認 |
| AC-02 | `skillCreatorAPI` オブジェクトに `onApprovalRequest` 実装が追加されている              | `skillCreatorAPI` オブジェクトを目視確認    |
| AC-03 | `onApprovalRequest` が `APPROVAL_REQUEST` チャンネルを `safeOn` で正しく購読する       | TC-APPR-02 PASS 確認                        |
| AC-04 | `SkillLifecyclePanel.tsx` が `onApprovalRequest` を消費して `ApprovalSheet` を表示する | TC-APPR-07 PASS 確認                        |
| AC-05 | approve / reject 操作が `respondToApproval` に接続されている                           | TC-APPR-08/09 PASS 確認                     |
| AC-06 | `preload/index.ts` の同名メソッドと型シグネチャが対称である                            | 型定義を比較確認                            |
| AC-07 | TypeScript コンパイルエラーなし（`pnpm typecheck` PASS）                               | Phase 9 品質レポート確認                    |
| AC-08 | ESLint エラーなし（`pnpm lint` PASS）                                                  | Phase 9 品質レポート確認                    |
| AC-09 | Vitest テスト PASS（新規テストケースを含む）                                           | Phase 9 品質レポート確認                    |

---

## 型シグネチャ対称性確認（Phase 1 事前確認）

### `preload/index.ts` の `onApprovalRequest`（参照実装、line 380〜388）

```typescript
onApprovalRequest: (
  callback: (payload: {
    operationType: string;
    description: string;
    destination?: string;
    sessionId: string;
    operationId: string;
  }) => void,
) => safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback),
```

### `skill-creator-api.ts` に追加すべき型（対称）

```typescript
onApprovalRequest: (
  callback: (payload: {
    operationType: string;
    description: string;
    destination?: string;
    sessionId: string;
    operationId: string;
  }) => void,
) => () => void;
```

→ 型シグネチャが一致していること（AC-06）を Phase 3 レビューで確認済み。
