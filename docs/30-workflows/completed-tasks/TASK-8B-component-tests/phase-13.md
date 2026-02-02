# Phase 13: PR作成

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 13                           |
| タスク | TASK-8B コンポーネントテスト |
| 機能名 | skill-import-agent-system    |
| 作成日 | 2026-02-01                   |

## 目的

全変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名               | パス                                          | 説明           |
| -------------------- | --------------------------------------------- | -------------- |
| 最終レビュー         | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト           | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

## 実行手順

### ステップ1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

確認依頼内容:

```bash
# テスト実行
pnpm --filter @repo/desktop test -- --run src/renderer/components/skill/__tests__/

# カバレッジ確認
pnpm --filter @repo/desktop test -- --run --coverage src/renderer/components/skill/__tests__/

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

### ステップ2: 変更サマリーの提示と許可確認【必須】

以下のサマリーを提示し、PRを作成してよいかユーザーに確認する:

```markdown
## 変更サマリー

### 新規作成ファイル

- `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx` (15テスト)
- `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx` (12テスト)
- `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx` (12テスト)
- `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` (16テスト)

### テスト結果

- 合計: 55+ テストケース
- 成功率: 100%
- カバレッジ: Line XX%, Branch XX%, Function XX%

### ドキュメント

- 実装ガイド（Part 1 + Part 2）
- ドキュメント更新履歴
- 未タスク検出レポート
```

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### ステップ3: `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### ステップ4: 実行結果の確認

- PRが作成されていること
- CIが通過していること
- テストが全て成功していること

### ステップ5: フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合:

```bash
# 手動PR作成
git add apps/desktop/src/renderer/components/skill/__tests__/
git add docs/30-workflows/skill-import-agent-system/TASK-8B-component-tests/
git commit -m "test(skill): TASK-8B コンポーネントテスト（SkillSelector/SkillImportDialog/PermissionDialog/SkillStreamingView）"
git push -u origin task/TASK-8B-component-tests

gh pr create \
  --title "test(skill): TASK-8B コンポーネントテスト" \
  --body "## Summary
- 4コンポーネントのTesting Libraryテスト実装
- 55+ テストケース、カバレッジ80%以上達成
- アクセシビリティ・キーボードナビゲーションテスト含む

## Test plan
- [ ] \`pnpm --filter @repo/desktop test\` で全テスト成功
- [ ] カバレッジ80%以上確認
- [ ] CI全ジョブ成功"
```

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                      | 確認項目                                   |
| ---------------- | ----------------------------- | ------------------------------------------ |
| UI/UX            | PR内容のUI品質確認 → **適用** | PRがUI仕様の検証を含んでいるか             |
| アクセシビリティ | a11yテスト含有確認 → **適用** | PRにアクセシビリティテストが含まれているか |
| セキュリティ     | テストコードのみ → **適用外** | -                                          |
| パフォーマンス   | CI実行速度 → **限定的適用**   | CIが合理的な時間内に完了するか             |

### Electronデスクトップアプリ観点

| 観点                       | 適用判断                          | 確認項目                                 |
| -------------------------- | --------------------------------- | ---------------------------------------- |
| フロントエンド（Renderer） | UIコンポーネントテスト → **適用** | Renderer Process内のテストがCI通過するか |
| バックエンド（Main）       | テスト対象外 → **適用外**         | -                                        |
| IPC通信                    | Storeレベルでモック → **適用外**  | -                                        |
| Preload/セキュリティ       | テスト対象外 → **適用外**         | -                                        |
| ローカルストレージ         | テスト対象外 → **適用外**         | -                                        |

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/skill-import-agent-system/TASK-8B-component-tests/ docs/30-workflows/completed-tasks/

# 元のタスク仕様も移動
mv docs/30-workflows/skill-import-agent-system/tasks/task-8b-component-tests.md docs/30-workflows/skill-import-agent-system/tasks/completed-task/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-8B

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-8B-component-testsをcompleted-tasksに移動"
git push
```

## サブタスク管理

1. ユーザーへの動作確認依頼
2. 変更サマリーの提示と許可確認
3. PR作成の実行
4. CI通過の確認
5. タスクディレクトリの移動
6. 成果物の作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/TASK-8B-component-tests --phase 13
```

## 次のPhase

なし（ワークフロー完了）
