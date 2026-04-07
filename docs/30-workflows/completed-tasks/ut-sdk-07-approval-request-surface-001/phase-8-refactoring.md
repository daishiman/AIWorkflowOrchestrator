# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 8                                           |
| 機能名     | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001      |
| タスク名   | Skill Creator approval request surface 接続 |
| 前提Phase  | Phase 7                                     |
| 後続Phase  | Phase 9                                     |
| 作成日     | 2026-04-06                                  |
| ステータス | pending                                     |

## 目的

Phase 5 実装と Phase 6-7 のテスト結果を踏まえ、重複・ナビゲーションドリフト・コード品質の問題を除去する。

## 実行タスク

- 重複排除: `onApprovalRequest` 実装と既存 `safeOn` 呼び出しパターンの一貫性を確認する
- 責務境界確認: approval state 管理が `SkillLifecyclePanel.tsx` に正しく局所化されているかを確認する
- コメント/型注釈: 必要な箇所にのみ JSDoc コメントを付与する（既存パターンに準拠）
- 変更記録: 対象/Before/After/理由テーブル形式で記録する

## リファクタリング候補チェック

| 観点                    | 確認内容                                                          | 対応方針                                |
| ----------------------- | ----------------------------------------------------------------- | --------------------------------------- |
| `safeOn` パターン統一   | `onApprovalRequest` が他の `safeOn` 呼び出しと同形か              | 既存パターン（`onProgress` 等）と揃える |
| approval state の局所化 | `pendingApproval` state が SkillLifecyclePanel 外に漏れていないか | 局所化を維持する                        |
| JSDoc コメント          | TASK-SDK-07 コメントが一貫しているか                              | 既存の governance bundle コメントに準拠 |
| import 順序             | approval request の local alias が既存 import 順序と一致するか    | ESLint import order ルールに従う        |

## 変更記録テンプレート（Before/After/理由）

| 対象                     | Before | After | 理由 |
| ------------------------ | ------ | ----- | ---- |
| （Phase 5 実装後に記入） | -      | -     | -    |

## 参照資料

| 参照資料               | パス                                              | 説明           |
| ---------------------- | ------------------------------------------------- | -------------- |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物 |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                | Phase 5 成果物 |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |
| 契約差分               | `outputs/phase-5/contract-diff.md`                | Phase 5 成果物 |

## 実行手順

1. Phase 7 成果物を確認する。
2. リファクタリング候補チェックを実施する。
3. 変更が必要な箇所を Before/After/理由テーブルに記録する。
4. リファクタリングを実施する（テストが Green を維持することを確認）。
5. `pnpm typecheck` と `pnpm lint` を再実行する。
6. 成果物を記録する。

## 成果物

| 成果物         | パス                                             | 説明                         |
| -------------- | ------------------------------------------------ | ---------------------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | 変更対象と Before/After/理由 |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | リファクタ後の確認テスト計画 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | Preload/Renderer 責務境界図  |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 変更内容が Before/After/理由テーブル形式で記録されている
- [ ] リファクタ後も全テスト（TC-APPR-01〜18）が Green である
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-sdk-07-approval-request-surface-001
```

## 次のPhase

Phase 9: 品質保証
