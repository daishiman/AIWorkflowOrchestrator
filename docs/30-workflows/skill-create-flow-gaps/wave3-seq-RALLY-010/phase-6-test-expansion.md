# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 6                        |
| タスクID   | TASK-RALLY-010           |
| 機能名     | ラリー完了状態UI表示追加 |
| 前提Phase  | Phase 5                  |
| 後続Phase  | Phase 7                  |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

Phase 4 で作成したテストに加え、エッジケース・異常系・回帰テストを追加してテストカバレッジを拡充する。

## 追加テストケース

```typescript
describe("RALLY-010: エッジケース・異常系", () => {
  it("workflowSnapshotがnullのとき待機UIが表示される", () => {
    // workflowSnapshot = null のとき
    // isRallyCompleted = false なので data-testid="interview-waiting" が表示されること
  });

  it("workflowSnapshot.phaseが未定義のとき待機UIが表示される", () => {
    // workflowSnapshot.phase = undefined のとき完了UIが表示されないこと
  });

  it("workflowSnapshot.statusがcompletedでもpendingRequestがあれば入力エリアが優先される", () => {
    // pendingRequest 優先ルール（RALLY-002）との整合確認
  });

  it("完了UIに「ラリーが完了しました」テキストが含まれる", () => {
    // data-testid="interview-completed" 内のテキスト確認
  });

  it("完了UIに「次のステップへ進んでください」テキストが含まれる", () => {
    // サブテキスト確認
  });
});
```

## 実行タスク

1. エッジケーステストを追加する
2. 回帰テスト（RALLY-002 との整合）を追加する
3. `pnpm test` で全件 Green を確認する

## 参照資料

| 資料名       | パス                                        | 説明           |
| ------------ | ------------------------------------------- | -------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |

## 成果物

| 成果物           | パス                                        | 説明               |
| ---------------- | ------------------------------------------- | ------------------ |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | 追加したテスト一覧 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 回帰確認結果       |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | エッジケース結果   |

## 完了条件

- [ ] エッジケーステストが追加されていること
- [ ] 回帰テストが追加されていること
- [ ] `pnpm test` で全件 Green であること
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

Phase 7: テストカバレッジ確認
