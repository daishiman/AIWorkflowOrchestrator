# Phase 6: テスト拡充レポート

## タスク ID

UT-FIX-AGENTVIEW-INFINITE-LOOP-001

## 対象ファイル

- テスト: `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx`
- 実装: `apps/desktop/src/renderer/views/AgentView/index.tsx`

## 追加テストケース一覧

### 1. 再レンダリング安定性 (2件)

| No. | テスト名                                      | 目的                                                        |
| --- | --------------------------------------------- | ----------------------------------------------------------- |
| 1   | should call fetchSkills only once on mount    | マウント時にfetchSkillsが1回のみ呼ばれることを確認          |
| 2   | should not re-trigger fetchSkills on rerender | 再レンダリング時にfetchSkillsが再トリガーされないことを確認 |

### 2. ハンドラ動作 (2件)

| No. | テスト名                                                     | 目的                                                                          |
| --- | ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| 3   | should call fetchSkills and openImportDialog on import click | インポートボタンクリック時にfetchSkillsとopenImportDialogが呼ばれることを確認 |
| 4   | should call fetchSkills on retry click                       | エラー状態で再試行ボタンクリック時にfetchSkillsが呼ばれることを確認           |

### 3. トースト表示 (2件)

| No. | テスト名                                  | 目的                                                         |
| --- | ----------------------------------------- | ------------------------------------------------------------ |
| 5   | should display toast message when present | トーストメッセージが設定されている場合に表示されることを確認 |
| 6   | should not display toast when null        | トーストメッセージがnullの場合に非表示であることを確認       |

### 4. カテゴリ抽出 (1件)

| No. | テスト名                                                           | 目的                                                                      |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| 7   | should extract categories from imported skills with category field | カテゴリ付きスキルからカテゴリが抽出されることを確認（useMemoカバレッジ） |

### 5. レスポンシブレイアウト (1件)

| No. | テスト名                                                            | 目的                                                                           |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 8   | should render detail panel with mobile layout when window is narrow | ウィンドウ幅が狭い場合のモバイルレイアウト表示を確認（handleResizeカバレッジ） |

### 6. スキル選択ハンドラ (1件)

| No. | テスト名                                                    | 目的                                                            |
| --- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| 9   | should call selectSkill when a skill is clicked in the list | スキル一覧からスキルクリック時にselectSkillが呼ばれることを確認 |

### 7. スキル詳細パネル表示 (5件)

| No. | テスト名                                                      | 目的                                                |
| --- | ------------------------------------------------------------- | --------------------------------------------------- |
| 10  | should display SkillDetailPanel when a skill is selected      | スキル選択時に詳細パネルが表示されることを確認      |
| 11  | should not display SkillDetailPanel when no skill is selected | スキル未選択時に詳細パネルが非表示であることを確認  |
| 12  | should call showToast on successful execute                   | 実行成功時にトースト表示を確認                      |
| 13  | should call removeSkill and showToast on successful delete    | 削除成功時にremoveSkillとトースト表示を確認         |
| 14  | should call selectSkill(null) when close button is clicked    | 閉じるボタンでselectSkill(null)が呼ばれることを確認 |

### 8. エラーハンドリング (4件)

| No. | テスト名                                                          | 目的                                                              |
| --- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| 15  | should show error toast when execute fails with Error             | 実行失敗時（Errorオブジェクト）のエラートースト表示確認           |
| 16  | should show generic error toast when execute fails with non-Error | 実行失敗時（非Errorオブジェクト）のジェネリックエラートースト確認 |
| 17  | should show error toast when delete fails                         | 削除失敗時（Errorオブジェクト）のエラートースト表示確認           |
| 18  | should show generic error toast when delete fails with non-Error  | 削除失敗時（非Errorオブジェクト）のジェネリックエラートースト確認 |

### 9. インポートダイアログ (1件)

| No. | テスト名                                                        | 目的                                             |
| --- | --------------------------------------------------------------- | ------------------------------------------------ |
| 19  | should render SkillImportDialog when isImportDialogOpen is true | インポートダイアログ開放時に表示されることを確認 |

### 10. handleImportコールバック (3件)

| No. | テスト名                                                           | 目的                                                                    |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| 20  | should call importSkill and closeImportDialog on successful import | インポート成功時のimportSkillとcloseImportDialog呼出し確認              |
| 21  | should show error toast when import fails                          | インポート失敗時（Errorオブジェクト）のエラートースト表示確認           |
| 22  | should show generic error toast when import fails with non-Error   | インポート失敗時（非Errorオブジェクト）のジェネリックエラートースト確認 |

## テスト実行結果

```
 RUN  v2.1.9

 PASS  src/renderer/views/AgentView/__tests__/AgentView.test.tsx (53 tests)

 Test Files  1 passed (1)
      Tests  53 passed (53)
```

- **既存テスト**: 31件 (全PASS、変更なし)
- **追加テスト**: 22件 (全PASS)
- **合計テスト**: 53件 (全PASS)

## 追加テストの設計方針

1. **個別セレクタHookモック方式**: 既存テストパターンに準拠し、`vi.mocked(useXxx).mockReturnValue(...)` でオーバーライド
2. **fireEvent使用**: ユーザー操作テストには `@testing-library/react` の `fireEvent` を使用（happy-dom環境との互換性のため `userEvent` から移行）
3. **within使用**: 複数の同名ボタンが存在する場合に `within()` で特定のコンテナ内を検索
4. **エラーブランチ網羅**: Errorオブジェクトと非Errorオブジェクトの両方のcatchブランチをテスト
5. **act使用**: resizeイベント発火・非同期ハンドラ実行時に `act()` でラップしてReact状態更新とPromiseマイクロタスクを正しく反映
