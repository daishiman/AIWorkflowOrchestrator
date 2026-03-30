# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 13                                    |
| 名称       | PR 作成                               |
| 前提Phase  | Phase 12                              |
| ステータス | blocked                               |
| 成果物     | PR 準備メモ（ユーザー承認後のみ実行） |

## 目的

ユーザーの明示承認が与えられた場合にのみ、commit / push / PR 作成へ進む。

## 実行タスク

- Task 13-1: 変更範囲と成果物を再確認する
- Task 13-2: ローカル確認項目を満たしているか確認する
- Task 13-3: ユーザー承認がある場合のみ commit / PR 作成を実行する
- Task 13-4: 承認がない場合は blocked のまま終了する

### Task 13-1: 変更範囲確認

`git status` と `git diff --stat` を確認し、本タスクに関係する変更だけが含まれていることを確認する。

### Task 13-2: ローカル確認

- `pnpm --filter @repo/desktop exec tsc --noEmit`
- `pnpm --filter @repo/desktop test`
- 必要なら `pnpm --filter @repo/desktop lint`

### Task 13-3: 承認付き実行

以下は**ユーザーの明示承認後のみ**実施する。

1. `git add`
2. `git commit`
3. `git push`
4. `gh pr create`

### Task 13-4: blocked 維持

承認がない場合は、この Phase を `blocked` のまま維持し、実行しない。

## 参照資料

| 資料名           | パス                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| Phase 12         | `docs/30-workflows/agentview-permission-api-fix/phase-12-documentation.md` |
| execute workflow | `.agents/skills/task-specification-creator/references/execute-workflow.md` |

## 実行手順

### ステップ1: 承認前提を確認する

commit / PR が禁止されている間は準備だけに留める。

### ステップ2: ローカル品質結果を確認する

Phase 9-12 の結果が PR 準備に十分か確認する。

### ステップ3: 承認があれば実施、なければ blocked のまま終了する

本タスクでは blocked 維持が正しい完了状態である。

## 成果物

| 成果物      | パス                                                                     | 説明           |
| ----------- | ------------------------------------------------------------------------ | -------------- |
| PR 準備メモ | `docs/30-workflows/agentview-permission-api-fix/phase-13-pr-creation.md` | 承認条件と手順 |

## 完了条件

- [ ] 変更範囲を確認した
- [ ] PR 実行がユーザー承認前提であることを明記した
- [ ] 承認がない場合は blocked を維持すると定義した
- [ ] commit / push / PR を自動実行しない
