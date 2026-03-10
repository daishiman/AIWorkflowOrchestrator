# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 13                              |
| Phase名    | PR作成                          |
| カテゴリ   | fix                             |
| ステータス | pending                         |
| 前提Phase  | Phase 12                        |
| 後続Phase  | なし                            |

## 目的

全 Phase の成果物を最終確認し、ユーザー明示指示がある場合のみ PR 準備を行う。

## 実行タスク

- タスク1: 全 Phase の成果物と差分を最終確認する
- タスク2: PR に必要な情報を整理する
- タスク3: ユーザー指示がある場合のみ PR 作成手順を準備する

### タスク1: 成果物チェックリスト

**目的**: 全 Phase の成果物が揃っていることを確認する

| Phase | 成果物                                                   | 確認 |
| ----- | -------------------------------------------------------- | ---- |
| 1     | 要件定義書                                               | [ ]  |
| 2     | 設計書                                                   | [ ]  |
| 3     | 設計レビュー結果                                         | [ ]  |
| 4     | テストコード                                             | [ ]  |
| 5     | 実装コード                                               | [ ]  |
| 6     | 拡充テストコード                                         | [ ]  |
| 7     | カバレッジレポート                                       | [ ]  |
| 8     | リファクタリング結果                                     | [ ]  |
| 9     | 品質検証結果                                             | [ ]  |
| 10    | 最終レビュー結果                                         | [ ]  |
| 11    | 手動テスト結果                                           | [ ]  |
| 12    | ドキュメント（実装ガイド・仕様書更新・未タスクレポート） | [ ]  |

### タスク2: 変更ファイルの最終確認

**目的**: 変更されたファイルを一覧化し、意図しない変更がないことを確認する

**手順**:

1. `git diff --stat main` で変更ファイル一覧を確認
2. 各変更ファイルが意図した変更であることを確認
3. 不要なファイル（デバッグ用ログ等）が含まれていないことを確認

**期待される変更ファイル**:

| ファイル                                                             | 変更内容                    |
| -------------------------------------------------------------------- | --------------------------- |
| `apps/desktop/src/preload/index.ts`                                  | safeInvoke タイムアウト追加 |
| テストファイル                                                       | タイムアウトテスト追加      |
| `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/` | 仕様書一式                  |
| 仕様書（該当する場合）                                               | システム仕様更新            |

### タスク3: PR 準備

**目的**: PR の作成準備を行う

**PR 情報**:

- **ブランチ名**: `fix/safeinvoke-timeout`
- **タイトル**: `fix(preload): safeInvoke に timeout と timer cleanup を追加`
- **ベースブランチ**: `main`

**PR 本文テンプレート**:

```markdown
## Summary

- safeInvoke に timeout + timer cleanup 付きの IPC 保護（5000ms）を追加
- IPC 呼び出しがハングした場合に Promise が永遠に pending になる問題を解消
- タイムアウトエラーメッセージに channel 名を含めてデバッグ性を向上

## Test Plan

- [ ] タイムアウト発動テスト（T1: IPC 無応答時に 5000ms で reject）
- [ ] エラーメッセージ検証（T2: channel 名が含まれる）
- [ ] 正常応答テスト（T4: タイムアウト内の応答は正常 resolve）
- [ ] チャンネル拒否テスト（T6: 既存動作維持）
- [ ] 既存テスト全 PASS（AC-6）
- [ ] TypeScript 型チェック PASS
- [ ] ESLint PASS
```

### タスク4: コミット前チェック

**目的**: コミット前チェックリストを実行する

**チェックリスト**（07-git-and-tooling.md 準拠）:

- [ ] `pnpm lint` が通ること
- [ ] `pnpm typecheck` が通ること
- [ ] 関連テストが全て PASS すること
- [ ] `--no-verify` を使っていないこと

### タスク5: artifacts.json 最終更新

**目的**: 全 Phase のステータスを更新する

**手順**:

1. `artifacts.json` の全 Phase を `completed` に更新
2. 完了日時を記録

## 参照資料

| 参照資料                 | パス                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| Phase 2 設計             | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-2-design.md`            |
| Phase 5 実装             | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-5-implementation.md`    |
| Phase 6 テスト拡充       | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-6-test-expansion.md`    |
| Phase 7 カバレッジ確認   | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-7-coverage-check.md`    |
| Phase 8 リファクタリング | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-8-refactoring.md`       |
| Phase 9 品質保証         | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-9-quality-assurance.md` |
| Phase 10 最終レビュー    | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-10-final-review.md`     |
| Phase 11 手動テスト      | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-11-manual-test.md`      |
| Phase 12 ドキュメント    | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-12-documentation.md`    |
| PR 作成ルール            | `.claude/rules/07-git-and-tooling.md#PR作成ルール`                                               |
| コミット前チェックリスト | `.claude/rules/07-git-and-tooling.md#コミット前チェックリスト`                                   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                          | 内容               |
| ------------------ | ----------------------------------------------------------------------------- | ------------------ |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`          | 完了タスク記録     |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | PR作成ガイドライン |

## 統合テスト連携

- 全テスト PASS を最終確認してから、ユーザー明示指示がある場合のみコミット / PR 作成

## 成果物

| 成果物                 | パス                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------- |
| artifacts.json（最終） | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/artifacts.json` |
| PR                     | GitHub PR URL（ユーザー指示時のみ作成後記入）                                      |

## 完了条件

- [ ] 全 Phase の成果物が揃っている
- [ ] 変更ファイルの最終確認が完了
- [ ] コミット前チェックリスト全項目 PASS
- [ ] artifacts.json を最終更新
- [ ] ユーザー指示がある場合のみ PR 準備完了（ブランチ名・タイトル・本文）
- [ ] 本Phase内の全タスクを100%実行完了

## タスク完了

TASK-FIX-SAFEINVOKE-TIMEOUT-001 の全 Phase が完了。コミット / PR はユーザー指示時のみ実施する。
