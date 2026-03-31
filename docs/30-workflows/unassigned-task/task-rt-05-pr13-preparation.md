# TASK-RT-05-PR13: multi_select Phase 13 PR作成・CI確認 - タスク指示書

## メタ情報

```yaml
issue_number: 1793
```

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | TASK-RT-05-PR13                             |
| タスク名     | multi_select Phase 13 PR作成・CI確認        |
| 分類         | release / pr-creation                       |
| 対象機能     | multi_select-user-input-kind（TASK-RT-05）  |
| 優先度       | 中                                          |
| 見積もり規模 | 小規模                                      |
| ステータス   | 未実施                                      |
| 発見元       | TASK-RT-05 Phase 13（最小記述のまま未完了） |
| 発見日       | 2026-03-30                                  |
| issue_number | 1757                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-RT-05（multi_select-user-input-kind）のコード実装は完了しており、main ブランチへのマージ準備が整っている。しかし Phase 13（PR作成・CI確認）が最小限の記述しかない状態で停止しており、以下の手続きが未完了のままである。

- `git diff main...HEAD` による差分整理とコミットメッセージ生成
- 機能ブランチの作成と PR 作成
- CI/CD チェックの確認
- レビュワー指定と関連 Issue の紐付け

加えて、worktree が detached HEAD 状態のため、通常の PR 作成フロー（`gh pr create`）を適用する前にブランチ切り出しが必要になるという固有の問題がある。

### 1.2 問題点・課題

- worktree が detached HEAD 状態のため、そのままでは `gh pr create` でベースブランチとして利用できない
- Phase 9/10/11 が環境ブロックにより「テスト確認済み」としての証跡取得が完了していない
- PR 本文に受入条件・テスト証跡リンクを含める前に、前提タスク（Phase 11 証跡取得・テスト再実行）の完了確認が必要

### 1.3 放置した場合の影響

- multi_select 機能がレポジトリに取り込まれず、TASK-RT-05 が永久に「実装完了だが未マージ」状態になる
- worktree がタスクブランチとして分離されないまま放置され、コンフリクトリスクが蓄積する
- CI 確認・レビュー・Issue クローズが行われないため、チームの可視性が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

1. `git diff main...HEAD --stat` で差分を整理してコミットメッセージを生成する
2. TASK-RT-05 の機能ブランチを作成し、GitHub PR を正式に提出する
3. CI/CD の全チェックが PASS することを確認する

### 2.2 最終ゴール

- GitHub 上に TASK-RT-05-multi-select の PR が作成された状態
- CI/CD の全ジョブが GREEN
- レビュワーが指定され、TASK-RT-05 の Issue が PR にリンクされている
- PR 本文に multi_select 実装の概要・受入条件・テスト証跡リンクが含まれる

### 2.3 スコープ

#### 含むもの

- detached HEAD から機能ブランチへの切り出し
- 差分分析（`git diff main...HEAD`）とコミットメッセージ生成
- `ai:diff-to-pr` スキルを使ったPR本文生成・PR作成
- `gh pr checks` による CI 確認
- レビュワー指定（`gh pr edit --add-reviewer`）
- TASK-RT-05 Issue との紐付け

#### 含まないもの

- multi_select の機能追加・バグ修正（コード実装は完了済み）
- Phase 11 証跡の取得（別タスク TASK-RT-05-PHASE11 の責務）
- テスト再実行（別タスク TASK-RT-05-TEST-RERUN の責務）

### 2.4 成果物

| 成果物       | 説明                                   |
| ------------ | -------------------------------------- |
| 機能ブランチ | `feature/task-rt-05-multi-select`      |
| Pull Request | multi_select 実装の PR（GitHub上）     |
| PR本文       | 概要・受入条件・テスト証跡リンクを含む |
| CI確認結果   | 全チェック PASS の記録                 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- **TASK-RT-05-PHASE11 が完了していること**（Phase 11 証跡取得済み）
- **TASK-RT-05-TEST-RERUN が完了していること**（テスト全件 PASS 確認済み）
- `gh` CLI が認証済みであること（`gh auth status`）
- 現在の worktree が TASK-RT-05 の実装コミットを含んでいること

### 3.2 依存タスク

| タスクID              | 関係     | 補足                                   |
| --------------------- | -------- | -------------------------------------- |
| TASK-RT-05-PHASE11    | 先行必須 | Phase 11 証跡取得が未完了ならブロック  |
| TASK-RT-05-TEST-RERUN | 先行必須 | テスト再実行 PASS が未確認ならブロック |

### 3.3 必要な知識

- Git detached HEAD 状態からのブランチ切り出し方法
- `gh pr create` / `gh pr checks` / `gh pr edit` の基本操作
- `ai:diff-to-pr` スキルの起動方法（`/ai:diff-to-pr`）
- TASK-RT-05 の multi_select 機能概要（受入条件・変更ファイル）

### 3.4 推奨アプローチ

`/ai:diff-to-pr` スキルを使うことを強く推奨する。このスキルはリモート同期・品質検証・コミット・PR 作成・CI 確認までを自動化するため、手動の git/gh 操作を最小化できる。ただし detached HEAD 状態のため、スキル起動前にブランチ切り出しを手動で実施する必要がある。

---

## 4. 実行手順

### Phase構成

| Phase | 名称                           | 目的                                               |
| ----- | ------------------------------ | -------------------------------------------------- |
| 1     | 事前確認                       | 前提タスク完了確認                                 |
| 2     | 差分分析                       | `git diff main...HEAD --stat` で変更の全体像を把握 |
| 3     | ブランチ作成                   | detached HEAD から機能ブランチへ切り出し           |
| 4     | コミットメッセージ生成         | 差分内容に基づくコミットメッセージ作成             |
| 5     | PR本文生成                     | 受入条件・テスト証跡を含むPR本文を生成             |
| 6     | PR作成                         | `gh pr create` / `/ai:diff-to-pr` でPR提出         |
| 7     | CI確認                         | `gh pr checks` で全チェックのPASSを確認            |
| 8     | レビュワー指定・Issue連携      | PR に担当者を追加し Issue を紐付ける               |
| 9     | 品質確認                       | PR内容の最終レビュー                               |
| 10    | スキル仕様反映                 | ai:diff-to-pr スキルへのフィードバック記録         |
| 11    | 手動確認（スクリーンショット） | ブラウザでPR状態を目視確認                         |
| 12    | ドキュメント更新               | タスク仕様書・教訓の更新                           |

---

### Phase 1: 事前確認

#### 目的

前提タスクが完了していることを確認し、未完了の場合は作業をブロックする。

#### 手順

1. TASK-RT-05-PHASE11 の完了状態を確認する
   ```bash
   # Phase 11 証跡ディレクトリの存在確認
   ls docs/30-workflows/task-rt-05-multi-select/outputs/phase-11/
   ```
2. TASK-RT-05-TEST-RERUN の完了状態を確認する
   ```bash
   # テスト結果の記録確認
   cat docs/30-workflows/task-rt-05-multi-select/outputs/phase-11/manual-test-result.md
   ```
3. どちらかが未完了の場合は作業を中断し、対応する前提タスクを先に完了させる

#### 成果物

前提タスク完了確認チェックリスト（確認メモ）

#### 完了条件

- [ ] TASK-RT-05-PHASE11 が完了済みであることが確認できた
- [ ] TASK-RT-05-TEST-RERUN が完了済みであることが確認できた

---

### Phase 2: 差分分析

#### 目的

`git diff main...HEAD` で変更ファイルと変更行数の全体像を把握し、PR本文の材料を揃える。

#### 手順

1. ファイル変更一覧を確認する
   ```bash
   git diff main...HEAD --stat
   ```
2. 変更の概要を確認する
   ```bash
   git log main...HEAD --oneline
   ```
3. 主要な変更ファイルの内容を確認する
   ```bash
   git diff main...HEAD -- <重要ファイル>
   ```

#### 成果物

変更ファイル一覧・変更行数サマリー（PR本文の概要セクション用）

#### 完了条件

- [ ] 変更ファイル一覧が把握できている
- [ ] multi_select 実装の主要変更点が整理できている

---

### Phase 3: ブランチ作成

#### 目的

detached HEAD 状態から機能ブランチを切り出し、PRのベースブランチとして利用可能な状態にする。

**苦戦箇所: worktree detached HEAD 状態からのPR作成**

worktree が detached HEAD 状態のままでは `gh pr create` がエラーになる。以下の手順でブランチを切り出してから PR を作成すること。

#### 手順

1. 現在の detached HEAD 状態を確認する
   ```bash
   git status
   git log --oneline -3
   ```
2. 現在のコミットから機能ブランチを作成する
   ```bash
   git checkout -b feature/task-rt-05-multi-select
   ```
3. ブランチが正しく作成されたことを確認する
   ```bash
   git branch
   git log --oneline -3
   ```
4. リモートにプッシュする（PR作成の準備）
   ```bash
   git push -u origin feature/task-rt-05-multi-select
   ```

#### 成果物

`feature/task-rt-05-multi-select` ブランチ（リモートに push 済み）

#### 完了条件

- [ ] `git branch` で `feature/task-rt-05-multi-select` が表示される
- [ ] `git status` で detached HEAD 状態が解消されている
- [ ] リモートへの push が成功している

---

### Phase 4: コミットメッセージ生成

#### 目的

Phase 2 の差分分析結果をもとに、規約に従ったコミットメッセージを生成する。

#### 手順

1. 既存コミット履歴の文体を確認する
   ```bash
   git log main...HEAD --oneline
   ```
2. 変更内容に基づきコミットメッセージを作成する
   - フォーマット: `feat(component): TASK-RT-05 multi_select user-input-kind 実装`
   - 変更ファイル・機能の概要を1-2文で要約
3. 未コミットの変更がある場合はコミットする
   ```bash
   git add <変更ファイル>
   git commit -m "feat(...): ..."
   ```

#### 成果物

コミットメッセージ（文字列）

#### 完了条件

- [ ] コミットメッセージがプロジェクト規約に沿っている
- [ ] 未コミット変更がない（`git status` で clean）

---

### Phase 5: PR本文生成

#### 目的

受入条件・テスト証跡リンクを含むPR本文を生成する。`/ai:diff-to-pr` スキルに委ねることを推奨するが、手動で行う場合は以下のセクションを含める。

#### 手順

1. `ai:diff-to-pr` スキルを起動して PR 本文を自動生成する（推奨）

   ```
   /ai:diff-to-pr
   ```

   スキルが差分分析・ブランチ確認・PR本文生成・PR作成・CI確認を自動で実行する。

   手動で行う場合は手順 2-4 を実施する。

2. PR本文に以下のセクションを含める
   - 概要: multi_select-user-input-kind の実装内容
   - 変更内容: 変更ファイル一覧と各ファイルの変更意図
   - 受入条件: TASK-RT-05 で定義された全受入条件のチェックリスト
   - テスト証跡: Phase 11 手動テスト結果へのリンク
   - 関連 Issue: TASK-RT-05 の GitHub Issue 番号
3. PR 本文を `.github/pull_request_template.md` のフォーマットに準拠させる
4. スクリーンショット（UI変更がある場合）を PR 本文に添付する

#### 成果物

PR本文テキスト（Markdown形式）

#### 完了条件

- [ ] PR本文に multi_select 実装の概要が含まれる
- [ ] PR本文に受入条件のチェックリストが含まれる
- [ ] PR本文にテスト証跡リンクが含まれる

---

### Phase 6: PR作成

#### 目的

機能ブランチから `main` ブランチへの Pull Request を GitHub 上に作成する。

#### 手順

1. `/ai:diff-to-pr` スキルが既に実行済みの場合はこの Phase をスキップする

   手動で PR を作成する場合は以下を実行する：

2. `gh pr create` で PR を作成する
   ```bash
   gh pr create \
     --base main \
     --head feature/task-rt-05-multi-select \
     --title "feat(multi-select): TASK-RT-05 multi_select user-input-kind 実装" \
     --body "$(cat pr-body.md)"
   ```
3. 作成された PR の URL を記録する
   ```bash
   gh pr view --json url -q .url
   ```

#### 成果物

GitHub PR URL

#### 完了条件

- [ ] PR が GitHub 上に作成されている
- [ ] PR のベースブランチが `main` である
- [ ] PR 本文に必要なセクションが含まれている

---

### Phase 7: CI確認

#### 目的

CI/CD の全チェックが PASS していることを確認する。

#### 手順

1. CI チェックの状態を確認する
   ```bash
   gh pr checks
   ```
2. 失敗しているチェックがある場合は原因を特定して修正する
   ```bash
   gh pr checks --watch  # リアルタイム監視
   ```
3. 全チェックが PASS したことを確認し記録する

#### 成果物

CI チェック結果のスクリーンショットまたはテキスト記録

#### 完了条件

- [ ] `gh pr checks` で全ジョブが PASS 表示
- [ ] 失敗しているチェックが0件

---

### Phase 8: レビュワー指定・Issue連携

#### 目的

PR にレビュワーを指定し、TASK-RT-05 の Issue を PR にリンクする。

#### 手順

1. レビュワーを指定する
   ```bash
   gh pr edit --add-reviewer <GitHubユーザー名>
   ```
2. TASK-RT-05 の Issue 番号を確認する
   ```bash
   gh issue list --search "TASK-RT-05"
   ```
3. PR 本文に Issue のクローズキーワードを追加する（既に含まれている場合はスキップ）

   ```bash
   gh pr edit --body "$(cat pr-body.md)

   Closes #<Issue番号>"
   ```

4. PR の状態を最終確認する
   ```bash
   gh pr view
   ```

#### 成果物

レビュワー指定済み・Issue リンク済みの PR

#### 完了条件

- [ ] レビュワーが少なくとも1名指定されている
- [ ] TASK-RT-05 の Issue が PR にリンクされている

---

### Phase 9: 品質確認

#### 目的

PR の内容・CI 状態・メタ情報を総合的にレビューする。

#### 手順

1. PR の全体像を確認する
   ```bash
   gh pr view --web  # ブラウザで PR を開く
   ```
2. 以下の観点でセルフレビューを行う
   - PR 本文に不足情報がないか
   - ラベルが正しく設定されているか
   - CI が全件 PASS しているか

#### 完了条件

- [ ] PR 本文に漏れがない
- [ ] ラベル・マイルストーンが適切に設定されている
- [ ] CI 全件 PASS

---

### Phase 10: スキル仕様反映

#### 目的

本タスクで得られた知見を `ai:diff-to-pr` スキルにフィードバックとして記録する。

#### 手順

1. 苦戦箇所（detached HEAD対応、前提タスク確認忘れ）を教訓として記録する
2. `.claude/skills/ai-diff-to-pr/LOGS.md` または同等のログファイルに追記する
3. 「worktree が detached HEAD 状態の場合は先にブランチを切り出す」旨の注意書きを追加する

#### 完了条件

- [ ] 教訓がスキルログに記録された

---

### Phase 11: 手動確認（スクリーンショット）

#### 目的

ブラウザで GitHub PR ページを開き、PR 状態を目視確認する。

#### 手順

1. `gh pr view --web` でブラウザを開く
2. PR の以下を目視確認する
   - タイトル・本文の内容
   - CI チェックの結果
   - レビュワー・Issue リンク

#### 完了条件

- [ ] ブラウザで PR の状態を目視確認した

---

### Phase 12: ドキュメント更新

#### 目的

タスク仕様書・教訓ドキュメントを更新し、TASK-RT-05 の完了を記録する。

#### 手順

1. TASK-RT-05 のタスク仕様書を `completed-tasks/` に移動する
   ```bash
   mv docs/30-workflows/task-rt-05-multi-select/ \
      docs/30-workflows/completed-tasks/
   ```
2. 教訓ドキュメントに本タスクの苦戦箇所を追記する
3. 変更をコミットする
   ```bash
   git add docs/30-workflows/
   git commit -m "docs(workflows): TASK-RT-05をcompleted-tasksに移動"
   ```

#### 完了条件

- [ ] TASK-RT-05 ワークフローディレクトリが `completed-tasks/` に移動された
- [ ] 教訓ドキュメントが更新された
- [ ] 変更がコミットされた

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] PR本文に multi_select 実装の概要が含まれる
- [ ] PR本文に受入条件のチェックリストが含まれる
- [ ] PR本文にテスト証跡リンクが含まれる
- [ ] レビュワーが少なくとも1名指定されている
- [ ] TASK-RT-05 の Issue が PR にリンクされている

### 品質要件

- [ ] CI/CD の全チェックが PASS
- [ ] `git status` で未コミット変更がない（clean state）
- [ ] PR のベースブランチが `main` である

### ドキュメント要件

- [ ] 教訓（苦戦箇所）がスキルログに記録された
- [ ] TASK-RT-05 ワークフローディレクトリが `completed-tasks/` に移動された

---

## 6. 検証方法

### テストケース

| ケース           | 検証コマンド                                | 期待結果                                 |
| ---------------- | ------------------------------------------- | ---------------------------------------- |
| ブランチ確認     | `git branch`                                | `feature/task-rt-05-multi-select` が存在 |
| PR作成確認       | `gh pr view`                                | PR が open 状態                          |
| CI確認           | `gh pr checks`                              | 全ジョブ PASS                            |
| レビュワー確認   | `gh pr view --json reviewRequests`          | 1名以上指定                              |
| Issue リンク確認 | `gh pr view --json closingIssuesReferences` | Issue が1件以上                          |

### 検証手順

1. `gh pr view` でPRの基本情報を確認する
2. `gh pr checks` でCI状態を確認する
3. `gh pr view --web` でブラウザから目視確認する

---

## 7. リスクと対策

| リスク                                  | 影響度 | 発生確率 | 対策                                                                                |
| --------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------- |
| detached HEAD からのブランチ作成に失敗  | 高     | 中       | `git checkout -b feature/task-rt-05-multi-select` で事前にブランチを切り出す        |
| 前提タスク未完了のままPR作成してしまう  | 高     | 中       | Phase 1 の事前確認をスキップしない。Phase 11 証跡とテスト再実行の完了を必ず確認する |
| CI が失敗する（型エラー・lint エラー）  | 中     | 低       | PR 作成前に `pnpm typecheck && pnpm lint` をローカルで確認する                      |
| main ブランチとのコンフリクトが発生する | 中     | 低       | `git fetch origin && git merge origin/main` でコンフリクトを事前に解消する          |
| `ai:diff-to-pr` スキルが利用できない    | 低     | 低       | `gh pr create` による手動 PR 作成にフォールバックする                               |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/task-rt-05-multi-select/` — TASK-RT-05 ワークフローディレクトリ
- `docs/30-workflows/task-rt-05-multi-select/outputs/phase-11/` — Phase 11 証跡（前提）
- `.github/pull_request_template.md` — PR 本文テンプレート
- `.claude/skills/task-specification-creator/references/phase-template-phase13-detail.md` — Phase 13 詳細テンプレート

### 参考資料

- `ai:diff-to-pr` スキル: 差分からPR作成までの完全な Git ワークフローを実行するコマンド（`/ai:diff-to-pr` で起動）
- GitHub CLI ドキュメント: `gh pr create`, `gh pr checks`, `gh pr edit`

---

## 9. 備考

### 苦戦箇所と知見

#### 苦戦箇所1: worktree detached HEAD 状態からのPR作成

| 項目   | 内容                                                                                                                                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題   | worktree が detached HEAD 状態のため、`gh pr create` を実行してもベースブランチとして認識されずエラーになる。                                                                                                   |
| 解決策 | PR 作成前に `git checkout -b feature/task-rt-05-multi-select` を実行して named ブランチを切り出し、`git push -u origin feature/task-rt-05-multi-select` でリモートに push してから PR を作成する。              |
| 教訓   | worktree 環境で作業する場合は、Phase 3 でブランチ切り出しを明示的な手順として組み込むこと。`/ai:diff-to-pr` スキルも detached HEAD を自動検出しない場合があるため、スキル起動前に手動でブランチを切り出すこと。 |

#### 苦戦箇所2: 前提タスク完了確認の忘れ防止

| 項目   | 内容                                                                                                                                                             |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題   | Phase 11 証跡取得（TASK-RT-05-PHASE11）とテスト再実行（TASK-RT-05-TEST-RERUN）が完了していない状態でPR作成を開始すると、PR本文にテスト証跡リンクを含められない。 |
| 解決策 | Phase 1 を必須フェーズとして設け、前提タスクの完了確認を PR 作成前の強制チェックポイントとする。`ls outputs/phase-11/` の存在確認を自動化する。                  |
| 教訓   | 「実装完了」と「PR作成可能状態」は別物。Phase 11 証跡（スクリーンショット・テスト結果）が揃っていない限り PR 作成を開始しないというルールを Phase 1 に明示する。 |

### 推奨ツール

`/ai:diff-to-pr` スキルを使うと、差分分析・ブランチ作成・コミット・PR 作成・CI 確認・補足コメント投稿までを一貫して自動化できる。ただし **detached HEAD 状態の場合は Phase 3 のブランチ切り出しを先に手動実施すること**。スキルが detached HEAD を自動検出する保証がないため、Phase 3 を省略してスキルを起動しないこと。
