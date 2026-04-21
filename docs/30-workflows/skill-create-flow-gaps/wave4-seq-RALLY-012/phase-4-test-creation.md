# Phase 4: テスト作成

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 4                  |
| タスクID   | TASK-RALLY-012     |
| 機能名     | エラー回復導線追加 |
| 前提Phase  | Phase 3            |
| 後続Phase  | Phase 5            |
| 作成日     | 2026-04-21         |
| ステータス | pending            |

## 目的

Phase 2 の設計に基づいたテストコードを先に作成し（TDD）、Red 状態を確認してから Phase 5 実装へ進む。

## テストケース設計

```typescript
describe("RALLY-012: エラー回復導線", () => {
  it("AC-1: onSubmitがrejectしたときエラーUIが表示される", async () => {
    // onSubmit = jest.fn().mockRejectedValue(new Error("失敗"))
    // 送信操作後に data-testid="interview-error-recovery" が表示されること
    // data-testid="interview-retry" が表示されること
  });

  it("AC-4: 再試行するボタンクリックでonSubmitが再呼び出しされる", async () => {
    // エラー状態で data-testid="interview-retry" をクリック
    // onSubmit が2回呼ばれていること
  });

  it("AC-3/5: onResetが存在するとき最初からやり直すボタンが表示される", async () => {
    // onReset = jest.fn() を渡してエラー状態にする
    // data-testid="interview-reset" が表示されること
  });

  it("AC-5: onResetが未定義のとき最初からやり直すボタンが表示されない", async () => {
    // onReset を渡さずエラー状態にする
    // data-testid="interview-reset" が存在しないこと
  });

  it("AC-5: 最初からやり直すクリックでonResetが呼ばれる", async () => {
    // data-testid="interview-reset" をクリック
    // onReset が1回呼ばれていること
  });

  it("AC-6: エラーUI表示中に通常の入力エリアが非表示になる", async () => {
    // エラー状態のとき data-testid="interview-input-area" が表示されていないこと
  });

  it("AC-7: 再試行後にエラーがクリアされ入力エリアが戻る", async () => {
    // 再試行成功後に data-testid="interview-error-recovery" が消えること
  });
});
```

## 参照資料

| 資料名         | パス                                      | 説明           |
| -------------- | ----------------------------------------- | -------------- |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`  | Phase 1 成果物 |
| 回復導線設計書 | `outputs/phase-2/recovery-flow-design.md` | Phase 2 成果物 |
| ゲート判定     | `outputs/phase-3/gate-decision.md`        | Phase 3 成果物 |

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
  docs/30-workflows/skill-create-flow-gaps/p12-seq-RALLY-012
```

## 次のPhase

Phase 5: 実装
