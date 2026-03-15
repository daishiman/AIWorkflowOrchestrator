# Phase 13: 完了・PR 作成

## メタ情報

| 項目          | 値                                           |
| ------------- | -------------------------------------------- |
| Phase         | 13                                           |
| 機能名        | TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| 作成日        | 2026-03-14                                   |
| 前Phase成果物 | outputs/phase-12/documentation-changelog.md  |
| 成果物        | outputs/phase-13/pr-info.md                  |

## 目的

全 Phase の成果物を最終確認し、ユーザーの承認を得て PR を作成する。
CI が通過したことを確認後、タスクディレクトリを `completed-tasks/` に移動して完了とする。

## 実行タスク

| #    | タスク                      | 目的                        |
| ---- | --------------------------- | --------------------------- |
| 13-1 | ローカル動作確認依頼        | ユーザーによる最終検証      |
| 13-2 | 変更サマリー提示と許可確認  | PR 作成前の明示的な承認取得 |
| 13-3 | PR 作成（`/ai:diff-to-pr`） | ユーザー許可後に実行        |
| 13-4 | CI 通過確認                 | PR の健全性検証             |
| 13-5 | タスクディレクトリ移動      | 完了状態の記録              |

- Task 13-1: ローカル動作確認を依頼する
- Task 13-2: 変更サマリーを提示し、PR 作成許可を取得する
- Task 13-3: 許可後に PR を作成する
- Task 13-4: CI 通過を確認する
- Task 13-5: 完了記録を更新する

## 参照資料

依存Phase: Phase 1 / Phase 2 / Phase 5 / Phase 6 / Phase 7 / Phase 8 / Phase 9 / Phase 10 / Phase 11 / Phase 12

### 前Phase成果物

- `outputs/phase-12/implementation-guide.md` — 実装ガイド
- `outputs/phase-12/system-spec-update-summary.md` — 仕様更新判断
- `outputs/phase-12/documentation-changelog.md` — ドキュメント変更記録
- `outputs/phase-12/unassigned-task-detection.md` — 未タスク検出結果
- `outputs/phase-12/skill-feedback-report.md` — スキルフィードバック

### システム仕様（aiworkflow-requirements）

- `.claude/rules/07-git-and-tooling.md` — PR 作成ルール
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-workspace-chat-lifecycle-tests.md` — 親タスクとの未タスク整合
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` — 再発防止の完了条件
- GitHub Issue: #1222

## 実行手順

### Task 13-1: ローカル動作確認依頼

ユーザーに以下を依頼する:

```
以下のコマンドでテストを実行して、全 PASS を確認してください:

cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts

期待結果: TC-WS-01〜06 が全て PASS
```

### Task 13-2: 変更サマリー提示と許可確認

PR 作成前に以下の変更サマリーをユーザーに提示し、明示的な許可を得る:

**変更サマリー**:

| 種別     | ファイル                                                                            | 内容                                              |
| -------- | ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| 新規追加 | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts` | workspacePath 制約ガードの検証テスト TC-WS-01〜06 |

**確認事項**:

- TC-WS-01 (workspace 内): success: true
- TC-WS-02 (workspace 外): PERMISSION_DENIED
- TC-WS-03 (workspacePath 未指定): isAllowedPath 未呼び出し
- TC-WS-04 (パストラバーサル): PERMISSION_DENIED
- TC-WS-05 (複数コンテキスト, 1つ外): PERMISSION_DENIED
- TC-WS-06 (空配列): isAllowedPath 未呼び出し

ユーザーに「PR を作成してよいですか？」と確認し、明示的な許可を得てから次の Task に進む。

### Task 13-3: PR 作成

**前提**: ユーザーの明示的な許可を得た後にのみ実行する。

```
/ai:diff-to-pr
```

PR タイトル（70 文字以内）:

```
test(chatEdit): workspacePath 制約ガードの検証テスト TC-WS-01〜06
```

PR 本文フォーマット（`07-git-and-tooling.md` 準拠）:

```markdown
## Summary

- `chatEditHandlers.ts` の workspacePath 制約ガードに対する検証テスト 6 件（TC-WS-01〜06）を追加
- workspace 外アクセス拒否・パストラバーサル防止・境界値ケースを網羅
- 実装本体への変更なし（テストコード追加のみ）

## Test Plan

- [x] TC-WS-01: workspace 内ファイル → success: true
- [x] TC-WS-02: workspace 外ファイル → PERMISSION_DENIED
- [x] TC-WS-03: workspacePath 未指定 → isAllowedPath 未呼び出し
- [x] TC-WS-04: パストラバーサル攻撃 → PERMISSION_DENIED
- [x] TC-WS-05: 複数コンテキスト（1つ外）→ PERMISSION_DENIED
- [x] TC-WS-06: 空コンテキスト配列 → isAllowedPath 未呼び出し
- [x] 既存テストへのリグレッションなし

Closes #1222
```

### Task 13-4: CI 通過確認

PR 作成後、CI の状態を確認する:

```bash
gh pr checks <PR番号>
```

CI が失敗した場合:

- テストの失敗を修正する（`--no-verify` は使用禁止）
- 失敗したテストには `.skip` を適用し、Issue/TODO を作成して後続対応

### Task 13-5: タスクディレクトリ移動

CI 通過確認後、タスクディレクトリを `completed-tasks/` に移動する:

```bash
mv "docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001" \
   "docs/30-workflows/completed-tasks/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001"
```

`artifacts.json` の全 Phase ステータスを `completed` に更新する。

## 多角的チェック観点（AI が判断）

| 観点        | チェック内容                                                 |
| ----------- | ------------------------------------------------------------ |
| 承認確認    | ユーザーの明示的な許可なしに PR を作成していないこと         |
| PR タイトル | 70 文字以内であること                                        |
| PR 本文     | Summary + Test Plan が含まれること                           |
| CI          | 全チェックが PASS していること                               |
| Issue       | #1222 が PR 作成後に自動 Close されること（Closes #1222）    |
| 完了記録    | タスクディレクトリが `completed-tasks/` に移動されていること |

## 成果物

- `outputs/phase-13/pr-info.md` — PR URL・CI 結果・完了確認の記録

## 完了条件

- [ ] ユーザーによるローカル動作確認が完了していること（TC-WS-01〜06 全 PASS）
- [ ] ユーザーの明示的な PR 作成許可を得ていること
- [ ] PR が作成されていること（タイトル 70 文字以内、Summary + Test Plan 記載）
- [ ] CI が全て PASS していること
- [ ] GitHub Issue #1222 が Close されていること
- [ ] タスクディレクトリが `completed-tasks/` に移動されていること
- [ ] `outputs/phase-13/pr-info.md` に PR URL と完了確認が記録されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了していること

## サブタスク管理

| ID   | タスク                     | 状態    |
| ---- | -------------------------- | ------- |
| 13-1 | ローカル動作確認依頼       | pending |
| 13-2 | 変更サマリー提示と許可確認 | pending |
| 13-3 | PR 作成                    | pending |
| 13-4 | CI 通過確認                | pending |
| 13-5 | タスクディレクトリ移動     | pending |

## タスク 100% 実行確認【必須】

Phase 13 完了前に以下を確認すること:

- [ ] Task 13-1: ユーザーがローカルでテスト実行・全 PASS 確認済み
- [ ] Task 13-2: ユーザーから PR 作成の明示的許可を取得済み
- [ ] Task 13-3: PR 作成完了（URL を pr-info.md に記録）
- [ ] Task 13-4: CI 全 PASS 確認済み
- [ ] Task 13-5: タスクディレクトリを `completed-tasks/` に移動済み
- [ ] GitHub Issue #1222 が Close されていること

## 次の Phase

なし（タスク完了）
