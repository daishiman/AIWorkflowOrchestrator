# Phase 13: PR作成

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 13                             |
| 機能名 | task-ut-sdk-l34-ui-display-001 |
| 作成日 | 2026-04-03                     |

## 目的

変更をコミットし、**ユーザーの明示的な許可を得てから**Pull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名        | パス                                          | 説明           |
| ------------- | --------------------------------------------- | -------------- |
| Phase 2成果物 | `outputs/phase-2/design.md`                   | 設計前提       |
| Phase 5成果物 | `outputs/phase-5/implementation-summary.md`   | 実装結果       |
| Phase 6成果物 | `outputs/phase-6/test-expansion-report.md`    | テスト拡充結果 |
| Phase 7成果物 | `outputs/phase-7/coverage-report.md`          | カバレッジ結果 |
| Phase 8成果物 | `outputs/phase-8/refactoring-report.md`       | リファクタ結果 |
| Phase 9成果物 | `outputs/phase-9/quality-report.md`           | 品質ゲート結果 |
| 最終レビュー  | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト    | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント  | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する：

```
以下の手順でローカル動作確認をお願いします：
1. pnpm --filter @repo/desktop dev でアプリを起動
2. SkillCreatorでスキルを生成してverify phaseへ進む
3. Verify DetailパネルでLayer別グルーピングが表示されることを確認
4. Layerヘッダーをクリックして折りたたみ動作を確認
5. Layer3/4のcheck（L3-001等）がUIで識別できることを確認
```

### 2. 変更サマリーの提示と許可確認【必須】

**変更内容サマリー**:

| ファイル                                                                            | 変更種別         | 主な変更内容                                              |
| ----------------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                | 修正             | Layer別グルーピング・アコーディオン・severityアイコン実装 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | 修正             | TC-01〜TC-19追加                                          |
| `apps/desktop/src/renderer/components/skill/VerifyLayerGroup.tsx`                   | 新規（条件付き） | 分離する場合のみ                                          |

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後：

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること（typecheck / lint / test）

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している（typecheck / lint / test）
- [ ] タスクディレクトリが`completed-tasks`に移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

PRが作成され、CIが通過した後：

```bash
mv docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001/ docs/30-workflows/completed-tasks/
git add docs/30-workflows/
git commit -m "docs(workflows): task-ut-sdk-l34-ui-display-001をcompleted-tasksに移動"
git push
```

## 次のPhase

なし（全Phase完了）
