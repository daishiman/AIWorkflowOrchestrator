# UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001 タスク仕様書

## 概要

**Task ID**: UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001
**タイトル**: スキルウィザード trackEvent の E2E UI 到達確認テスト追加
**カテゴリ**: テスト
**優先度**: 中
**規模**: 中規模
**ステータス**: completed
**作成日**: 2026-04-12

---

## 背景

W3-seq-04 でスキル作成ウィザードへの `trackEvent` 計装を実装した。Phase 11 の手動テスト証跡は NON_VISUAL として Vitest のカバレッジレポートと mock 呼び出し確認で代替した。しかし実際のブラウザ/Electron 上で UI 操作が完了し `trackEvent` が発火するかどうかは検証されていない。

本タスクでは Playwright E2E テストを新規追加し、実際の UI 操作を通じて各 `trackEvent` 計装ポイントが正しく動作することを確認する。

---

## 依存タスク

| タスク ID | 内容                                       | 状態     |
| --------- | ------------------------------------------ | -------- |
| W3-seq-04 | スキル作成ウィザードの trackEvent 計装実装 | 完了済み |

---

## 成果物（新規作成ファイル）

| ファイルパス                                       | 説明                                                   |
| -------------------------------------------------- | ------------------------------------------------------ |
| `apps/desktop/e2e/skill-wizard-tracking.spec.ts`   | Playwright E2E テストファイル（本体）                  |
| `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` | trackEvent スタブ注入ヘルパー                          |
| `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`  | renderer の trackEvent 差し替え用 E2E スタブ           |
| `.github/workflows/ci.yml`                         | E2E テスト実行ステップ追加（`e2e-desktop` ジョブ改修） |
| `apps/desktop/vite.e2e.config.ts`                  | trackEvent の E2E alias 追加                           |

---

## フェーズ構成

| フェーズ | 名称             | 概要                                                                              | ファイル                                                       |
| -------- | ---------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Phase 1  | 要件定義         | AC・スコープ・テストケース一覧の策定                                              | [phase-1-requirements.md](./phase-1-requirements.md)           |
| Phase 2  | 設計             | E2E テスト設計・trackEvent スタブ注入パターン設計                                 | [phase-2-design.md](./phase-2-design.md)                       |
| Phase 3  | 設計レビュー     | 設計の妥当性検証・Phase 4 進行可否ゲート判定                                      | [phase-3-design-review.md](./phase-3-design-review.md)         |
| Phase 4  | テスト作成       | TDD Red: TC-03/05/06/08/09/11/12 相当の E2E テスト作成                            | [phase-4-test-creation.md](./phase-4-test-creation.md)         |
| Phase 5  | 実装             | trackEvent.e2e-stub.ts・wizard-tracking-stub.ts・E2E セットアップ・フロー再現実装 | [phase-5-implementation.md](./phase-5-implementation.md)       |
| Phase 6  | テスト拡充       | エッジケース追加・離脱イベント確認                                                | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       |
| Phase 7  | カバレッジ確認   | 全 AC 充足確認・Playwright トレースレポート                                       | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       |
| Phase 8  | リファクタリング | ヘルパー重複除去・型安全性向上・命名揺れ修正                                      | [phase-8-refactoring.md](./phase-8-refactoring.md)             |
| Phase 9  | 品質保証         | E2E 全件実行・既存テスト影響確認・typecheck・lint                                 | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) |
| Phase 10 | 最終レビュー     | AC-1〜AC-9 充足確認・スタブ本番混入確認                                           | [phase-10-final-review.md](./phase-10-final-review.md)         |
| Phase 11 | 手動テスト       | Electron 起動・DevTools でイベント発火目視確認                                    | [phase-11-manual-test.md](./phase-11-manual-test.md)           |
| Phase 12 | ドキュメント更新 | 実装ガイド・仕様更新・未タスク検出                                                | [phase-12-documentation.md](./phase-12-documentation.md)       |
| Phase 13 | PR 作成          | **BLOCKED** - ユーザー明示承認後のみ実施                                          | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           |

---

## 受入条件（AC）サマリー

| AC   | 内容                                                                                                                    |
| ---- | ----------------------------------------------------------------------------------------------------------------------- |
| AC-1 | E2E で InfoStep 完了 → ConversationRoundStep 遷移の確認（TC-03 相当）                                                   |
| AC-2 | E2E で CompleteStep 「👍（satisfied）」後に `skill_skeleton_quality_feedback` 発火（TC-05 相当）                        |
| AC-3 | E2E で CompleteStep 「👎（unsatisfied）」後に `skill_skeleton_quality_feedback` 発火（TC-06 相当）                      |
| AC-4 | E2E で `complete-step-action-execute` クリック後に `skill_wizard_next_action(execute)` 発火（TC-08 相当）               |
| AC-5 | E2E で `complete-step-action-open-editor` クリック後に `skill_wizard_next_action(open_editor)` 発火（TC-09 相当）       |
| AC-6 | E2E で `complete-step-action-create-another` クリック後に `skill_wizard_next_action(create_another)` 発火（TC-11 相当） |
| AC-7 | E2E で「もう一度作成」後にウィザードが InfoStep に戻ることの確認（TC-12 相当）                                          |
| AC-8 | `trackEvent` の E2E スタブが本番の `trackEvent.ts` と型整合していること                                                 |
| AC-9 | CI パイプラインで E2E テストが自動実行され、失敗時に PR がブロックされること                                            |

---

## スコープ

### 含むもの

- Playwright E2E テストファイルの新規追加（`apps/desktop/e2e/` 配下）
- Electron Renderer への `trackEvent` スタブ設定（`page.evaluate` / `window` expose パターン）
- ウィザードのマルチステップフロー再現用ヘルパー関数
- CI ワークフローへの E2E テスト実行ステップ追加

### 含まないもの

- `trackEvent.ts` 本体の変更
- `SkillCreateWizard.tsx` の変更
- 既存ユニットテストの変更
- 外部アナリティクスサービスへの実送信
