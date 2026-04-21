# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 8                    |
| タスクID   | TASK-RALLY-011       |
| 機能名     | 送信中競合防止UI強化 |
| 前提Phase  | Phase 7              |
| 後続Phase  | Phase 9              |
| 作成日     | 2026-04-21           |
| ステータス | pending              |

## 目的

Phase 5 の実装をレビューし、可読性・保守性・責務境界の観点でリファクタリングが必要な箇所を特定・修正する。

## リファクタリング観点

| 観点          | 確認内容                                                                    |
| ------------- | --------------------------------------------------------------------------- |
| 可読性        | `pendingSnapshotRef` と `activeSnapshot` の役割がコメントで明示されているか |
| useEffect整理 | バッファリング用 useEffect が2つある構成が最適か（統合可能か）              |
| 責務境界      | IPC呼び出し用と UI表示用の `workflowSnapshot` 参照分離が明確か              |
| 後続影響      | RALLY-012 が変更する箇所（`submitAnswer` のエラー処理）と衝突しないか       |

## 参照資料

| 資料名                 | パス                                              | 説明           |
| ---------------------- | ------------------------------------------------- | -------------- |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |

## 成果物

| 成果物         | パス                                             | 説明                     |
| -------------- | ------------------------------------------------ | ------------------------ |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | リファクタ内容と判断     |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | リファクタ後のテスト計画 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | 責務分離の整理           |

## 完了条件

- [ ] リファクタリング後に `pnpm test` で全件 Green であること
- [ ] `pnpm typecheck` と `pnpm lint` でエラー 0 件であること
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

Phase 9: 品質保証
