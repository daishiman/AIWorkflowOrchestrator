# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 9                            |
| タスクID   | TASK-RALLY-013               |
| 機能名     | Undo可能範囲の視覚的表現追加 |
| 前提Phase  | Phase 8                      |
| 後続Phase  | Phase 10                     |
| 作成日     | 2026-04-21                   |
| ステータス | pending                      |

## 目的

実装・テスト・リファクタリングを通じた品質状態を総合評価し、Phase 10 最終レビューゲートへの入力とする。RALLY-013 は ConversationalInterview ドメインのチェーン末尾のため、RALLY-010〜013 全体の整合も確認する。

## リスク評価観点

| リスク項目                          | 内容                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| RALLY-003 未完了時の動作            | RALLY-003 が未完了の場合、Undoボタンはクライアント側のみ動作する点を明記        |
| canUndo と undoableStepCount の乖離 | `interview.steps` の更新タイミングと `canUndo` の更新タイミングが一致しているか |
| RALLY-010〜013 チェーン全体の整合   | 4タスクの変更が ConversationalInterview.tsx 上で矛盾なく動作しているか          |
| インジケーターの表示条件            | `undoableStepCount > 0` の条件が全シナリオ（エラー/完了/待機/入力）で正しいか   |

## 参照資料

| 資料名         | パス                                         | 説明           |
| -------------- | -------------------------------------------- | -------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`        | Phase 8 成果物 |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md` | Phase 8 成果物 |

## 成果物

| 成果物         | パス                                   | 説明               |
| -------------- | -------------------------------------- | ------------------ |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 品質指標の総合評価 |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | リスクと対策一覧   |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | 副作用確認結果     |

## 完了条件

- [ ] 品質レポートが作成されていること
- [ ] typecheck・lint・test すべて 0 エラーであること
- [ ] RALLY-010〜013 チェーン全体の整合が確認されていること
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

Phase 10: 最終レビューゲート
