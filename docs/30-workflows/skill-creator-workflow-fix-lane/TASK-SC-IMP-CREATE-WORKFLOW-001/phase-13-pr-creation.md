# Phase 13: PR作成

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 13                              |
| Phase名    | PR作成                          |
| 対象機能   | TASK-SC-IMP-CREATE-WORKFLOW-001 |
| 前提Phase  | Phase 12: ドキュメント更新      |
| 次Phase    | -                               |
| ステータス | blocked（ユーザー承認待ち）     |
| 作成日     | 2026-04-14                      |

## 目的

ユーザー承認がある場合のみchange summaryとlocal checkをまとめ、
PRを作成する。ユーザー指示があるまで commit / push / PR を実行しない。

## 実行タスク

### Task 1: 変更要約準備

**変更ファイル一覧**:

| ファイル                                                                     | 変更内容                                             |
| ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | `runCreateWorkflow` 実装・`createSkill` switch文修正 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | create モードの新規テスト追加                        |

**修正内容サマリ**:

- `runCreateWorkflow` の戻り型を `void` から `StructurePlanJson | null` に変更する
- `create` モードで `resourceLoader.loadAgent` を呼び出し、agentファイルからレシピを読み込む
- `loadAgent` 失敗時は例外をキャッチして `null` を返すフォールバック機構を実装する
- `void options` コメントを削除し、`options.description` を構造計画JSON生成に使用する
- `createSkill()` の `case "create"` で `const structurePlan` を local variable として受け取り、hidden property を使わずタスクAのtmp JSON機構へ明示引数で渡す

**validator結果・テスト結果**:

- lint: `pnpm --filter @repo/desktop lint` → 0エラー（Phase 9で確認済み）
- typecheck: `pnpm --filter @repo/desktop typecheck` → 0エラー（Phase 9で確認済み）
- test: `pnpm --filter @repo/desktop test` → 全パス（Phase 9で確認済み）

**残リスク**:

- `StructurePlanJson` 型のインライン定義 vs `@repo/shared/types` 移行は未決定（Phase 8で判断記録）
- タスクAとのバンドルPR検討が必要（下記参照）

### Task 2: タスクAとのバンドルPR検討

**バンドルPR推奨の理由**:

- `TASK-SC-FIX-GENERATE-SKILL-MD-001`（タスクA）と本タスクは同一ファイル（`SkillCreatorService.ts`）を変更する
- 本タスクの `runCreateWorkflow` はタスクAのtmp JSON機構に接続するため、単独では動作確認が困難
- 同一PRでレビューすることでコンテキストが共有され、レビュー効率が向上する

**バンドルPR手順（ユーザー承認後）**:

1. タスクAのブランチと本タスクのブランチをマージしたバンドルブランチを作成する
2. バンドルブランチから `main` へのPRを作成する
3. PR説明にタスクAとタスクBの変更内容を両方記載する

**個別PR手順（ユーザー判断による）**:

1. 本タスクのブランチから `main` へのPRを作成する
2. PR説明にタスクAへの依存関係を明記する
3. タスクAのPRをfirst mergeするよう注記する

### Task 3: PR実行条件の確認

- ユーザー承認がない限り commit / push / PR を実行しない
- タスクA（TASK-SC-FIX-GENERATE-SKILL-MD-001）の完了状況を確認してからPR方針を決定する
- バンドルPRにするか個別PRにするかをユーザーと確認する
- 現時点ではユーザー指示により blocked 扱いとする

## 参照資料

| 資料名               | パス                                      | 説明           |
| -------------------- | ----------------------------------------- | -------------- |
| 設計書               | `outputs/phase-2/design.md`               | 背景要約       |
| 実装計画             | `outputs/phase-5/implementation-plan.md`  | 修正内容       |
| テスト拡充記録       | `outputs/phase-6/extended-test-record.md` | テスト差分     |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`      | coverage要約   |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`   | 整理内容       |
| 品質保証レポート     | `outputs/phase-9/quality-report.md`       | 品質ゲート     |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md` | 判定           |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`  | NON_VISUAL状態 |
| ドキュメント更新     | `phase-12-documentation.md`               | 直前成果物     |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md`  | 実行時に更新   |

## 成果物

| 成果物               | パス                                     | 説明         |
| -------------------- | ---------------------------------------- | ------------ |
| 変更サマリ           | `outputs/phase-13/change-summary.md`     | PR説明の素案 |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | 実行ログ要約 |

## 完了条件

- [ ] ユーザー承認の有無が明記されている
- [ ] blocked条件が明記されている
- [ ] commit / push / PRを未実行であることが記録されている
- [ ] タスクAとのバンドルPR検討が記録されている
- [ ] 承認後に必要な成果物が定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

- blocked: ユーザー承認待ち
- タスクAとのバンドルPR方針確認後に実行
