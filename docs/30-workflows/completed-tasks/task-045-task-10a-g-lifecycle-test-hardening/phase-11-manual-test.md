# Phase 11: 手動テスト - スキルライフサイクル統合テスト強化

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 11 - 手動テスト                     |
| 機能名     | task-10a-g-lifecycle-test-hardening |
| タスクID   | TASK-10A-G                          |
| 作成日     | 2026-03-10                          |
| 前Phase    | Phase 10 - 最終レビュー             |
| ステータス | completed                           |

## 目的

自動テストの結果だけでは見えない「画面上の責務境界」と「current workflow 成果物の整合」を手動で再確認する。今回はユーザーからスクリーンショット検証の明示要求があるため、テスト専用タスクであっても P53 代替に逃げず、代表 UI の実画面証跡を current workflow 配下へ残す。

## 実行タスク

- Task 1: G1/G2/G3 の対象コードと targeted suite の結果を目視レビューする
- Task 2: 代表 UI 5ケースをスクリーンショット取得して仕様照合する
- Task 3: 障害切り分けフローと ChatPanel / Store / IPC の責務境界を再確認する
- Task 4: manual-test-result / screenshot-plan / capture metadata / coverage を同期する

## テストケース

| テストケース | 対象画面                 | 状態                               | 目的                                   | 優先度 |
| ------------ | ------------------------ | ---------------------------------- | -------------------------------------- | ------ |
| TC-11-01     | ChatPanel 実行中ハーネス | 実行中 / スキル管理トグル disabled | G3 executing guard の視覚確認          | A      |
| TC-11-02     | SkillManagementPanel     | default                            | import 済み/利用可能一覧の同時表示確認 | A      |
| TC-11-03     | SkillCreateWizard        | complete                           | create フロー成功面の確認              | A      |
| TC-11-04     | SkillAnalysisView        | default                            | analyze フローの基本面確認             | A      |
| TC-11-05     | SkillAnalysisView        | improved                           | improve 後の状態反映確認               | A      |

## 画面カバレッジマトリクス

| テストケース | 画面                 | 状態            | 証跡                                                      | 判定 |
| ------------ | -------------------- | --------------- | --------------------------------------------------------- | ---- |
| TC-11-01     | ChatPanel            | executing guard | `screenshots/TC-11-01-chatpanel-executing-guard.png`      | PASS |
| TC-11-02     | SkillManagementPanel | default         | `screenshots/TC-11-02-skill-management-panel-default.png` | PASS |
| TC-11-03     | SkillCreateWizard    | complete        | `screenshots/TC-11-03-skill-create-wizard-complete.png`   | PASS |
| TC-11-04     | SkillAnalysisView    | default         | `screenshots/TC-11-04-skill-analysis-default.png`         | PASS |
| TC-11-05     | SkillAnalysisView    | improved        | `screenshots/TC-11-05-skill-analysis-improved.png`        | PASS |

## 実行結果サマリー

### 自動テスト再確認

| 項目           | コマンド                                                                                                                                                                                                                                        | 期待結果   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| G1             | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts`                                                                                                                                                        | 14/14 PASS |
| G2             | `cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`                                                                                                                                | 21/21 PASS |
| G3             | `cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`                                                                                                                                 | 17/17 PASS |
| targeted suite | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx` | 52/52 PASS |

### 画面証跡取得

| 項目                 | コマンド                                                                                                                                                                                   | 期待結果                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| screenshot preflight | `pnpm --filter @repo/desktop build`                                                                                                                                                        | build PASS                    |
| screenshot capture   | `pnpm --filter @repo/desktop run screenshot:task-10a-g`                                                                                                                                    | 5 screenshots + metadata 出力 |
| screenshot coverage  | `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-045-task-10a-g-lifecycle-test-hardening` | PASS                          |

## 障害切り分け手順

| 失敗パターン        | 原因候補                                        | 切り分け先                                                        |
| ------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| G1のみ失敗          | `skill:create` ハンドラの入力検証 / sender 検証 | `apps/desktop/src/main/ipc/skillHandlers.ts`                      |
| G2のみ失敗          | Store action と preload mock の契約ずれ         | `apps/desktop/src/renderer/store/agentSlice.ts` と hook 群        |
| G3のみ失敗          | ChatPanel と SkillManagementPanel の結線ずれ    | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`         |
| screenshot だけ失敗 | harness / mock / route drift                    | `apps/desktop/scripts/capture-task-10a-g-phase11-screenshots.mjs` |

## 統合テスト連携

- G1 は `skill:create` の入力検証と handler 契約を固定し、G2/G3 が参照する Main 側境界の退行を先に検知する
- G2 は Store 駆動の `create/analyze/improve` 遷移を固定し、Phase 11 の代表 UI 5ケースと 1対1で照合する
- G3 は ChatPanel 起点の結線を固定し、TC-11-01 の executing guard と TC-11-02 のパネル表示整合を担保する
- Phase 11 では targeted suite 52件 PASS と screenshot 5件の両方を証跡とし、非視覚情報だけで完了扱いにしない

## 参照資料

| 参照資料                     | パス                                                                              | 使用目的                                         |
| ---------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| テストパターン               | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | targeted suite と mock 境界確認                  |
| 状態管理                     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | G2/G3 の Store 境界確認                          |
| UI機能別実装記録             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | SkillCreateWizard / SkillAnalysisView の責務照合 |
| UI統合インターフェース       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`    | ChatPanel 統合境界確認                           |
| Phase 11/12 ガイド           | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`       | explicit screenshot 要求時の運用確認             |
| Phase 2 設計検証             | `outputs/phase-2/design-verification.md`                                          | UI責務とテスト観点の設計根拠                     |
| Phase 5 Green レポート       | `outputs/phase-5/g1-g2-g3-green-report.md`                                        | 手動確認前の成功基準                             |
| Phase 6 カバレッジレポート   | `outputs/phase-6/coverage-report.md`                                              | 追加テスト観点の照合                             |
| Phase 7 最終カバレッジ       | `outputs/phase-7/coverage-final-report.md`                                        | 対象範囲の coverage 根拠                         |
| Phase 8 refactoring レポート | `outputs/phase-8/refactoring-report.md`                                           | helper 抽出後の責務維持確認                      |
| Phase 9 品質検証レポート     | `outputs/phase-9/quality-verification-report.md`                                  | quality gate PASS の根拠                         |
| Phase 10 最終レビュー        | `outputs/phase-10/final-review-report.md`                                         | 手動テストへ進める判定根拠                       |

## 成果物

| 成果物                 | パス                                                         | 説明                                             |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| 手動テスト結果レポート | `outputs/phase-11/manual-test-result.md`                     | targeted suite / screenshot / 責務境界の総合判定 |
| 撮影計画               | `outputs/phase-11/screenshot-plan.json`                      | TC と png の対応表                               |
| 撮影メタデータ         | `outputs/phase-11/screenshots/phase11-capture-metadata.json` | 取得時刻・route・viewport                        |
| 画面カバレッジ         | `outputs/phase-11/screenshot-coverage.md`                    | 5/5 TC coverage                                  |
| 実行ログ抜粋           | `outputs/phase-11/test-run-log.txt`                          | 自動テスト要約                                   |

## 完了条件

- [x] G1/G2/G3 の targeted suite 結果が再確認されている
- [x] 代表 UI 5ケースの screenshot が current workflow 配下に保存されている
- [x] `manual-test-result.md` に TC ごとの証跡が紐付いている
- [x] `validate-phase11-screenshot-coverage.js` が PASS している
- [x] 障害切り分け手順が current 実装へ一致している

## 次Phase

Phase 12: ドキュメント（`phase-12-documentation.md`）
