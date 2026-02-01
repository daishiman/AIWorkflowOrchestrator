# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目      | 内容                                |
| --------- | ----------------------------------- |
| Phase     | 13                                  |
| Phase名   | PR作成                              |
| カテゴリ  | 完了                                |
| 機能名    | TASK-7D-chatpanel-agent-integration |
| 作成日    | 2026-01-31                          |
| 前提Phase | Phase 12                            |
| 後続Phase | なし                                |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

### タスク1: ローカル動作確認依頼【必須】

**目的**: PR作成前にユーザーにローカル環境での動作確認を依頼する。

**手順**:

1. 以下の確認項目をユーザーに提示する:
   - ChatPanelでSkillSelectorが表示されるか
   - スキル選択→実行→ストリーミング→完了の全フローが動作するか
   - 既存のチャット機能に影響がないか
2. ユーザーの確認結果を待つ

### タスク2: 変更サマリー提示と許可確認【必須】

**目的**: 変更内容のサマリーを提示しPR作成の許可を確認する。

**手順**:

1. 変更内容のサマリーを提示する:
   - 新規ファイル: SkillStreamingView.tsx
   - 修正ファイル: ChatPanel.tsx, skill/index.ts
   - テストファイル: ChatPanel.test.tsx（修正）、SkillStreamingView.test.tsx（新規）
   - ドキュメント: 実装ガイド、システム仕様更新、未タスクレポート
2. PRを作成してよいかユーザーに確認する

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### タスク3: `/ai:diff-to-pr`実行

**目的**: ユーザーの許可を得た後、PR作成を実行する。

**手順**:

1. `/ai:diff-to-pr`を実行する
2. PRが作成されたことを確認する
3. CIが通過したことを確認する

### タスク4: タスク完了処理

**目的**: タスクディレクトリを完了フォルダに移動する。

**手順**:

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-7D-chatpanel-agent-integration/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-7D-chatpanel

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-7D-chatpanel-agent-integrationをcompleted-tasksに移動"
git push
```

## 参照資料

| 参照資料         | パス                                            | 内容           |
| ---------------- | ----------------------------------------------- | -------------- |
| 最終レビュー     | `outputs/phase-10/final-review-result.md`       | Phase 10成果物 |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`        | Phase 11成果物 |
| ドキュメント更新 | `outputs/phase-12/documentation-changelog.md`   | Phase 12成果物 |
| 未タスクレポート | `outputs/phase-12/unassigned-task-detection.md` | Phase 12成果物 |

## 成果物

| 成果物 | パス                          | 種別     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | document |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] 本Phase内の全作業を100%完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. タスク1: ローカル動作確認依頼
2. タスク2: 変更サマリー提示と許可確認
3. タスク3: `/ai:diff-to-pr`実行
4. タスク4: タスク完了処理
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

なし（ワークフロー完了）
