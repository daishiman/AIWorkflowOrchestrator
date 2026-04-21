# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 4                            |
| タスクID   | TASK-RALLY-013               |
| 機能名     | Undo可能範囲の視覚的表現追加 |
| 前提Phase  | Phase 3                      |
| 後続Phase  | Phase 5                      |
| 作成日     | 2026-04-21                   |
| ステータス | pending                      |

## 目的

Phase 2 の設計に基づいたテストコードを先に作成し（TDD）、Red 状態を確認してから Phase 5 実装へ進む。

## テストケース設計

```typescript
describe("RALLY-013: Undo可能範囲インジケーター", () => {
  it("AC-1/5: ユーザー回答が3件のときインジケーターに「3 ステップ前まで戻れます」が表示される", () => {
    // interview.steps にユーザーメッセージを3件含むモックを用意
    // data-testid="interview-undo-hint" のテキストが "3 ステップ前まで戻れます" であること
  });

  it("AC-1: ユーザー回答が1件のときインジケーターに「1 ステップ前まで戻れます」が表示される", () => {
    // data-testid="interview-undo-hint" のテキストが "1 ステップ前まで戻れます" であること
  });

  it("AC-2: ユーザー回答が0件のときインジケーターが表示されない", () => {
    // data-testid="interview-undo-hint" が存在しないこと
  });

  it("AC-3: undoableStepCountが0のときUndoボタンがdisabledである", () => {
    // data-testid="interview-undo" が disabled であること
  });

  it("AC-4: isSubmittingがtrueのときUndoボタンがdisabledである", () => {
    // undoableStepCount > 0 でも data-testid="interview-undo" が disabled であること
  });
});
```

## 参照資料

| 資料名               | パス                                     | 説明           |
| -------------------- | ---------------------------------------- | -------------- |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md` | Phase 1 成果物 |
| インジケーター設計書 | `outputs/phase-2/indicator-design.md`    | Phase 2 成果物 |
| ゲート判定           | `outputs/phase-3/gate-decision.md`       | Phase 3 成果物 |

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
  docs/30-workflows/skill-create-flow-gaps/p13-seq-RALLY-013
```

## 次のPhase

Phase 5: 実装
