# Phase 13: PR作成

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 13                                |
| Phase名    | PR作成                            |
| 対象機能   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| 前提Phase  | Phase 12: ドキュメント更新        |
| 次Phase    | -                                 |
| ステータス | pending                           |
| 作成日     | 2026-04-14                        |

## 目的

ユーザー承認がある場合のみchange summaryとlocal checkをまとめ、
PRを作成する。ユーザー指示があるまでcommit / push / PRを実行しない。

## 実行タスク

### Task 1: 変更サマリ準備

- 変更ファイル一覧と修正内容を以下の通りまとめる

| ファイル                                                                     | 変更種別 | 変更内容                                                                      |
| ---------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 修正     | `generateSkillMd`メソッドで`--plan`/`--output`引数を渡すよう変更（行152-165） |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 修正     | 上記変更に対応するテストを追加・更新                                          |

- validator結果・テスト結果・残リスクを整理する
- AC-1〜AC-5のpassエビデンスをまとめる

### Task 2: PR実行条件の確認

- ユーザー承認がない限りcommit / push / PRを実行しない
- 現時点ではユーザー指示を待つ（blocked扱い）

### Task 3: ローカルチェック（承認後に実行）

以下のコマンドを承認後に実行し、全PASSを確認してからPRを作成する。

```bash
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test
```

### Task 4: PR作成（承認後に実行）

承認後、以下の内容でPRを作成する。

**PRタイトル案**:

```
fix(skill): SkillCreatorService で generate_skill_md.js に --plan/--output 引数を渡すよう修正
```

**PR本文案**:

```
## 概要

SkillCreatorService.ts の generateSkillMd メソッドが generate_skill_md.js を
`--path` のみで呼び出していたため、スクリプトが常に失敗していた問題を修正する。

## 変更内容

- description から最小 plan JSON を組み立て tmp ファイルに書き込む
- `--plan <tmpPath> --output <skillDir>/SKILL.md` でスクリプトを呼び出す
- finally 節で tmp ファイルを必ず削除する

## 受入条件

- AC-1: generate_skill_md.js が終了コード 0 で完了する
- AC-2: 生成 SKILL.md に `## Task一覧` セクションが含まれる
- AC-3: 生成 SKILL.md に YAML フロントマターが含まれる
- AC-4: スクリプト不在時は ensureSkillMdExists フォールバックが機能する
- AC-5: tmp ファイルが finally で削除される
```

## 参照資料

| 資料名               | パス                                       | 説明         |
| -------------------- | ------------------------------------------ | ------------ |
| 設計書               | `outputs/phase-2/design-document.md`       | 背景要約     |
| 実装記録             | `outputs/phase-5/implementation-record.md` | 修正内容     |
| テスト拡充記録       | `outputs/phase-6/extended-test-record.md`  | テスト差分   |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`       | coverage要約 |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`    | 整理内容     |
| 品質保証レポート     | `outputs/phase-9/quality-report.md`        | 品質ゲート   |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`  | 判定         |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`   | N/A evidence |
| ドキュメント更新     | `phase-12-documentation.md`                | 直前成果物   |

## 成果物

| 成果物               | パス                                     | 説明         |
| -------------------- | ---------------------------------------- | ------------ |
| 変更サマリ           | `outputs/phase-13/change-summary.md`     | PR説明の素案 |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | 実行ログ要約 |

## 完了条件

- [ ] ユーザー承認の有無が明記されている
- [ ] blocked条件が明記されている
- [ ] commit / push / PRを未実行であることが記録されている
- [ ] 承認後に必要な成果物（変更サマリ・ローカルチェック結果）が定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

- blocked: ユーザー承認待ち
