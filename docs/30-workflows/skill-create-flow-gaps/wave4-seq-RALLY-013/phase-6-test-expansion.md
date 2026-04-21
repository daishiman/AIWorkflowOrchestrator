# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 6                            |
| タスクID   | TASK-RALLY-013               |
| 機能名     | Undo可能範囲の視覚的表現追加 |
| 前提Phase  | Phase 5                      |
| 後続Phase  | Phase 7                      |
| 作成日     | 2026-04-21                   |
| ステータス | pending                      |

## 目的

Phase 4 のテストに加え、エッジケース・異常系・回帰テストを追加してカバレッジを拡充する。

## 追加テストケース

```typescript
describe("RALLY-013: エッジケース・回帰テスト", () => {
  it("ステップ数が変化したときインジケーターが即時更新される", async () => {
    // steps が2件 → Undoで1件になったとき
    // data-testid="interview-undo-hint" のテキストが「1 ステップ前まで戻れます」に更新されること
  });

  it("RALLY-012との整合: エラーUI表示中はUndoボタンが含まれる入力エリア自体が非表示", async () => {
    // localError がある（エラーUI表示中）のとき
    // data-testid="interview-undo" が表示されていないこと（入力エリア全体が非表示のため）
  });

  it("RALLY-010との整合: 完了UI表示中はUndoボタンが非表示", async () => {
    // isRallyCompleted = true のとき
    // data-testid="interview-undo" が表示されていないこと
  });

  it("canUndoとundoableStepCountが整合している", () => {
    // canUndo = true かつ undoableStepCount > 0 のとき一致していること
    // canUndo = false かつ undoableStepCount = 0 のとき一致していること
  });
});
```

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
- [ ] RALLY-010/011/012 との整合テストが追加されていること
- [ ] `pnpm test` で全件 Green であること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p13-seq-RALLY-013
```

## 次のPhase

Phase 7: テストカバレッジ確認
