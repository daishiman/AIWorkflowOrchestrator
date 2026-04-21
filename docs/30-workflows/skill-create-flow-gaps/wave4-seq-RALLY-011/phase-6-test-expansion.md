# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 6                    |
| タスクID   | TASK-RALLY-011       |
| 機能名     | 送信中競合防止UI強化 |
| 前提Phase  | Phase 5              |
| 後続Phase  | Phase 7              |
| 作成日     | 2026-04-21           |
| ステータス | pending              |

## 目的

Phase 4 のテストに加え、エッジケース・競合シナリオ・回帰テストを追加してカバレッジを拡充する。

## 追加テストケース

```typescript
describe("RALLY-011: エッジケース・競合シナリオ", () => {
  it("isSubmitting中に複数回workflowSnapshotが更新された場合、最後の値だけが反映される", async () => {
    // isSubmitting中に2回更新 → isSubmitting = false
    // 最後のworkflowSnapshotの内容が表示されること
  });

  it("isSubmitting中に更新がなければバッファは空のまま", async () => {
    // isSubmitting = true → false（workflowSnapshot変化なし）
    // 余分な再レンダリングがないこと
  });

  it("RALLY-010との整合: activeSnapshotが完了フェーズのとき完了UIが表示される", () => {
    // activeSnapshot.phase = "completed" のとき
    // data-testid="interview-completed" が表示されること
  });

  it("送信完了後にバッファがクリアされる", async () => {
    // isSubmitting = false になった後
    // pendingSnapshotRef.current が null になっていること
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
- [ ] RALLY-010 との整合テストが追加されていること
- [ ] `pnpm test` で全件 Green であること
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

Phase 7: テストカバレッジ確認
