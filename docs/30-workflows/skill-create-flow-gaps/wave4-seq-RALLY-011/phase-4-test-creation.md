# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 4                    |
| タスクID   | TASK-RALLY-011       |
| 機能名     | 送信中競合防止UI強化 |
| 前提Phase  | Phase 3              |
| 後続Phase  | Phase 5              |
| 作成日     | 2026-04-21           |
| ステータス | pending              |

## 目的

Phase 2 の設計に基づいたテストコードを先に作成し（TDD）、Red 状態を確認してから Phase 5 実装へ進む。

## テストファイル

`apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx`

## テストケース設計

```typescript
describe("RALLY-011: 送信中競合防止", () => {
  it("AC-1: isSubmitting中にworkflowSnapshotが更新されても即時反映されない", async () => {
    // isSubmitting = true の状態でworkflowSnapshotをrerender
    // data-testid="interview-waiting" が表示されたままであること（新しい質問は未表示）
  });

  it("AC-2: isSubmitting完了後にバッファのsnapshotが反映される", async () => {
    // isSubmitting = true → workflowSnapshot更新 → isSubmitting = false
    // 新しいawaitingUserInputの質問が表示されること
  });

  it("AC-3: isSubmitting中は送信ボタンがdisabledである", () => {
    // isSubmitting = true のとき
    // data-testid="interview-submit" が disabled であること
  });

  it("AC-5: バッファが空のときisSubmitting完了後に余分な更新が起きない", async () => {
    // isSubmitting中にworkflowSnapshot変化なし → isSubmitting = false
    // 余分なsetActiveSnapshot呼び出しがないこと
  });
});
```

## 参照資料

| 資料名               | パス                                     | 説明           |
| -------------------- | ---------------------------------------- | -------------- |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md` | Phase 1 成果物 |
| バッファリング設計書 | `outputs/phase-2/buffering-design.md`    | Phase 2 成果物 |
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
  docs/30-workflows/skill-create-flow-gaps/p11-seq-RALLY-011
```

## 次のPhase

Phase 5: 実装
