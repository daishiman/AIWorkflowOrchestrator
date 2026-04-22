# Existing Test Inventory — Phase 4

## 関連テストファイル

| ファイル                                                                                         | restoredPendingRequest カバー                 | 備考                                                        |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------- | ----------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx`          | 部分的（undo テストあり、合成式直接検証なし） | TC-E07/TC-E08: snapshot null/pendingRequest null の挙動あり |
| `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.ipc-edge.test.tsx` | なし                                          | IPC タイムアウト・エラー系のみ                              |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`       | なし                                          | SkillLifecyclePanel 統合テスト                              |
| `apps/desktop/src/renderer/components/skill/__tests__/useInterviewState.test.ts`                 | なし                                          | useInterviewState フック単体テスト                          |

## カバレッジギャップ分析

| シナリオID | 説明                                                | 既存テスト                           |
| ---------- | --------------------------------------------------- | ------------------------------------ |
| S-1        | restoredPendingRequest 非 null → 合成式で優先される | **なし** — 新規テスト必要            |
| S-2        | snapshot requestId 更新でクリアされる               | **なし** — 新規テスト必要            |
| S-3        | 通常フロー（null）→ snapshot へフォールバック       | 間接的にあり（TC-E08）、直接検証なし |

## 新規テストファイル

- `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx`
  - S-1, S-2, S-3 正常系 3 シナリオ
  - EC-1〜EC-5 異常系・エッジケース 5 シナリオ
  - 計 8 テストケース
