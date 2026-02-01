# Phase 13: PR作成

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 13         |
| 機能名 | TASK-8C-G  |
| 作成日 | 2026-02-01 |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に `/ai:diff-to-pr` を実行
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名                  | パス                                          | 説明                 |
| ----------------------- | --------------------------------------------- | -------------------- |
| Phase 2 設計書          | `outputs/phase-02/fixture-design.md`          | フィクスチャ設計     |
| Phase 5 実装サマリ      | `outputs/phase-05/implementation-summary.md`  | 実装済みフィクスチャ |
| Phase 6 テスト拡充      | `outputs/phase-06/test-expansion-result.md`   | 追加テスト一覧       |
| Phase 7 カバレッジ      | `outputs/phase-07/coverage-report.md`         | カバレッジ結果       |
| Phase 8 リファクタ      | `outputs/phase-08/refactoring-log.md`         | リファクタ内容       |
| Phase 9 品質レポート    | `outputs/phase-09/quality-report.md`          | 品質検証結果         |
| Phase 10 最終レビュー   | `outputs/phase-10/final-review-result.md`     | レビュー判定         |
| Phase 11 手動テスト結果 | `outputs/phase-11/manual-test-result.md`      | 手動テスト結果       |
| Phase 12 ドキュメント   | `outputs/phase-12/documentation-changelog.md` | 更新履歴             |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

確認依頼内容:

```bash
# テスト実行
pnpm vitest run apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts

# 検証スクリプト手動実行（任意）
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js \
  --target apps/desktop/src/__tests__/__fixtures__/skill-creator/boundary-skill
```

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**提示すべき内容:**

| 項目             | 内容                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| 新規フィクスチャ | 6種類（boundary, missing-fields, forbidden-files, invalid-name, empty-agents, invalid-schema） |
| 新規テストケース | 34件（TC-063～TC-096）                                                                         |
| テスト品質改善   | D カテゴリ（YAML統一, assertion強化）                                                          |
| 既存テスト影響   | 既存62件は変更なし・PASS維持                                                                   |
| 合計テスト       | 96件以上（全件PASS）                                                                           |

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること

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
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリが completed-tasks に移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-8C-G/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-8C-G

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-8C-Gをcompleted-tasksに移動"
git push
```

## 次のPhase

なし（ワークフロー完了）
