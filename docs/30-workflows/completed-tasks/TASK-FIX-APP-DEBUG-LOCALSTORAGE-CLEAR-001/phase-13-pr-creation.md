# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 13                                        |
| Phase名    | PR作成                                    |
| カテゴリ   | fix                                       |
| ステータス | completed                                 |
| 前提Phase  | Phase 12                                  |
| 後続Phase  | なし                                      |

## 目的

成果物の最終確認を行い、ユーザーの明示的な許可後にのみコミット・PR 作成・CI 確認へ進める準備を整える。

## 実行タスク

- タスク1: 全 Phase の成果物と受入基準の最終状態を確認する
- タスク2: ローカル確認依頼と変更サマリー提示を行い、PR 作成可否を確認する
- タスク3: ユーザー許可後のみコミット・PR 作成・CI 確認を実施する
- タスク4: `artifacts.json` と `pr-info.md` を最終状態へ同期する

### タスク1: 成果物最終確認

**目的**: 全 Phase の成果物が揃っていることを確認する

**チェックリスト**:

| Phase    | 成果物                                                                   | 状態         |
| -------- | ------------------------------------------------------------------------ | ------------ |
| Phase 1  | 要件定義書                                                               | (実行時記入) |
| Phase 2  | 設計書                                                                   | (実行時記入) |
| Phase 3  | 設計レビュー報告書                                                       | (実行時記入) |
| Phase 4  | テストファイル                                                           | (実行時記入) |
| Phase 5  | 修正済み App.tsx                                                         | (実行時記入) |
| Phase 6  | カバレッジレポート                                                       | (実行時記入) |
| Phase 7  | カバレッジ確認結果                                                       | (実行時記入) |
| Phase 8  | リファクタリング報告書                                                   | (実行時記入) |
| Phase 9  | 品質検証結果                                                             | (実行時記入) |
| Phase 10 | 最終レビュー報告書                                                       | (実行時記入) |
| Phase 11 | 手動テスト結果                                                           | (実行時記入) |
| Phase 12 | 実装ガイド、spec-update-summary、changelog、未タスク検出、skill-feedback | (実行時記入) |

### タスク2: 受入基準の最終確認

**目的**: 全受入基準が満たされていることを最終確認する

| AC   | 基準                                            | 判定         |
| ---- | ----------------------------------------------- | ------------ |
| AC-1 | デバッグ用useEffectが完全に削除                 | (実行時記入) |
| AC-2 | localStorage.clear() が起動時に実行されない     | (実行時記入) |
| AC-3 | persist状態がアプリ再起動後も保持               | (実行時記入) |
| AC-4 | BROWSER_GET_LAST_WEB_PREFERENCES エラーが非発生 | (実行時記入) |
| AC-5 | E2Eテストが引き続き動作                         | (実行時記入) |
| AC-6 | 全既存テストがPASS                              | (実行時記入) |

### タスク3: PR 準備

**目的**: ユーザーの明示的な許可後にのみ、マージ準備としてコミットと PR を作成する

**手順**:

1. 変更内容の最終確認: `git diff --stat`
2. ブランチ名: `fix/remove-debug-localstorage-clear` またはタスクブランチを継続使用
3. **重要**: ユーザーから明示的に「コミットしてよい」「PRを作成してよい」と許可が出るまで、このタスクは未着手のまま維持する。勝手にコミット・PR を実行しない
4. コミットメッセージ:

   ```
   fix(renderer): remove debug useEffect that clears localStorage on startup

   Remove debug code (App.tsx L46-61) that was clearing localStorage
   on every app startup, destroying Zustand persist state and causing
   BROWSER_GET_LAST_WEB_PREFERENCES errors via forced page reload.

   Closes: TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001
   ```

5. PR 作成（07-git-and-tooling.md 準拠、ユーザー許可後のみ）:
   - タイトル: `fix(renderer): remove debug localStorage.clear() from App.tsx`
   - Summary: デバッグコード削除、persist 状態復旧、エラー解消
   - Test Plan: TC-1〜TC-5 全 PASS、手動テスト完了

### タスク4: artifacts.json 更新

**目的**: 全 Phase のステータスと PR 情報を最終状態に更新する

**手順**:

1. `artifacts.json` の全 Phase のステータスを `completed` に更新
2. `outputs/phase-13/pr-info.md` に PR URL・CI 結果・レビュー観点を記録

## 参照資料

| 参照資料         | パス                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| Phase 1 成果物   | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-1-requirements.md`      |
| Phase 2 成果物   | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-2-design.md`            |
| Phase 5 成果物   | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-5-implementation.md`    |
| Phase 6 成果物   | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-6-test-expansion.md`    |
| Phase 7 成果物   | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-7-coverage-check.md`    |
| Phase 8 成果物   | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-8-refactoring.md`       |
| Phase 9 成果物   | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-9-quality-assurance.md` |
| Phase 10 成果物  | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-10-final-review.md`     |
| Phase 11 成果物  | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-11-manual-test.md`      |
| Phase 12 成果物  | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-12-documentation.md`    |
| PR作成ルール     | `.claude/rules/07-git-and-tooling.md`                                                                      |
| 実行ワークフロー | `.claude/skills/task-specification-creator/references/execute-workflow.md`                                 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                       | 内容                                |
| ------------------------ | -------------------------------------------------------------------------- | ----------------------------------- |
| タスクワークフロールール | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md` | 品質ゲート・完了条件・PR 作成ルール |

## 成果物

| 成果物         | パス                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| PR情報         | `outputs/phase-13/pr-info.md`                                                                |
| artifacts.json | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/artifacts.json` |

## 完了条件

- [x] 全 Phase の成果物が揃っていること
- [x] 全受入基準が満たされていること
- [x] ユーザーへローカル確認依頼と変更サマリー提示が完了していること
- [x] ユーザーが許可した場合のみコミットが作成されていること
- [x] ユーザーが許可した場合のみ PR が作成準備完了していること
- [x] artifacts.json が更新されていること
- [x] pr-info.md が更新されていること
- [x] 本Phase内の全タスクを100%実行完了

## 次Phase

なし（ワークフロー完了）
