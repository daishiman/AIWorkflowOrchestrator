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
| ステータス | completed                              |

## 目的

ロジック変更（useEffect によるクリア条件の追加）が伴うため、シナリオテストを作成する。

## 実行タスク

1. 受け入れ基準と Phase 3 のレビュー結果をもとにテスト観点を固定する
2. RED で失敗すべきケースと GREEN で維持すべきケースを分ける
3. 回帰しやすい状態遷移に focused test を割り当てる

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

| 資料名           | パス                                      | 用途                     |
| ---------------- | ----------------------------------------- | ------------------------ |
| 変更設計書       | `outputs/phase-2/change-design.md`        | テスト対象のロジック確認 |
| テスト戦略       | `outputs/phase-2/test-strategy.md`        | テスト方針確認           |
| P50チェック結果  | `outputs/phase-1/p50-check-result.md`     | Phase 1 成果物           |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | Phase 3 成果物           |

## 統合テスト連携

- RTL / Vitest で復元状態と snapshot 反映を deterministic に再現する
- Phase 6 で境界ケースを拡張し、Phase 7 の traceability に接続する

## 多角的チェック観点（AIが判断）

- 演繹思考: AC から必要テストを機械的に導出できるか
- 逆説思考: テストが通っても仕様逸脱しうる抜け道を潰せているか
- 仮説思考: 最も壊れやすいのは request 更新境界だという仮説を検証できるか

## サブタスク管理

- T-1: テストケース設計
- T-2: RED 条件定義
- T-3: 実行コマンド固定

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
