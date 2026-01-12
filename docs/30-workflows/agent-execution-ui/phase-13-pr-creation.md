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

- [ ] コミットが論理的な単位で整理されている
- [ ] PRが作成されている
- [ ] PRテンプレートが適切に記入されている
- [ ] セルフレビューが完了している
- [ ] CIが全てパスしている
- [ ] レビュアーが設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 変更内容の確認
2. コミットの整理
3. PRブランチのプッシュ
4. PR本文の作成
5. PRの作成
6. セルフレビューの実施
7. CIの確認
8. レビュアーの設定
9. PR作成結果の記録
10. 完了条件の検証

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
