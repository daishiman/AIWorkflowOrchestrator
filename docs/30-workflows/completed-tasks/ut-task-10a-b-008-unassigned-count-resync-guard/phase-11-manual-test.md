# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 11                                                                      |
| 機能名     | ut-task-10a-b-008-unassigned-count-resync-guard                         |
| タスクID   | UT-TASK-10A-B-008                                                       |
| タスク名   | 未タスク件数再計算同期ガード                                            |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10 |
| 後続Phase  | Phase 12                                                                |
| 作成日     | 2026-03-06                                                              |
| ステータス | completed                                                               |

## 目的

コマンド出力、3台帳の本文、教訓文書の記述を人手で照合すると同時に、ユーザーが明示要求したスクリーンショット証跡を用いて関連UI（SkillAnalysisView）の表示状態を再確認し、機械検証だけでは拾いにくい読解ミス・日付解釈ミス・画面状態不整合を除去する。

## Atent Team（SubAgent）分担

| SubAgent | 関心ごと                 | 実行順序  | 役割                                                                   |
| -------- | ------------------------ | --------- | ---------------------------------------------------------------------- |
| A        | 台帳整合                 | 先行      | コマンド出力と本文中のID集合を照合する                                 |
| B        | 画面証跡取得             | Aと並列   | SkillAnalysisView の dark/light/mobile/error/loading を撮影する        |
| C        | Apple UI/UX 視覚レビュー | B後に直列 | 余白、階層、コントラスト、レスポンシブ、状態遷移の見え方を評価する     |
| D        | 手動判定統合             | C後に直列 | 目視結果を `manual-test-result.md` / `screenshot-review.md` にまとめる |

## 実行タスク

- active set 目視確認: `rg` 出力と本文のID集合を照合する
- 台帳本文確認: detection、workflow、UI仕様の件数と説明文を照合する
- 画面証跡取得: SkillAnalysisView の通常/選択/改善後/エラー/ローディング/light/mobile を撮影する
- Apple UI/UX 視覚レビュー: 画面証跡をもとに階層・余白・コントラスト・レスポンシブを評価する
- 手動判定統合: 目視結果と差分有無を記録する

## 参照資料

### 前Phase成果物

| 資料名                       | パス                                         | 用途                   |
| ---------------------------- | -------------------------------------------- | ---------------------- |
| Phase 1 要件定義             | `outputs/phase-1/requirements-definition.md` | 目視判定基準を確認する |
| Phase 2 台帳同期設計         | `outputs/phase-2/ledger-sync-design.md`      | 照合順序を確認する     |
| Phase 5 active set 証跡      | `outputs/phase-5/active-id-proof.md`         | active set を確認する  |
| Phase 6 回帰テスト計画       | `outputs/phase-6/regression-test.md`         | 代表ケースを確認する   |
| Phase 7 カバレッジ報告       | `outputs/phase-7/coverage-report.md`         | 重点確認領域を確認する |
| Phase 8 再利用ガードパターン | `outputs/phase-8/reusable-guard-pattern.md`  | 再利用ルールを確認する |
| Phase 9 品質報告             | `outputs/phase-9/quality-report.md`          | 監査観点を確認する     |
| Phase 10 最終レビュー結果    | `outputs/phase-10/final-review-result.md`    | 通過条件を確認する     |

### 関連UI証跡

| 資料名                     | パス                                                               | 用途                                 |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------ |
| SkillAnalysisView workflow | `docs/30-workflows/completed-tasks/skill-analysis-view/`           | 画面証跡の正本と対象UI文脈を確認する |
| screenshot capture script  | `apps/desktop/scripts/capture-skill-analysis-view-screenshots.mjs` | 再撮影コマンドの仕様を確認する       |

### システム仕様（aiworkflow-requirements）

| 資料名                   | パス                                                                            | 用途                                     |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------- |
| タスク運用正本           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 残課題表と節本文を確認する               |
| タスク運用ルール         | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`      | 未タスク配置先とリンク整合条件を確認する |
| UI機能仕様正本           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 関連未タスク表を確認する                 |
| UI/UX コンポーネント規約 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | SkillAnalysisView のUI文脈を確認する     |
| 教訓正本                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 再発防止ルールを確認する                 |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | 手動確認記録の粒度を確認する             |
| 開発ガイドライン         | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`   | 手動確認結果の記録順を確認する           |

## 実行手順

1. `rg` で抽出した active set と 3台帳本文のID集合を並べて読む。
2. 件数、ID集合、完了済み除外、追加UT反映の4観点で差分を探す。
3. `pnpm --filter @repo/desktop run screenshot:skill-analysis -- --output-dir .../outputs/phase-11/screenshots` を実行する。
4. light/mobile/error/loading を含む 8 ケースの screenshot を目視し、Apple UI/UX 観点で評価する。
5. lessons の再利用ルールが本文差分と矛盾しないか確認する。
6. 目視結果を `manual-test-result.md` / `evidence-checklist.md` / `screenshot-review.md` に記録する。

## 統合テスト連携

- Phase 11 は機械検証結果と手動確認結果の両方を揃えて通過とする。
- Phase 12 は Phase 11 で確認した差分ゼロ結果だけを実装ガイドへ転記する。

## テストケース

| テストケース | 名称                                       | 判定 |
| ------------ | ------------------------------------------ | ---- |
| TC-01        | SkillAnalysisView 通常表示（dark desktop） | PASS |
| TC-02        | 改善提案の選択状態                         | PASS |
| TC-03        | 選択適用後の改善済み表示                   | PASS |
| TC-04        | 全自動改善後の改善済み表示                 | PASS |
| TC-05        | エラー表示                                 | PASS |
| TC-06        | ローディング表示                           | PASS |
| TC-07        | light theme 表示                           | PASS |
| TC-08        | mobile 表示                                | PASS |

## スクリーンショット取得手順

1. `pnpm --filter @repo/desktop run screenshot:skill-analysis -- --output-dir ../../docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard/outputs/phase-11/screenshots`
2. `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard`
3. `outputs/phase-11/screenshots/` の 8 ファイルを目視する
4. `outputs/phase-11/screenshot-review.md` に Apple UI/UX 観点のレビューを記録する

## 画面カバレッジマトリクス

| TC    | 観点                     | 証跡ファイル                             |
| ----- | ------------------------ | ---------------------------------------- |
| TC-01 | 通常表示（dark desktop） | `TC-01-analysis-default-dark.png`        |
| TC-02 | 改善提案の選択状態       | `TC-02-analysis-selection-dark.png`      |
| TC-03 | 選択適用後               | `TC-03-analysis-apply-improved-dark.png` |
| TC-04 | 全自動改善後             | `TC-04-analysis-auto-improved-dark.png`  |
| TC-05 | エラー状態               | `TC-05-analysis-error-dark.png`          |
| TC-06 | ローディング状態         | `TC-06-analysis-loading-dark.png`        |
| TC-07 | light theme              | `TC-07-analysis-default-light.png`       |
| TC-08 | mobile 表示              | `TC-08-analysis-default-mobile-dark.png` |

## 非視覚確認

| 観点     | 確認内容                                                      | 正本                    |
| -------- | ------------------------------------------------------------- | ----------------------- |
| ID集合   | command 出力と本文が一致するか                                | `manual-test-result.md` |
| 件数表現 | 3台帳の件数表現が一致するか                                   | `evidence-checklist.md` |
| 教訓表現 | 再利用ルールが本文と矛盾しないか                              | `manual-test-result.md` |
| 日付表現 | 2026-03-02 / 2026-03-05 / 2026-03-06 が混在解釈されていないか | `evidence-checklist.md` |

## 成果物

| 成果物                     | パス                                     | 説明                                     |
| -------------------------- | ---------------------------------------- | ---------------------------------------- |
| 手動テスト結果             | `outputs/phase-11/manual-test-result.md` | 目視確認の結果を記録する                 |
| 証跡チェックリスト         | `outputs/phase-11/evidence-checklist.md` | 照合観点と結果を記録する                 |
| スクリーンショットレビュー | `outputs/phase-11/screenshot-review.md`  | Apple UI/UX 観点の視覚レビューを記録する |
| 画面証跡                   | `outputs/phase-11/screenshots/`          | 8 ケースの PNG 証跡を保存する            |

## 完了条件

- [x] active set と本文を目視照合した
- [x] 3台帳の件数とID集合を目視照合した
- [x] 教訓文書の再利用ルールを目視照合した
- [x] screenshot 8 ケースを取得して Apple UI/UX 観点でレビューした
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 1/2/5/6/7/8/9/10 成果物の確認
2. SubAgent-A/B の並列照合
3. SubAgent-C の教訓照合
4. SubAgent-D の手動判定統合
5. 成果物出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載の4成果物を定義した
- [x] ID集合、件数、教訓、日付の4観点を目視確認した
- [x] screenshot 8 ケースと review 記録を出力した
- [x] Phase 12 の入力を確定した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard
```

## 次のPhase

Phase 12: ドキュメント更新
