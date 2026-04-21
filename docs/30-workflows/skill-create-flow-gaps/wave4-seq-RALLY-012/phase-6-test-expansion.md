# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 6                  |
| タスクID   | TASK-RALLY-012     |
| 機能名     | エラー回復導線追加 |
| 前提Phase  | Phase 5            |
| 後続Phase  | Phase 7            |
| 作成日     | 2026-04-21         |
| ステータス | pending            |

## 目的

Phase 4 のテストに加え、エッジケース・異常系・回帰テストを追加してカバレッジを拡充する。

## 追加テストケース

```typescript
describe("RALLY-012: エッジケース・異常系", () => {
  it("再試行中に再度エラーが発生した場合、エラーUIが更新される", async () => {
    // 1回目エラー → 再試行 → 2回目エラー
    // data-testid="interview-error-recovery" が引き続き表示されること
  });

  it("再試行成功後にlastAnswerRefがクリアされる", async () => {
    // 再試行成功後に lastAnswerRef.current が null になっていること
  });

  it("RALLY-011との整合: isSubmitting中はエラーUIも表示されない", async () => {
    // isSubmitting = true かつ localError がある場合
    // （実際のシナリオでは isSubmitting 中にエラーが発生するケースは submitAnswer 内のみ）
  });

  it("RALLY-010との整合: エラークリア後に完了UIが正しく表示される", async () => {
    // エラー → localError クリア → isRallyCompleted = true の状態
    // data-testid="interview-completed" が表示されること
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
- [ ] RALLY-010/011 との整合テストが追加されていること
- [ ] `pnpm test` で全件 Green であること
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

Phase 7: テストカバレッジ確認
