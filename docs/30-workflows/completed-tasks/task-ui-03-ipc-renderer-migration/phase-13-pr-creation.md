# Phase 13: PR作成

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 13                                |
| Phase名    | PR作成                            |
| 機能名     | task-ui-03-ipc-renderer-migration |
| 前提Phase  | Phase 12: ドキュメント更新        |
| 次Phase    | -（完了）                         |
| ステータス | pending                           |
| 作成日     | 2026-04-07                        |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認する。

## 実行タスク

- ユーザーにローカル動作確認を依頼
- 変更サマリーを提示し PR 作成の許可を確認
- `/ai:diff-to-pr` を実行
- CI 確認

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR 作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認ポイント**:

- `ImprovementProposalPanel` の改善適用が正常に動作する
- `GovernanceSummaryPanel` のガバナンス状態表示が正常に動作する
- Electron コンソールに IPC 関連エラーが出ていない

### 2. 変更サマリーの提示と許可確認【必須】

**変更内容サマリー**:

- `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`: `window.electronAPI.skillCreator` → `window.skillCreatorAPI` に移行
- `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx`: 同上

**PR タイトル案**:
`fix(ipc): TASK-UI-03-REMAINING renderer IPC経路移行完了 — ImprovementProposalPanel・GovernanceSummaryPanel`

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR 作成を実行する。

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- PR が作成されていること
- CI が通過していること

## 参照資料

| 資料名         | パス                                          | 説明            |
| -------------- | --------------------------------------------- | --------------- |
| 最終レビュー   | `outputs/phase-10/final-review-result.md`     | Phase 10 成果物 |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md`      | Phase 11 成果物 |
| 変更履歴       | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物 |

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示し PR 作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PR が作成されている
- [ ] CI が通過している
- [ ] タスクディレクトリが completed-tasks に移動されている
- [ ] 本Phase内の全作業を100%完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている

## タスク完了処理【必須】

PR 作成後、タスクディレクトリを completed-tasks に移動する:

```bash
mv docs/30-workflows/task-ui-03-ipc-renderer-migration/ docs/30-workflows/completed-tasks/
git add docs/30-workflows/
git commit -m "docs(workflows): task-ui-03-ipc-renderer-migration を completed-tasks に移動"
```
