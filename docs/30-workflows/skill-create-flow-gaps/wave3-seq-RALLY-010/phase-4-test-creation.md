# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 4                        |
| タスクID   | TASK-RALLY-010           |
| 機能名     | ラリー完了状態UI表示追加 |
| 前提Phase  | Phase 3                  |
| 後続Phase  | Phase 5                  |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

Phase 2 の設計に基づいたテストコードを先に作成し（TDD）、Red 状態を確認してから Phase 5 実装へ進む。

## テストファイル

`apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx`
（既存ファイルへの追加、またはなければ新規作成）

## テストケース設計

```typescript
describe("RALLY-010: ラリー完了状態UI", () => {
  it("AC-1: workflowSnapshotが完了フェーズのとき完了UIが表示される", () => {
    // workflowSnapshot.phase = "completed" でレンダリング
    // data-testid="interview-completed" が表示されていること
    // data-testid="interview-waiting" が表示されていないこと
  });

  it("AC-2: awaitingUserInputがnullかつ未完了フェーズのとき待機UIが表示される", () => {
    // workflowSnapshot.phase = "in_progress", awaitingUserInput = null
    // data-testid="interview-waiting" が表示されていること
    // data-testid="interview-completed" が表示されていないこと
  });

  it("AC-3: 完了UIと待機UIが同時に表示されない", () => {
    // どちらの状態でも両方が同時に存在しないこと
  });

  it("AC-4: pendingRequestが存在するとき完了UIは表示されない", () => {
    // workflowSnapshot.phase = "completed" でもpendingRequestがあれば入力エリアが表示
    // data-testid="interview-input-area" が表示されていること
    // data-testid="interview-completed" が表示されていないこと
  });

  it("待機メッセージが「次の質問を準備しています...」に変更されている", () => {
    // data-testid="interview-waiting" のテキストが変更後のメッセージであること
  });
});
```

## 実行タスク

1. テストファイルにテストケースを追加する
2. `pnpm --filter @repo/desktop test` を実行して Red（失敗）を確認する
3. Red 状態のスクリーンショット相当のログを `outputs/phase-4/red-test-result.md` に記録する

## 参照資料

| 資料名       | パス                                     | 説明           |
| ------------ | ---------------------------------------- | -------------- |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md` | Phase 1 成果物 |
| UI設計書     | `outputs/phase-2/ui-design.md`           | Phase 2 成果物 |
| ゲート判定   | `outputs/phase-3/gate-decision.md`       | Phase 3 成果物 |

## 成果物

| 成果物       | パス                                    | 説明             |
| ------------ | --------------------------------------- | ---------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | テストケース一覧 |
| Red結果      | `outputs/phase-4/red-test-result.md`    | 失敗確認ログ     |

## 完了条件

- [ ] テストケースが全件作成されていること
- [ ] `pnpm test` で Red 状態が確認されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p10-seq-RALLY-010
```

## 次のPhase

Phase 5: 実装
