# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 11                                    |
| 機能名     | task-043b-ui-ux-import-list-design    |
| タスク名   | TASK-10A-E-B UI/UX インポート一覧設計 |
| 前提Phase  | Phase 10                              |
| 後続Phase  | Phase 12                              |
| 作成日     | 2026-03-06                            |
| ステータス | completed                             |
| 担当       | SubAgent-B                            |

## 目的

UI 視覚差分、検索操作、追加確認ダイアログ、success / error 通知、キーボード移動、focus return を手動で検証する。

## 背景

本フェーズは `phase-1-requirements.md`、`phase-2-design.md`、`phase-5-implementation.md`、`phase-6-test-expansion.md`、`phase-7-coverage-check.md`、`phase-8-refactoring.md`、`phase-9-quality-assurance.md`、`phase-10-final-review.md` を入力にし、視覚状態と操作遷移を確認する。

## Atent Team 編成

| SubAgent | 関心ごと   | 主担当内容                                      |
| -------- | ---------- | ----------------------------------------------- |
| B1       | 一覧表示   | mixed state、empty、no-result、error の画面確認 |
| B2       | 追加導線   | dialog open / cancel / confirm / success        |
| B3       | キーボード | Tab、Enter、Escape、focus return                |
| B4       | 証跡管理   | screenshot と non-visual log の整理             |

## 実行タスク

- 手動ケース定義: desktop と mobile の主要シナリオを定義する
- 画面証跡定義: screenshot と non-visual log の両方を定義する
- A11y 操作確認: Tab 順、Enter 実行、Escape close、focus return を確認する
- 発見課題整理: blocking / non-blocking で分類する

## 参照資料

### 依存Phase

| 資料名                 | パス                                      | 用途                |
| ---------------------- | ----------------------------------------- | ------------------- |
| 依存Phase 1 仕様       | `phase-1-requirements.md`                 | 要件確認            |
| 依存Phase 2 仕様       | `phase-2-design.md`                       | UI 設計確認         |
| 依存Phase 5 仕様       | `phase-5-implementation.md`               | 実装境界確認        |
| 依存Phase 6 仕様       | `phase-6-test-expansion.md`               | edge case 確認      |
| 依存Phase 7 仕様       | `phase-7-coverage-check.md`               | gate 条件確認       |
| 依存Phase 8 仕様       | `phase-8-refactoring.md`                  | 分割後の確認観点    |
| 依存Phase 9 仕様       | `phase-9-quality-assurance.md`            | 品質監査確認        |
| 依存Phase 10 仕様      | `phase-10-final-review.md`                | Go 判定確認         |
| 依存Phase 6 成果物     | `outputs/phase-6/screenshot-matrix.md`    | screenshot 対象確認 |
| 依存Phase 10 成果物    | `outputs/phase-10/final-review-result.md` | 実施前条件確認      |
| Go/No-Goチェックリスト | `outputs/phase-10/go-no-go-checklist.md`  | Phase 10 成果物     |
| 依存関係レビュー       | `outputs/phase-10/dependency-review.md`   | Phase 10 成果物     |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                            | 用途                             |
| -------------------- | ------------------------------------------------------------------------------- | -------------------------------- |
| UI設計原則           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  | focus、文言、ライブリージョン    |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | empty/loading/error の見え方     |
| UI機能仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | SearchFilterList / CardGrid 整合 |
| UIデザインシステム   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`      | light / dark、状態色、余白       |
| A11yテスト           | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`    | keyboard / role / aria 確認      |

## 実行手順

1. mixed state、imported empty、available empty、query no-result、error、success の各画面を表示し、TC ごとに `screenshot-plan.json` へ登録する。
2. available row の `追加する` から dialog を開き、cancel、confirm、success の各経路を確認する。
3. keyboard だけで search input、row button、dialog、success 後の imported row へ到達できることを確認する。
4. light / dark、desktop / mobile、dialog open / success / error の必須状態 `[A][B]` をスクリーンショットで取得する。
5. `manual-test-result.md` と `screenshot-coverage.md` に TC-ID、証跡ファイル、非視覚ログ、N/A理由を記録する。
6. `validate-phase11-screenshot-coverage.js` で TC と証跡の紐付けを検証し、blocking issue を `discovered-issues.md` へ分類する。

## テストケース

| TC-ID    | 種別   | シナリオ                                               | 期待結果                                              | 主証跡                                                             |
| -------- | ------ | ------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------ |
| TC-11-01 | 機能   | imported / available mixed state を表示する            | 2セクションが同時表示され、件数が一致する             | `outputs/phase-11/screenshots/TC-11-01-mixed-state-light.png`      |
| TC-11-02 | 機能   | imported empty / available populated を表示する        | imported 空状態と available 一覧が同時表示される      | `outputs/phase-11/screenshots/TC-11-02-imported-empty-light.png`   |
| TC-11-03 | 機能   | query no-result を表示する                             | 両セクションで結果0件が伝わり、入力値が保持される     | `outputs/phase-11/screenshots/TC-11-03-no-result-light.png`        |
| TC-11-04 | 異常系 | fetch failure を表示する                               | 一覧は残り、`role="alert"` の再試行導線が出る         | `outputs/phase-11/screenshots/TC-11-04-fetch-error-light.png`      |
| TC-11-05 | 機能   | available row から dialog を開く                       | dialog title、description、confirm / cancel が見える  | `outputs/phase-11/screenshots/TC-11-05-dialog-open-light.png`      |
| TC-11-06 | 機能   | dialog confirm で import 成功させる                    | imported 側へ移動し、`role="status"` で成功通知される | `outputs/phase-11/screenshots/TC-11-06-import-success-light.png`   |
| TC-11-07 | A11y   | keyboard のみで open / cancel / confirm / close を行う | Tab / Enter / Escape と focus return が成立する       | `outputs/phase-11/screenshots/TC-11-07-keyboard-dialog-light.png`  |
| TC-11-08 | A11y   | dark mode で mixed state と dialog を確認する          | 配色コントラストと focus visible が維持される         | `outputs/phase-11/screenshots/TC-11-08-mixed-state-dark.png`       |
| TC-11-09 | 異常系 | `description` 欠損を含む available item を表示する     | 一覧表示と検索が継続し、空文字扱いでクラッシュしない  | `outputs/phase-11/screenshots/TC-11-09-nullish-metadata-light.png` |

## 画面カバレッジマトリクス

| TC-ID    | コンポーネント / 状態                                                            | 優先度 | 画面証跡                                                           | 非視覚証跡                                             | N/A理由 |
| -------- | -------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------ | ------------------------------------------------------ | ------- |
| TC-11-01 | SkillManagementPanel / mixed state / light / desktop                             | [A]    | `outputs/phase-11/screenshots/TC-11-01-mixed-state-light.png`      | `outputs/phase-11/manual-test-result.md` の `TC-11-01` | -       |
| TC-11-02 | SkillManagementPanel / imported empty / light / desktop                          | [B]    | `outputs/phase-11/screenshots/TC-11-02-imported-empty-light.png`   | `outputs/phase-11/manual-test-result.md` の `TC-11-02` | -       |
| TC-11-03 | SkillManagementPanel / no-result / light / desktop                               | [A]    | `outputs/phase-11/screenshots/TC-11-03-no-result-light.png`        | `outputs/phase-11/manual-test-result.md` の `TC-11-03` | -       |
| TC-11-04 | SkillManagementPanel / error alert / light / desktop                             | [B]    | `outputs/phase-11/screenshots/TC-11-04-fetch-error-light.png`      | `outputs/phase-11/manual-test-result.md` の `TC-11-04` | -       |
| TC-11-05 | SkillImportDialog / open / light / desktop                                       | [A]    | `outputs/phase-11/screenshots/TC-11-05-dialog-open-light.png`      | `outputs/phase-11/manual-test-result.md` の `TC-11-05` | -       |
| TC-11-06 | SkillManagementPanel / success / light / desktop                                 | [A]    | `outputs/phase-11/screenshots/TC-11-06-import-success-light.png`   | `outputs/phase-11/manual-test-result.md` の `TC-11-06` | -       |
| TC-11-07 | SkillImportDialog / keyboard interaction / light / desktop                       | [B]    | `outputs/phase-11/screenshots/TC-11-07-keyboard-dialog-light.png`  | `outputs/phase-11/manual-test-result.md` の `TC-11-07` | -       |
| TC-11-08 | SkillManagementPanel + SkillImportDialog / mixed state + dialog / dark / desktop | [A]    | `outputs/phase-11/screenshots/TC-11-08-mixed-state-dark.png`       | `outputs/phase-11/manual-test-result.md` の `TC-11-08` | -       |
| TC-11-09 | SkillManagementPanel / nullish metadata / light / desktop                        | [B]    | `outputs/phase-11/screenshots/TC-11-09-nullish-metadata-light.png` | `outputs/phase-11/manual-test-result.md` の `TC-11-09` | -       |

## 統合テスト連携

- Phase 11 の TC ID は Phase 6 screenshot matrix と一致させる。
- non-visual log は dialog title、alert 文言、status 文言、focus target を記録する。
- blocking issue は Phase 10 の差戻し先へ戻す。

## 多角的チェック観点

| 観点               | 本Phaseで確認する内容                                                                              | 仕様参照先                                                                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | UI検証で新規IPC/Preload/API追加を要求しないことを確認する                                          | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`, `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                      |
| UI/UX              | 2セクション、状態表示、文言、フォーカス、ライブリージョン、light / dark を手動確認する             | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`      |
| アーキテクチャ     | `SkillManagementPanel` と `SkillImportDialog` の責務境界が画面遷移で崩れていないか確認する         | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                  |
| API/IPC            | `skill:list` / `skill:getImported` / `skill:import` の既存契約再利用だけで挙動が成立するか確認する | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                  |
| エラーハンドリング | error alert、retry、stale error クリア、擬似失敗防止を手動確認する                                 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                      |
| テスタビリティ     | TC-ID、screenshot、non-visual log、coverage validator の対応を維持する                             | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`, `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md` |

### Electronデスクトップアプリ観点

| 層       | 本Phaseで確認する内容                                                           | 仕様参照先                                                                                                                                                      |
| -------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer | list view / dialog / live region / focus contract を画面で検証する              | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                         |
| Main     | 新規サービス追加なしの前提で Renderer / Store 観点へ閉じる                      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| IPC通信  | 既存 `skill:*` channel の戻り値契約どおりに UI が変化するか確認する             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                            |
| Preload  | 既存公開APIだけで画面検証できることを確認する                                   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                    |
| Store    | `agentSlice` 個別selector と idempotent import 契約が画面に反映されるか確認する | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    |

## 成果物

| 成果物                  | パス                                      | 説明                    |
| ----------------------- | ----------------------------------------- | ----------------------- |
| 手動テスト計画          | `outputs/phase-11/manual-test-plan.md`    | TC 一覧                 |
| 撮影計画                | `outputs/phase-11/screenshot-plan.json`   | 必須状態と撮影順        |
| 手動テスト結果          | `outputs/phase-11/manual-test-result.md`  | 実施結果                |
| 画面カバレッジ          | `outputs/phase-11/screenshot-coverage.md` | TC と証跡の対応表       |
| 発見課題                | `outputs/phase-11/discovered-issues.md`   | blocking / non-blocking |
| screenshot ディレクトリ | `outputs/phase-11/screenshots/`           | TC ごとの画面証跡       |

## 完了条件

- [x] mixed state、empty、no-result、error、success の TC が定義されている
- [x] dialog、keyboard、focus return の TC が定義されている
- [x] `phase-11-manual-test.md` に `## テストケース` と `## 画面カバレッジマトリクス` がある
- [x] screenshot と non-visual log の保存先が定義されている
- [x] nullish metadata の手動確認 TC が定義されている
- [x] `validate-phase11-screenshot-coverage.js` を通す前提が定義されている
- [x] 発見課題の分類方法が定義されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. TC 定義
2. screenshot 対象定義
3. keyboard / focus 定義
4. issue 分類定義
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブルの全ファイルを出力
- [x] 完了条件を全件確認

## 次のPhase

Phase 12: ドキュメント更新
