# Phase 9: 品質保証

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 9                                        |
| Phase名      | 品質保証                                 |
| 前提Phase    | Phase 5                                  |
| 後続Phase    | Phase 10                                 |
| ステータス   | completed                                |
| 作成日       | 2026-03-06                               |
| 機能名       | task-056e-integration-gate-and-spec-sync |
| 担当SubAgent | SubAgent-E4                              |

## 目的

統合ゲート仕様、仕様同期台帳、下流引き渡し条件の品質を監査し、未解決の品質リスクを閉じ込める。

## 実行タスク

- 品質監査: ドキュメント構造、リンク、更新区分、判定理由を監査する。
- 同期準備確認: aiworkflow 反映に必要な情報が不足なく揃っているか確認する。
- リスク記録: 品質上の残課題を一覧化し、最終レビューへ渡す。

## 参照資料

| 参照資料          | パス                                            | 内容           |
| ----------------- | ----------------------------------------------- | -------------- |
| Phase 5実装       | `phase-5-implementation.md`                     | 監査対象       |
| Phase 8リファクタ | `phase-8-refactoring.md`                        | 改善結果       |
| レビューゲート    | `outputs/phase-5/review-gate.md`                | 品質監査対象   |
| 仕様同期対象一覧  | `outputs/phase-5/spec-sync-targets.md`          | 品質監査対象   |
| 実装計画          | `outputs/phase-5/implementation-plan.md`        | Phase 5 成果物 |
| リファクタ計画    | `outputs/phase-8/refactoring-plan.md`           | Phase 8 成果物 |
| 一貫性チェック    | `outputs/phase-8/contract-consistency-check.md` | Phase 8 成果物 |

## システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                         | 内容                     |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| 品質要件            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 文書品質基準             |
| 品質基準            | `.claude/skills/task-specification-creator/references/quality-standards.md`  | 曖昧表現排除と自己完結性 |
| IPC仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`        | 同期区分の品質観点       |
| Preloadセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | 公開境界品質観点         |
| IPCセキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | security同期の品質観点   |
| エラーハンドリング  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | FAIL記録品質観点         |
| ナビゲーションUI    | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | navigation同期品質観点   |
| タスク台帳          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | 台帳同期の品質観点       |

## 実行手順

### ステップ1: 文書品質監査

リンク切れ、区分漏れ、判定理由欠落、曖昧表現を確認する。

### ステップ2: 同期準備確認

Step 1-B、Step 1-C、Step 2 の更新材料が揃っているか確認する。

### ステップ3: 品質リスクの記録

解消前の品質リスクを一覧化し、最終レビューへ渡す。

## 統合テスト連携

| 観点           | 内容                                                   |
| -------------- | ------------------------------------------------------ |
| 文書構造       | 主要成果物の必須項目を確認する                         |
| 同期区分       | 3区分の更新対象に根拠があるか確認する                  |
| リスク引き渡し | 残課題が最終レビューへ渡る形で記録されているか確認する |

## 成果物

| 成果物               | パス                                     | 内容                    |
| -------------------- | ---------------------------------------- | ----------------------- |
| 品質チェックリスト   | `outputs/phase-9/quality-checklist.md`   | 品質監査項目と結果      |
| 仕様同期準備レポート | `outputs/phase-9/spec-sync-readiness.md` | aiworkflow 更新準備状況 |

## 完了条件

- [x] リンク切れの有無が確認されている
- [x] 更新区分ごとの根拠が確認されている
- [x] Step 1-B / Step 1-C / Step 2 の準備状況が確認されている
- [x] `quality-standards.md` に基づく曖昧表現の有無が確認されている
- [x] 品質リスクが一覧化されている
- [x] 最終レビューへ渡す材料が整理されている

## 次のPhase

Phase 10: 最終レビューゲート

## 多角的チェック観点（AIが判断）

| 観点                         | 適用判断                                            | 仕様参照先                                                                                                                      |
| ---------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 文書品質                     | リンク、区分、根拠、曖昧表現の欠落を防ぐため適用    | `aiworkflow-requirements: quality-requirements.md`, `.claude/skills/task-specification-creator/references/quality-standards.md` |
| IPC / Preload / セキュリティ | security 同期準備の妥当性を確認するため適用         | `aiworkflow-requirements: api-ipc-system.md`, `security-api-electron.md`, `security-electron-ipc.md`                            |
| エラーハンドリング           | FAIL記録品質の妥当性を確認するため適用              | `aiworkflow-requirements: error-handling.md`                                                                                    |
| ナビゲーション               | navigation 同期準備の妥当性を確認するため適用       | `aiworkflow-requirements: ui-ux-navigation.md`                                                                                  |
| 台帳整合                     | spec_created 反映材料が揃っているか確認するため適用 | `aiworkflow-requirements: task-workflow.md`                                                                                     |

## サブタスク管理

Phase実行開始時に、TodoWriteツールまたは同等のタスク管理手段で以下のサブタスクを作成し、完了後ただちに `completed` へ更新する。

1. 文書品質監査
2. 同期準備確認
3. 品質リスク記録
4. 最終レビュー入力整理
5. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 品質チェックリストと同期準備レポートを成果物へ反映
- [x] 品質リスクを最終レビュー入力へ反映
- [x] `artifacts.json` の対象Phaseステータス更新内容を確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync \
  --phase 9
```
