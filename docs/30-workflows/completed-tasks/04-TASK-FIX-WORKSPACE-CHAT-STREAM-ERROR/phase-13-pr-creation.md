# Phase 13: PR作成

## メタ情報

| 項目          | 値                                                                                    |
| ------------- | ------------------------------------------------------------------------------------- |
| Phase番号     | 13                                                                                    |
| 機能名        | WorkspaceChat ストリーミングエラーUX改善                                              |
| タスクID      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR                                                  |
| 作成日        | 2026-03-20                                                                            |
| 状態          | 未実施（ユーザー承認待ち）                                                            |
| 前Phase成果物 | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-12-documentation.md` |

## 目的

commit / PR / push はユーザーの明示承認後にだけ実施する。本 Phase は、承認が出た時に実行する手順と必要証跡を保持する。

## 実行タスク

- Task 1: ユーザー承認後に final verification を再実行する
- Task 2: ユーザー承認後に commit / PR を行う
- Task 3: CI / reviewer / archive を確認する

### Task 1: 最終成果物確認

全Phaseの成果物が揃っているかを確認する。

```bash
# 成果物の存在確認
ls -la docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/

# 実装ファイルの確認
ls -la apps/desktop/src/renderer/views/WorkspaceView/hooks/
ls -la apps/desktop/src/renderer/views/WorkspaceView/components/
```

#### 現在の状態

- Phase 1〜12 の docs/code/same-wave sync は完了済み。
- commit / PR / directory archive は未着手。
- したがって本 Phase は block ではなく `pending by user approval` として保持する。

#### 成果物チェックリスト

| 成果物                                          | 確認 |
| ----------------------------------------------- | ---- |
| `phase-1-requirements.md`                       | 済   |
| `phase-2-design.md`                             | 済   |
| `phase-3-design-review.md`                      | 済   |
| `phase-4-test-creation.md`                      | 済   |
| `phase-5-implementation.md`                     | 済   |
| `phase-6-test-expansion.md`                     | 済   |
| `phase-7-coverage-check.md`                     | 済   |
| `phase-8-refactoring.md`                        | 済   |
| `phase-9-quality-assurance.md`                  | 済   |
| `phase-10-final-review.md`                      | 済   |
| `phase-11-manual-test.md`                       | 済   |
| `phase-12-documentation.md`                     | 済   |
| `phase-13-pr-creation.md`                       | 保留 |
| `outputs/phase-12/implementation-guide.md`      | 済   |
| `component-documentation.md`                    | 済   |
| `outputs/phase-12/documentation-changelog.md`   | 済   |
| `outputs/phase-12/unassigned-task-detection.md` | 済   |
| `mapLLMErrorToStreamingError.ts`                | 済   |
| `StreamingErrorDisplay.tsx`                     | 済   |
| `useWorkspaceChatController.ts`（拡張後）       | 済   |
| `WorkspaceChatPanel.tsx`（統合後）              | 済   |

### Task 2: 最終テスト実行

承認が出たら以下を再実行する。

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/views/WorkspaceView/hooks/__tests__/useWorkspaceChatController.runtime.test.ts src/renderer/views/WorkspaceView/hooks/__tests__/mapLLMErrorToStreamingError.test.ts src/renderer/views/WorkspaceView/components/__tests__/StreamingErrorDisplay.test.tsx src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.runtime.test.tsx src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop build
```

### Task 3: コミットの準備

この turn では未実行。承認が出たら `git status` / `git diff --stat` を確認し、Task 04 と same-wave sync 対象だけを stage する。

### Task 4: コミットメッセージ案

```text
fix(workspace-chat): improve streaming error UX
```

### Task 5: PR作成

この turn では未実行。承認が出たら branch 名、PR title、body を最終差分に合わせて作成する。

### Task 6: PRレビュー依頼後の確認

承認後に PR を作成したら:

- [ ] CIが通ることを確認する（Lint + TypeCheck + Test）
- [ ] レビュアーをアサインする
- [ ] 関連GitHubIssueをPRにリンクする

### Task 7: ディレクトリ移管

この turn では未実行。commit / PR の後、必要なら current root から `completed-tasks/` へ移管する。

## 参照資料

| ドキュメント          | パス                                                                                  | 参照目的       |
| --------------------- | ------------------------------------------------------------------------------------- | -------------- |
| Phase 12 ドキュメント | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-12-documentation.md` | 成果物一覧確認 |
| Phase 11 手動テスト   | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-11-manual-test.md`   | evidence 確認  |
| Git ツーリングルール  | `.claude/rules/07-git-and-tooling.md`                                                 | PR 作成ルール  |
| タスク実行ルール      | `.claude/rules/05-task-execution.md`                                                  | Phase 13 gate  |

## 実行手順

1. ユーザー承認を受ける。
2. Task 1-2 の再確認コマンドを実行する。
3. 差分を stage / commit する。
4. PR を作成し、CI / reviewer / archive を確認する。

## 成果物

| 成果物          | パス / 場所                                                                         | 形式         |
| --------------- | ----------------------------------------------------------------------------------- | ------------ |
| Phase 13 仕様書 | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-13-pr-creation.md` | Markdown     |
| commit / PR     | ユーザー承認後に生成                                                                | Git / GitHub |

## 完了条件

- [ ] ユーザー承認を受けた
- [ ] 最終テストを再実行した
- [ ] 変更を stage / commit した
- [ ] PR を作成した
- [ ] CI / reviewer / archive を確認した
- [ ] Phase 13 を完了扱いに更新した

## 現在の結論

Phase 13 は未実施であり、ユーザー承認待ちである。commit / PR / push は本ファイルの手順を future action として保持する。
