# Phase 13: PR作成 - Slide Workspace UI 4領域実装

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| Phase    | 13                           |
| 機能名   | ut-slide-ui-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 作成日   | 2026-03-21                   |

## 目的

Phase 1-12 の成果物を最終確認し、ユーザー承認が得られた場合にのみ push / PR 作成へ進む。承認前は Phase 13 を `blocked` として維持する。

## 実行タスク

| #   | タスク名         | 目的                                            |
| --- | ---------------- | ----------------------------------------------- |
| 1   | 承認ゲート確認   | push / PR 作成の可否をユーザー承認で確定する    |
| 2   | PR 草案準備      | Summary / Test Plan / 主要変更点を draft 化する |
| 3   | 承認後の PR 作成 | 承認取得後のみ push / `gh pr create` を実行する |
| 4   | CI / 報告        | 承認取得後のみ checks を確認し結果を報告する    |

- PR作成: 承認ゲートを先に確認し、承認前は draft まで、承認後のみ push / PR / CI へ進む。

## 参照資料

| 資料                                                                       | 用途                                  |
| -------------------------------------------------------------------------- | ------------------------------------- |
| `phase-2-design.md`                                                        | 設計意図の再確認                      |
| `phase-5-implementation.md`                                                | 実装差分の再確認                      |
| `phase-6-test-expansion.md`                                                | テスト拡充結果の再確認                |
| `phase-7-coverage-check.md`                                                | カバレッジ基準の再確認                |
| `phase-8-refactoring.md`                                                   | リファクタリング結果の再確認          |
| `phase-9-quality-assurance.md`                                             | 品質結果の再確認                      |
| `phase-10-final-review.md`                                                 | 最終レビュー指摘の再確認              |
| `phase-11-manual-test.md`                                                  | 手動テスト証跡の再確認                |
| `phase-12-documentation.md`                                                | ドキュメント更新内容の再確認          |
| `artifacts.json`                                                           | 全 Phase の状態確認                   |
| `outputs/artifacts.json`                                                   | outputs 側の同期確認                  |
| `outputs/phase-12/documentation-changelog.md`                              | 変更ファイルと validator 結果の確認   |
| `outputs/phase-12/phase12-task-spec-compliance-check.md`                   | Phase 12 準拠確認                     |
| `.claude/skills/task-specification-creator/references/execute-workflow.md` | PR 作成はユーザー明示承認後のみの原則 |

## 実行手順

### Task 1: 承認ゲート確認

1. ユーザーから PR 作成の明示承認があるか確認する。
2. 承認がない場合:
   - Phase 13 ステータスは `blocked`
   - `git push`, `gh pr create`, `gh pr checks` は実行しない
   - Task 2 までで止める
3. 承認がある場合のみ Task 3 へ進む。

### Task 2: PR 草案準備

1. `outputs/phase-13/pr-summary-draft.md` を作成する。
2. 草案には以下を含める。
   - Summary: 4領域 UI、4状態 UI 語彙、Terminal Launcher 常時表示
   - Test Plan: unit / integration / manual / accessibility / coverage
   - Spec Sync: canonical 更新の有無、未タスクの有無
3. このタスクは承認前でも実行してよい。

### Task 3: 承認後の PR 作成

1. 承認取得後のみ `git status` で差分を確認する。
2. 必要な場合は push を行い、`gh pr create` で PR を作成する。
3. PR 本文には `outputs/phase-13/pr-summary-draft.md` を使う。

### Task 4: CI / 報告

1. 承認取得後のみ `gh pr checks` を確認する。
2. チェック結果、PR URL、残リスクをユーザーへ報告する。
3. 承認未取得の場合は「Phase 13 blocked」とだけ記録し、完了扱いにしない。

## 統合テスト連携

- Phase 13 では新規テスト実行は不要
- Phase 9 と Phase 11 の結果を PR 草案へ要約する
- 承認未取得時は CI 実行前提の記述を残さない

## 多角的チェック観点

| 観点           | チェック内容                                        |
| -------------- | --------------------------------------------------- |
| approval gate  | user approval なしで push / PR が書かれていない     |
| artifacts 整合 | root / outputs 両方の artifacts が一致している      |
| PR 草案品質    | Summary / Test Plan / Spec Sync の3要素が揃っている |
| blocked 運用   | 承認未取得時に completed 扱いへ進めない             |

## 成果物

| ファイル                               | 説明        |
| -------------------------------------- | ----------- |
| `outputs/phase-13/pr-summary-draft.md` | PR 本文草案 |

## 完了条件

- [ ] user approval 未取得時は Phase 13 を `blocked` のまま維持している
- [ ] `outputs/phase-13/pr-summary-draft.md` が作成されている
- [ ] user approval 取得後のみ push / PR / CI 確認を実行している
- [ ] 承認後に実行した場合は結果をユーザーへ報告している

## サブタスク管理

- [ ] Task 1: 承認ゲート確認
- [ ] Task 2: PR 草案準備
- [ ] Task 3: 承認後の PR 作成
- [ ] Task 4: CI / 報告

## タスク 100% 実行確認

- [ ] 承認前に禁止操作を実行していない
- [ ] `pr-summary-draft.md` が存在する
- [ ] 承認取得後にのみ Task 3-4 を進めている

## 次の Phase

なし（user approval 待ち、またはタスク完了）
