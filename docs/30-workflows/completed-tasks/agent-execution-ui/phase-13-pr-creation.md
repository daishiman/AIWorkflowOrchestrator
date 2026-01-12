# Phase 13: PR作成

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase      | 13                 |
| 機能名     | agent-execution-ui |
| 作成日     | 2026-01-12         |
| ステータス | 未実施             |

## 目的

実装をレビュー可能な形でPull Requestとして提出する。

## 実行タスク

- **コミット整理**: 論理的なコミット単位への整理
- **PR作成**: テンプレートに従ったPR本文作成
- **セルフレビュー**: 提出前の最終確認
- **レビュー依頼**: 適切なレビュアーへの依頼

## ⚠️ PR作成に関する重要な注意【必須確認】

> **重要**: PR作成はプロジェクトの公開リポジトリに影響を与える操作です。

| 確認項目                       | 必須 | 説明                           |
| ------------------------------ | ---- | ------------------------------ |
| ユーザーにPR作成の許可を求める | ✅   | 必ず事前にユーザーの承認を得る |
| ローカル確認を完了する         | ✅   | 全チェック項目をパスさせる     |
| PR内容をユーザーに提示する     | ✅   | タイトル・本文を事前確認       |

### ユーザー確認フロー

```
1. 全てのローカルチェックを完了
2. PR内容（タイトル・本文）を生成
3. ユーザーに内容を提示し、承認を依頼
4. 承認を得てからPR作成を実行
```

## ローカル確認チェックリスト【PR作成前に必須】

| #   | 確認項目               | コマンド                                    | 期待結果 | 結果 |
| --- | ---------------------- | ------------------------------------------- | -------- | ---- |
| 1   | ビルド成功             | `pnpm --filter @repo/desktop build`         | 成功     | [ ]  |
| 2   | テスト全パス           | `pnpm --filter @repo/desktop test`          | 全パス   | [ ]  |
| 3   | 型チェック成功         | `pnpm --filter @repo/desktop typecheck`     | エラー0  | [ ]  |
| 4   | Lintエラーなし         | `pnpm --filter @repo/desktop lint`          | エラー0  | [ ]  |
| 5   | カバレッジ基準達成     | `pnpm --filter @repo/desktop test:coverage` | 基準達成 | [ ]  |
| 6   | 不要ファイルなし       | `git status`                                | クリーン | [ ]  |
| 7   | コミットメッセージ確認 | `git log --oneline main..HEAD`              | 適切     | [ ]  |

**重要**: 上記全てがパスするまでPR作成に進まないこと。

## /ai:diff-to-pr スキルの使用【推奨】

PR作成には `/ai:diff-to-pr` スキルの使用を推奨:

```bash
# スキルを使用したPR作成フロー
/ai:diff-to-pr [branch-name]
```

このスキルは以下を自動化:

1. 差分分析・ブランチ作成・コミット
2. PR本文生成・PR作成
3. 補足コメント投稿
4. CI/CD完了確認
5. マージ可能報告

⚠️ マージはユーザーがGitHub UIで手動実行

## 参照資料

### 前Phase成果物

| 資料          | パス                                      | 説明           |
| ------------- | ----------------------------------------- | -------------- |
| ドキュメント  | `outputs/phase-12/`                       | Phase 12成果物 |
| 全Phase成果物 | `outputs/phase-1/` 〜 `outputs/phase-12/` | 全成果物       |

## 実行手順

### ステップ1: 変更内容の確認

```bash
# 変更ファイル一覧
git status

# 差分確認
git diff --stat main

# コミット履歴確認
git log --oneline main..HEAD
```

### ステップ2: コミット整理

論理的な単位でコミットを整理:

| コミット順 | 内容                   | 対象ファイル                            |
| ---------- | ---------------------- | --------------------------------------- |
| 1          | 型定義の追加           | `packages/shared/src/types/`            |
| 2          | agentSlice拡張         | `apps/desktop/src/renderer/store/`      |
| 3          | UIコンポーネント追加   | `apps/desktop/src/renderer/components/` |
| 4          | AgentExecutionView実装 | `apps/desktop/src/renderer/views/`      |
| 5          | IPC通信実装            | `apps/desktop/src/`                     |
| 6          | テスト追加             | `apps/desktop/src/**/*.test.*`          |
| 7          | ドキュメント更新       | `docs/`, `.claude/skills/`              |

### ステップ3: PR作成

```bash
# PRブランチをプッシュ
git push origin feat/agent-004-execution-ui

# PRを作成
gh pr create --title "feat(agent): add Agent Execution UI (AGENT-004)" --body-file pr-template.md
```

### ステップ4: PRテンプレート

```markdown
## 概要

Agent実行画面のUIを実装。Claude Code SDKを使用したエージェント実行のインターフェースを提供。

## 変更内容

### 新規追加

- **AgentExecutionView**: エージェント実行のメインビュー
- **AgentChatInterface**: チャット形式のメッセージ表示
- **AgentOutputStream**: ストリーミング出力表示
- **AgentMessageInput**: ユーザー入力コンポーネント
- **AgentExecutionControls**: 実行制御コンポーネント
- **PermissionDialog**: 権限確認ダイアログ

### 状態管理

- agentSlice拡張（実行状態・Permission管理）

### IPC通信

- agent:start / agent:stop / agent:stream / agent:status
- agent:permission / agent:permission:res

## 関連Issue/タスク

- タスク: AGENT-004
- 依存: AGENT-001, AGENT-002, AGENT-003

## テスト

- [ ] ユニットテスト: `pnpm --filter @repo/desktop test`
- [ ] カバレッジ: Line 80%+, Branch 60%+, Function 80%+
- [ ] 統合テスト: IPC/ストリーミング/Permission

## スクリーンショット

### 基本画面

<!-- スクリーンショットを貼り付け -->

### Permission確認ダイアログ

<!-- スクリーンショットを貼り付け -->

## レビューポイント

1. IPC通信設計の妥当性
2. Permission確認フローの安全性
3. ストリーミング表示のパフォーマンス
4. アクセシビリティ対応

## チェックリスト

- [ ] ESLint/Prettierエラーなし
- [ ] TypeScriptエラーなし
- [ ] テスト全件パス
- [ ] カバレッジ基準達成
- [ ] ドキュメント更新済み
```

### ステップ5: セルフレビュー

| チェック項目                     | 確認結果 |
| -------------------------------- | -------- |
| 不要なコード・コメントがないか   | [ ]      |
| デバッグ用コードが残っていないか | [ ]      |
| console.logが残っていないか      | [ ]      |
| 機密情報が含まれていないか       | [ ]      |
| コミットメッセージが適切か       | [ ]      |

### ステップ6: CIの確認

```bash
# CIステータス確認
gh pr checks
```

| CIチェック | ステータス |
| ---------- | ---------- |
| lint       | {{結果}}   |
| typecheck  | {{結果}}   |
| test       | {{結果}}   |
| build      | {{結果}}   |

## 統合テスト連携【必須】

PR提出前の統合テスト最終確認:

| テストカテゴリ       | 実行結果 | CI連携 |
| -------------------- | -------- | ------ |
| IPC接続テスト        | {{結果}} | ✓      |
| ストリーミングテスト | {{結果}} | ✓      |
| Permission連携テスト | {{結果}} | ✓      |
| 状態同期テスト       | {{結果}} | ✓      |
| E2Eテスト            | {{結果}} | ✓      |

## 成果物

| 成果物       | パス                                 | 説明         |
| ------------ | ------------------------------------ | ------------ |
| PR URL       | `outputs/phase-13/pr-url.md`         | 作成したPR   |
| コミット一覧 | `outputs/phase-13/commits.md`        | コミット履歴 |
| レビュー依頼 | `outputs/phase-13/review-request.md` | 依頼内容     |

## PR作成結果テンプレート

```markdown
# PR作成結果

## 作成日: {{DATE}}

## PR情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| PR URL   | https://github.com/xxx/yyy/pull/NNN |
| ブランチ | feat/agent-004-execution-ui         |
| ベース   | main                                |
| 状態     | Open                                |

## コミット一覧

| SHA     | メッセージ                 |
| ------- | -------------------------- |
| xxxxxxx | feat: add type definitions |
| xxxxxxx | feat: extend agentSlice    |
| ...     | ...                        |

## CIステータス

| チェック | ステータス |
| -------- | ---------- |
| lint     | ✓/✗        |
| test     | ✓/✗        |
| build    | ✓/✗        |

## レビュアー

| 担当者 | ステータス |
| ------ | ---------- |
| -      | Pending    |
```

## 完了条件

- [ ] **ローカル確認チェックリストが全てパスしている**
- [ ] コミットが論理的な単位で整理されている
- [ ] **ユーザーからPR作成の承認を得ている**
- [ ] PRが作成されている
- [ ] PRテンプレートが適切に記入されている
- [ ] セルフレビューが完了している
- [ ] CIが全てパスしている
- [ ] レビュアーが設定されている
- [ ] **タスク完了処理が実施されている**
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 変更内容の確認
2. **ローカル確認チェックリストの実行**
3. コミットの整理
4. PRブランチのプッシュ
5. PR本文の作成
6. **ユーザーへのPR作成承認依頼**
7. PRの作成（/ai:diff-to-pr使用推奨）
8. セルフレビューの実施
9. CIの確認
10. レビュアーの設定
11. PR作成結果の記録
12. **タスク完了処理（completed-tasks/への移動）**
13. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-execution-ui --phase 13
```

## タスク完了

このPhaseが完了すると、AGENT-004タスク全体が完了となる。

### タスク完了チェックリスト

- [ ] 全Phase（1-13）が完了している
- [ ] artifacts.jsonで全Phaseがcompletedになっている
- [ ] PRがマージされている（または承認待ち）
- [ ] タスク定義ファイルが`completed-tasks/`に移動されている

### タスク完了処理【PR作成後に実施】

PRが作成されたら、タスク定義ファイルを`completed-tasks/`ディレクトリに移動:

```bash
# タスク定義ファイルの移動
mkdir -p docs/30-workflows/completed-tasks/
mv docs/30-workflows/agent-execution-ui/ docs/30-workflows/completed-tasks/

# 元のunassigned-taskからタスク指示書を削除（存在する場合）
rm -f docs/30-workflows/unassigned-task/task-agent-04-execution-ui.md

# 移動を確認
ls docs/30-workflows/completed-tasks/agent-execution-ui/

# 変更をコミット
git add docs/30-workflows/
git commit -m "chore: move AGENT-004 task to completed-tasks"
```

**注意**: この処理はPRがマージ承認された後、または承認待ち状態になった後に実施すること。
