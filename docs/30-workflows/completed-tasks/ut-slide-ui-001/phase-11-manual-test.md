# Phase 11: 手動テスト - Slide Workspace UI 4領域実装

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| Phase    | 11                           |
| タスクID | UT-SLIDE-UI-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 作成日   | 2026-03-21                   |

## 目的

`SlideWorkspace` の 5 状態（empty / synced / running / degraded / guidance）を Light / Dark の 2 テーマで視覚確認し、Phase 12 で修正した CTA 配線と handoff 反映が UI に載っていることを確認する。

## 実行タスク

- screenshot capture 再実行: `apps/desktop/scripts/capture-ut-slide-ui-001-phase11.mjs` で 10 枚の PNG と metadata を生成する
- 証跡転記: `manual-test-result.md` / `screenshot-coverage.md` / `discovered-issues.md` を current 証跡で更新する
- 配線監査: CTA とアクセシビリティの配線を source review で補助確認する

1. `apps/desktop/scripts/capture-ut-slide-ui-001-phase11.mjs` を実行して 10 枚の PNG と metadata を生成する
2. `manual-test-result.md` / `screenshot-coverage.md` / `discovered-issues.md` を current 証跡で更新する
3. CTA とアクセシビリティの配線を source review で補助確認する

## 実施前提

- current worktree では `esbuild` native binary mismatch により Vite / Electron live preview が起動できない
- そのため Phase 11 は `apps/desktop/scripts/capture-ut-slide-ui-001-phase11.mjs` による static fallback capture を採用する
- fallback であっても current code の文言・状態機械・残課題を一致させ、PNG / metadata / coverage を current workflow 配下へ保存する

## テストケース

| TC-ID    | 状態     | 主確認項目                                                                         |
| -------- | -------- | ---------------------------------------------------------------------------------- |
| TC-11-01 | empty    | 空状態カードのみ表示、Launcher 非表示                                              |
| TC-11-02 | synced   | `SlideSyncCard` / `SlideWatchStatus` / `SkillPhasePanel` / `TerminalLauncher` 表示 |
| TC-11-03 | running  | progress 行、cancel CTA、running badge 表示                                        |
| TC-11-04 | degraded | degraded badge、error reason、retry / terminal fallback CTA 表示                   |
| TC-11-05 | guidance | handoff reason、settings CTA、terminal launcher 表示                               |

## 画面カバレッジマトリクス

| テストケース | 状態     | テーマ       | 証跡                                                                                                                  |
| ------------ | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| TC-11-01     | empty    | Light / Dark | `outputs/phase-11/screenshots/TC-11-01-empty-light.png`, `outputs/phase-11/screenshots/TC-11-01-empty-dark.png`       |
| TC-11-02     | synced   | Light / Dark | `outputs/phase-11/screenshots/TC-11-02-synced-light.png`, `outputs/phase-11/screenshots/TC-11-02-synced-dark.png`     |
| TC-11-03     | running  | Light / Dark | `outputs/phase-11/screenshots/TC-11-03-running-light.png`, `outputs/phase-11/screenshots/TC-11-03-running-dark.png`   |
| TC-11-04     | degraded | Light / Dark | `outputs/phase-11/screenshots/TC-11-04-degraded-light.png`, `outputs/phase-11/screenshots/TC-11-04-degraded-dark.png` |
| TC-11-05     | guidance | Light / Dark | `outputs/phase-11/screenshots/TC-11-05-guidance-light.png`, `outputs/phase-11/screenshots/TC-11-05-guidance-dark.png` |

## 実施手順

1. `node apps/desktop/scripts/capture-ut-slide-ui-001-phase11.mjs` を実行する
2. `outputs/phase-11/screenshots/phase11-capture-metadata.json` に 10 キャプチャが記録されていることを確認する
3. `manual-test-result.md` と `screenshot-coverage.md` に TC-ID と証跡を転記する
4. CTA / accessibility の実行可否は unit test 更新内容と source review を併記して判定する

## 実行コマンド

```bash
node apps/desktop/scripts/capture-ut-slide-ui-001-phase11.mjs
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/ut-slide-ui-001
```

## 参照資料

- `apps/desktop/src/renderer/slide/SlideWorkspace.tsx`
- `docs/30-workflows/ut-slide-ui-001/phase-2-design.md`
- `docs/30-workflows/ut-slide-ui-001/phase-5-implementation.md`
- `docs/30-workflows/ut-slide-ui-001/phase-6-test-expansion.md`
- `docs/30-workflows/ut-slide-ui-001/phase-7-coverage-check.md`
- `docs/30-workflows/ut-slide-ui-001/phase-8-refactoring.md`
- `docs/30-workflows/ut-slide-ui-001/phase-9-quality-assurance.md`
- `docs/30-workflows/ut-slide-ui-001/phase-10-final-review.md`
- `apps/desktop/src/renderer/slide/components/SlideSyncCard.tsx`
- `apps/desktop/src/renderer/slide/components/SlideGuidanceBlock.tsx`
- `apps/desktop/src/renderer/slide/components/TerminalLauncher.tsx`
- `docs/30-workflows/ut-slide-ui-001/outputs/phase-11/screenshots/phase11-capture-metadata.json`

## チェック観点

| 観点             | 判定基準                                                                  |
| ---------------- | ------------------------------------------------------------------------- |
| 視覚整合         | 5 状態すべてで 4領域 UI の並び順と CTA の露出が正しい                     |
| テーマ           | Light / Dark の両方で badge / guidance / launcher が崩れない              |
| CTA 配線         | retry / settings / copy が code と result の両方で追える                  |
| アクセシビリティ | focus ring / aria / progressbar 属性は source review で追跡できる         |
| fallback 妥当性  | PNG、metadata、manual result、coverage が current workflow に同居している |

## 成果物

| ファイル                                                     | 説明                              |
| ------------------------------------------------------------ | --------------------------------- |
| `outputs/phase-11/manual-test-checklist.md`                  | TC別チェックと accessibility 監査 |
| `outputs/phase-11/manual-test-result.md`                     | 実行結果と証跡                    |
| `outputs/phase-11/discovered-issues.md`                      | 残課題                            |
| `outputs/phase-11/screenshot-plan.json`                      | 撮影定義                          |
| `outputs/phase-11/screenshot-coverage.md`                    | TC-ID ↔ PNG 対応表                |
| `outputs/phase-11/screenshots/phase11-capture-metadata.json` | capture metadata                  |

## 統合テスト連携

- unit test の配線確認結果は `SlideWorkspace.test.tsx` と `selectors.test.ts` を補助証跡として扱う
- current environment では vitest 起動前に `esbuild` native binary mismatch が発生するため、Phase 11 の主証跡は PNG / metadata / source review を採用する

## 完了条件

- [ ] TC-11-01 〜 TC-11-05 の証跡が揃っている
- [ ] Light / Dark の 10 PNG が保存されている
- [ ] `manual-test-result.md` に証跡列がある
- [ ] `screenshot-coverage.md` と metadata が current workflow 配下にある
- [ ] 残課題が `discovered-issues.md` と Phase 12 未タスクへ同期されている

## 次の Phase

Phase 12: ドキュメント更新（`phase-12-documentation.md`）
