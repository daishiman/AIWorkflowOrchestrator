# Phase 5: 実装

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 5                                        |
| Phase名      | 実装                                     |
| 前提Phase    | Phase 4                                  |
| 後続Phase    | Phase 6                                  |
| ステータス   | completed                                |
| 作成日       | 2026-03-06                               |
| 機能名       | task-056e-integration-gate-and-spec-sync |
| 担当SubAgent | SubAgent-E2 / E3                         |

## 目的

統合レビューゲート本体、仕様同期対象一覧、下流引き渡し計画を実体ドキュメントとして作成する。

## 実行タスク

- 実装計画作成: 実行順序、入力、担当、検証コマンドを明文化する。
- レビューゲート作成: PASS / MINOR / MAJOR 判定表と証跡ソースを文書化する。
- 仕様同期対象一覧作成: aiworkflow 反映対象と更新手順を文書化する。

## 参照資料

| 参照資料             | パス                                                                                                    | 内容                            |
| -------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 4テスト仕様    | `phase-4-test-creation.md`                                                                              | 実装の受け入れ条件              |
| C正本                | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md`                      | history / notification の確定値 |
| D正本                | `docs/30-workflows/completed-tasks/task-056d-viewtype-routing-nav/index.md`                             | navigation の確定値             |
| A正本                | `docs/30-workflows/completed-tasks/task-056a-a-store-slice-baseline/index.md`                           | state基準                       |
| B正本                | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-056a-b-ipc-contract-security.md` | IPC / security 基準             |
| テスト仕様           | `outputs/phase-4/test-specification.md`                                                                 | Phase 4 成果物                  |
| テストケース         | `outputs/phase-4/test-cases.md`                                                                         | Phase 4 成果物                  |
| 統合テストマトリクス | `outputs/phase-4/integration-test-matrix.md`                                                            | Phase 4 成果物                  |

## システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                                        | 内容                                 |
| ------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| タスク台帳          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 台帳反映先                           |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | safeInvoke / safeOn と型契約の再利用 |
| 状態管理パターン    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | state同期対象の判断                  |
| IPC仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | IPC同期対象の判断                    |
| Preloadセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | 公開API境界の判断                    |
| IPCセキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | security同期対象の判断               |
| エラーハンドリング  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | FAIL理由と戻り値形式の判断           |
| ナビゲーションUI    | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | navigation同期対象の判断             |

## 実行手順

### ステップ1: 実装計画の固定

入力、出力、レビュー担当、検証コマンドを `implementation-plan.md` にまとめる。

### ステップ2: レビューゲート本文の作成

統合判定軸、証跡ソース、戻り先Phase、ブロッカー解除条件を `review-gate.md` に記載する。

### ステップ3: 仕様同期対象一覧の作成

更新対象、更新不要、条件付き更新を `spec-sync-targets.md` に一覧化する。

## 統合テスト連携

| 観点     | 内容                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------ |
| 上流整合 | A/B/C/D の確定値が `review-gate.md` に引用されているか確認する                                         |
| 下流整合 | `TASK-UI-02` / `TASK-UI-03` / `TASK-UI-04A` の引き渡し条件が `implementation-plan.md` にあるか確認する |
| 台帳整合 | Step 1-B / Step 1-C / Step 2 の更新先が `spec-sync-targets.md` にあるか確認する                        |

## 成果物

| 成果物           | パス                                     | 内容               |
| ---------------- | ---------------------------------------- | ------------------ |
| 実装計画         | `outputs/phase-5/implementation-plan.md` | 実行順序と担当     |
| レビューゲート   | `outputs/phase-5/review-gate.md`         | 統合判定表         |
| 仕様同期対象一覧 | `outputs/phase-5/spec-sync-targets.md`   | aiworkflow更新対象 |

## 完了条件

- [x] 実装計画に入力、出力、担当、検証コマンドが記載されている
- [x] レビューゲートに PASS / MINOR / MAJOR の判定表がある
- [x] 仕様同期対象一覧に更新理由と更新区分がある
- [x] 下流タスクごとのブロッカー解除条件が `review-gate.md` にある
- [x] A/B/C/D の確定値を引用した箇所が追跡できる

## 次のPhase

Phase 6: テスト拡充

## 多角的チェック観点（AIが判断）

| 観点                         | 適用判断                                                      | 仕様参照先                                                                                           |
| ---------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| ドキュメント構造             | レビューゲート本文を構造化するため適用                        | `phase-4-test-creation.md`                                                                           |
| 状態管理                     | state 同期対象の引用根拠を固定するため適用                    | `aiworkflow-requirements: arch-state-management.md`                                                  |
| IPC / Preload / セキュリティ | ipc / security 同期対象と公開境界の引用根拠を固定するため適用 | `aiworkflow-requirements: api-ipc-system.md`, `security-api-electron.md`, `security-electron-ipc.md` |
| エラーハンドリング           | FAIL理由の引用根拠を固定するため適用                          | `aiworkflow-requirements: error-handling.md`                                                         |
| ナビゲーション               | navigation 同期対象の引用根拠を固定するため適用               | `aiworkflow-requirements: ui-ux-navigation.md`                                                       |

## サブタスク管理

Phase実行開始時に、TodoWriteツールまたは同等のタスク管理手段で以下のサブタスクを作成し、完了後ただちに `completed` へ更新する。

1. 実装計画の固定
2. レビューゲート本文の作成
3. 仕様同期対象一覧の作成
4. 上流 / 下流整合の確認
5. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 実装計画、レビューゲート、仕様同期対象一覧を成果物へ反映
- [x] 上流 / 下流整合の確認結果を成果物へ反映
- [x] `artifacts.json` の対象Phaseステータス更新内容を確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync \
  --phase 5
```
