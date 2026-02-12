# Phase 13: PR作成

## メタ情報

| 項目    | 値                       |
| ------- | ------------------------ |
| Phase   | 13                       |
| 機能名  | skill-creator-ipc        |
| 作成日  | 2026-02-12               |
| 次Phase | なし（ワークフロー完了） |

## 目的

全Phaseの成果物をまとめ、変更をコミットしてPull Requestを作成する。CIの通過を確認し、タスクディレクトリをcompleted-tasksに移動してワークフローを完了する。

## 実行タスク

### Task 1: ローカル動作確認依頼

ユーザーにローカル環境での最終確認を依頼する。

| 確認項目           | 確認依頼内容                                                 | 結果       |
| ------------------ | ------------------------------------------------------------ | ---------- |
| Electronアプリ起動 | `pnpm --filter @repo/desktop dev` でアプリが正常起動するか   | {{RESULT}} |
| IPC通信            | 6チャンネル（5 invoke + 1 on）がローカル環境で正常動作するか | {{RESULT}} |
| 既存機能           | skill:\*チャンネルが既存のまま正常動作するか                 | {{RESULT}} |

### Task 2: 品質チェック実行

コミット前に以下のチェックを全て実行し、クリーンであることを確認する。

| #   | チェック項目         | コマンド                           | 期待結果           | 実行結果   |
| --- | -------------------- | ---------------------------------- | ------------------ | ---------- |
| 1   | Lintがクリーン       | `pnpm lint`                        | エラー0件          | {{RESULT}} |
| 2   | TypeCheckがクリーン  | `pnpm typecheck`                   | エラー0件          | {{RESULT}} |
| 3   | テスト全PASS         | `pnpm --filter @repo/desktop test` | 全テストPASS       | {{RESULT}} |
| 4   | `--no-verify` 未使用 | -                                  | 使用していないこと | {{RESULT}} |

### Task 3: 変更サマリー提示

PR作成前にユーザーに変更サマリーを提示し、PR作成の許可を得る。

#### 新規ファイル

| ファイル                                            | 内容                                                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | IPCハンドラー登録（registerSkillCreatorHandlers / unregisterSkillCreatorHandlers）       |
| `apps/desktop/src/preload/api/skill-creator-api.ts` | Preload API実装（safeInvoke/safeOn使用）                                                 |
| `packages/shared/src/types/skillCreator.ts`         | 共有型定義（SkillCreatorMode, CreateSkillOptions, ExecuteTasksOptions, ExecutionReport） |
| 関連テストファイル                                  | 単体テスト・統合テスト                                                                   |

#### 変更ファイル

| ファイル                               | 変更内容                                                 |
| -------------------------------------- | -------------------------------------------------------- |
| `apps/desktop/src/preload/channels.ts` | SKILL_CREATOR系チャンネル定数追加（6チャンネル）         |
| `apps/desktop/src/preload/types.ts`    | SkillCreatorAPI型定義追加                                |
| `apps/desktop/src/preload/index.ts`    | contextBridge登録にskillCreatorAPI追加                   |
| `apps/desktop/src/main/ipc/index.ts`   | registerAllIpcHandlersにregisterSkillCreatorHandlers追加 |

#### ユーザー許可フロー

「PR作成前に、以下の変更サマリーを確認してください。PR作成を実行してよろしいですか？」
→ ユーザーの明示的な許可を得るまでPR作成を実行しない

### Task 4: PR作成（ユーザー許可後のみ実行）

| 項目       | 値                                                             |
| ---------- | -------------------------------------------------------------- |
| ブランチ名 | `feature/task-9b-h-skill-creator-ipc`                          |
| PRタイトル | `feat(ipc): SkillCreatorService IPCハンドラー登録 (TASK-9B-H)` |

#### PR本文テンプレート

```markdown
## Summary

- SkillCreatorServiceのIPCハンドラーを登録し、Rendererからスキル作成機能を利用可能にした
- skill-creator用IPCチャンネル定義（5 invoke + 1 on）、ハンドラー登録、Preload API拡張を実装
- セキュリティ要件（ホワイトリスト、引数バリデーション、エラーサニタイズ）を遵守

## Test plan

- [ ] 単体テスト: skillCreatorHandlers.test.ts が全PASS
- [ ] 単体テスト: skill-creator-api.test.ts が全PASS
- [ ] 統合テスト: IPC通信フロー全体のテストが全PASS
- [ ] 手動テスト: Electron開発モードで全チャンネルの動作確認済み
- [ ] 既存テスト: 既存のスキル管理機能テストが影響なくPASS
- [ ] Lint/TypeCheck: クリーン
```

### Task 5: CI確認

| #   | 確認項目                 | 期待結果     | 実行結果   |
| --- | ------------------------ | ------------ | ---------- |
| 1   | GitHub Actionsの通過確認 | 全ジョブ成功 | {{RESULT}} |
| 2   | テスト結果の確認         | 全テストPASS | {{RESULT}} |
| 3   | Lint/TypeCheckの通過確認 | エラー0件    | {{RESULT}} |

## 参照資料

| 資料名                   | パス                                                                              | 説明                                             |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| スキルIPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | validatePath、safeInvoke/safeOn、3層セキュリティ |
| SkillCreatorService仕様  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | API仕様、型定義、SkillCreatorMode                |
| IPC・永続化パターン      | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`       | Pattern 3、registerAllIpcHandlers                |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender検証、CSP、BrowserWindow設定               |
| Agent Dashboard IPC      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | 既存チャンネル命名一貫性                         |
| Phase 12 成果物          | `docs/30-workflows/skill-creator-ipc/outputs/phase-12/`                           | ドキュメント更新成果物                           |
| Gitルール                | `.claude/rules/07-git-and-tooling.md`                                             | PR作成ルール、コミット前チェックリスト           |

## 実行手順

### 手順 1: ローカル動作確認依頼（Task 1）

1. ユーザーに `pnpm --filter @repo/desktop dev` でアプリ起動を依頼する
2. 6チャンネルのIPC通信が正常動作するか確認を依頼する
3. 既存skill:\*チャンネルに影響がないか確認を依頼する

### 手順 2: 品質チェック実行（Task 2）

1. `pnpm lint` を実行しエラー0件を確認する
2. `pnpm typecheck` を実行しエラー0件を確認する
3. `pnpm --filter @repo/desktop test` を実行し全テストPASSを確認する

### 手順 3: 変更サマリー提示（Task 3）

1. 新規ファイル・変更ファイルの一覧をユーザーに提示する
2. 「PR作成を実行してよろしいですか？」と明示的に許可を求める
3. ユーザーの許可を得るまでPR作成を実行しない

### 手順 4: PR作成（Task 4）-- ユーザー許可後のみ

1. `feature/task-9b-h-skill-creator-ipc` ブランチを作成する（未作成の場合）
2. 変更をコミットする（`--no-verify` 使用禁止）
3. リモートにプッシュする
4. `gh pr create` でPRを作成する

### 手順 5: CI確認（Task 5）

1. GitHub Actionsの実行結果を確認する
2. 全ジョブ成功を確認する
3. 失敗した場合は原因を調査・修正して再プッシュする

### 手順 6: タスク完了処理

1. `docs/30-workflows/skill-creator-ipc/` を `docs/30-workflows/completed-tasks/` に移動する
2. `artifacts.json` の Phase 13 ステータスを `completed` に更新する

## 統合テスト連携【必須】

| テスト項目   | 確認内容                                               | 期待結果                | 実行結果   |
| ------------ | ------------------------------------------------------ | ----------------------- | ---------- |
| 品質チェック | pnpm lint + typecheck + test が全クリーン              | エラー0件、全テストPASS | {{RESULT}} |
| CI通過       | GitHub Actionsの全ジョブ成功                           | 全ジョブ成功            | {{RESULT}} |
| PR作成       | PRが正常に作成され、本文にSummaryとTest planが含まれる | PR URL取得可能          | {{RESULT}} |

## 多角的チェック観点

| 観点         | 確認内容                                              | 判定基準             |
| ------------ | ----------------------------------------------------- | -------------------- |
| 品質         | lint, typecheck, testが全てクリーンか                 | エラー0件            |
| セキュリティ | `--no-verify` を使用していないか                      | 使用していないこと   |
| プロセス     | ユーザー許可を得てからPR作成しているか                | 明示的な許可取得済み |
| CI           | GitHub Actionsが全て成功しているか                    | 全ジョブ成功         |
| 完了処理     | タスクディレクトリがcompleted-tasksに移動されているか | 移動完了             |

## 成果物

| 成果物 | パス                          | 説明                             |
| ------ | ----------------------------- | -------------------------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL、CIステータス、マージ状況 |

## 完了条件

- [ ] ローカル品質チェック（lint, typecheck, test）が全クリーン
- [ ] ユーザーが変更サマリーを確認し、PR作成を許可した
- [ ] PRが作成されている（`feature/task-9b-h-skill-creator-ipc` ブランチから）
- [ ] PR本文にSummary（3項目）とTest plan（6項目）が含まれている
- [ ] CIが通過している（GitHub Actions全ジョブ成功）
- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/` に移動済み
- [ ] `artifacts.json` の Phase 13 ステータスが `completed` に更新済み
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスクID | タスク名                   | 依存関係 | ステータス |
| ------------ | -------------------------- | -------- | ---------- |
| 13-1         | ローカル動作確認依頼       | なし     | 未着手     |
| 13-2         | 品質チェック実行           | 13-1     | 未着手     |
| 13-3         | 変更サマリー提示・許可取得 | 13-2     | 未着手     |
| 13-4         | PR作成                     | 13-3     | 未着手     |
| 13-5         | CI確認                     | 13-4     | 未着手     |
| 13-6         | タスク完了処理             | 13-5     | 未着手     |

## タスク100%実行確認【必須】

| 確認項目                                                    | ステータス |
| ----------------------------------------------------------- | ---------- |
| Task 1（ローカル動作確認依頼）完了                          | [ ]        |
| Task 2（品質チェック）lint + typecheck + test 全クリーン    | [ ]        |
| Task 3（変更サマリー提示）ユーザー許可取得完了              | [ ]        |
| Task 4（PR作成）PR URL取得完了                              | [ ]        |
| Task 5（CI確認）全ジョブ成功確認完了                        | [ ]        |
| タスク完了処理（ディレクトリ移動 + artifacts.json更新）完了 | [ ]        |

## 次のPhase

なし（ワークフロー完了）
