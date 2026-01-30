# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 13                               |
| Phase名    | PR作成                           |
| カテゴリ   | 完了                             |
| 前提Phase  | Phase 12                         |
| 後続Phase  | なし                             |
| ステータス | 未実施                           |
| 作成日     | 2026-01-30                       |
| 機能名     | TASK-3-2-F-skill-stream-test-env |
| タスクID   | TASK-3-2-F                       |
| Issue      | #559                             |

---

## 目的

テスト環境改善の全変更をコミットし、Pull Requestを作成する。CI/CD通過を確認し、マージ準備を完了する。

## 背景

Phase 1-12で実施したテスト環境改善（DOM環境切り替え、Clipboard APIモック実装、テスト有効化、ドキュメント更新）の全変更を、PRとしてmainブランチへのマージ準備を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
> **重要**: PR作成はユーザーの明示的な許可を得てから実行すること。

### タスク1: ローカル最終確認

**目的**: PR作成前にローカル環境での最終確認を行う。

**実行手順**:

1. 以下の確認を実行する

| #   | 確認項目          | コマンド                                                                                               | 期待結果   |
| --- | ----------------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| 1   | ビルド成功        | `pnpm --filter @repo/desktop build`                                                                    | エラーゼロ |
| 2   | 全テストPASS      | `pnpm --filter @repo/desktop vitest run`                                                               | 全件PASS   |
| 3   | 型チェックPASS    | `pnpm --filter @repo/desktop typecheck`                                                                | エラーゼロ |
| 4   | LintPASS          | `pnpm --filter @repo/desktop lint`                                                                     | エラーゼロ |
| 5   | describe.skip 0件 | `grep -r "describe.skip" apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay*` | 結果0件    |

2. 全ての確認がパスすることを検証する
3. 失敗がある場合は、該当Phaseに戻って修正する

**期待される成果物**:

- ローカル確認結果の記録

---

### タスク2: PR作成（ユーザー許可後）

**目的**: `/ai:diff-to-pr`コマンドでPull Requestを作成する。

**実行手順**:

1. **ユーザーの明示的な許可を得る**（PR作成の実行前に必ず確認）
2. `/ai:diff-to-pr`コマンドを実行する
   - ブランチ名: `task/TASK-3-2-F-skill-stream-test-env`
   - PRタイトル: `fix: SkillStreamDisplay テスト環境改善 (TASK-3-2-F)`
   - PR本文に含める内容:
     - 変更概要（テスト環境切り替え、Clipboard APIモック、describe.skip解消）
     - 受け入れ基準の達成状況（AC-1〜AC-6）
     - テスト結果サマリー
     - 関連Issue: #559
3. PRが正常に作成されたことを確認する

**期待される成果物**:

- Pull Request（GitHub上）

---

### タスク3: CI/CD確認

**目的**: CI/CDパイプラインでテストが通過することを確認する。

**実行手順**:

1. GitHub ActionsのCI結果を確認する
   ```bash
   gh pr checks
   ```
2. 全CIジョブが成功することを確認する
3. 失敗するCIジョブがある場合、原因を調査して修正する
4. CI結果をユーザーに報告する

**期待される成果物**:

- CI/CD結果の報告

---

### タスク4: マージ準備完了報告

**目的**: マージ準備が完了したことをユーザーに報告する。

**実行手順**:

1. 以下の情報をユーザーに報告する
   - PR URL
   - CI/CD結果
   - 変更ファイル数と変更行数
   - 受け入れ基準の達成状況サマリー
2. **マージ自体はユーザーがGitHub UIで手動実行する**（自動マージは行わない）

**期待される成果物**:

- マージ準備完了報告

---

### タスク5: タスク完了処理【必須】

**目的**: PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

**実行手順**:

1. タスクディレクトリを`completed-tasks`に移動する
   ```bash
   mv docs/30-workflows/TASK-3-2-F-skill-stream-test-env/ docs/30-workflows/completed-tasks/
   ```
2. 移動を確認する
   ```bash
   ls docs/30-workflows/completed-tasks/ | grep TASK-3-2-F
   ```
3. 変更をコミットする
   ```bash
   git add docs/30-workflows/
   git commit -m "docs(workflows): TASK-3-2-F-skill-stream-test-envをcompleted-tasksに移動"
   git push
   ```

**期待される成果物**:

- タスクディレクトリの`completed-tasks`への移動完了

---

## 参照資料

| 参照資料       | パス                                            | 内容                 |
| -------------- | ----------------------------------------------- | -------------------- |
| Phase 12成果物 | `outputs/phase-12/implementation-guide.md`      | 実装ガイド           |
| Phase 12成果物 | `outputs/phase-12/documentation-changelog.md`   | ドキュメント更新履歴 |
| Phase 12成果物 | `outputs/phase-12/unassigned-task-detection.md` | 未タスク検出レポート |
| Phase 10成果物 | `outputs/phase-10/final-review-result.md`       | 最終レビュー結果     |

---

## 成果物

| 成果物       | パス     | 内容               |
| ------------ | -------- | ------------------ |
| Pull Request | GitHub上 | マージ準備完了のPR |

---

## 完了条件

- [ ] ローカル最終確認（ビルド、テスト、型チェック、リント）が全てPASS
- [ ] ユーザーの許可を得てPRが作成されている
- [ ] CI/CDパイプラインが全て成功している
- [ ] マージ準備完了がユーザーに報告されている
- [ ] PRにIssue #559への参照が含まれている
- [ ] タスクディレクトリが`docs/30-workflows/completed-tasks/`に移動されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] タスクディレクトリがcompleted-tasksに移動されている

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（タスク完了）

---

## タスク完了

本タスク（TASK-3-2-F: SkillStreamDisplay テスト環境改善）の全Phaseが完了しました。
