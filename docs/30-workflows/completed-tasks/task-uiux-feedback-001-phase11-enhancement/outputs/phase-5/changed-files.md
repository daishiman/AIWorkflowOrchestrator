# 変更ファイル一覧

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 5                                     |
| 機能名 | phase11-ui-ux-auto-eval-feedback-loop |
| 作成日 | 2026-03-31                            |
| 現在地 | spec_created                          |

## current fact

この wave では `.claude/skills/task-specification-creator/` に 3 層評価用の script / agent / test を追加した。まだ `.agents/skills/task-specification-creator/` mirror、Phase 11 実測 evidence、Phase 12 close-out 完了は揃っていないため、本ファイルは「実装済み台帳」ではなく「canonical root で確認できる差分一覧」として扱う。

## canonical root で確認できる差分

### 新規作成ファイル

| No. | ファイルパス                                                                                       | 役割                                |
| --- | -------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 1   | `.claude/skills/task-specification-creator/agents/evaluate-ui-ux.md`                               | AI UX 評価プロンプトと 3 層評価仕様 |
| 2   | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`                              | Claude API 評価 CLI                 |
| 3   | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts`            | Playwright Electron 設定            |
| 4   | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts`               | Semantic / Visual 層テスト骨格      |
| 5   | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-prompt-loader.js`                | prompt section loader               |
| 6   | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-report-formatter.js`             | Markdown レポート生成               |
| 7   | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-screenshot.js`                   | screenshot base64 変換              |
| 8   | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-unassigned-task.js`              | HIGH 問題の unassigned-task 化      |
| 9   | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-types.d.ts`                      | JSDoc 用型定義                      |
| 10  | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts`               | evaluator テスト                    |
| 11  | `.claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux-prompt-loader.test.ts` | prompt loader テスト                |

### 修正ファイル

| No. | ファイルパス                                                                                                    | 変更内容                                 |
| --- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 12  | `.claude/skills/task-specification-creator/SKILL.md`                                                            | Phase 11 を 3 層評価へ更新               |
| 13  | `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md`                         | 3 層評価セクション追加                   |
| 14  | `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/phase-11-manual-test.md` | M11-1〜M11-4 を 3 層評価シナリオに再定義 |

## 未完了事項

| 対象                                                | 状態       | 理由                                       |
| --------------------------------------------------- | ---------- | ------------------------------------------ |
| `.agents/skills/task-specification-creator/` mirror | 未同期     | canonical 差分の反映が未了                 |
| `outputs/phase-11/screenshots/*.png`                | 実測未取得 | 現在は `scaffold-placeholder.png` のみ     |
| `outputs/phase-12/*` close-out                      | 再整理中   | false green 除去と system spec sync が必要 |
