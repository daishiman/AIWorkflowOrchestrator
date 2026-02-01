# Phase 13: PR作成

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 13                              |
| 機能名 | TASK-IMP-permission-history-001 |
| 作成日 | 2026-01-31                      |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |
| 品質レポート | `outputs/phase-9/quality-report.md`           | Phase 9成果物  |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する:

- Electronアプリを起動し、スキル実行→Permission Dialog→設定画面→履歴パネルの一連フローを確認
- フィルタリング・クリア機能の動作確認
- アプリ再起動後の履歴保持確認

### 2. 変更サマリーの提示と許可確認【必須】

以下の変更内容サマリーを提示し、PRを作成してよいかユーザーに確認する:

| 変更カテゴリ     | 新規/変更 | ファイル                                                                                         |
| ---------------- | --------- | ------------------------------------------------------------------------------------------------ |
| データモデル     | 新規      | `apps/desktop/src/renderer/components/skill/permissionHistory.ts`                                |
| Zustand Store    | 新規      | `apps/desktop/src/renderer/stores/slices/permissionHistorySlice.ts`                              |
| UIコンポーネント | 新規      | `PermissionHistoryPanel.tsx`, `PermissionHistoryFilter.tsx`, `PermissionHistoryItem.tsx`         |
| 既存変更         | 変更      | `PermissionSettings/index.tsx`（履歴パネル統合）、`skillSlice.ts`（自動記録追加）                |
| テスト           | 新規      | `permissionHistory.test.ts`, `permissionHistorySlice.test.ts`, `PermissionHistoryPanel.test.tsx` |
| ドキュメント     | 新規/変更 | 実装ガイド、システム仕様書更新                                                                   |

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr task-imp-permission-history-001
```

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること
- GitHub Issue #602 との関連付けが行われていること

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている（GitHub Issue #602 関連付け）
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-IMP-permission-history-001/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-IMP-permission-history-001

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-IMP-permission-history-001をcompleted-tasksに移動"
git push
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 成果物の作成・配置
4. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-history-001 --phase 13
```

## 次のPhase

なし（ワークフロー完了）
