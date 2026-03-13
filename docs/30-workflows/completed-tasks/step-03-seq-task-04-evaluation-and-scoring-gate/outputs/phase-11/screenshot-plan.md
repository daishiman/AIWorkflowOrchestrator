# Phase 11 スクリーンショット計画

## 実行情報

- command: `node apps/desktop/scripts/capture-task-skill-lifecycle-04-phase11.mjs`
- viewport: `1440x1600`
- theme: `light`
- output root: `outputs/phase-11/screenshots/`

## 画面カバレッジマトリクス

| テストケース | ファイル                                                              | ready 条件                                                              | 状態     |
| ------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------- |
| TC-11-01     | `outputs/phase-11/screenshots/TC-11-01-revise-required.png`           | `data-testid="skill-evaluation-panel"` と `改善必須` badge の表示       | 取得済み |
| TC-11-02     | `outputs/phase-11/screenshots/TC-11-02-save-with-warning.png`         | `保存可・警告あり` badge と summary の表示                              | 取得済み |
| TC-11-03     | `outputs/phase-11/screenshots/TC-11-03-use-ready.png`                 | `利用可` badge と総合スコア表示                                         | 取得済み |
| TC-11-04     | `outputs/phase-11/screenshots/TC-11-04-hard-block.png`                | hard block 文言 `critical risk が残っているため利用できません。` の表示 | 取得済み |
| TC-11-05     | `outputs/phase-11/screenshots/TC-11-05-recommended-after-improve.png` | `推奨` badge と `+14` delta の表示                                      | 取得済み |
| TC-11-06     | `outputs/phase-11/screenshots/TC-11-06-task05-re-evaluate.png`        | `SkillCenterView` 側 quality banner と再評価後の `利用可` 表示          | 取得済み |

## capture metadata

- `outputs/phase-11/screenshots/capture-results.json` に各 screenshot の取得時刻を保存済み
