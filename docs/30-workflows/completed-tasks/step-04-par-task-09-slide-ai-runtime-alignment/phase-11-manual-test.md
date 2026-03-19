# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 11                                                                                                                                                                                  |
| Phase名    | 手動テスト                                                                                                                                                                          |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001                                                                                                                                             |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー） |
| 後続Phase  | Phase 12（ドキュメント）                                                                                                                                                            |
| ステータス | completed                                                                                                                                                                           |
| 作成日     | 2026-03-13                                                                                                                                                                          |
| 機能名     | slide-ai-runtime-alignment                                                                                                                                                          |

## テスト方式

- 画面確認: `SlideWorkspace` の current code を元にした static fallback harness でスクリーンショットを取得する
- 契約確認: `ipc/index.ts` / `slide/ipc-handlers.ts` / `slide/agent-client.ts` / `slide/modifier-skill.ts` / `SlideWorkspace.tsx` を照合する
- fallback 理由: current worktree では `electron-vite` 起動時に esbuild native binary mismatch が発生し、live preview capture を継続できなかった
- 証跡正本: `outputs/phase-11/screenshot-plan.json` と `outputs/phase-11/screenshots/phase11-capture-metadata.json`

## 目的

task 09 が定義した slide runtime/auth-mode alignment の仕様に対して、現在の画面・IPC・runtime 境界がどこまで一致し、どこが未反映かをスクリーンショット付きで再確認する。

## 実行タスク

- empty state の視覚確認: project 未選択時の導線と CTA を確認する
- synced state の視覚確認: project 選択後に runtime/auth/status 表示が揃っているかを確認する
- manual sync CTA の視覚確認: `out-of-sync` 時の同期導線と用語が設計に一致するかを確認する
- running progress の視覚確認: modifier 実行中の進捗表示と cancel 導線を確認する
- degraded state の視覚確認: sync error 時に guidance / terminal fallback が露出するかを確認する
- code/spec 契約確認: runtime resolver、IPC 登録、legacy path、P31 follow-up を横断確認する

## テストケース

| TC-ID    | シナリオ            | 期待仕様                                                                                 |
| -------- | ------------------- | ---------------------------------------------------------------------------------------- |
| TC-11-01 | empty state         | project 未選択時に open CTA が表示され、画面が初期状態として成立している                 |
| TC-11-02 | synced state        | project 選択後に sync 状態、watch 状態、runtime/auth 状態が user-facing surface に現れる |
| TC-11-03 | out-of-sync CTA     | reverse-sync 導線と用語が正本仕様に一致し、manual fallback が誤解なく伝わる              |
| TC-11-04 | running progress    | 実行中 progress と cancel 導線、phase 状態が画面上で追跡できる                           |
| TC-11-05 | degraded / guidance | error 時に degraded guidance、terminal launcher、handoff 理由が表示される                |

## 画面カバレッジマトリクス

| TC-ID    | 対象画面                   | キャプチャ source               | 証跡                                                        |
| -------- | -------------------------- | ------------------------------- | ----------------------------------------------------------- |
| TC-11-01 | SlideWorkspace empty       | `static-fallback://empty`       | `screenshots/TC-11-01-slide-workspace-empty-state.png`      |
| TC-11-02 | SlideWorkspace synced      | `static-fallback://synced`      | `screenshots/TC-11-02-slide-workspace-synced-state.png`     |
| TC-11-03 | SlideWorkspace out-of-sync | `static-fallback://out-of-sync` | `screenshots/TC-11-03-slide-workspace-manual-sync-cta.png`  |
| TC-11-04 | SlideWorkspace running     | `static-fallback://running`     | `screenshots/TC-11-04-slide-workspace-running-progress.png` |
| TC-11-05 | SlideWorkspace error       | `static-fallback://sync-error`  | `screenshots/TC-11-05-slide-workspace-sync-error.png`       |

## 参照資料

| 参照資料                 | パス                                                 | 内容                                                         |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------------------------ |
| Phase 1（要件定義）      | `phase-1-requirements.md`                            | 期待 runtime/auth contract を確認する                        |
| Phase 2（設計）          | `phase-2-design.md`                                  | UI 4領域、IPC rename、RuntimeResolver 統合設計を確認する     |
| Phase 5 成果物           | `outputs/phase-5/implementation-plan.md`             | 実装対象の粒度と main/renderer 分割を確認する                |
| Phase 6 成果物           | `outputs/phase-6/regression-plan.md`                 | 契約差分の回帰確認観点を参照する                             |
| Phase 7 成果物           | `outputs/phase-7/coverage-plan.md`                   | coverage と evidence の不足観点を参照する                    |
| Phase 8 成果物           | `outputs/phase-8/refactor-plan.md`                   | refactor / P31 follow-up 観点を参照する                      |
| Phase 9 成果物           | `outputs/phase-9/qa-checklist.md`                    | QA 観点と品質ゲートを参照する                                |
| Phase 10（最終レビュー） | `phase-10-final-review.md`                           | review 指摘と未解決事項を確認する                            |
| Slide IPC handlers       | `apps/desktop/src/main/slide/ipc-handlers.ts`        | slide IPC の現行チャネル名と処理内容を確認する               |
| Main IPC index           | `apps/desktop/src/main/ipc/index.ts`                 | slide handler 登録有無を確認する                             |
| Slide agent client       | `apps/desktop/src/main/slide/agent-client.ts`        | Direct SDK / safeStorage / env fallback の残存有無を確認する |
| Modifier skill           | `apps/desktop/src/main/slide/modifier-skill.ts`      | reverse-sync 二重実装の残存を確認する                        |
| SlideWorkspace           | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | user-facing runtime/alignment surface の現状を確認する       |
| useSlideProject          | `apps/desktop/src/renderer/slide/useSlideProject.ts` | store 参照と P31 follow-up 候補を確認する                    |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                            | 内容                                     |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------- |
| workflow-ai-runtime-authmode         | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | task 09 の workflow 正本と canonical set |
| api-ipc-system-core                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                      | slide IPC 正本契約                       |
| interfaces-agent-sdk-skill-advanced  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-advanced.md`      | modifier / skill-executor の責務境界     |
| arch-electron-services-details-part2 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`     | RuntimeResolver / DI 統合の正本          |
| ui-ux-feature-components-details     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-details.md`         | SlideWorkspace UI surface 正本           |
| arch-state-management-advanced       | `.claude/skills/aiworkflow-requirements/references/arch-state-management-advanced.md`           | slideSlice / selector / P31 正本         |
| security-electron-ipc-core           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`               | slide IPC security 順序の正本            |

## 実行手順

### ステップ1: capture plan と metadata を固定する

`outputs/phase-11/screenshot-plan.json` に TC-ID と expected capture を固定し、取得後は `phase11-capture-metadata.json` で route / viewport / fallback reason を記録する。

### ステップ2: TC-11-01 から TC-11-05 を順に確認する

各ケースごとに current UI を撮影し、task 09 で定義した runtime/auth-mode alignment の期待仕様との差分を `manual-test-result.md` に記録する。

### ステップ3: screen evidence と code reality を突合する

スクリーンショットだけで判定せず、Main/Renderer の現行実装を照合して「見えていないのか」「実装自体が未接続なのか」を区別する。

### ステップ4: 発見事項を分類する

設計タスク（spec_created）であるため、現行コードとの乖離は `Blocker` ではなく `Note` / `Info` として整理し、必要なものは Phase 12 で formalize する。

## 統合テスト連携

- reverse-sync / watch-start-stop / sync-status / sync-progress / sync-error / execution-progress の契約を横断確認する
- RuntimeResolver / handoffGuidance / terminal launcher の user-facing surface 有無を確認する
- renderer の store / hook / UI と main の IPC registration の依存関係をつなげて確認する

## 成果物

| 成果物                   | パス                                                         | 内容                               |
| ------------------------ | ------------------------------------------------------------ | ---------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`                  | TC-ID 一覧と実施結果の骨子         |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                     | 画面証跡と code reality の照合結果 |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`                      | task 09 仕様との差分と follow-up   |
| 撮影計画                 | `outputs/phase-11/screenshot-plan.json`                      | TC-ID と expected capture 定義     |
| 撮影メタデータ           | `outputs/phase-11/screenshots/phase11-capture-metadata.json` | fallback reason と取得時刻         |

## 完了条件

- [ ] `TC-11-01` から `TC-11-05` の全ケースに証跡 PNG が存在する
- [ ] `manual-test-result.md` に TC-ID と `証跡` 列があり、coverage validator が参照できる
- [ ] fallback capture を使った場合、その理由が metadata と結果ファイルに残っている
- [ ] 現行コードとの差分が `discovered-issues.md` に分類されている
- [ ] Phase 12 へ引き継ぐ未タスク候補が formalize 可能な粒度で整理されている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md) に進む
