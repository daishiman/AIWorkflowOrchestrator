# Phase 13: PR作成

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 13                              |
| 機能名 | TASK-IMP-permission-date-filter |
| 作成日 | 2026-02-01                      |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名           | パス                                            | 説明           |
| ---------------- | ----------------------------------------------- | -------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`       | Phase 10成果物 |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`        | Phase 11成果物 |
| ドキュメント     | `outputs/phase-12/documentation-changelog.md`   | Phase 12成果物 |
| 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md` | Phase 12成果物 |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼内容:**

| 確認項目                 | 操作手順                                                               |
| ------------------------ | ---------------------------------------------------------------------- |
| 期間プリセット選択の動作 | PermissionHistoryPanelで各プリセットを選択し表示変化を確認             |
| カスタム範囲指定の動作   | 「カスタム範囲」を選択し、日付入力→フィルタ適用を確認                  |
| 既存フィルタとの複合動作 | ツール名フィルタ+期間フィルタの同時適用を確認                          |
| 既存機能のリグレッション | ツール名・判断結果フィルタの単独動作、履歴クリア、仮想スクロールを確認 |

### 2. 変更サマリーの提示と許可確認【必須】

**変更サマリー:**

| カテゴリ         | 変更ファイル                                                                                   | 変更内容                       |
| ---------------- | ---------------------------------------------------------------------------------------------- | ------------------------------ |
| 型定義           | `packages/shared/src/types/permissionHistory.ts`                                               | DateRangeFilter/DatePreset追加 |
| フィルタロジック | `apps/desktop/src/renderer/components/settings/PermissionSettings/dateFilterUtils.ts`          | 日付フィルタヘルパー新規作成   |
| フィルタUI       | `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryFilter.tsx` | 期間セレクトUI追加             |
| パネルロジック   | `apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryPanel.tsx`  | フィルタチェーン拡張           |
| テスト           | 上記各ファイルの\*.test.ts                                                                     | テストコード追加               |
| ドキュメント     | `docs/30-workflows/TASK-IMP-permission-date-filter/`                                           | 全Phase仕様書・成果物          |

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること
- Issue #632との関連付けが行われていること

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
- [ ] PRが作成されている（Issue #632と関連付け）
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-IMP-permission-date-filter/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-IMP-permission-date-filter

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-IMP-permission-date-filterをcompleted-tasksに移動"
git push
```

## サブタスク管理

1. ローカル動作確認の依頼
2. 変更サマリーの作成・提示
3. ユーザー許可の取得
4. PR作成（/ai:diff-to-pr）
5. CI確認
6. タスクディレクトリの移動

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

なし（ワークフロー完了）
