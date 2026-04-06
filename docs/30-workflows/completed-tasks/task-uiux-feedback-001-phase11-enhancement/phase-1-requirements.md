# Phase 1: 要件定義

## メタ情報

| 項目      | 値                                                                      |
| --------- | ----------------------------------------------------------------------- |
| Phase     | 1                                                                       |
| 機能名    | TASK-UIUX-FEEDBACK-001: Phase 11 UI/UX 3層評価+フィードバックループ強化 |
| 作成日    | 2026-03-31                                                              |
| 担当      | 設計書作成エージェント                                                  |
| 関連Issue | GitHub Issue #1755 (TASK-RT-05 multi_select Phase 11 PENDING)           |

## 目的

現行の Phase 11「スクリーンショット手動撮影のみ」を、Semantic 確認・Visual 回帰検出・AI UX 評価の 3 層評価構造へ拡張し、評価結果をフィードバックループ（unassigned-task 自動生成）として次タスク設計へ繋げる仕組みを確立する。同時に TASK-RT-05 の Phase 11（M11-1〜M11-4 全 PENDING）を 3 層評価で完了させることで Issue #1755 を解消する。

## 実行タスク

- `task-specification-creator` スキルの Phase 11 テンプレートを 3 層評価構造（Semantic・Visual・AI UX）に更新する
- フィードバックループ（AI 評価 → unassigned-task 自動生成 → 次 Phase 2 参照）の設計を確定する
- Playwright `_electron` 統合による E2E 自動化仕様を定義する
- AI UX 評価パイプライン（Claude API 呼び出し）の実装仕様を定義する
- TASK-RT-05 の Phase 11（multi_select M11-1〜M11-4）を 3 層評価シナリオで再定義し、完了可能な状態にする
- 新規スクリプト配置先（`.claude/skills/task-specification-creator/scripts/`）を確定する

## 受入条件

| ID   | 条件                                                                                                      | 優先度 |
| ---- | --------------------------------------------------------------------------------------------------------- | ------ |
| AC-1 | Phase 11 テンプレートに 3 層評価構造（Semantic 確認・Visual 回帰検出・AI UX 評価）が定義されている        | MUST   |
| AC-2 | フィードバックループ（評価 → `unassigned-task/ui-ux-issue-{{ID}}.md` 自動生成）の仕組みが定義されている   | MUST   |
| AC-3 | Playwright `_electron` 統合による E2E 自動化仕様（設定・テスト構造・起動方法）が定義されている            | MUST   |
| AC-4 | AI UX 評価パイプラインの実装仕様（Claude API 呼び出し・レスポンス処理・出力先）が定義されている           | MUST   |
| AC-5 | TASK-RT-05 Phase 11（M11-1〜M11-4）が 3 層評価シナリオとして再定義され、完了可能になる                    | MUST   |
| AC-6 | `outputs/phase-11/ai-ux-evaluation.md` への評価結果記録形式が定義されている                               | MUST   |
| AC-7 | 既存 Phase 11 テンプレートとの後方互換性が確認されている（既存 UI task への影響範囲が明記されている）     | SHOULD |
| AC-8 | フィードバックループが「機械的に継続できる仕組み」として閉じている（次タスク Phase 2 での参照手順を含む） | MUST   |

## 現行コードアンカー（変更対象ファイルと観察点）

| ファイルパス                                                                                                    | 変更種別 | 観察点                                                                                              |
| --------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md`                         | 更新     | 現行は「スクリーンショットエビデンス」と「仕様照合結果サマリー」のみ。3層評価セクションが存在しない |
| `.claude/skills/task-specification-creator/SKILL.md` (line 118)                                                 | 更新     | Phase 11 説明が「docs navigation と UI evidence を人手で確認する」のみ                              |
| `.claude/skills/task-specification-creator/references/phase-templates.md`                                       | 更新     | Phase 11 テンプレート定義の 3 層評価構造への拡張                                                    |
| `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/phase-11-manual-test.md` | 更新     | M11-1〜M11-4 が walkthrough シナリオのみ。3 層評価での再定義が必要                                  |
| `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts`                            | 新規作成 | Playwright `_electron` 統合スクリプト（未存在）                                                     |
| `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`                                           | 新規作成 | Claude API 呼び出しスクリプト（未存在）                                                             |

### 現行 Phase 11 テンプレートの課題

現行の `phase-11-test-report-template.md` には以下のセクションが存在するが、3 層評価は含まれていない:

- 機能テスト（正常系）テーブル
- エラーハンドリングテスト（異常系）テーブル
- アクセシビリティテスト（ARIA ラベル等の確認は形式的）
- スクリーンショットエビデンス（手動撮影・命名ルールのみ）
- 仕様照合結果サマリー

**欠落している要素**:

1. Semantic 確認（ARIA ロール・tabindex・キーボードナビゲーション構造検証）が独立セクションとして存在しない
2. Visual 回帰検出（`toHaveScreenshot()` による before/after diff）が存在しない
3. AI UX 評価パイプライン（スクリーンショット → LLM → 改善提案出力）が存在しない
4. 評価結果から `unassigned-task` を自動生成するフローが存在しない

## 参照資料

| 資料名                              | パス / URL                                                                                                      | 説明                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 11 テンプレート（現行）       | `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md`                         | 改善ベースライン                   |
| SKILL.md Phase 11 説明              | `.claude/skills/task-specification-creator/SKILL.md` line 118                                                   | 現行の Phase 11 定義               |
| TASK-RT-05 Phase 11                 | `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/phase-11-manual-test.md` | 適用対象の既存 Phase 11（PENDING） |
| GitHub Issue #1755                  | https://github.com/[repo]/issues/1755                                                                           | multi_select Phase 11 未完了 issue |
| Playwright `_electron` ドキュメント | https://playwright.dev/docs/api/class-electron                                                                  | ElectronApp 統合 API               |
| Playwright `toHaveScreenshot()`     | https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-2                       | 視覚的回帰検出 API                 |
| agent-browser (Vercel Labs)         | https://github.com/vercel-labs/agent-browser                                                                    | semantic snapshot 設計思想         |

## 統合テスト連携

| 連携先          | 連携内容                                                                               |
| --------------- | -------------------------------------------------------------------------------------- |
| Phase 4 テスト  | Playwright `_electron` テストスイートを Phase 4 で作成・Phase 11 で実行                |
| Phase 6 拡充    | 3 層評価の fail ケース（ARIA 欠落、視覚回帰、UX 問題）を Phase 6 で edge case 追加     |
| Phase 12 docs   | AI UX 評価レポート（`ai-ux-evaluation.md`）を Phase 12 ドキュメントに取り込む          |
| unassigned-task | Phase 11 で検出した UX 問題を `unassigned-task/ui-ux-issue-{{ID}}.md` として formalize |

## 成果物

| 成果物名                  | パス                                                                                    | 説明           |
| ------------------------- | --------------------------------------------------------------------------------------- | -------------- |
| 要件定義書（本ファイル）  | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-1-requirements.md`  | Phase 1 成果物 |
| 設計書（Phase 2）         | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-2-design.md`        | Phase 2 で作成 |
| 設計レビュー書（Phase 3） | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-3-design-review.md` | Phase 3 で作成 |

## タスク分類

| 項目            | 値                                                                |
| --------------- | ----------------------------------------------------------------- |
| タスク種別      | スキル改善 + UI task（Phase 11 実行含む）                         |
| artifact 命名   | `phase-1-requirements`, `phase-2-design`, `phase-3-design-review` |
| screenshot 必要 | YES（3 層評価の Visual 確認セクションで Playwright 実行時に生成） |
| Phase 11 分類   | UI task（スクリーンショット・視覚確認が必要）                     |

## 完了条件チェックリスト

- [ ] 受入条件 AC-1〜AC-8 が全て定義されている
- [ ] 現行 Phase 11 テンプレートの課題が文書化されている
- [ ] 変更対象ファイル 6 点が洗い出されている
- [ ] TASK-RT-05 Phase 11 との関係が明記されている
- [ ] GitHub Issue #1755 の解消方法が受入条件に反映されている
- [ ] タスク分類（UI task / docs-only task）が明示されている
- [ ] artifact 命名 canonical 一覧が確定している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**
