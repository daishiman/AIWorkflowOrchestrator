# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 3                                |
| 後続Phase  | Phase 5                                |
| 作成日     | 2026-04-21                             |
| ステータス | pending                                |

## 目的

ロジック変更（useEffect によるクリア条件の追加）が伴うため、シナリオテストを作成する。

## テスト方針

コメント追加は動作変更を伴わないため追加テスト不要。useEffect によるクリアロジックは動作変更であるためシナリオテストを追加する。

## テストシナリオ

| シナリオ                                             | 期待結果                                                               | 優先度 |
| ---------------------------------------------------- | ---------------------------------------------------------------------- | ------ |
| セッション復元時（restoredPendingRequest が非 null） | pendingRequest = restoredPendingRequest                                | 必須   |
| workflowSnapshot.awaitingUserInput が届いた後        | restoredPendingRequest がクリアされ pendingRequest = awaitingUserInput | 必須   |
| 通常フロー（restoredPendingRequest が null）         | pendingRequest = workflowSnapshot?.awaitingUserInput                   | 必須   |
| awaitingUserInput が null の場合                     | restoredPendingRequest はクリアされない                                | 必須   |

## テストファイル設計

```typescript
// テスト対象: ConversationalInterview.tsx の pendingRequest 合成ロジック
// テストフレームワーク: Vitest + React Testing Library

describe('pendingRequest合成ロジック', () => {
  it('セッション復元時はrestoredPendingRequestを優先する', () => { ... });
  it('awaitingUserInputが届いたらrestoredPendingRequestをクリアする', () => { ... });
  it('通常フローではworkflowSnapshotのawaitingUserInputを使う', () => { ... });
  it('awaitingUserInputがnullの場合はrestoredPendingRequestをクリアしない', () => { ... });
});
```

## 参照資料

| 資料名     | パス                               | 用途                     |
| ---------- | ---------------------------------- | ------------------------ |
| 変更設計書 | `outputs/phase-2/change-design.md` | テスト対象のロジック確認 |
| テスト戦略 | `outputs/phase-2/test-strategy.md` | テスト方針確認           |

## 成果物

| 成果物         | パス                                    | 説明                          |
| -------------- | --------------------------------------- | ----------------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md` | シナリオテストの仕様          |
| Red テスト結果 | `outputs/phase-4/red-test-result.md`    | 実装前のテスト失敗確認（TDD） |

## 完了条件

- [ ] シナリオテストを作成した
- [ ] テストが RED 状態（実装前に失敗）であることを確認した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 5: 実装
