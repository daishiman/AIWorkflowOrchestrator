# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 7                                     |
| 機能名     | task-043b-ui-ux-import-list-design    |
| タスク名   | TASK-10A-E-B UI/UX インポート一覧設計 |
| 前提Phase  | Phase 6                               |
| 後続Phase  | Phase 8                               |
| 作成日     | 2026-03-06                            |
| ステータス | completed                             |
| 担当       | SubAgent-B                            |

## 目的

対象ファイルの coverage 目標、warning-free 条件、selector 安定性、A11y ケース網羅を品質ゲートとして確定する。

## 背景

本タスクは UI list view の表示差分が中心であり、単純な line coverage だけでは不足する。`isImporting`、dialog open、focus return、duplicate guard、no-result の分岐が branch coverage へ反映されるように管理する。

## Atent Team 編成

| SubAgent | 関心ごと       | 主担当内容                          |
| -------- | -------------- | ----------------------------------- |
| B1       | Coverage       | line / branch / function の目標設定 |
| B2       | Selector安定性 | P31対策と rerender 最小化チェック   |
| B3       | A11y品質       | jest-axe と manual の責務分離       |
| B4       | Gate定義       | fail 条件と通過条件の明文化         |

## 実行タスク

- 目標設定: touched file 単位の coverage 目標を定義する
- rerender 監査: 個別selector方針が維持される条件を定義する
- A11y 品質定義: dialog / status / alert の自動検証と manual 検証の境界を定義する
- Gate 定義: どの条件で Phase 8 へ進めるかを定義する

## 参照資料

### 親タスク・コード

| 資料名                       | パス                                       | 用途                   |
| ---------------------------- | ------------------------------------------ | ---------------------- |
| 親タスク仕様                 | `../task-043b-ui-ux-import-list-design.md` | 検証条件の確認         |
| 依存Phase 5 仕様             | `phase-5-implementation.md`                | 対象ファイル確認       |
| 依存Phase 5 成果物           | `outputs/phase-5/selector-action-map.md`   | selector / action 確認 |
| 依存Phase 6 仕様             | `phase-6-test-expansion.md`                | 拡張ケース確認         |
| 依存Phase 6 成果物           | `outputs/phase-6/regression-matrix.md`     | 回帰対象確認           |
| テスト拡充計画               | `outputs/phase-6/test-expansion-plan.md`   | Phase 6 成果物         |
| edge case 一覧               | `outputs/phase-6/edge-case-cases.md`       | Phase 6 成果物         |
| スクリーンショットマトリクス | `outputs/phase-6/screenshot-matrix.md`     | Phase 6 成果物         |

### システム仕様（aiworkflow-requirements）

| 資料名     | パス                                                                              | 用途                          |
| ---------- | --------------------------------------------------------------------------------- | ----------------------------- |
| 品質要件   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage と warning-free 条件 |
| テスト設計 | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | touched file と case の対応   |
| 状態管理   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | selector 安定性               |
| タスク運用 | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`        | gate 失敗時の差戻し条件       |

## 実行手順

1. `SkillManagementPanel.tsx`、`SkillImportDialog.tsx`、対応テストファイルを coverage 対象として固定する。
2. line / branch / function それぞれの最低値と推奨値を設定する。
3. selector 安定性は `useAvailableSkillsMetadata`、`useImportedSkills`、`useIsImportingSkill` の rerender 最小化で判定する。
4. gate fail 条件を `coverage 未達`、`a11y fail`、`warning が残る`、`selector 不安定` に固定する。

## 統合テスト連携

- `vitest`、`jest-axe`、selector 安定性テストを同一 gate で扱う。
- Phase 6 の regression matrix と coverage gap を突合する。
- Phase 11 manual test は Phase 7 で取り切れない視覚差分だけを担当する。

## 多角的チェック観点

| 観点               | 本Phaseで確認する内容                                                                                     | 仕様参照先                                                                                                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | カバレッジ向上のために危険なテスト専用経路を導入していないか確認する                                      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`, `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                      |
| UI/UX              | 2セクション、状態表示、フォーカス、ライブリージョン、レスポンシブ状態が coverage 対象に含まれるか確認する | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`      |
| アーキテクチャ     | `SkillManagementPanel` の責務境界と既存 view 分岐が coverage 対象から漏れていないか確認する               | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                  |
| API/IPC            | `skill:list` / `skill:getImported` / `skill:import` の既存契約で十分に検証できているか確認する            | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                  |
| エラーハンドリング | error alert、retry、stale error クリアが coverage 対象に含まれているか確認する                            | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                      |
| テスタビリティ     | TC-ID、selector、fixture、manual evidence の対応が coverage report と同期しているか確認する               | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`, `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md` |

### Electronデスクトップアプリ観点

| 層       | 本Phaseで確認する内容                                                                       | 仕様参照先                                                                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer | list view / dialog / live region / focus contract の coverage を確認する                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                         |
| Main     | 新規サービス追加なしの前提で Renderer / Store coverage に閉じる                             | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| IPC通信  | 既存 `skill:*` channel の戻り値契約が coverage 観点へ反映されているか確認する               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                            |
| Preload  | Preload 境界を増やさず既存公開Hookだけを使う                                                | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                    |
| Store    | `agentSlice` 個別selector と idempotent import 契約が coverage 対象に含まれているか確認する | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    |

## 成果物

| 成果物                    | パス                                              | 説明                      |
| ------------------------- | ------------------------------------------------- | ------------------------- |
| coverage 目標レポート     | `outputs/phase-7/coverage-target-report.md`       | touched file ごとの目標値 |
| coverage gate 条件        | `outputs/phase-7/coverage-gate-criteria.md`       | fail / pass 条件          |
| selector 安定性 checklist | `outputs/phase-7/selector-stability-checklist.md` | rerender 最小化の確認項目 |

## 完了条件

- [x] touched file ごとの coverage 目標が定義されている
- [x] selector 安定性の確認項目が定義されている
- [x] a11y fail と warning fail の gate 条件が定義されている
- [x] Phase 8 へ戻す条件が定義されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 対象ファイル確定
2. coverage 目標設定
3. selector checklist 作成
4. gate 条件定義
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブルの全ファイルを出力
- [x] 完了条件を全件確認

## 次のPhase

Phase 8: リファクタリング
